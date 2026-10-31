import type { SetState } from '@illusive/types';
import { is_empty } from '@common/utils/util';
import { Prefs } from '@illusive/prefs';
import { GLOBALS } from './globals';
import { download_track, download_track_lyrics } from './downloader';
import { SQLTracks } from './sql/sql_tracks';
import { SQLRecentlyPlayed } from './sql/sql_recently_played';
import { SQLPlaylists } from './sql/sql_playlists';
import { load_native_modules } from '@native/gen/load_native_modules';
import { load_native_miscnative } from '@native/miscnative/miscnative';
import { SQLfs } from './sql/sql_fs';
import { DatabaseBoot } from './db/boot';
import { Illusive } from './illusive';
import { default_playlists } from './default_playlists';
import { addShortcutListener, getInitialShortcut } from 'react-native-siri-shortcut';
import { reinterpret_cast } from '../../common/cast';
import { Constants } from './constants';
import { YouTubeDL } from '@origin/youtube/youtube_dl';
import { SoundCloud } from '@origin/index';
import { ffmpeg, load_native_ffmpeg } from '@native/ffmpeg/ffmpeg';
import { SQLUpdate } from './legacy/1810/sql_update';
import { SQLArtists } from './sql/sql_artists';
import { SQLGlobal } from './sql/sql_global';
import { generate_unique_track_tints } from './illusive_utils';
import { catch_log } from '@common/utils/error_util';
import { Store } from './db/store';
import { SyncEngine } from './db/sync/sync_engine';
import { FutsalShuffle } from './futsal_shuffle';
import { fs, load_native_fs } from '@native/fs/fs';
import bpath from 'path-browserify';
import { run_startup_links } from './linker';
import { load_native_mmkv } from '@native/mmkv/mmkv';
import { load_native_sqlite } from '@native/sqlite/sqlite';
import { breadcrumb } from '@common/sentry_error_handler';
import * as Sentry from '@sentry/react-native';

async function reload_library() {
	await SQLTracks.fetch_track_data();
	SQLPlaylists.invalidate_playlist_tracks_cache();
	SQLGlobal.notify_global_tracks_updated();
}

/** Syncs once the app runs on the v2 database, after migrating the 1810 one in the background if needed */
function start_sync() {
	SyncEngine.on_library_changed(() => { reload_library().catch(catch_log); });
	if (!Store.legacy()) {
		SyncEngine.start();
		return;
	}
	DatabaseBoot.run_migration(async () => {
		await reload_library();
		breadcrumb('startup', 'legacy database migrated');
		SyncEngine.start();
	}).catch(catch_log);
}

