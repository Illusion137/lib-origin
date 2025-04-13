import { is_empty } from "../../../../../origin/src/utils/util";
import { Illusive } from "../../../illusive";
import { Prefs } from "../../../prefs";
import { ISOString, Promises, SQLTrack, SQLTrackArray, Track, TrackMetaData } from "../../../types";
import { ExampleObj } from "../example_objs";
import * as GLOBALS from '../globals';
import * as SQLfs from './sql_fs';
import * as uuid from 'react-native-uuid';
import { document_directory, lyrics_directory, media_directory, thumbnail_directory } from './sql_fs';
import { db_exec_async, db_get_all_async, db_run_async, download_thumbnail, obj_to_update_sql, sql_delete_from, sql_insert_values, sql_select, sql_set, sql_update_table, sql_where } from "./sql_utils";
import { ResponseError } from "../../../../../origin/src/utils/types";
import { alert_error, alert_info } from "../alert";
import { clean_album_title } from "../../../gen/apple_music_parser";

export function track_to_sqllite_insertion(track: Track): SQLTrackArray {
    const meta: TrackMetaData = {
        added_date: new Date().toISOString() as ISOString,
        last_played_date: new Date().toISOString() as ISOString,
        plays: 0,
    };
    const to_array: SQLTrackArray = [        
        track.uid ?? "",
        track.title ?? "",
        track.alt_title ?? "",
        JSON.stringify(track.artists ?? []),
        track.duration ?? 0,
        track.prods ?? "",
        track.genre ?? "",
        JSON.stringify(track.tags ?? []),
        track.explicit ?? "NONE",
        track.unreleased ?? false,
        JSON.stringify(track.album ?? {name: "", uri: ""}),
        track.plays ?? 0,
        track.imported_id ?? "",
        track.illusi_id ?? uuid.default.v4(),
        track.youtube_id ?? "",
        track.youtubemusic_id ?? "",
        track.soundcloud_id ?? 0,
        track.soundcloud_permalink ?? "",
        track.spotify_id ?? "",
        track.amazonmusic_id ?? "",
        track.applemusic_id ?? "",
        track.artwork_url ?? "",
        track.thumbnail_uri ?? "",
        track.media_uri ?? "",
        track.lyrics_uri ?? "",
        is_empty(track.meta) ? JSON.stringify(meta) : JSON.stringify(track.meta),
    ];
    return to_array;
}

export async function fixup(track: Track, t: Track){
    let update = false;
    if(JSON.stringify(track.album).length > JSON.stringify(t.album).length || clean_album_title(t.album?.name ?? "--NULLISH--") === track.album?.name){
        t.album = track.album;
        update = true;
    }
    if(JSON.stringify(track.artists).length > JSON.stringify(t.artists).length){
        t.artists = track.artists;
        update = true;
    }
    if(update) await update_track(t.uid, t);
}
export async function check_fixerupper_track(track: Track){
    if(!Prefs.get_pref('quick_fixer_upper')) return;
    const promises: Promises = [];
    for(const t of GLOBALS.global_var.sql_tracks){
        if(track.uid === t.uid) continue;
        if(!is_empty(track.applemusic_id) && !is_empty(t.applemusic_id) && track.applemusic_id === t.applemusic_id){
            promises.push(fixup(track, t));
        }
        if(!is_empty(track.youtube_id) && !is_empty(t.youtube_id) && track.youtube_id === t.youtube_id){
            promises.push(fixup(track, t));
        }
    }
    return await Promise.all(promises);
}

function find_track_in_globals(track: Track){
    if(GLOBALS.global_var.sql_tracks.some(t => t.uid === track.uid)) return undefined;
    if(!is_empty(track.youtube_id)) return GLOBALS.global_var.sql_tracks.find(t => t.youtube_id === track.youtube_id);
    if(!is_empty(track.soundcloud_id)) return GLOBALS.global_var.sql_tracks.find(t => t.soundcloud_id === track.soundcloud_id);
    if(!is_empty(track.spotify_id)) return GLOBALS.global_var.sql_tracks.find(t => t.spotify_id === track.spotify_id);
    if(!is_empty(track.amazonmusic_id)) return GLOBALS.global_var.sql_tracks.find(t => t.amazonmusic_id === track.amazonmusic_id);
    if(!is_empty(track.applemusic_id)) return GLOBALS.global_var.sql_tracks.find(t => t.applemusic_id === track.applemusic_id);
    if(!is_empty(track.spotify_id)) return GLOBALS.global_var.sql_tracks.find(t => t.spotify_id === track.spotify_id);
    return undefined;
}

