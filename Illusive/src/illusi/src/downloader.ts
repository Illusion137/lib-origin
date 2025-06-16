/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import * as ffmpeg from 'ffmpeg-kit-react-native';
import { is_empty } from '../../../../origin/src/utils/util';
import { Constants } from '../../constants';
import { Illusive } from '../../illusive';
import { create_uri, number_epsilon_distance } from '../../illusive_utilts';
import { Prefs } from '../../prefs';
import { DownloadFromIdResult, DownloadTrackResult, ISOString, NamedUUID, SetState, Track, TrackMetaData } from "../../types";
import { alert_error } from './alert';
import * as GLOBALS from './globals';
import { playlist_tracks } from './playlist_converter';
import * as SQLBackpack from './sql/sql_backpack';
import * as SQLfs from './sql/sql_fs';
import * as SQLTracks from './sql/sql_tracks';

function wait_for(condition_function: () => boolean) {
    const poll = (resolve: ()=>void) => {
        if (condition_function()) resolve();
        else setTimeout((_: never) => poll(resolve), 400);
    }
    return new Promise(poll as never);
}
export function sort_tracks_for_download(tracks: Track[]): Track[] {
    return tracks.sort((a, b) => a.duration - b.duration);
}
export function sort_filter_tracks(tracks: Track[]) {
    return sort_tracks_for_download(tracks.filter(item => is_empty(item.media_uri) || Prefs.get_pref('can_redownload_batch') ));
}
export async function download_track_list(tracks: Track[]) {
    for(const track of sort_filter_tracks(tracks))
        GLOBALS.global_var.download_track(track).catch(e => alert_error(e));
}

export async function batch_download(playlist_key: string, slice?: [number, number]) {
    return await download_track_list((await playlist_tracks(playlist_key)).slice(slice?.[0], slice?.[1]));
}
export async function batch_undownload(playlist_key: string, slice?: [number, number], callback?: (progress:number) => void){
    const tracks = (await playlist_tracks(playlist_key)).slice(slice?.[0], slice?.[1]);
    for(let i = 0; i < tracks.length; i++){
        if(!Illusive.is_youtube(tracks[i])){
            await SQLTracks.clear_track_youtube(tracks[i].uid);
        }
        await SQLTracks.mark_track_undownloaded(tracks[i].uid, tracks[i].media_uri!);
        callback?.((i+1)/tracks.length);
    }
}
export async function undownload_track(track: Track){
    if(!Illusive.is_youtube(track)){
        await SQLTracks.clear_track_youtube(track.uid);
    }
    await SQLTracks.mark_track_undownloaded(track.uid, track.media_uri!);
}

