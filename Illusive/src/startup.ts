import { catch_function_async } from '@common/utils/util';
import { Prefs } from '@illusive/prefs';
import type { BottomAlertType, Track } from '@illusive/types';
import { GLOBALS } from './globals';
import { download_track } from './downloader';
import { SQLTracks } from './sql/sql_tracks';
import { SQLRecentlyPlayed } from './sql/sql_recently_played';
import { SQLPlaylists } from './sql/sql_playlists';
import { load_native_modules } from '@native/gen/load_native_modules';
import { miscnative } from '@native/miscnative/miscnative';
import { IllusiIcons } from './illusi_icons';
import { SQLfs } from './sql/sql_fs';
import { load_database } from './db/database';

export async function illusi_startup(version: string, play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => void, set_theme: (theme: Prefs.Theme) => void, bottom_alert: (text: string, type: BottomAlertType) => void) {
    await catch_function_async(async() => {
        await load_native_modules();
        await SQLfs.cache_load_directories();
        await Prefs.load_mmkv_module();
        await IllusiIcons.load_illusi_icons();
        //TODO CHANGE location based on platform
        await load_database(SQLfs.document_directory(".illusi/sumi.sqlite"));
        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        GLOBALS.global_var.set_theme = set_theme;
        GLOBALS.global_var.bottom_alert = bottom_alert;
        // ffmpeg.FFmpegKitConfig.setLogLevel(ffmpeg.Level.AV_LOG_QUIET).catch(e => e);
        // const statistics_callback = (statistics: ffmpeg.Statistics) => {
        //     const dlidx = GLOBALS.downloading.findIndex(item => item.execution_id === statistics.getSessionId());
        //     if (dlidx === -1) return;
        //     const progress = Math.floor(statistics.getTime() / 1000) / GLOBALS.downloading[dlidx].duration;
        //     GLOBALS.downloading[dlidx].progress = Math.floor(progress * 100);
        //     if (GLOBALS.downloading[dlidx].progress_updater !== undefined) {
        //         GLOBALS.downloading[dlidx].progress_updater(GLOBALS.downloading[dlidx].progress);
        //     }
        // };
        // ffmpeg.FFmpegKitConfig.enableStatisticsCallback(statistics_callback);
        
        await Promise.all(
            [
                // SQLUtils.recreate_all_tables(),
                Prefs.load_prefs()
            ]
        )
        // await SQLUpdate.fix_to_new_update(version);

        await SQLTracks.fetch_track_data();
        
        Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            SQLPlaylists.all_playlists_data("PROMISE"),
            miscnative().keep_mobile_awake()
        ]).catch(e => e);
        Prefs.pref_set_theme(set_theme);
    }, (error) => GLOBALS.global_var.bottom_alert((error as Error).message, "WARN"))
}