import { activateKeepAwakeAsync } from 'expo-keep-awake';
import * as ffmpeg from 'ffmpeg-kit-react-native';
import { Prefs } from '../../prefs';
import { BottomAlertType, Track } from '../../types';
import { download_track } from './downloader'
import * as GLOBALS from './globals';
import { catch_function_async } from './illusi_utils';
import * as SQLRecentlyPlayed from './sql/sql_recently_played';
import * as SQLPlaylists from './sql/sql_playlists';
import * as SQLTracks from './sql/sql_tracks';
import * as SQLUpdate from './sql/sql_update';
import * as SQLUtils from './sql/sql_utils';

export async function illusi_startup(version: string, play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => void, set_theme: (theme: Prefs.Theme) => void, bottom_alert: (text: string, type: BottomAlertType) => void) {
    await catch_function_async(async() => {
        // console.log(((await db.runAsync( SQLUtils.sql_drop_table("new_releases") )).changes));
        // console.log(((await db.runAsync( SQLUtils.sql_drop_table("seen_new_releases") )).changes));
        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        GLOBALS.global_var.set_theme = set_theme;
        GLOBALS.global_var.bottom_alert = bottom_alert;
        ffmpeg.FFmpegKitConfig.setLogLevel(ffmpeg.Level.AV_LOG_QUIET).catch(e => e);
        const statistics_callback = (statistics: ffmpeg.Statistics) => {
            const dlidx = GLOBALS.downloading.findIndex(item => item.execution_id === statistics.getSessionId());
            if (dlidx === -1) return;
            const progress = Math.floor(statistics.getTime() / 1000) / GLOBALS.downloading[dlidx].duration;
            GLOBALS.downloading[dlidx].progress = Math.floor(progress * 100);
            if (GLOBALS.downloading[dlidx].progress_updater !== undefined) {
                GLOBALS.downloading[dlidx].progress_updater(GLOBALS.downloading[dlidx].progress);
            }
        };
        ffmpeg.FFmpegKitConfig.enableStatisticsCallback(statistics_callback);
        
        await Promise.all(
            [
                SQLUtils.recreate_all_tables(),
                Prefs.load_prefs()
            ]
        )
        await SQLUpdate.fix_to_new_update(version);

        await SQLTracks.fetch_track_data();
        
        Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            SQLPlaylists.all_playlists_data("PROMISE"),
            activateKeepAwakeAsync()
        ]).catch(e => e);
        Prefs.pref_set_theme(set_theme);
    })
}