export async function warmup_client() {
	await load_native_ffmpeg();
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
	const startup_t0 = Date.now();
	const phase_timings: [string, number][] = [];
	let last_phase_ms = 0;

	const phase = (name: string) => {
		const elapsed = Date.now() - startup_t0;
		const section_ms = elapsed - last_phase_ms;
		phase_timings.push([name, elapsed]);
		last_phase_ms = elapsed;
		breadcrumb('startup', `illusi_startup: ${name}`, { elapsed_ms: elapsed, section_ms });
	};

	try {
		phase('native modules start');
		await Promise.all([
			load_native_fs(),
			load_native_mmkv(),
			load_native_sqlite()
		]);
		phase('native modules done');

		const prefs_chain = (async () => {
			await Prefs.load_mmkv_module();
			await Prefs.load_prefs();
			phase('prefs loaded');
		})();
		const database_chain = (async () => {
			await SQLfs.cache_load_directories();
			// Which account's database to open is saved in prefs
			await prefs_chain;
			if (!await DatabaseBoot.open().catch((error: unknown) => {
				catch_log(error);
				return false;
			})) {
				console.error('BAD DATABASE CONNECTION');
				return false;
			}
			phase('db migrated');
			await SQLTracks.fetch_track_data();
			phase('tracks fetched');
			return true;
		})();
		const [database_connected] = await Promise.all([database_chain, prefs_chain]);
		if (!database_connected) return;

		GLOBALS.global_var.play_tracks = play_tracks;
		GLOBALS.global_var.download_track = download_track;
		GLOBALS.global_var.download_track_lyrics = download_track_lyrics;
		GLOBALS.global_var.set_theme = set_theme;
		GLOBALS.global_var.bottom_alert = bottom_alert;

		// Old updates only apply to the 1810 database; v2 is created from it already updated
		const database_version_before_update = Prefs.get_pref('database_version');
		if (Store.legacy()) await SQLUpdate.fix_to_new_update();

		on_finish_essentials();

		if (Prefs.get_pref('database_version') !== database_version_before_update) await SQLTracks.fetch_track_data();

		if (version === Prefs.get_pref('latest_version')) {
			GLOBALS.global_var.past_playing_tracks = SQLTracks.add_playback_saved_data_to_tracks(Prefs.get_pref('past_queue').tracks);
			GLOBALS.global_var.past_track_index = Prefs.get_pref('past_queue').index;
		} else {
			await Prefs.save_pref('recent_rejected_ota_update', '');
			await Prefs.save_pref('past_queue', { index: 0, tracks: [] });
			(async () => {
				const tmp_dir = await fs().temp_directory();
				const tmp_dir_file_list = await fs().read_directory(tmp_dir);
				if ('error' in tmp_dir_file_list) {
					GLOBALS.global_var.bottom_alert('Failed to purge temp cache on update', 'WARN', tmp_dir_file_list);
				} else {
					await Promise.all(tmp_dir_file_list.map(async (file) => {
						const file_path = bpath.join(tmp_dir, file);
						const info = await fs().get_info(file_path);
						if (info.is_directory) return;
						await fs().remove(file_path);
					}));
				}
			})().catch(catch_log);
		}
		await Prefs.save_pref('latest_version', version);
		phase('update check done');

		Sentry.setContext('library', { track_count: GLOBALS.global_var.sql_tracks.length });

		(async () => {
			start_sync();
			if (Prefs.get_pref('album_track_tinting')) {
				generate_unique_track_tints(GLOBALS.global_var.sql_tracks, GLOBALS.global_var.tint_table);
				SQLGlobal.notify_global_tracks_updated();
			}
			await SQLArtists.get_all_sql_artists();
			await Promise.all([
				SQLRecentlyPlayed.cleanup_recently_played(),
				load_native_miscnative().then(async m => m.keep_mobile_awake())
			]).catch(catch_log);
		})().catch(catch_log);
		phase('sync_engine');

		Prefs.pref_set_theme(set_theme);
		SQLfs.recreate_directories().catch(catch_log);
		phase('dir');
		warmup_client().catch(catch_log);
		phase('warmup');
		if (Prefs.get_pref('use_track_shuffle_bias')) FutsalShuffle.build_cache();
		phase('shuffle_bias');
		run_startup_links(Prefs.get_pref('linker_links')).catch(catch_log);
		phase('links');

		const total_ms = Date.now() - startup_t0;
		const phase_summary = Object.fromEntries(phase_timings.map(([name, ms], i) => [name, `${i > 0 ? ms - phase_timings[i - 1][1] : ms}ms`]));
		breadcrumb('startup', 'illusi_startup: complete', { total_ms, ...phase_summary });

		if (total_ms > 2800) {
			Sentry.captureMessage('Slow app startup', {
				level: 'warning',
				tags: { perf: 'startup' },
				extra: { total_ms, track_count: GLOBALS.global_var.sql_tracks.length, ...phase_summary }
			});
		}
	} catch (error) {
		GLOBALS.global_var.bottom_alert('Illusi Startup Failed', 'ERROR', { error: error as Error });
	}
}

async function run_shortcut(play_tracks: typeof GLOBALS.global_var.play_tracks, userInfo: { uuid: string }, activityType: string) {
	const info = reinterpret_cast<{ uuid: string }>(userInfo);
	switch (activityType) {
		case 'com.illusion137.Illusi.ShuffleMusic': {
			if (is_empty(info.uuid)) return;
			const default_playlist_names = default_playlists.map(playlist => playlist.name);
			const shuffled = Illusive.shuffle_tracks('SHUFFLE', default_playlist_names.includes(info.uuid) ? await default_playlists.find(playlist => playlist.name === info.uuid)!.track_function() : info.uuid === Constants.library_write_playlist ? GLOBALS.global_var.sql_tracks : await SQLPlaylists.playlist_tracks(info.uuid));
			play_tracks(shuffled[0], shuffled, 'Shortcut');
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

export async function on_app_load(version: string, play_tracks: typeof GLOBALS.global_var.play_tracks, set_theme: SetState, update_bottom_alert: typeof GLOBALS.global_var.bottom_alert, set_is_loading: SetState) {
	await illusi_startup(version, play_tracks, set_theme, update_bottom_alert, async () => {
		set_is_loading(false);
		const maybe_initial_shortcut = reinterpret_cast<InitialShortcut>(await getInitialShortcut());
		const default_playlist_names = default_playlists.map(playlist => playlist.name);
		if (maybe_initial_shortcut?.userInfo && !default_playlist_names.includes(maybe_initial_shortcut.userInfo.uuid)) {
			await run_shortcut(play_tracks, maybe_initial_shortcut.userInfo, maybe_initial_shortcut.activityType);
		}
		if (maybe_initial_shortcut?.userInfo && default_playlist_names.includes((maybe_initial_shortcut.userInfo as { uuid: string }).uuid)) {
			await run_shortcut(play_tracks, maybe_initial_shortcut.userInfo, maybe_initial_shortcut.activityType);
		}
		load_native_modules().catch(catch_log);
	});
}
