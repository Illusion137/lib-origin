import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as GLOBALS from './globals';
import * as LegacyTypes1307 from './legacy/1307/legacy_types';
import CookieManager from '@react-native-community/cookies';
import { Illusive } from '../../illusive';
import { Playlist, PlaylistsTracks, Promises, SQLAlter, SQLPlaylist, SQLPlaylistArray, SQLTable, SQLTables, SQLTrack, SQLTrackArray, SQLType, Track, TrackMetaData } from '../../types';
import { array_exclude, array_include, array_mask, extract_file_extension, playlist_name_sql_friendly } from '../../illusive_utilts';
import { is_empty } from '../../../../origin/src/utils/util';
import { Alert } from 'react-native';
import { Prefs } from '../../prefs';
import { ExampleObj } from './example_objs';
import path from 'path';
import * as uuid from "react-native-uuid";
import { obj_to_update_sql, sql_all, sql_create_table, sql_delete_from, sql_drop_table, sql_insert_values, sql_select, sql_set, sql_update_table, sql_where } from './sql_helper';

const db_pre_1307_path = "illusi-db.sqlite3";
const db_pre_1307 = SQLite.openDatabaseSync(db_pre_1307_path); // Pre 14.0.0

const db_path = "illusi-db-1400.sqlite3";
export let db = SQLite.openDatabaseSync(db_path);

export async function sql_update<T extends Record<string, any>>(table: SQLTables, item: {uid: string}, key: keyof T, value: any){
    return sql_all(db, sql_update_table(table), `SET ${String(key)}='${value}'`, sql_where<{uid: string}>(["uid", item.uid]))
}
export async function create_table<T extends Record<string, any>>(table: SQLTables, obj: T){
    await db.execAsync(sql_create_table<T>(table, obj));
}

export async function get_all_tables(database: SQLite.SQLiteDatabase) {
    const tables = await database.getAllAsync(`${sql_select("sqlite_master", "*")} ${sql_where<{type: string}>(["type", "table"])}`);
    return tables as SQLTable[];
}

export async function add_playback_saved_data_to_tracks(tracks: Track[]){
    return await Promise.all(
        tracks.map(async(track) => {
            track.playback = {
                "artwork": Illusive.get_track_artwork(track),
                "added": false,
                "successful": false
            }
            track.downloading_data = {"saved": await track_exists(track), "progress": 0, "playlist_saved": false}
            return track;
        })
    );
}
export async function add_saved_data_to_write_playlist_tracks(playlist_uuid: string, tracks: Track[]): Promise<Track[]>{
    return await Promise.all(
        tracks.map(async(track) => {
            track.downloading_data = {"saved": true, "progress": 0, "playlist_saved": await track_exists_in_playlist(playlist_uuid, track.uid)}
            return track;
        })
    )
}