export async function add_playback_saved_data_to_tracks(tracks: Track[]) {
    return await Promise.all(
        tracks.map(async(track) => {
            track.playback = {
                artwork: Illusive.get_track_artwork(document_directory(""), track),
                added: false,
                successful: false
            }
            const saved = await track_exists(track);
            track.downloading_data = {saved: saved, progress: 0, playlist_saved: false};
            if(saved && is_empty(track.media_uri) && is_empty(track.lyrics_uri) && is_empty(track.thumbnail_uri) && Prefs.get_pref('media_files_on_albums')) {
                const found_track = find_track_in_globals(track);
                if(found_track) track.uid = found_track.uid;
                track.media_uri = found_track?.media_uri;
                track.thumbnail_uri = found_track?.thumbnail_uri;
                track.lyrics_uri = found_track?.lyrics_uri;
            }
            check_fixerupper_track(track).catch(e => e);
            return track;
        })
    );
}
export function merge_track_with_new_track(track: Track, new_track: Track): Track {
    return {
        uid: track.uid,
        title: track.title,
        alt_title: new_track.title ?? new_track.alt_title,
        artists: track.artists,
        duration: new_track.duration,
        album: is_empty(track.album) ? new_track.album : track.album,
        explicit: track.explicit,
        unreleased: track.unreleased,
        plays: is_empty(track.plays) ? new_track.plays : track.plays,
        media_uri: is_empty(track.media_uri) ? new_track.media_uri : track.media_uri,
        thumbnail_uri: is_empty(track.thumbnail_uri) ? new_track.thumbnail_uri : track.thumbnail_uri,
        lyrics_uri: is_empty(track.lyrics_uri) ? new_track.lyrics_uri : track.lyrics_uri,
        imported_id: is_empty(track.imported_id) ? new_track.imported_id : track.imported_id,
        illusi_id: is_empty(track.illusi_id) ? new_track.illusi_id : track.illusi_id,
        youtube_id: is_empty(track.youtube_id) ? new_track.youtube_id : track.youtube_id,
        youtubemusic_id: is_empty(track.youtubemusic_id) ? new_track.youtubemusic_id : track.youtubemusic_id,
        spotify_id: is_empty(track.spotify_id) ? new_track.spotify_id : track.spotify_id,
        amazonmusic_id: is_empty(track.amazonmusic_id) ? new_track.amazonmusic_id : track.amazonmusic_id,
        applemusic_id: is_empty(track.applemusic_id) ? new_track.applemusic_id : track.applemusic_id,
        soundcloud_id: is_empty(track.soundcloud_id) ? new_track.soundcloud_id : track.soundcloud_id,
        soundcloud_permalink: is_empty(track.soundcloud_permalink) ? new_track.soundcloud_permalink : track.soundcloud_permalink,
        artwork_url: is_empty(track.artwork_url) ? new_track.artwork_url : track.artwork_url,
        meta: track.meta
    }
}
export function sql_track_to_track(sql_track: SQLTrack): Track|ResponseError {
    try {
        const meta: TrackMetaData = JSON.parse(sql_track.meta!);
        return Object.assign(sql_track, {
            artists: JSON.parse(sql_track.artists),
            album: JSON.parse(sql_track.album!),
            prods: sql_track.prods?.trim(),
            tags: JSON.parse(sql_track.tags!),
            explicit: sql_track.explicit,
            unreleased: Boolean(sql_track.unreleased),
            meta: {
                ...meta,
                plays: meta.plays ?? 0,
                added_date: meta.added_date ?? new Date(0).toISOString(),
                last_played_date: meta.last_played_date ?? new Date(0).toISOString()
            },
            playback: {artwork: Illusive.get_track_artwork(document_directory(""), sql_track as unknown as Track), added: false, successful: false},
            downloading: {}
        });
    } catch (error) {
        return {error: new Error((error as Error).message, {'cause': JSON.stringify(sql_track)})};
    }
}
export function sql_tracks_to_tracks(sql_tracks: SQLTrack[]): Track[]{
    const mapped = sql_tracks.map(sql_track_to_track);
    mapped.filter(track => "error" in track).forEach(err => alert_error(err));
    return mapped.filter(track => !("error" in track)) as Track[];
}

