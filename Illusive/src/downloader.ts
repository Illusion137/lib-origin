/* eslint-disable @typescript-eslint/no-floating-promises */
import { is_empty } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { Illusive } from '@illusive/illusive';
import { create_uri, number_epsilon_distance, track_exists } from '@illusive/illusive_utilts';
import type { DownloadFromIdResult, DownloadTrackResult, ISOString, NamedUUID, OnErrorCallback, SetState, Track, TrackMetaData } from "@illusive/types";
import { get_audio_duration } from '@native/get_audio_duration/get_audio_duration';
import { GLOBALS } from './globals';
import { get_playlist_tracks } from './playlist_utils';
import { SQLPlaylists } from './sql/sql_playlists';
import { SQLTracks } from './sql/sql_tracks';
import type { ResponseError } from '@common/types';
import { SQLBackpack } from './sql/sql_backpack';
import { SQLfs } from './sql/sql_fs';
import { ffmpeg } from '@native/ffmpeg/ffmpeg';
import { generror } from '@common/utils/error_util';

async function wait_for(condition_function: () => boolean) {
    const poll = (resolve: () => void) => {
        if (condition_function()) resolve();
        else setTimeout((_: never) => { poll(resolve) }, 400);
    }
    return new Promise(poll as never);
}
export function sort_tracks_for_download(tracks: Track[]): Track[] {
    return tracks.sort((a, b) => a.duration - b.duration);
}
export function sort_filter_tracks(tracks: Track[], redownload_batch = false) {
    return sort_tracks_for_download(tracks.filter(item => is_empty(item.media_uri) || redownload_batch ));
}
export async function download_track_list(tracks: Track[], on_error?: OnErrorCallback) {
    for(const track of sort_filter_tracks(tracks))
        GLOBALS.global_var.download_track(track).catch(e => {on_error?.(e)});
}

export async function batch_download(playlist_key: string, slice?: [number, number]) {
    await download_track_list((await get_playlist_tracks(playlist_key, GLOBALS.global_var.sql_tracks, SQLPlaylists.playlist_tracks)).slice(slice?.[0], slice?.[1]));
}
export async function batch_undownload(playlist_key: string, slice?: [number, number], callback?: (progress:number) => void){
    const tracks = (await get_playlist_tracks(playlist_key, GLOBALS.global_var.sql_tracks, SQLPlaylists.playlist_tracks)).slice(slice?.[0], slice?.[1]);
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

function download_error_callback(track: Track, error: ResponseError, on_error: OnErrorCallback, start_download?: SetState): "ERROR" {
    if (start_download !== undefined) start_download(false);
    on_error?.(error);
    const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
    GLOBALS.downloading.splice(item_index, 1);
    return "ERROR";
}
export async function handle_track_meta_data(track: Track, metadata: undefined|DownloadFromIdResult['metadata']) {
    if(metadata === undefined) return;
    if(!track_exists(track, GLOBALS.global_var.sql_tracks)) return;
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
    if(!track_exists(track, GLOBALS.global_var.sql_tracks))
        if(dl_uri.new_track_data !== undefined)
            return SQLTracks.add_playback_saved_data_to_track(
                SQLTracks.merge_track_with_new_track(track, dl_uri.new_track_data)
            );
        else return SQLTracks.add_playback_saved_data_to_track(track);
    if ("new_track_data" in dl_uri && dl_uri.new_track_data !== undefined) {
        await SQLTracks.update_track_with_new_track_data(track, dl_uri.new_track_data);
        track = SQLTracks.merge_track_with_new_track(track, dl_uri.new_track_data);
    }
    if("metadata" in dl_uri) {
        await handle_track_meta_data(track, dl_uri.metadata);
    }
    return SQLTracks.add_playback_saved_data_to_track(track);
}
export async function download_track(track: Track, redownload = false): Promise<DownloadTrackResult> {
    if(GLOBALS.downloading.find(item => item.uid === track.uid)) return "GOOD";
    function in_download_range(uid: string, download_queue_max_length: number) {
        for (let i = 0; i < download_queue_max_length; i++)
            if (GLOBALS.downloading[i].uid === uid)
                return true;
        return false;
    }

    GLOBALS.downloading.push({ uid: track.uid, progress: -1, execution_id: -1, duration: track.duration });
    wait_for(() => in_download_range(track.uid, Constants.download_queue_max_length))
        .then(async () => {
            const is_redownloading = (is_empty(track.media_uri) && !Illusive.is_youtube(track)) || (redownload && !Illusive.is_youtube(track));
            if(is_redownloading) {
                track = {...track, youtube_id: ""};
                if(!is_empty(track.media_uri)) await SQLTracks.mark_track_undownloaded(track.uid, track.media_uri!);
            } 
            const download_uri = await Illusive.get_download_url(await SQLfs.document_directory(""), track, "highestaudio", redownload);
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
            const media_uri = track.uid + '.mp4';
            const new_uri = await SQLfs.media_directory(media_uri);
            const ffmpeg_result = await ffmpeg().execute_args([
                '-y',
                '-i',
                download_uri.url,
                '-vn',
                '-c:a',
                'aac',
                '-b:a',
                '128k',
                new_uri,
            ]);
            {
                const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                if(item_index !== -1)
                    GLOBALS.downloading[item_index].execution_id = ffmpeg_result.session_id;
            }

            const retcode = await ffmpeg_result.retcode;
            if(retcode !== Constants.ffmpeg_retcode_success) return generror(`FFMPEG return status code: ${retcode};\n Execution ID: ${ffmpeg_result.session_id}`);
            
            const audio_duration_seconds = await get_audio_duration.get_audio_duration(new_uri);
            if(audio_duration_seconds === -1) return generror("Unable to access audio metadata duration");

            if (Math.round(audio_duration_seconds) < 3) return generror(`Invalid Duration: ${audio_duration_seconds}`);
            else if(is_empty(track.duration) || is_empty(track.duration)){
                await SQLTracks.update_track(track.uid, {...track, duration: audio_duration_seconds})
            }
            else if (!number_epsilon_distance(audio_duration_seconds, track.duration, Constants.download_duration_epsilon)){
                return generror(`Epsilon Duration > ${Constants.download_duration_epsilon} With ${Math.abs(audio_duration_seconds - track.duration)}`);
            }
            
            await SQLTracks.mark_track_downloaded(track.uid, media_uri);
            {
                const item_index = GLOBALS.downloading.findIndex((item) => item.uid == track.uid);
                GLOBALS.downloading.splice(item_index, 1);
            }
            return "GOOD";
    });
    return "GOOD";
}