function download_error_callback(title: string, error: Error, track: Track, start_download?: SetState): "ERROR" {
    if (start_download !== undefined) start_download(false);
    if( error.message ) alert_error({error: new Error(title + ": " + JSON.stringify({title: track.title, uid: track.uid}) + ":\n" + error.message + ":\n")});
    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
    GLOBALS.downloading.splice(item_index, 1);
    return "ERROR";
}
export async function handle_track_meta_data(track: Track, metadata: undefined|DownloadFromIdResult['metadata']) {
    if(metadata === undefined) return;
    if(!await SQLTracks.track_exists(track)) return;
    if(track.artists[0].uri === null) {
        await SQLTracks.update_track(track.uid, 
            {
                ...track, 
                artists: [
                    {name: track.artists[0].name, uri: create_uri("youtube", metadata.artist_id)} as NamedUUID
                ].concat(...track.artists.slice(1)),
            });
    }
    const new_metadata: TrackMetaData = {
        ...(!is_empty(track.meta) ? track.meta! : ({
            plays: 0,
            added_date: new Date().toISOString() as ISOString,
            last_played_date: new Date().toISOString() as ISOString
        })),
        age_restricted: metadata.age_restricted,
        chapters: metadata.chapters,
        songs: metadata.songs,
    }
    track.meta = new_metadata;
    await SQLTracks.update_track_meta_data(track.uid, new_metadata);
}
export async function handle_new_track_data(track: Track, dl_uri: Awaited<ReturnType<typeof Illusive.get_download_url>>) {
    if("error" in dl_uri) return dl_uri;
    if(!await SQLTracks.track_exists(track))
        if(dl_uri.new_track_data !== undefined)
            return (await SQLTracks.add_playback_saved_data_to_tracks([
                SQLTracks.merge_track_with_new_track(track, dl_uri.new_track_data)
            ]))[0];
        else return (await SQLTracks.add_playback_saved_data_to_tracks([track]))[0];
    if ("new_track_data" in dl_uri && dl_uri.new_track_data !== undefined) {
        await SQLTracks.update_track_with_new_track_data(track, dl_uri.new_track_data);
        track = SQLTracks.merge_track_with_new_track(track, dl_uri.new_track_data);
    }
    if("metadata" in dl_uri) {
        await handle_track_meta_data(track, dl_uri.metadata);
    }
    return (await SQLTracks.add_playback_saved_data_to_tracks([track]))[0];
}
export async function download_track(track: Track, progress_updater?: SetState, start_download?: SetState, set_finished_downloaded?: SetState): Promise<DownloadTrackResult> {
    if(GLOBALS.downloading.find(item => item.uid === track.uid)) return "GOOD";
    function in_download_range(uid: string, download_queue_max_length: number) {
        for (let i = 0; i < download_queue_max_length; i++)
            if (GLOBALS.downloading[i].uid === uid)
                return true;
        return false;
    }

    GLOBALS.downloading.push({ uid: track.uid, progress: 0, progress_updater: progress_updater, execution_id: 0, duration: track.duration });
    const download_queue_max_length = Prefs.get_pref('download_queue_max_length');
    wait_for(() => in_download_range(track.uid, download_queue_max_length))
        .then(async () => {
            const is_redownloading = (is_empty(track.media_uri) && !Illusive.is_youtube(track)) || (Prefs.get_pref('can_redownload') && !Illusive.is_youtube(track));
            if(is_redownloading) {
                track = {...track, youtube_id: ""};
                if(!is_empty(track.media_uri)) await SQLTracks.mark_track_undownloaded(track.uid, track.media_uri!);
            } 

            const download_uri = await Illusive.get_download_url(SQLfs.document_directory(""), track, "highestaudio", Prefs.get_pref('can_redownload'));
            if ("error" in download_uri) {
                if (download_uri.error.message.toLowerCase().includes("unavailable"))
                    await SQLBackpack.add_to_backpack(track.uid);
                return download_error_callback("Couldn't find the file", download_uri.error, track, start_download);
            }
            if("url" in download_uri && download_uri.url.includes("file://")) {
                return download_error_callback("", new Error(""), track, start_download);
            }
            const nt_handle = await handle_new_track_data(track, download_uri);
            if(!("error" in nt_handle)) track = nt_handle;
            else {
                return download_error_callback("New Track Error", nt_handle.error, track, start_download);
            }
            try {
                if (start_download !== undefined) start_download(true);
                const media_uri = track.uid + '.aac';
                const new_uri = SQLfs.media_directory(media_uri);
                ffmpeg.FFmpegKit.executeAsync(`-y -i ${download_uri.url} -vn ${new_uri}`, async (execution) => {
                    try {
                        const retcode = (await execution.getReturnCode()).getValue();
                        if(retcode !== Constants.ffmpeg_retcode_success)
                            throw new Error(`FFMPEG return status code: ${retcode};\n Execution ID: ${execution.getSessionId()}`)
                        const sound_temp = new Audio.Sound();
                        await sound_temp.loadAsync({ uri: new_uri });
                        const meta_data = await sound_temp.getStatusAsync();
                        await sound_temp.unloadAsync();
                        if (meta_data.isLoaded === false)
                            throw new Error('No load');
                        const downloaded_duration = Math.floor((meta_data.durationMillis ?? 0) / 1000);
                        if (Math.round(downloaded_duration) < 3)
                            throw new Error(`Invalid Duration: ${downloaded_duration}`);
                        else if(isNaN(track.duration)){
                            await SQLTracks.update_track(track.uid, {...track, duration: downloaded_duration})
                        }
                        else if (!number_epsilon_distance(downloaded_duration, track.duration, Constants.download_duration_epsilon))
                            throw new Error(`Epsilon Duration > ${Constants.download_duration_epsilon} With ${Math.abs(downloaded_duration - track.duration)}`);

                        await SQLTracks.mark_track_downloaded(track.uid, media_uri);

                        const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                        GLOBALS.downloading.splice(item_index, 1);

                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

                        if (GLOBALS.downloading.length === 0)
                            Alert.alert("Finished Download Enqueued Tracks");
                        if (start_download !== undefined)          start_download(false);
                        if (set_finished_downloaded !== undefined) set_finished_downloaded(true);
                    } catch (error) {
                        download_error_callback("Failed To Download:", error as Error, track, start_download);
                    }
                }, () => {}, () => {}).then(ff_session => {
                    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                    if(item_index !== -1)
                        GLOBALS.downloading[item_index].execution_id = ff_session.getSessionId();
                })
            } catch (error) {
                return download_error_callback("Failed To Download:", error as Error, track, start_download);
            }
            return "GOOD";
    });
    return "GOOD";
}

export async function ffcache_yt(url: string, track: Track) {
    const hls_out_uri = SQLfs.cache_directory(`playlist_${track.youtube_id}.m3u8`);
    const hls_segments = SQLfs.cache_directory(`file_${track.youtube_id}__%d.m4a`);
    const cmd = `-y -i "${url}" -c:a aac -b:a 128k -muxdelay 0 -f segment -sc_threshold 0 -segment_time 7 -segment_list "${hls_out_uri}" -segment_format mpegts "${hls_segments}"`;
    ffmpeg.FFmpegKit.executeAsync(cmd, () => {}, () => {}, () => {}).catch(e => e);
    return hls_out_uri;
}