export async function mark_track_downloaded(uid: Track['uid'], media_uri: string) {
    await db_exec_async(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", media_uri])} ${sql_where<Track>(["uid", uid])}`);
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx].media_uri = media_uri;
}
export async function mark_all_tracks_undownloaded() {
    await Promise.all(GLOBALS.global_var.sql_tracks.map(async (track) => {
        if(is_empty(track.media_uri)) return;
        await SQLfs.delete_item(media_directory(track.media_uri!));
        track.media_uri = "";
    }));
    await db_exec_async(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", ""])}`);
}
export async function mark_track_undownloaded(uid: Track['uid'], media_uri: string) {
    if(is_empty(media_uri)) return;
    const found = GLOBALS.global_var.sql_tracks.find(track => track.uid === uid);
    if(found && !is_empty(found.imported_id)) return;
    await db_exec_async(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", ""])} ${sql_where<Track>(["uid", uid])}`);
    await SQLfs.delete_item(media_directory(media_uri));
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx].media_uri = "";
}
export async function clear_track_youtube(uid: Track['uid']) {
    await db_exec_async(`${sql_update_table("tracks")} ${sql_set<Track>(["youtube_id", ""])} ${sql_where<Track>(["uid", uid])}`);
}
export function track_exist_in_other(tracks: Track[], track: Track){
    for(const t of tracks) {
        if(!is_empty(t.illusi_id) && !is_empty(track.illusi_id) && t.illusi_id === track.illusi_id) return true;
        if(!is_empty(t.youtube_id) && !is_empty(track.youtube_id) && t.youtube_id === track.youtube_id) return true;
        // if(!is_empty(t.youtubemusic_id) && !is_empty(track.youtubemusic_id) && t.youtubemusic_id === track.youtubemusic_id) return true;
        if(!is_empty(t.spotify_id) && !is_empty(track.spotify_id) && t.spotify_id === track.spotify_id) return true;
        if(!is_empty(t.amazonmusic_id) && !is_empty(track.amazonmusic_id) && t.amazonmusic_id === track.amazonmusic_id) return true;
        if(!is_empty(t.applemusic_id) && !is_empty(track.applemusic_id) && t.applemusic_id === track.applemusic_id) return true;
        if(!is_empty(t.soundcloud_id) && !is_empty(track.soundcloud_id) && t.soundcloud_id === track.soundcloud_id) return true;
        if(!is_empty(t.imported_id) && !is_empty(track.imported_id) && t.imported_id === track.imported_id) return true;
    }
    return false;
}
export async function track_exists(track: Track) {
    return track_exist_in_other(GLOBALS.global_var.sql_tracks, track);
}
export async function track_from_service_id(ftrack: Track) {
    const potential_keys: (keyof Track)[] = ["youtube_id", "youtubemusic_id", "spotify_id", "amazonmusic_id", "applemusic_id", "soundcloud_id"];
    let track_id: string;
    let key: keyof Track;
    for(const k of potential_keys) {
        if(!is_empty(ftrack[k])) {
            track_id = ftrack[k] as string;
            key = k;
            break;
        }
    }
    if(is_empty(key!) || is_empty(track_id!)) return null;
    const track = await db_get_all_async(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>([key!, track_id!])}`);
    if(track.length === 0) return null;
    return sql_track_to_track(track[0] as SQLTrack);
}
export async function track_from_uid(uid: Track['uid']) {
    const track = await db_get_all_async(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return sql_track_to_track(track[0] as SQLTrack);
}
export async function track_uid_exists(track: Track) {
    const count_sql = await db_get_all_async(`${sql_select<Track>("tracks", "uid")} ${sql_where<Track>(["uid", track.uid])}`);
    return count_sql.length !== 0;
}
export async function fetch_track_data() {
    const tracks: SQLTrack[] = await db_get_all_async(sql_select("tracks", "*"));
    GLOBALS.global_var.sql_tracks = sql_tracks_to_tracks(tracks);
}
export async function get_tracks(){
    const tracks: SQLTrack[] = await db_get_all_async(sql_select("tracks", "*"));
    return sql_tracks_to_tracks(tracks);;
}
export async function clear_tracks() {
    await db_exec_async('DELETE FROM tracks');
}
export async function fetch_track_data_from_uid(uid: Track['uid']): Promise<Track> {
    const tracks: SQLTrack[] = await db_get_all_async(`${sql_select("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return sql_tracks_to_tracks(tracks)[0];
}

export async function insert_all_tracks(tracks: Track[]) {
    const promise_tracks: Promises = [];
    for(const track of tracks)
        promise_tracks.push(insert_track(track));
    await Promise.all(promise_tracks);
}
export async function insert_track(track: Track) {
    if( await track_exists(track) ) return;
    if(Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track).catch(e => e);
    await db_run_async(sql_insert_values("tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
    GLOBALS.global_var.sql_tracks.push(track);
    if(Prefs.get_pref('auto_download') && is_empty(track.media_uri)) GLOBALS.global_var.download_track(track).catch(e => e);
}
export async function update_track(track_uid: Track['uid'], new_track: Track) {
    await db_run_async(`${sql_update_table("tracks")} SET ${obj_to_update_sql(new_track, ExampleObj.track_example0)} ${sql_where<Track>(["uid", track_uid])}`);
}
export async function update_track_meta_data(track_uid: Track['uid'], new_meta: TrackMetaData) {
    await db_run_async(`${sql_update_table("tracks")} ${sql_set<Track>(["meta", JSON.stringify(new_meta)])} ${sql_where<Track>(["uid", track_uid])}`);
}

export async function update_track_with_new_track_data(old_track: Track, new_track: Track) {
    const merged_track = merge_track_with_new_track(old_track, new_track);
    await update_track(merged_track.uid, merged_track);
    return merged_track;
}
export async function delete_track(uid: Track['uid']) {
    await db_run_async(`${sql_delete_from("tracks")} ${sql_where<Track>(["uid", uid])}`);
}

export async function restore_thumbnail_cache() {
    for(const track of GLOBALS.global_var.sql_tracks)
        if(is_empty(track.imported_id) && is_empty(track.thumbnail_uri))
            download_thumbnail(track).catch(e => e);
}

export async function clean_thumbnail_cache() {
    const files = await SQLfs.read_directory(thumbnail_directory(""));
    const all_promises: Promises = [];
    for(const file of files)
        all_promises.push(SQLfs.delete_item(thumbnail_directory(file)))
    await db_exec_async(`${sql_update_table("tracks")} ${sql_set<Track>(["thumbnail_uri", ""])}`);
    await Promise.all(all_promises);
}

export async function clean_directories() {
    const thumbnail_files = await SQLfs.read_directory(thumbnail_directory(""));
    const media_files     = await SQLfs.read_directory(media_directory(""));
    const lyrics_files    = await SQLfs.read_directory(lyrics_directory(""));

    const thumbnail_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({thumbnail_uri}) => thumbnail_uri).filter(item => item !== undefined));
    const media_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({media_uri}) => media_uri).filter(item => item !== undefined));
    const lyrics_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({lyrics_uri}) => lyrics_uri).filter(item => item !== undefined));

    const files_to_delete: Promises = [];

    for(const file of thumbnail_files)
        if(!thumbnail_uri_set.has(file))
            files_to_delete.push(SQLfs.delete_item(thumbnail_directory(file)));
    for(const file of media_files)
        if(!media_uri_set.has(file))
            files_to_delete.push(SQLfs.delete_item(media_directory(file)));
    for(const file of lyrics_files)
        if(!lyrics_uri_set.has(file))
            files_to_delete.push(SQLfs.delete_item(lyrics_directory(file)));
    
    alert_info(`Cleaned ${files_to_delete.length} files`);
    await Promise.all(files_to_delete);
}