export async function legacy_1307_track_to_track(legacy_1307_track: LegacyTypes1307.Track): Promise<Track>{
    const media_info = is_empty(legacy_1307_track.media_uri) ? null : await FileSystem.getInfoAsync(media_directory() + legacy_1307_track.media_uri);
    const download_date = media_info !== null && media_info.exists && media_info.isDirectory === false ? new Date(media_info.modificationTime) : new Date(0);
    // const parsed_track = parse_youtube_title_artist({title: legacy_1307_track.video_name, artists: [{"name": legacy_1307_track.video_creator. }]});
    
    // const topiced = legacy_1307_track.video_creator.includes(" - Topic");

    return {
        "uid": legacy_1307_track.uid,
        "title": legacy_1307_track.video_name,
        "artists": [{"name": legacy_1307_track.video_creator, "uri": null}],
        // "prods": parsed_track.prods,
        "tags": [],
        "duration": legacy_1307_track.video_duration,
        // "explicit": topiced ? "NONE" : parsed_track.explicit,
        // "unreleased": topiced ? false : parsed_track.unreleased,
        "album": undefined,
        "plays": 0,
        "imported_id": legacy_1307_track.imported ? <string>uuid.default.v4() : "",
        "illusi_id": "",
        "youtube_id": legacy_1307_track.video_id,
        "youtubemusic_id": "",
        "soundcloud_id": 0,
        "soundcloud_permalink": "",
        "spotify_id": "",
        "amazonmusic_id": "",
        "applemusic_id": "",
        "artwork_url": "",
        "thumbnail_uri": legacy_1307_track.thumbnail_uri,
        "media_uri": legacy_1307_track.media_uri,
        "lyrics_uri": "",
        "meta": {
            "plays": 0,
            "downloaded_date": download_date,
            "last_played_date": new Date(0),
            "added_date": download_date.getTime() === 0 ? new Date() : download_date
        },
    }
}
export function sql_track_to_track(sql_track: SQLTrack): Track{
    const meta: TrackMetaData = JSON.parse(sql_track.meta!);
    return Object.assign(sql_track, {
        "artists": JSON.parse(sql_track.artists!),
        "album": JSON.parse(sql_track.album!),
        "prods": JSON.parse(sql_track.prods!),
        "tags": JSON.parse(sql_track.tags!),
        "explicit": Boolean(sql_track.explicit),
        "unreleased": Boolean(sql_track.unreleased),
        "meta": {
            "plays": meta.plays,
            "added_date": new Date(meta.added_date),
            "last_played_date": new Date(meta.last_played_date)
        },
        "playback": {"artwork": Illusive.get_track_artwork(sql_track as unknown as Track), "added": false, "successful": false},
        "downloading": {}
    });
}
export function merge_track_with_new_track(track: Track, new_track: Track): Track{
    return {
        "uid": track.uid,
        "title": track.title,
        "artists": track.artists,
        "duration": new_track.duration,
        "album": is_empty(track.album) ? new_track.album : track.album,
        "explicit": track.explicit,
        "unreleased": track.unreleased,
        "plays": is_empty(track.plays) ? new_track.plays : track.plays,
        "media_uri": is_empty(track.media_uri) ? new_track.media_uri : track.media_uri,
        "thumbnail_uri": is_empty(track.thumbnail_uri) ? new_track.thumbnail_uri : track.thumbnail_uri,
        "lyrics_uri": is_empty(track.lyrics_uri) ? new_track.lyrics_uri : track.lyrics_uri,
        "imported_id": is_empty(track.imported_id) ? new_track.imported_id : track.imported_id,
        "illusi_id": is_empty(track.illusi_id) ? new_track.illusi_id : track.illusi_id,
        "youtube_id": is_empty(track.youtube_id) ? new_track.youtube_id : track.youtube_id,
        "youtubemusic_id": is_empty(track.youtubemusic_id) ? new_track.youtubemusic_id : track.youtubemusic_id,
        "spotify_id": is_empty(track.spotify_id) ? new_track.spotify_id : track.spotify_id,
        "amazonmusic_id": is_empty(track.amazonmusic_id) ? new_track.amazonmusic_id : track.amazonmusic_id,
        "applemusic_id": is_empty(track.applemusic_id) ? new_track.applemusic_id : track.applemusic_id,
        "soundcloud_id": is_empty(track.soundcloud_id) ? new_track.soundcloud_id : track.soundcloud_id,
        "soundcloud_permalink": is_empty(track.soundcloud_permalink) ? new_track.soundcloud_permalink : track.soundcloud_permalink,
        "artwork_url": is_empty(track.artwork_url) ? new_track.artwork_url : track.artwork_url,
        "meta": track.meta
    }
}
export async function sql_playlist_to_playlist(sql_playlist: SQLPlaylist, ignore_tracks = false): Promise<Playlist>{
    const tracks = ignore_tracks ? [] : await playlist_tracks(sql_playlist.uuid, new Set<string>(), true);
    return Object.assign(sql_playlist, {
        "inherited_playlists": JSON.parse(sql_playlist.inherited_playlists!),
        "linked_playlists": JSON.parse(sql_playlist.linked_playlists!),
        "visual_data": ignore_tracks ? {"four_track": [], "track_count": 0} : {"four_track": tracks.slice(0,4), "track_count": tracks.length},
        "date": new Date(sql_playlist.date!)
    });
}

