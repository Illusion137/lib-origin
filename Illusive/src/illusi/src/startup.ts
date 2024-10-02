import * as GLOBALS from './globals';
import * as SQLActions from './sql_actions';
import * as ffmpeg from 'react-native-ffmpeg';
import * as LegacyPrefs from './legacy/1307/legacy_prefs';
import { Prefs } from '../../prefs';
import { download_track } from './downloader'
import { Promises, Track } from '../../types';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { Alert } from 'react-native';

export async function illusi_startup(play_tracks: (first_track: Track, tracks: Track[], playlist_name: string) => void) {
    try {
        GLOBALS.global_var.play_tracks = play_tracks;
        GLOBALS.global_var.download_track = download_track;
        ffmpeg.RNFFmpegConfig.setLogLevel(ffmpeg.LogLevel.AV_LOG_QUIET);
        const statistics_callback = (statistics: ffmpeg.Statistics) => {
            const index = GLOBALS.downloading.findIndex(item => item.execution_id == statistics.executionId);
            if (index == -1) return;
            const progress = Math.floor(statistics.time / 1000) / GLOBALS.downloading[index].duration;
            GLOBALS.downloading[index].progress = Math.floor(progress * 100);
            if (GLOBALS.downloading[index].progress_updater !== undefined) {
                GLOBALS.downloading[index].progress_updater(GLOBALS.downloading[index].progress);
            }
        };
        ffmpeg.RNFFmpegConfig.enableStatisticsCallback(statistics_callback);
        await SQLActions.recreate_all_tables();

        const legacy_prefs = LegacyPrefs.get_legacy_prefs();
        await Prefs.load_prefs();
        if(legacy_prefs === null) await Prefs.load_legacy_prefs(legacy_prefs);
        await SQLActions.fix_to_new_update();
        await SQLActions.fetch_track_data();
        await Promise.all([
            SQLActions.cleanup_recently_played(),
            activateKeepAwakeAsync()
        ]);
    } catch (error) { Alert.alert("Error", String(error)); }
}