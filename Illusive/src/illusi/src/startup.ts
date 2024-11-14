import * as GLOBALS from './globals';
import * as SQLTracks from './sql/sql_tracks';
import * as SQLUtils from './sql/sql_utils';
import * as SQLUpdate from './sql/sql_update';
import * as SQLRecentlyPlayed from './sql/sql_recently_played';
import * as ffmpeg from 'react-native-ffmpeg';
import * as LegacyPrefs from './legacy/1307/legacy_prefs';
import { Prefs } from '../../prefs';
import { download_track } from './downloader'
import { Track } from '../../types';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { catch_function_async } from './illusi_utils';

export async function illusi_startup(play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => void, set_theme: (theme: Prefs.Theme) => void) {
    await catch_function_async(async() => {
        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        GLOBALS.global_var.set_theme = set_theme;
        ffmpeg.RNFFmpegConfig.setLogLevel(ffmpeg.LogLevel.AV_LOG_QUIET);
        const statistics_callback = (statistics: ffmpeg.Statistics) => {
            const dlidx = GLOBALS.downloading.findIndex(item => item.execution_id === statistics.executionId);
            if (dlidx === -1) return;
            const progress = Math.floor(statistics.time / 1000) / GLOBALS.downloading[dlidx].duration;
            GLOBALS.downloading[dlidx].progress = Math.floor(progress * 100);
            if (GLOBALS.downloading[dlidx].progress_updater !== undefined) {
                GLOBALS.downloading[dlidx].progress_updater(GLOBALS.downloading[dlidx].progress);
            }
        };
        ffmpeg.RNFFmpegConfig.enableStatisticsCallback(statistics_callback);
        
        await SQLUtils.recreate_all_tables();

        const legacy_prefs = LegacyPrefs.get_legacy_prefs();
        await Prefs.load_prefs();
        if(legacy_prefs === null) await Prefs.load_legacy_prefs(legacy_prefs);
        await SQLUpdate.fix_to_new_update();
        await SQLTracks.fetch_track_data();
        await Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            activateKeepAwakeAsync()
        ]);
        if(Prefs.get_pref('auto_clean_directories')) SQLTracks.clean_directories();
        set_theme(Prefs.get_theme(Prefs.get_pref('theme')));
    })
}