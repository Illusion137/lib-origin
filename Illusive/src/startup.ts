import type { SetState } from '@illusive/types';
import { catch_function_async, is_empty } from '@common/utils/util';
import { Prefs } from '@illusive/prefs';
import { GLOBALS } from './globals';
import { download_track, download_track_lyrics } from './downloader';
import { SQLTracks } from './sql/sql_tracks';
import { SQLRecentlyPlayed } from './sql/sql_recently_played';
import { SQLPlaylists } from './sql/sql_playlists';
import { load_native_modules } from '@native/gen/load_native_modules';
import { miscnative } from '@native/miscnative/miscnative';
import { SQLfs } from './sql/sql_fs';
import { db, is_database_connected, load_database } from './db/database';
import { Illusive } from './illusive';
import { default_playlists } from './default_playlists';
import { addShortcutListener, getInitialShortcut } from "react-native-siri-shortcut";
import { reinterpret_cast } from '../../common/cast';
import { Constants } from './constants';
import { YouTubeDL } from '@origin/youtube_dl';
import { SoundCloud } from '@origin/index';
import { ffmpeg } from '@native/ffmpeg/ffmpeg';
import { SQLUpdate } from './sql/sql_update';
import { SQLArtists } from './sql/sql_artists';
import { catch_log } from '@common/utils/error_util';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import migrations from './drizzle/mobile/migrations';
import { supabase } from './db/supabase';
import { SyncEngine } from './db/sync/sync_engine';
import { NetworkMonitor } from './db/sync/network_monitor';
import { FutsalShuffle } from './futsal_shuffle';
import { fs } from '@native/fs/fs';
import bpath from 'path-browserify';
import { run_startup_links } from './linker';

let sync_engine_instance: SyncEngine | null = null;
let sync_engine_start_promise: Promise<void> | null = null;
let sync_engine_should_run = false;
let auth_state_subscription: { unsubscribe: () => void } | null = null;

async function start_sync_engine() {
    sync_engine_should_run = true;
    if (sync_engine_instance) return;
    if (sync_engine_start_promise) {
        await sync_engine_start_promise;
        return;
    }

    const engine = new SyncEngine(supabase(), NetworkMonitor.get_instance());
    sync_engine_start_promise = (async () => {
        try {
            await engine.initialize();
            if (!sync_engine_should_run) {
                engine.destroy();
                return;
            }
            sync_engine_instance = engine;
        } catch (error) {
            engine.destroy();
            throw error;
        } finally {
            sync_engine_start_promise = null;
        }
    })();

    await sync_engine_start_promise;
}

function stop_sync_engine() {
    sync_engine_should_run = false;
    if (!sync_engine_instance) return;
    sync_engine_instance.destroy();
    sync_engine_instance = null;
}

function reset_auth_sync_subscription() {
    auth_state_subscription?.unsubscribe();
    auth_state_subscription = null;
}

export async function warmup_client() {
    await ffmpeg().execute_args(['-L']);
    if (Prefs.get_pref('warmup_youtube')) {
        await YouTubeDL.get_innertube_client();
    }
    if (Prefs.get_pref('warmup_soundcloud')) {
        await SoundCloud.get_client_id({ cookie_jar: Prefs.get_pref('soundcloud_cookie_jar') });
    }
}

