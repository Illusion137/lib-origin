import { is_empty } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { Illusive } from '@illusive/illusive';
import { create_uri, number_epsilon_distance, track_exists } from '@illusive/illusive_utils';
import type { DownloadFromIdResult, Downloading, DownloadTrackResult, ISOString, LyricsDownloading, NamedUUID, OnErrorCallback, Track, TrackMetaData } from "@illusive/types";
import { get_audio_duration } from '@native/get_audio_duration/get_audio_duration';
import { GLOBALS } from './globals';
import { get_playlist_tracks } from './playlist_utils';
import { SQLPlaylists } from './sql/sql_playlists';
import { SQLTracks } from './sql/sql_tracks';
import { AsyncFNQueue } from '@common/types';
import { SQLBackpack } from './sql/sql_backpack';
import { SQLfs } from './sql/sql_fs';
import { ffmpeg } from '@native/ffmpeg/ffmpeg';
import { generror } from '@common/utils/error_util';
import { wait } from '@common/utils/timed_util';

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

async function download_track_base(downloading: Downloading): Promise<DownloadTrackResult> {
    const is_redownloading = (is_empty(downloading.track.media_uri) && !Illusive.is_youtube(downloading.track)) || (downloading.redownload && !Illusive.is_youtube(downloading.track));
    if(is_redownloading) {
        downloading.track = {...downloading.track, youtube_id: ""};
        if(!is_empty(downloading.track.media_uri)) await SQLTracks.mark_track_undownloaded(downloading.track.uid, downloading.track.media_uri!);
    } 
    const download_uri = await Illusive.get_download_url(SQLfs.document_directory(""), downloading.track, "highestaudio", downloading.redownload);
    if ("error" in download_uri) {
        if (download_uri.error.message.toLowerCase().includes("unavailable"))
            await SQLBackpack.add_to_backpack(downloading.track.uid);
        return generror("Couldn't find the file", downloading);
    }
    if("url" in download_uri && download_uri.url.includes("file://")) {
        return generror("File already exists", downloading);
    }
    const nt_handle = await handle_new_track_data(downloading.track, download_uri);
    if(!("error" in nt_handle)) downloading.track = nt_handle;
    else return nt_handle;

    const media_uri = downloading.track.uid + '.mp4';
    const new_uri = SQLfs.media_directory(media_uri);

    let retcode = 1;
    for(let i = 0; i < 2 && retcode !== 0; i++){
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
        ], (statistics) => {
            const progress = statistics.time_seconds / downloading.track.duration;
            track_downloader.update_key(downloading.uid, {...downloading, progress: progress});
        });
        track_downloader.update_key(downloading.uid, {...downloading, execution_id: ffmpeg_result.session_id});

        retcode = await ffmpeg_result.retcode;
        await wait(1000);
    }

    if(retcode !== Constants.ffmpeg_retcode_success) return generror(`FFMPEG return status code: ${retcode};\n UID: ${downloading.track.uid}`);
    
    const audio_duration_seconds = await get_audio_duration().get_audio_duration(new_uri);
    if(audio_duration_seconds === -1) return generror("Unable to access audio metadata duration");

    if (Math.round(audio_duration_seconds) < 3) return generror(`Invalid Duration: ${audio_duration_seconds}`);
    else if(is_empty(downloading.track.duration) || is_empty(downloading.track.duration)){
        await SQLTracks.update_track(downloading.track.uid, {...downloading.track, duration: audio_duration_seconds})
    }
    else if (!number_epsilon_distance(audio_duration_seconds, downloading.track.duration, Constants.download_duration_epsilon)){
        return generror(`Epsilon Duration > ${Constants.download_duration_epsilon} With ${Math.abs(audio_duration_seconds - downloading.track.duration)}`);
    }
    
    await SQLTracks.mark_track_downloaded(downloading.track.uid, media_uri);

    return "GOOD";
}

export const track_downloader = new AsyncFNQueue<Downloading, Awaited<ReturnType<typeof download_track_base>>>(
    Constants.download_queue_max_length, 
    o => o.uid, 
    download_track_base
);

export async function download_track(track: Track, redownload?: boolean): Promise<DownloadTrackResult>{
    const result = await track_downloader.push_into_queue({ track, redownload: redownload ?? false, uid: track.uid, progress: 0, execution_id: -1, duration: track.duration });
    return result;
}

async function download_track_lyrics_base(downloading: LyricsDownloading){
    const lyrics_maybe = await Illusive.get_track_lryics(downloading.track);
    return lyrics_maybe;
}

export const track_lyrics_downloader = new AsyncFNQueue<LyricsDownloading, Awaited<ReturnType<typeof download_track_lyrics_base>>>(
    Constants.download_lyrics_queue_max_length, 
    o => o.uid, 
    download_track_lyrics_base
);

export async function download_track_lyrics(track: Track){
    if(!is_empty(track.lyrics_uri)) return "EXISTS";
    const result = await track_lyrics_downloader.push_into_queue({ track, uid: track.uid });
    if(typeof result === "object") return result;
    if(result === "EXISTS") return result;
    await SQLTracks.save_track_lyrics(track, result);
    return result;
}

export async function batch_download_track_lyrics(tracks: Track[]){
    const results: Awaited<ReturnType<typeof download_track_lyrics>>[] = [];
    for(const track of tracks){
        results.push(await download_track_lyrics(track));
    }
    return results;
}