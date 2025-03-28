import { activateKeepAwakeAsync } from 'expo-keep-awake';
import * as ffmpeg from 'ffmpeg-kit-react-native';
import { Prefs } from '../../prefs';
import { BottomAlertType, Track } from '../../types';
import { download_track } from './downloader'
import * as GLOBALS from './globals';
import { catch_function_async } from './illusi_utils';
import * as LegacyPrefs from './legacy/1307/legacy_prefs';
import * as SQLRecentlyPlayed from './sql/sql_recently_played';
import * as SQLTracks from './sql/sql_tracks';
import * as SQLUpdate from './sql/sql_update';
import * as SQLUtils from './sql/sql_utils';
import * as Origin from '../../../../origin/src/index';
import { generate_unique_track_tints } from '../../illusive_utilts';

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
        
        await SQLUtils.recreate_all_tables();

        const legacy_prefs = LegacyPrefs.get_legacy_prefs();
        await Prefs.load_prefs();
        if(legacy_prefs === null) await Prefs.load_legacy_prefs(legacy_prefs);
        await SQLUpdate.fix_to_new_update(version);
        await SQLTracks.fetch_track_data();
        await Promise.all([
            SQLRecentlyPlayed.cleanup_recently_played(),
            activateKeepAwakeAsync()
        ]);
        if(Prefs.get_pref('album_track_tinting')){
            generate_unique_track_tints(GLOBALS.global_var.sql_tracks, GLOBALS.global_var.tint_table);
        }
        Prefs.pref_set_theme(set_theme);

        if(Prefs.get_pref('keep_soundcloud_alive')){
            Origin.SoundCloud.try_connect_session({cookie_jar: Prefs.get_pref('soundcloud_cookie_jar')}).then(async(result) => {
                if(result.ok) await Prefs.save_pref('soundcloud_cookie_jar', Prefs.get_pref('soundcloud_cookie_jar'));
            }).catch(e => e);
        }
    })
}