import { is_empty } from "../../../../../origin/src/utils/util";
import { Illusive } from "../../../illusive";
import { Prefs } from "../../../prefs";
import { ISOString, Promises, SQLTrack, SQLTrackArray, Track, TrackMetaData } from "../../../types";
import { ExampleObj } from "../example_objs";
import * as GLOBALS from '../globals';
import { db } from './database';
import * as SQLfs from './sql_fs';
import { document_directory, lyrics_directory, media_directory, thumbnail_directory } from './sql_fs';
import { download_thumbnail, obj_to_update_sql, sql_delete_from, sql_insert_values, sql_select, sql_set, sql_update_table, sql_where } from "./sql_utils";

export function track_to_sqllite_insertion(track: Track): SQLTrackArray {
    const meta: TrackMetaData = {
        added_date: new Date().toISOString() as ISOString,
        last_played_date: new Date().toISOString() as ISOString,
        plays: 0,
    };
    const to_array: SQLTrackArray = [        
        track.uid ?? "",
        track.title ?? "",
        JSON.stringify(track.artists ?? []),
        track.duration ?? 0,
        JSON.stringify(track.prods ?? []),
        track.genre ?? "",
        JSON.stringify(track.tags ?? []),
        track.explicit ?? "NONE",
        track.unreleased ?? false,
        JSON.stringify(track.album ?? {name: "", uri: ""}),
        track.plays ?? 0,
        track.imported_id ?? "",
        track.illusi_id ?? "",
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
export async function add_playback_saved_data_to_tracks(tracks: Track[]) {
    return await Promise.all(
        tracks.map(async(track) => {
            track.playback = {
                artwork: Illusive.get_track_artwork(document_directory(""), track),
                added: false,
                successful: false
            }
            track.downloading_data = {saved: await track_exists(track), progress: 0, playlist_saved: false}
            return track;
        })
    );
}
export function merge_track_with_new_track(track: Track, new_track: Track): Track {
    return {
        uid: track.uid,
        title: track.title,
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
export function sql_track_to_track(sql_track: SQLTrack): Track {
    const meta: TrackMetaData = JSON.parse(sql_track.meta!);
    return Object.assign(sql_track, {
        artists: JSON.parse(sql_track.artists!),
        album: JSON.parse(sql_track.album!),
        prods: JSON.parse(sql_track.prods!),
        tags: JSON.parse(sql_track.tags!),
        explicit: Boolean(sql_track.explicit),
        unreleased: Boolean(sql_track.unreleased),
        meta: {
            plays: meta.plays,
            added_date: meta.added_date,
            last_played_date: meta.last_played_date
        },
        playback: {artwork: Illusive.get_track_artwork(document_directory(""), sql_track as unknown as Track), added: false, successful: false},
        downloading: {}
    });
}

export async function mark_track_downloaded(uid: string, media_uri: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", media_uri])} ${sql_where<Track>(["uid", uid])}`);
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx].media_uri = media_uri;
}
export async function mark_track_undownloaded(uid: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", ""])} ${sql_where<Track>(["uid", uid])}`);
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx].media_uri = "";
    await clean_directories();
}
export async function track_exists(track: Track) {
    for(const t of GLOBALS.global_var.sql_tracks) {
        if(!is_empty(t.illusi_id) && !is_empty(track.illusi_id) && t.illusi_id === track.illusi_id) return true;
        if(!is_empty(t.youtube_id) && !is_empty(track.youtube_id) && t.youtube_id === track.youtube_id) return true;
        if(!is_empty(t.youtubemusic_id) && !is_empty(track.youtubemusic_id) && t.youtubemusic_id === track.youtubemusic_id) return true;
        if(!is_empty(t.spotify_id) && !is_empty(track.spotify_id) && t.spotify_id === track.spotify_id) return true;
        if(!is_empty(t.amazonmusic_id) && !is_empty(track.amazonmusic_id) && t.amazonmusic_id === track.amazonmusic_id) return true;
        if(!is_empty(t.applemusic_id) && !is_empty(track.applemusic_id) && t.applemusic_id === track.applemusic_id) return true;
        if(!is_empty(t.soundcloud_id) && !is_empty(track.soundcloud_id) && t.soundcloud_id === track.soundcloud_id) return true;
        if(!is_empty(t.imported_id) && !is_empty(track.imported_id) && t.imported_id === track.imported_id) return true;
    }
    return false;
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
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>([key!, track_id!])}`);
    if(track.length === 0) return null;
    return sql_track_to_track(track[0] as SQLTrack);
}
export async function track_from_uid(uid: string) {
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return sql_track_to_track(track[0] as SQLTrack);
}
export async function track_uid_exists(track: Track) {
    const count_sql = await db.getAllAsync(`${sql_select<Track>("tracks", "uid")} ${sql_where<Track>(["uid", track.uid])}`);
    return count_sql.length !== 0;
}
export async function fetch_track_data() {
    const tracks: SQLTrack[] = await db.getAllAsync(sql_select("tracks", "*"));
    GLOBALS.global_var.sql_tracks = tracks.map(track => sql_track_to_track(track));
}
export async function clear_tracks() {
    await db.execAsync('DELETE FROM tracks');
}
export async function fetch_track_data_from_uid(uid: string): Promise<Track> {
    const tracks: SQLTrack[] = await db.getAllAsync(`${sql_select("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return tracks.map(track => sql_track_to_track(track))[0];
}

export async function insert_all_tracks(tracks: Track[]) {
    await fetch_track_data();
    const promise_tracks: Promises = [];
    for(const track of tracks)
        promise_tracks.push(insert_track(track));
    await Promise.all(promise_tracks);
}
export async function insert_track(track: Track) {
    if( await track_exists(track) ) return;
    if(Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track);
    await db.runAsync(sql_insert_values("tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
    GLOBALS.global_var.sql_tracks.push(track);
    if(Prefs.get_pref('auto_download') && is_empty(track.media_uri)) GLOBALS.global_var.download_track(track);
}
export async function update_track(track_uid: string, new_track: Track) {
    await db.runAsync(`${sql_update_table("tracks")} SET ${obj_to_update_sql(new_track, true)} ${sql_where<Track>(["uid", track_uid])}`);
}
export async function update_track_meta_data(track_uid: string, new_meta: TrackMetaData) {
    await db.runAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["meta", JSON.stringify(new_meta)])} ${sql_where<Track>(["uid", track_uid])}`);
}

export async function update_track_with_new_track_data(old_track: Track, new_track: Track) {
    const merged_track = merge_track_with_new_track(old_track, new_track);
    await update_track(merged_track.uid, merged_track);
    return merged_track;
}
export async function delete_track(uid: string) {
    await db.runAsync(`${sql_delete_from("tracks")} ${sql_where<Track>(["uid", uid])}`);
    await clean_directories();
}

export async function restore_thumbnail_cache() {
    await fetch_track_data();
    for(const track of GLOBALS.global_var.sql_tracks)
        if(is_empty(track.imported_id) && is_empty(track.thumbnail_uri))
            download_thumbnail(track);
}

export async function clean_thumbnail_cache() {
    await fetch_track_data();
    const files = await SQLfs.read_directory(thumbnail_directory(""));
    const all_promises: Promises = [];
    for(const file of files)
        all_promises.push(SQLfs.delete_item(thumbnail_directory(file)))
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["thumbnail_uri", ""])}`);
    await Promise.all(all_promises);
}

export async function clean_directories() {
    if(!Prefs.get_pref('can_clean_directories')) return;
    await fetch_track_data();
    const thumbnail_files = await SQLfs.read_directory(thumbnail_directory(""));
    const media_files     = await SQLfs.read_directory(media_directory(""));
    const lyrics_files    = await SQLfs.read_directory(lyrics_directory(""));

    const thumbnail_uris = GLOBALS.global_var.sql_tracks.map(({thumbnail_uri}) => thumbnail_uri).filter(item => item !== undefined);
    const media_uris = GLOBALS.global_var.sql_tracks.map(({media_uri}) => media_uri).filter(item => item !== undefined);
    const lyrics_uris = GLOBALS.global_var.sql_tracks.map(({lyrics_uri}) => lyrics_uri).filter(item => item !== undefined);

    const files_to_delete: Promises = [];

    for(const file of thumbnail_files)
        if(!thumbnail_uris.includes(file))
            files_to_delete.push(SQLfs.delete_item(thumbnail_directory(file)));
    for(const file of media_files)
        if(!media_uris.includes(file))
            files_to_delete.push(SQLfs.delete_item(media_directory(file)));
    for(const file of lyrics_files)
        if(!lyrics_uris.includes(file))
            files_to_delete.push(SQLfs.delete_item(lyrics_directory(file)));
    await Promise.all(files_to_delete);
}