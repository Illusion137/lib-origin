import * as SQLActions from './sql_actions';
import * as GLOBALS from './globals';
import * as ffmpeg from 'react-native-ffmpeg';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Track, SetState, DownloadTrackResult } from "../../types";
import { Prefs } from '../../prefs';
import { Illusive } from '../../illusive';
import { Alert } from 'react-native';

function wait_for(condition_function: () => boolean) {
    const poll = (resolve: any) => {
        if (condition_function()) resolve();
        else setTimeout((_: any) => poll(resolve), 400);
    }
    return new Promise(poll);
}
export async function download_track(track: Track, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult> {
    function in_download_range(uid: string, download_queue_max_length: number) {
        for (let i = 0; i < download_queue_max_length; i++)
            if (GLOBALS.downloading[i].uid === uid)
                return true;
        return false;
    }

    GLOBALS.downloading.push({ 'uid': track.uid, 'progress': 0, 'progress_updater': progress_updater, 'execution_id': 0, 'duration': track.duration });
    const download_queue_max_length: number = Prefs.get_pref('download_queue_max_length');
    wait_for(() => in_download_range(track.uid, download_queue_max_length))
        .then(async () => {
            const download_uri = await Illusive.get_download_url(SQLActions.document_directory(""), track);
            if ("error" in download_uri) {
                if (download_uri.error.includes("Video unavailable"))
                    SQLActions.add_to_backpack(track.uid);
                if (start_download != undefined)
                    start_download(false);
                const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                GLOBALS.downloading.splice(item_index, 1);
                Alert.alert("Coudln't find the file", `${track.uid} : ${download_uri.error}`);
                return "ERROR";
            }
            if ("new_track_data" in download_uri && download_uri.new_track_data !== undefined) {
                await SQLActions.update_track_with_new_track_data(track, download_uri.new_track_data);
                track = SQLActions.merge_track_with_new_track(track, download_uri.new_track_data!);
            }
            if("url" in download_uri && download_uri.url.includes("file://")) {
                const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                GLOBALS.downloading.splice(item_index, 1);
                return;
            }
            try {
                if (start_download !== undefined) start_download(true);
                const new_uri = SQLActions.media_directory() + track.uid + '.m4a';
                ffmpeg.RNFFmpeg.executeAsync(`-y -i ${download_uri.url} ${new_uri}`, async () => {
                    try {
                        const sound_temp = new Audio.Sound();
                        await sound_temp.loadAsync({ uri: new_uri });
                        const meta_data = await sound_temp.getStatusAsync();
                        await sound_temp.unloadAsync();
                        if (meta_data.isLoaded === false)
                            throw new Error('No load');
                        if (Math.round((meta_data.durationMillis ?? 0) / 1000) < 3)
                            throw new Error('Invalid Duration');

                        await SQLActions.mark_track_downloaded(track.uid, track.uid + '.m4a');

                        const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                        GLOBALS.downloading.splice(item_index, 1);

                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                        if (GLOBALS.downloading.length === 0)
                            Alert.alert("Finished Download Enqueued Tracks");
                        if (start_download !== undefined)          start_download(false);
                        if (set_finished_downloaded !== undefined) set_finished_downloaded(true);
                    } catch (error) {
                        if (start_download !== undefined) start_download(false);
                        Alert.alert("Downloading Error", "Failed To Download: " + JSON.stringify(track) + ":\n" + error);
                        const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                        GLOBALS.downloading.splice(item_index, 1)
                        if (GLOBALS.downloading.length === 0) {
                            Alert.alert("Finished Download Playlist")
                        }
                    }
                }).then(execution_id => {
                    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                    if(item_index !== -1)
                        GLOBALS.downloading[item_index].execution_id = execution_id;
                })
            } catch (e) {
                if (start_download != undefined)
                    start_download(false)
                Alert.alert("Downloading Error", "Failed To Download: " + JSON.stringify(track) + ":\n" + e);
                const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                GLOBALS.downloading.splice(item_index, 1);
                if (GLOBALS.downloading.length === 0)
                    Alert.alert("Finished Download Playlist");
            }
            return "GOOD";
        });
    return "GOOD";
}