export async function get_legacy_1307_track_data(database: SQLite.SQLiteDatabase){
    const tracks: LegacyTypes1307.Track[] = await database.getAllAsync(sql_select("tracks", "*"));
    return tracks;
}
export async function get_legacy_1307_playlists(database: SQLite.SQLiteDatabase){
    const playlists: LegacyTypes1307.Playlist[] = await database.getAllAsync(sql_select("playlists", "*"));
    return playlists;
}
export async function get_legacy_1307_playlist_tracks(database: SQLite.SQLiteDatabase, playlist_name: string) {
    const tracks: LegacyTypes1307.Track[] = await database.getAllAsync(`${sql_select("tracks", "*")} AS t JOIN ${playlist_name_sql_friendly(playlist_name)} AS p ON p.track_uid = t.uid ORDER BY p.id`);
    return tracks;
}

export async function fetch_track_data(){
    const tracks: SQLTrack[] = await db.getAllAsync(sql_select("tracks", "*"));
    GLOBALS.global_var.sql_tracks = tracks.map(track => sql_track_to_track(track));
}
export async function clear_tracks(){
    await db.execAsync('DELETE FROM tracks');
}
export async function fetch_track_data_from_uid(uid: string): Promise<Track> {
    const tracks: SQLTrack[] = await db.getAllAsync(`${sql_select("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return tracks.map(track => sql_track_to_track(track))[0];
}
export async function mark_track_downloaded(uid: string, media_uri: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", media_uri])} ${sql_where<Track>(["uid", uid])}`);
    await fetch_track_data();
}
export async function mark_track_undownloaded(uid: string) {
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["media_uri", ""])} ${sql_where<Track>(["uid", uid])}`);
    await fetch_track_data();
    await clean_directories();
}
export async function track_exists(track: Track){
    await fetch_track_data();
    for(const t of GLOBALS.global_var.sql_tracks){
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
export async function track_exists_in_playlist(playlist_uuid: string, track_uid: string){
    const count = await db.getAllAsync(`${sql_select<PlaylistsTracks>("playlists_tracks", "*")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid], ["track_uid", track_uid])}`);
    return count.length !== 0;
}
export async function track_from_service_id(ftrack: Track){
    const potential_keys: (keyof Track)[] = ["youtube_id", "youtubemusic_id", "spotify_id", "amazonmusic_id", "applemusic_id", "soundcloud_id"];
    let track_id: string;
    let key: keyof Track;
    for(const k of potential_keys){
        if(!is_empty(ftrack[k])){
            track_id = ftrack[k] as string;
            key = k;
            break;
        }
    }
    if(is_empty(key!) || is_empty(track_id!)) return null;
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>([key!, track_id!])}`);
    if(track.length === 0) return null;
    return sql_track_to_track(<SQLTrack>track[0]);
}
export async function track_from_uid(uid: string){
    const track = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} ${sql_where<Track>(["uid", uid])}`);
    return sql_track_to_track(<SQLTrack>track[0]);
}
export async function track_uid_exists(track: Track){
    const count_sql = await db.getAllAsync(`${sql_select<Track>("tracks", "uid")} ${sql_where<Track>(["uid", track.uid])}`);
    return count_sql.length !== 0;
}

function track_to_sqllite_insertion(track: Track): SQLTrackArray {
    const meta: TrackMetaData = {
        "added_date": new Date(),
        "last_played_date": new Date(),
        "plays": 0,
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
        JSON.stringify(track.album ?? {"name": "", "uri": ""}),
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
function playlist_to_sqllite_insertion(playlist: Playlist){
    const to_array: SQLPlaylistArray = [
        playlist.uuid ?? "", 
        playlist.title ?? "", 
        playlist.description ?? "", 
        playlist.pinned ?? false, 
        playlist.thumbnail_uri ?? "", 
        playlist.sort ?? "OLDEST", 
        playlist.public ?? false, 
        playlist.public_uuid ?? "", 
        JSON.stringify(playlist.inherited_playlists ?? []), 
        JSON.stringify(playlist.linked_playlists ?? []), 
        playlist.date?.toISOString() ?? new Date().toISOString(), 
    ]
    return to_array;
}

export async function insert_track(track: Track) {
    if( await track_exists(track) ) return;
    if(Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track);
    await db.runAsync(sql_insert_values("tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
    await fetch_track_data();
}
export async function update_track(track_uid: string, new_track: Track){
    await db.runAsync(`${sql_update_table("tracks")} SET ${obj_to_update_sql(new_track)} ${sql_where<Track>(["uid", track_uid])}`);
    await fetch_track_data();
}
export async function update_track_meta_data(track_uid: string, new_meta: TrackMetaData){
    await db.runAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["meta", JSON.stringify(new_meta)])} ${sql_where<Track>(["uid", track_uid])}`);
    await fetch_track_data();
}