export async function illusi_startup(version: string, play_tracks: typeof GLOBALS.global_var.play_tracks, set_theme: typeof GLOBALS.global_var.set_theme, bottom_alert: typeof GLOBALS.global_var.bottom_alert, on_finish_essentials: () => {

}) {
    await catch_function_async(async () => {
        await load_native_modules();

        await SQLfs.cache_load_directories();
        await Prefs.load_mmkv_module();

        await Prefs.load_prefs();

        // await Prefs.save_pref('database_version', "17.2.0");
        // await delete_database();
        // return;

        if (!is_database_connected()) load_database();
        if (!is_database_connected()) {
            console.error("BAD DATABASE CONNECTION");
            return;
        };

        await migrate(db, migrations).catch(catch_log);

        // Start sync for the current session and maintain a single engine lifecycle.
        const { data: { session } } = await supabase().auth.getSession();
        if (session) {
            // Do not block app startup on long-running initial sync.
            void start_sync_engine().catch(catch_log);
        } else {
            stop_sync_engine();
        }

        reset_auth_sync_subscription();
        const { data: { subscription } } = supabase().auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                void start_sync_engine().catch(catch_log);
            }
            if (event === 'SIGNED_OUT') {
                stop_sync_engine();
            }
        });
        auth_state_subscription = subscription;

        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        GLOBALS.global_var.download_track_lyrics = download_track_lyrics;
        GLOBALS.global_var.set_theme = set_theme;
        GLOBALS.global_var.bottom_alert = bottom_alert;

        await SQLUpdate.fix_to_new_update();

        on_finish_essentials();

        if (version === Prefs.get_pref('latest_version')) {
            GLOBALS.global_var.past_playing_tracks = SQLTracks.add_playback_saved_data_to_tracks(Prefs.get_pref('past_queue').tracks);
            GLOBALS.global_var.past_track_index = Prefs.get_pref('past_queue').index;
        }
        else {
            await Prefs.save_pref('past_queue', { index: 0, tracks: [] });
            const tmp_dir = await fs().temp_directory();
            const tmp_dir_file_list = await fs().read_directory(tmp_dir);
            if ("error" in tmp_dir_file_list) {
                GLOBALS.global_var.bottom_alert("Failed to purge temp cache on update", "WARN", tmp_dir_file_list);
            }
            else {
                for (const file of tmp_dir_file_list) {
                    const path = bpath.join(tmp_dir, file);
                    await fs().remove(path);
                }
            }
        }
        await Prefs.save_pref('latest_version', version);

        await SQLTracks.fetch_track_data();
        await SQLArtists.get_all_sql_artists();

        Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            SQLPlaylists.all_playlists_data("PROMISE"),
            miscnative().keep_mobile_awake()
        ]).catch(catch_log);
        Prefs.pref_set_theme(set_theme);
        SQLfs.recreate_directories().catch(catch_log);
        warmup_client().catch(catch_log);
        if (Prefs.get_pref('use_track_shuffle_bias')) FutsalShuffle.build_cache();
        await run_startup_links(Prefs.get_pref('linker_links'));
    }, (error) => GLOBALS.global_var.bottom_alert("Illusi Startup Failed", "ERROR", { error }))
}

async function run_shortcut(play_tracks: typeof GLOBALS.global_var.play_tracks, userInfo: { uuid: string }, activityType: string) {
    const info = reinterpret_cast<{ uuid: string }>(userInfo);
    switch (activityType) {
        case "com.illusion137.Illusi.ShuffleMusic": {
            if (is_empty(info.uuid)) return;
            const default_playlist_names = default_playlists.map((playlist) => playlist.name);
            const shuffled = Illusive.shuffle_tracks("SHUFFLE", default_playlist_names.includes(info.uuid) ? await default_playlists.find((playlist) => playlist.name === info.uuid)!.track_function() : info.uuid === Constants.library_write_playlist ? GLOBALS.global_var.sql_tracks : await SQLPlaylists.playlist_tracks(info.uuid));
            play_tracks(shuffled[0], shuffled, "Shortcut");
            break;
        }
    }
}

interface ShortcutInfo {
    activityType: string;
    userInfo?: { uuid: string };
}
type InitialShortcut = null | ShortcutInfo;

export const get_shortcut_subscription = (play_tracks: typeof GLOBALS.global_var.play_tracks) => addShortcutListener(async (unknown_shortcut: unknown) => {
    const shortcut = reinterpret_cast<InitialShortcut>(unknown_shortcut);
    if (shortcut?.userInfo)
        await run_shortcut(play_tracks, shortcut.userInfo, shortcut.activityType);
});

export async function on_app_load(version: string, play_tracks: typeof GLOBALS.global_var.play_tracks, set_is_loading: SetState, set_theme: SetState, update_bottom_alert: typeof GLOBALS.global_var.bottom_alert) {
    await illusi_startup(version, play_tracks, set_theme, update_bottom_alert, async () => {
        const maybe_initial_shortcut = reinterpret_cast<InitialShortcut>(await getInitialShortcut());
        const default_playlist_names = default_playlists.map((playlist) => playlist.name);
        if (maybe_initial_shortcut?.userInfo && !default_playlist_names.includes(maybe_initial_shortcut.userInfo.uuid)) {
            await run_shortcut(play_tracks, maybe_initial_shortcut.userInfo, maybe_initial_shortcut.activityType);
        }
        if (maybe_initial_shortcut?.userInfo && default_playlist_names.includes((maybe_initial_shortcut.userInfo as { uuid: string }).uuid)) {
            await run_shortcut(play_tracks, maybe_initial_shortcut.userInfo, maybe_initial_shortcut.activityType);
        }
    });
    set_is_loading(false);
}
