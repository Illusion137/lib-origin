import * as SQLActions from './sql_actions';
import * as GLOBALS from './globals';
import * as ffmpeg from 'react-native-ffmpeg';
import * as Haptics from 'expo-haptics';
import * as fs from 'expo-file-system';
import { Audio } from 'expo-av';
import { Track, SetState, DownloadTrackResult } from "../../types";
import { Prefs } from '../../prefs';
import { Illusive } from '../../illusive';
import { Alert } from 'react-native';
import { alert_error } from './alert';
import { is_empty } from '../../../../origin/src/utils/util';
import { number_epsilon_distance } from '../../illusive_utilts';
import { Constants } from '../../constants';
import { playlist_tracks } from './playlist_converter';

function wait_for(condition_function: () => boolean) {
    const poll = (resolve: ()=>void) => {
        if (condition_function()) resolve();
        else setTimeout((_: never) => poll(resolve), 400);
    }
    return new Promise(<never>poll);
}
export function sort_tracks_for_download(tracks: Track[]): Track[]{
    return tracks.sort((a, b) => a.duration - b.duration);
}
export function sort_filter_tracks(tracks: Track[]){
    return sort_tracks_for_download(tracks.filter(item => is_empty(item.media_uri)));
}
export async function download_track_list(tracks: Track[]){
    for(const track of sort_filter_tracks(tracks))
        download_track(track);
}

export async function batch_download(key: string){
    return await download_track_list(await playlist_tracks(key));
}

function download_error_callback(title: string, error: string, track: Track, start_download?: SetState): "ERROR" {
    if (start_download !== undefined) start_download(false);
    if( !is_empty(error) ) alert_error({"error": title + ": " + JSON.stringify({title: track.title, uid: track.uid}) + ":\n" + error});
    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
    GLOBALS.downloading.splice(item_index, 1);
    return "ERROR";
}

export async function download_track(track: Track, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult> {
    function in_download_range(uid: string, download_queue_max_length: number) {
        for (let i = 0; i < download_queue_max_length; i++)
            if (GLOBALS.downloading[i].uid === uid)
                return true;
        return false;
    }

    GLOBALS.downloading.push({ 'uid': track.uid, 'progress': 0, 'progress_updater': progress_updater, 'execution_id': 0, 'duration': track.duration });
    const download_queue_max_length = Prefs.get_pref('download_queue_max_length');
    wait_for(() => in_download_range(track.uid, download_queue_max_length))
        .then(async () => {
            const download_uri = await Illusive.get_download_url(SQLActions.document_directory(""), track);
            if ("error" in download_uri) {
                if (download_uri.error.includes("Video unavailable"))
                    SQLActions.add_to_backpack(track.uid);
                return download_error_callback("Coudln't find the file", download_uri.error, track, start_download);
            }
            if ("new_track_data" in download_uri && download_uri.new_track_data !== undefined) {
                await SQLActions.update_track_with_new_track_data(track, download_uri.new_track_data);
                track = SQLActions.merge_track_with_new_track(track, download_uri.new_track_data!);
            }
            if("url" in download_uri && download_uri.url.includes("file://")) {
                return download_error_callback("", "", track, start_download);
            }
            try {
                if (start_download !== undefined) start_download(true);
                const new_uri = SQLActions.media_directory() + track.uid + '.m4a';
                ffmpeg.RNFFmpeg.executeAsync(`-y -i ${download_uri.url} ${new_uri}`, async (execution) => {
                    try {
                        if(execution.returnCode !== Constants.ffmpeg_retcode_success)
                            throw `FFMPEG return status code: ${execution.returnCode};\n Execution ID: ${execution.executionId}`
                        const sound_temp = new Audio.Sound();
                        await sound_temp.loadAsync({ uri: new_uri });
                        const meta_data = await sound_temp.getStatusAsync();
                        await sound_temp.unloadAsync();
                        if (meta_data.isLoaded === false)
                            throw 'No load';
                        const downloaded_duration = (meta_data.durationMillis ?? 0) / 1000;
                        if (Math.round(downloaded_duration) < 3)
                            throw `Invalid Duration: ${downloaded_duration}`;
                        else if (!number_epsilon_distance(downloaded_duration, track.duration, Constants.download_duration_epsilon))
                            throw `Epsilon Duration > ${Constants.download_duration_epsilon} With ${Math.abs(downloaded_duration - track.duration)}`;

                        await SQLActions.mark_track_downloaded(track.uid, track.uid + '.m4a');

                        const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                        GLOBALS.downloading.splice(item_index, 1);

                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                        if (GLOBALS.downloading.length === 0)
                            Alert.alert("Finished Download Enqueued Tracks");
                        if (start_download !== undefined)          start_download(false);
                        if (set_finished_downloaded !== undefined) set_finished_downloaded(true);
                    } catch (error) {
                        download_error_callback("Failed To Download:", String(error), track, start_download);
                    }
                }).then(execution_id => {
                    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                    if(item_index !== -1)
                        GLOBALS.downloading[item_index].execution_id = execution_id;
                })
            } catch (error) {
                return download_error_callback("Failed To Download:", String(error), track, start_download);
            }
            return "GOOD";
        });
    return "GOOD";
}

export async function ffcache_yt(url: string, track: Track){
    const hls_out_uri = fs.cacheDirectory + `playlist_${track.youtube_id}.m3u8`;
    const hls_segments = fs.cacheDirectory + `file_${track.youtube_id}__%d.m4a`;
    const cmd = `-y -i "${url}" -c:a aac -b:a 128k -muxdelay 0 -f segment -sc_threshold 0 -segment_time 7 -segment_list "${hls_out_uri}" -segment_format mpegts "${hls_segments}"`;
    ffmpeg.RNFFmpeg.executeAsync(cmd, async (execution) => {execution});
    return hls_out_uri;
}