export async function update_track_with_new_track_data(old_track: Track, new_track: Track){
    const merged_track = merge_track_with_new_track(old_track, new_track);
    await update_track(merged_track.uid, merged_track);
}
export async function insert_track_playlist(playlist_uuid: string, track_uid: string) {
    await db.runAsync(sql_insert_values("playlists_tracks", ExampleObj.playlists_tracks_example0), [playlist_uuid, track_uid]);
}

export async function delete_track(uid: string) {
    await db.runAsync(`${sql_delete_from("tracks")} ${sql_where<Track>(["uid", uid])}`);
    await clean_directories();
}
export async function delete_track_playlist(playlist_uuid: string, track_uid: string) {
    await db.runAsync(`${sql_delete_from("playlists_tracks")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid], ["track_uid", track_uid])}`);
}

export async function insert_recently_played_track(track: Track){
    await db.runAsync(`${sql_delete_from("recently_played_tracks")} ${sql_where<Track>(["uid", track.uid])}`);
    await db.runAsync(sql_insert_values("recently_played_tracks", ExampleObj.track_example0), track_to_sqllite_insertion(track));
}
export async function recently_played_tracks(): Promise<Track[]>{
    const recently_played_sql_tracks: SQLTrack[] = await db.getAllAsync(sql_select<Track>("recently_played_tracks", "*"));
    let recently_played_tracks = recently_played_sql_tracks.map(track => sql_track_to_track(track));
    for(let i = 0; i < recently_played_tracks.length; i++){
        const exists = await track_uid_exists(recently_played_tracks[i]);
        if(exists)
            recently_played_tracks[i] = await track_from_uid(recently_played_tracks[i].uid);
        else if(!is_empty(recently_played_tracks[i].imported_id)) recently_played_tracks.slice(i, 1);
    }
    return recently_played_tracks;
}
export async function cleanup_recently_played(){
    const recently_played_max_size = Prefs.get_pref('recently_played_max_size');
    let recently_played_data = await recently_played_tracks();
    
    const all_promises: Promises = [];
    
    if(recently_played_data.length > recently_played_max_size){
        recently_played_data.reverse();
        recently_played_data = recently_played_data.slice(0, recently_played_max_size);
        recently_played_data.reverse();
        await db.execAsync(sql_delete_from("recently_played_tracks"));
        for(let i = 0; i < recently_played_max_size; i++){
            const track = recently_played_data[i];
            all_promises.push(
                insert_recently_played_track(
                    {
                        'uid':track.uid,
                        'title': track.title,
                        'artists': track.artists,
                        'duration': track.duration,
                        'album': track.album,
                        'explicit': track.explicit,
                        'illusi_id': track.illusi_id,
                        'imported_id': track.imported_id,
                        'youtube_id': track.youtube_id,
                        'youtubemusic_id': track.youtubemusic_id,
                        'spotify_id': track.spotify_id,
                        'amazonmusic_id': track.amazonmusic_id,
                        'applemusic_id': track.applemusic_id,
                        'soundcloud_id': track.soundcloud_id
                    }
                ))
        }
    }
    await Promise.all(all_promises);
}
export async function all_playlists_data() {
    const playlists: SQLPlaylist[] = await db.getAllAsync(sql_select<Playlist>("playlists", "*"));
    return Promise.all(playlists.map(async(playlist) => await sql_playlist_to_playlist(playlist)));
}
export async function all_playlists_names(): Promise<{"title": string}[]> {
    const playlists_names = await db.getAllAsync(sql_select<Playlist>("playlists", "title"));
    return playlists_names as {"title": string}[];
}
export async function playlist_data(playlist_uuid: string, ignore_tracks = false) {
    const playlists: SQLPlaylist[] = await db.getAllAsync(`${sql_select<Playlist>("playlists", "*")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    return await sql_playlist_to_playlist(playlists[0], ignore_tracks);
}
export async function update_playlist(playlist_uuid: string, new_playlist: Playlist){
    await db.runAsync(`${sql_update_table("playlists")} ${obj_to_update_sql(new_playlist)} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function create_playlist(playlist_name: string): Promise<string> {
    const playlist_names = await all_playlists_names();
    let count = 2;
    if(playlist_names.findIndex((item) => item.title == playlist_name) != -1){
        while(playlist_names.findIndex((item) => item.title == `${playlist_name} ${count}`) != -1 && count <= 100)
            count++;
        if(count > 0)
            playlist_name = `${playlist_name} ${count}`;
    }
    const playlist_uuid = <string>uuid.default.v4();
    await db.runAsync(sql_insert_values("playlists", ExampleObj.playlist_example0), playlist_to_sqllite_insertion({ uuid: playlist_uuid, title: playlist_name }));
    return playlist_uuid;
}
export async function delete_playlist(playlist_uuid: string) {
    await db.execAsync(`${sql_delete_from("playlists")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    await db.execAsync(`${sql_delete_from("playlists_tracks")} ${sql_where<PlaylistsTracks>(["uuid", playlist_uuid])}`);
}
export async function delete_all_playlists() {
    const playlists = await all_playlists_data();
    for(const playlist of playlists){
        await delete_playlist(playlist.uuid);
    }
}
export async function pin_unpin_playlist(playlist_uuid: string, pin: boolean) {
    if(pin)
        await db.runAsync(`${sql_update_table("playlists")} ${sql_set<Playlist>(["pinned", true])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    else
        await db.execAsync(`${sql_update_table("playlists")} ${sql_set<Playlist>(["pinned", false])} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
}
export async function playlist_tracks(playlist_uuid: string, seen_playlist_uuids = new Set<string>(), skip_inheritance = false) {
    const playlist: SQLTrack[] = await db.getAllAsync(`${sql_select<Track>("tracks", "*")} AS t JOIN playlists_tracks AS p ON p.track_uid = t.uid AND p.uuid = '${playlist_uuid}' ORDER BY p.id`);
    let tracks: Track[] = playlist.map(track => sql_track_to_track(track)); 
    if(skip_inheritance) return tracks;
    const cplaylist_data = await playlist_data(playlist_uuid, true);
    for(const inherited_playlist of cplaylist_data.inherited_playlists!){
        if(!seen_playlist_uuids.has(playlist_uuid)){
            seen_playlist_uuids.add(playlist_uuid);
            const inherited_tracks = await playlist_tracks(inherited_playlist.uuid, seen_playlist_uuids);
            switch (inherited_playlist.mode) {
                case "INCLUDE": tracks = array_include<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "EXCLUDE": tracks = array_exclude<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "MASK"   : tracks = array_mask<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid);    break;
            }
        }
    }
    return tracks;
}
export async function is_playlist_pinned(playlist_uuid: string): Promise<boolean> {
    const playlists: SQLPlaylist[] = await db.getAllAsync(`${sql_select<Playlist>("playlists", "pinned")} ${sql_where<Playlist>(["uuid", playlist_uuid])}`);
    return Boolean(playlists[0].pinned);
}

export async function empty_backpack(){
    await db.execAsync(`DELETE FROM backpack`);
}
export async function delete_from_backpack(uid: string){
    await db.runAsync(`DELETE FROM backpack ${sql_where<Track>(["uid", uid])}`);
}
export async function backpack_tracks(): Promise<Track[]>{
    const sql_tracks: SQLTrack[] = await db.getAllAsync(sql_select<Track>("tracks", "*"));
    const tracks: Track[] = sql_tracks.map(sql_track => sql_track_to_track(sql_track));
    for(let i = 0; i < tracks.length; i++) tracks[i].playback!.artwork = Illusive.illusi_dark_icon;
    return tracks;
}
export async function add_to_backpack(uid: string){
    const track: Track = await track_from_uid(uid);
    const all_promises: Promises = [];
    all_promises.push( delete_track(uid) );
    all_promises.push( db.runAsync(sql_insert_values("backpack", ExampleObj.track_example0), track_to_sqllite_insertion(track)) );

    await Promise.all(all_promises);
}

export function document_directory(path: string){ return FileSystem.documentDirectory + path; }
export function sqlite_directory(){ return document_directory(Illusive.sqlite_directory); }
export function thumbnail_directory(){ return document_directory(Illusive.thumbnail_archive_path); }
export function media_directory(){ return document_directory(Illusive.media_archive_path); }
export function lyrics_directory(){ return document_directory(Illusive.lyrics_archive_path); }
export async function create_default_directories(){
    for(const directory of Illusive.default_directories)
        if(!(await FileSystem.getInfoAsync(document_directory(directory))).exists)
            await FileSystem.makeDirectoryAsync(document_directory(directory))
}

export async function download_thumbnail(track: Track){
    const best_artwork = await Illusive.get_best_track_artwork(track);
    if(typeof best_artwork === "object") {
        const ext = extract_file_extension(best_artwork.uri);
        const thumbnail_download = FileSystem.createDownloadResumable(best_artwork.uri, `${thumbnail_directory()}${track.uid}${ext}`);
        await thumbnail_download.downloadAsync();
        await sql_update<Track>("tracks", track, "thumbnail_uri", track.uid + ext);
    }
}

export async function restore_thumbnail_cache(){
    await fetch_track_data();
    for(const track of GLOBALS.global_var.sql_tracks)
        if(is_empty(track.imported_id) && is_empty(track.thumbnail_uri))
            download_thumbnail(track);
}

export async function clean_thumbnail_cache(){
    await fetch_track_data();
    const files = await FileSystem.readDirectoryAsync(thumbnail_directory());
    const all_promises: Promises = [];
    for(const file of files)
        all_promises.push(FileSystem.deleteAsync(thumbnail_directory() + file, {idempotent: true}))
    await db.execAsync(`${sql_update_table("tracks")} ${sql_set<Track>(["thumbnail_uri", ""])}`);
    await Promise.all(all_promises);
}
export async function clean_directories(){
    await fetch_track_data();
    const thumbnail_files = await FileSystem.readDirectoryAsync(thumbnail_directory());
    const media_files     = await FileSystem.readDirectoryAsync(media_directory());
    const lyrics_files    = await FileSystem.readDirectoryAsync(lyrics_directory());

    const thumbnail_uris = GLOBALS.global_var.sql_tracks.map(({thumbnail_uri}) => thumbnail_uri).filter(item => item !== undefined);
    const media_uris = GLOBALS.global_var.sql_tracks.map(({media_uri}) => media_uri).filter(item => item !== undefined);
    const lyrics_uris = GLOBALS.global_var.sql_tracks.map(({lyrics_uri}) => lyrics_uri).filter(item => item !== undefined);

    const files_to_delete: Promises = [];

    for(const file of thumbnail_files)
        if(!thumbnail_uris.includes(file))
            files_to_delete.push(FileSystem.deleteAsync(thumbnail_directory() + file, {"idempotent": true}));
    for(const file of media_files)
        if(!media_uris.includes(file))
            files_to_delete.push(FileSystem.deleteAsync(media_directory() + file, {"idempotent": true}));
    for(const file of lyrics_files)
        if(!lyrics_uris.includes(file))
            files_to_delete.push(FileSystem.deleteAsync(lyrics_directory() + file, {"idempotent": true}));
    await Promise.all(files_to_delete);
}

export async function move_unsorted_media_to_folders(){
    for(const file of await FileSystem.readDirectoryAsync(document_directory(""))){
        let info = await FileSystem.getInfoAsync(document_directory(file));
        if(!info.isDirectory && info.exists){
            if(info.uri.includes(".mp4") || info.uri.includes(".mp3") || info.uri.includes(".m4a"))
                await FileSystem.moveAsync({"from": info.uri, "to": media_directory() + path.basename(info.uri) });
        }
    }
    for(const file of await FileSystem.readDirectoryAsync(document_directory("CachedThumbnails"))){
        let info = await FileSystem.getInfoAsync(document_directory("CachedThumbnails") + file);
        if(!info.isDirectory && info.exists){
            if(info.uri.includes(".webp") || info.uri.includes(".png") || info.uri.includes(".jpg"))
                await FileSystem.moveAsync({"from": info.uri, "to": thumbnail_directory() + path.basename(info.uri) });
        }
    }
}

function get_sql_table_column_properties(table: SQLTable): {'column_name': string, 'type': SQLType}[]{
    const column_props: {'column_name': string, 'type': SQLType}[] = [];
    const inner_sql = table.sql.slice(table.sql.indexOf('(') + 1, table.sql.indexOf(')'));
    for(const prop of inner_sql.split(', ').map((prop => prop.trim())) ){
        const [column_name, type] = prop.split(' ');
        column_props.push({'column_name': column_name, 'type': type as SQLType})
    }
    return column_props;
}
async function alter_sql(database: SQLite.SQLiteDatabase, alter: SQLAlter){
    const tables = await get_all_tables(database);
    const selected_table_index = tables.findIndex((table) => table.name == alter.table);

    const table_column_props = get_sql_table_column_properties(tables[selected_table_index]);
    const selected_column_index = table_column_props.findIndex((props) => props.column_name == alter.column_name);
    const column_props = table_column_props[selected_column_index];
    if(alter.action === 'ADD' && column_props === undefined){
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} ${alter.column_name} ${alter.type}`);
    }
    else if(alter.action === 'DROP' && column_props !== undefined){
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} COLUMN ${alter.column_name}`);
    }
    else if(alter.action === 'RENAME' && column_props !== undefined && column_props.column_name !== alter.new_column_name){
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} COLUMN ${alter.column_name} TO ${alter.new_column_name}`);
    }
    else return;
    Alert.alert("Altered SQL Table: ", `Changes ${JSON.stringify(alter)}`);
}

export async function delete_database(database: SQLite.SQLiteDatabase, database_path: string){
    await database.closeAsync();
    await FileSystem.deleteAsync(sqlite_directory() + database_path, {"idempotent": true});
}
export async function delete_all_data(){
    await delete_database(db, db_path);
    for(const file of await FileSystem.readDirectoryAsync(document_directory(""))){
        try {
            if(!(file.includes("RCTAsyncLocalStorage") || file == 'RCTAsyncLocalStorage_V1'))
                await FileSystem.deleteAsync(document_directory(file), {idempotent:true});
        } catch (error) {}
    }
    db = await SQLite.openDatabaseAsync(db_path);
    await create_default_directories();
    await recreate_all_tables();
    if(!Prefs.get_pref('keep_prefs')){
        await CookieManager.clearAll();
        await Prefs.reset_prefs();
    }
    GLOBALS.global_var.sql_tracks = [];
}

export async function destroy_all_tables(){
    console.log(((await db.runAsync( sql_drop_table("tracks") )).changes));
    console.log(((await db.runAsync( sql_drop_table("recently_played_tracks") )).changes));
    console.log(((await db.runAsync( sql_drop_table("backpack") )).changes));
    console.log(((await db.runAsync( sql_drop_table("playlists") )).changes));
    console.log(((await db.runAsync( sql_drop_table("playlists_tracks") )).changes));
}

export async function recreate_all_tables(){
    // await destroy_all_tables();

    await create_table("tracks",                 ExampleObj.track_example0);
    await create_table("recently_played_tracks", ExampleObj.track_example0);
    await create_table("backpack",               ExampleObj.track_example0);
    await create_table("playlists",              ExampleObj.playlist_example0);
    await create_table("playlists_tracks",       ExampleObj.playlists_tracks_example0);
    // await db.execAsync([{sql: 'CREATE TABLE IF NOT EXISTS audiobooks (id INTEGER PRIMARY KEY, uid STRING, title STRING, media_uri STRING, thumbnail_uri STRING, subtitle_uri STRING, chapters_json STRING, extra_json STRING)', args: []}], false);
    await create_default_directories();
}

export async function fix_to_new_update(){
    // // UPDATE 13.0.4 BETA
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'RENAME', column_name: 'thumbnail_URI',         new_column_name: 'thumbnail_uri'}); 
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'ADD', column_name: 'sort',                     type: 'STRING'}); 
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'ADD', column_name: 'public',                   type: "BOOLEAN"});
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'ADD', column_name: 'public_uid',               type: "STRING"});
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'ADD', column_name: 'inherited_playlists_json', type: "STRING"});
    await alter_sql(db_pre_1307, {table: 'playlists', action: 'ADD', column_name: 'linked_playlists_json',    type: "STRING"});

    // UPDATE 13.0.5 BETA
    await alter_sql(db_pre_1307, {table: 'tracks', action: 'ADD', column_name: 'views', type: "INTEGER"});
    await alter_sql(db_pre_1307, {table: 'recently_played_tracks', action: 'ADD', column_name: 'views', type: "INTEGER"});

    // UPDATE 14.0.0 BETA
    const legacy_1307_tracks = await get_legacy_1307_track_data(db_pre_1307);
    const legacy_1307_playlists = await get_legacy_1307_playlists(db_pre_1307);
    const all_legacy_1307_table_names = (await get_all_tables(db_pre_1307)).map(table => table.name);
    const current_tracks = (await db.getAllAsync(sql_select<Track>("tracks", "*")));
    if(all_legacy_1307_table_names.includes("tracks") && current_tracks.length === 0){
        Alert.alert("Updating to 14.0.0 BETA");
        await move_unsorted_media_to_folders();
        const all_promises: Promises = [];
        for(const legacy_1307_track of legacy_1307_tracks)
            all_promises.push( insert_track(await legacy_1307_track_to_track(legacy_1307_track)) );
        for(const legacy_1307 of legacy_1307_playlists){
            const legacy_1307_tracks = await get_legacy_1307_playlist_tracks(db_pre_1307, legacy_1307.playlist_name);
            const playlist_uuid = await create_playlist(legacy_1307.playlist_name);
            for(const legacy_1307_track of legacy_1307_tracks)
                all_promises.push( insert_track_playlist(playlist_uuid, legacy_1307_track.uid) );
        }
        await Promise.all(all_promises);
    }
}