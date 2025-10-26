import { catch_function_async, is_empty } from '@common/utils/util';
import { Prefs } from '@illusive/prefs';
import type { SetState } from '@illusive/types';
import { GLOBALS } from './globals';
import { download_track, download_track_lyrics } from './downloader';
import { SQLTracks } from './sql/sql_tracks';
import { SQLRecentlyPlayed } from './sql/sql_recently_played';
import { SQLPlaylists } from './sql/sql_playlists';
import { load_native_modules } from '@native/gen/load_native_modules';
import { miscnative } from '@native/miscnative/miscnative';
import { SQLfs } from './sql/sql_fs';
import { load_database } from './db/database';
import { Illusive } from './illusive';
import { default_playlists } from './default_playlists';
import { addShortcutListener, getInitialShortcut } from "react-native-siri-shortcut";
import { reinterpret_cast } from '../../common/cast';
import { Constants } from './constants';
import { get_native_platform, type NativePlatform } from '@native/native_mode';
import { YouTubeDL } from '@origin/youtube_dl';
import { SoundCloud } from '@origin/index';
import { ffmpeg } from '@native/ffmpeg/ffmpeg';
import { SQLUpdate } from './sql/sql_update';
import { SQLArtists } from './sql/sql_artists';

export async function warmup_client(){
    await ffmpeg().execute_args(['-L']);
    if(Prefs.get_pref('warmup_youtube')){
        await YouTubeDL.get_innertube_client();
    }
    if(Prefs.get_pref('warmup_soundcloud')){
        await SoundCloud.get_client_id({cookie_jar: Prefs.get_pref('soundcloud_cookie_jar')});
    }
}

export async function illusi_startup(version: string, play_tracks: typeof GLOBALS.global_var.play_tracks, set_theme: typeof GLOBALS.global_var.set_theme, bottom_alert: typeof GLOBALS.global_var.bottom_alert, on_finish_essentials: () => {

}) {
    await catch_function_async(async() => {
        await load_native_modules();
        await SQLfs.cache_load_directories();
        await Prefs.load_mmkv_module();
        //TODO CHANGE location based on platform
        const sqlite_name = 'illusi-db-1400.sqlite3';
        const sqlite_location_mobile = SQLfs.document_directory('SQLite')
            .replace('file://', '')
            .replace('file:', '');
        const sqlite_location_desktop = SQLfs.document_directory(".illusi/sumi.sqlite");
        const sqlite_location_map: Record<NativePlatform, string> = {
            NODE: sqlite_location_desktop,
            REACT_NATIVE: sqlite_location_mobile,
            ELECTRON_RENDERER: sqlite_location_desktop,
            WEB: sqlite_location_desktop
        };
        await load_database(sqlite_name, sqlite_location_map[get_native_platform()], );
        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        GLOBALS.global_var.download_track_lyrics = download_track_lyrics;
        GLOBALS.global_var.set_theme = set_theme;
        GLOBALS.global_var.bottom_alert = bottom_alert;

        await SQLUpdate.fix_to_new_update(version);

        on_finish_essentials();
        
        await Prefs.load_prefs();
        if(version === Prefs.get_pref('latest_version')){
            GLOBALS.global_var.past_playing_tracks = SQLTracks.add_playback_saved_data_to_tracks(Prefs.get_pref('past_queue').tracks);
            GLOBALS.global_var.past_track_index = Prefs.get_pref('past_queue').index;
        }
        else {
            await Prefs.save_pref('past_queue', {index: 0, tracks: []});
        }
        await Prefs.save_pref('latest_version', version);

        await SQLTracks.fetch_track_data();
        await SQLArtists.get_all_sql_artists();
        
        Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            SQLPlaylists.all_playlists_data("PROMISE"),
            miscnative().keep_mobile_awake()
        ]).catch(e => e);
        Prefs.pref_set_theme(set_theme);
        await warmup_client();
    }, (error) => GLOBALS.global_var.bottom_alert((error as Error).message, "WARN"))
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
    if(shortcut?.userInfo)
        await run_shortcut(play_tracks, shortcut.userInfo, shortcut.activityType);
});

export async function on_app_load(version: string, play_tracks: typeof GLOBALS.global_var.play_tracks, set_is_loading: SetState, set_theme: SetState, update_bottom_alert: typeof GLOBALS.global_var.bottom_alert){
    await illusi_startup(version, play_tracks, set_theme, update_bottom_alert, async() => {
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