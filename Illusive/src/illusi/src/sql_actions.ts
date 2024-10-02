import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as GLOBALS from './globals';
import * as LegacyTypes1307 from './legacy/1307/legacy_types';
import CookieManager from '@react-native-community/cookies';
import { Illusive } from '../../illusive';
import { Playlist, Promises, SQLAlter, SQLPlaylist, SQLTable, SQLTrack, SQLType, Track, TrackMetaData } from '../../types';
import { array_exclude, array_include, array_mask, extract_file_extension, playlist_name_sql_friendly } from '../../illusive_utilts';
import { generate_new_uid, is_empty } from '../../../../origin/src/utils/util';
import { Alert } from 'react-native';
import { Prefs } from '../../prefs';
import { ExampleObj } from './example_objs';
import path from 'path';
import { parse_youtube_title_artist } from '../../track_parser';
import * as UUID from 'uuid';

const db_pre_1307_path = "illusi-db.sqlite3";
const db_pre_1307 = SQLite.openDatabaseSync(db_pre_1307_path); // Pre 14.0.0

const db_path = "illusi-db-1400.sqlite3";
export let db = SQLite.openDatabaseSync(db_path);

function obj_to_sql_table(primary: string|undefined, obj: Record<string, any>, types: boolean){
    const key_values = is_empty(primary) ? [] : [primary];
    for(const key of Object.keys(obj)){
        if(types === true)
            switch(typeof obj[key]){
                case "object": key_values.push(`${key} STRING`); break;
                case "string": key_values.push(`${key} STRING`); break;
                case "number": key_values.push(`${key} INTEGER`); break;
                case "boolean": key_values.push(`${key} BOOLEAN`); break;
                default: break;
            }
        else if(typeof obj[key] !== "undefined") key_values.push(`${key}`);
    }
    return `(${key_values.join(", ")})`;
}
function sql_table_to_query_variadics(sql_table: string){
    const qarr: string[] = [];
    for(const i in sql_table.split(','))
        qarr.push('?');
    return `(${qarr.join(', ')})`;
}
function obj_to_update_sql(obj: Record<string, any>){
    const updation: string[] = [];
    const keys = Object.keys(obj);
    for(const key of keys){
        const value = obj[key];
        switch(typeof value){
            case "string": updation.push(`${key}='${value}'`); break;
            case "object": updation.push(`${key}='${JSON.stringify(value)}'`); break;
            case "undefined": break;
            default: updation.push(`${key}=${value}`); break;
        }
    }
    return updation;
}

export async function get_all_tables(database: SQLite.SQLiteDatabase) {
    const tables = await database.getAllAsync("SELECT * FROM sqlite_master where type='table'");
    return tables as SQLTable[];
}

export async function sql_update<T>(table: string, item: {uid: string}, key: keyof T, value: any){ return await db.runAsync(`UPDATE ${table} SET ${String(key)}='${value}' WHERE uid='${item.uid}'`); }
export async function create_table(table: string, obj: Record<string, any>){
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${table} ${obj_to_sql_table("id INTEGER PRIMARY KEY", obj, true)}`);
}

export async function add_playback_saved_data_to_tracks(tracks: Track[]){
    return await Promise.all(
        tracks.map(async(track) => {
            track.playback = {
                "artwork": Illusive.get_track_artwork(track),
                "added": false,
                "successful": false
            }
            track.downloading_data = {"saved": await track_exists(track), "progress": 0}
            return track;
        })
    );
}

export async function legacy_1307_track_to_track(legacy_1307_track: LegacyTypes1307.Track): Promise<Track>{
    const media_info = is_empty(legacy_1307_track.media_uri) ? null : await FileSystem.getInfoAsync(media_directory() + legacy_1307_track.media_uri);
    const download_date = media_info !== null && media_info.exists && media_info.isDirectory === false ? new Date(media_info.modificationTime) : new Date(0);
    const parsed_track = parse_youtube_title_artist({title: legacy_1307_track.video_name, artist: legacy_1307_track.video_creator});
    
    const topiced = legacy_1307_track.video_creator.includes(" - Topic");

    return {
        "uid": legacy_1307_track.uid,
        "title": topiced ? legacy_1307_track.video_name : 
            parsed_track.title,
        "artists": [{"name": parsed_track.artist, "uri": null}].concat(parsed_track.feats.map(feat => {
                return {"name": feat, "uri": null}
            })),
        "prods": parsed_track.prods,
        "tags": [],
        "duration": legacy_1307_track.video_duration,
        "explicit": topiced ? "NONE" : parsed_track.explicit,
        "unreleased": topiced ? false : parsed_track.unreleased,
        "album": undefined,
        "plays": 0,
        "imported_id": legacy_1307_track.imported ? UUID.v7() : "",
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
        "inherited_playlists": JSON.parse(sql_playlist.inherited_playlists),
        "linked_playlists": JSON.parse(sql_playlist.linked_playlists),
        "visual_data": ignore_tracks ? {"four_track": [], "track_count": 0} : {"four_track": tracks.slice(0,4), "track_count": tracks.length},
        "date": new Date(sql_playlist.date)
    });
}

export async function get_legacy_1307_track_data(database: SQLite.SQLiteDatabase){
    const tracks: LegacyTypes1307.Track[] = await database.getAllAsync("SELECT * FROM tracks");
    return tracks;
}
export async function get_legacy_1307_playlists(database: SQLite.SQLiteDatabase){
    const playlists: LegacyTypes1307.Playlist[] = await database.getAllAsync("SELECT * FROM playlists");
    return playlists;
}
export async function get_legacy_1307_playlist_tracks(database: SQLite.SQLiteDatabase, playlist_name: string) {
    const tracks: LegacyTypes1307.Track[] = await database.getAllAsync(`SELECT * FROM tracks AS t JOIN ${playlist_name_sql_friendly(playlist_name)} AS p ON p.track_uid = t.uid ORDER BY p.id`);
    return tracks;
}

export async function fetch_track_data(){
    const tracks: SQLTrack[] = await db.getAllAsync("SELECT * FROM tracks");
    GLOBALS.global_var.sql_tracks = tracks.map(track => sql_track_to_track(track));
}
export async function clear_tracks(){
    await db.execAsync('DELETE FROM tracks');
}
export async function fetch_track_data_from_uid(uid: string): Promise<Track> {
    const tracks: SQLTrack[] = await db.getAllAsync(`SELECT * FROM tracks WHERE uid = (?)`, uid);
    return tracks.map(track => sql_track_to_track(track))[0];
}
export async function mark_track_downloaded(uid: string, media_uri: string) {
    await db.execAsync(`UPDATE tracks SET media_uri='${media_uri}' WHERE uid='${uid}'`);
    await fetch_track_data();
}
export async function mark_track_undownloaded(uid: string) {
    await db.execAsync(`UPDATE tracks SET media_uri='' WHERE uid='${uid}'`);
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
export async function track_from_uid(uid: string){
    const track = await db.getAllAsync('SELECT * FROM tracks WHERE uid = ?;', [uid]);
    return sql_track_to_track(track[0] as SQLTrack);
}
export async function track_uid_exists(track: Track){
    const count_sql = await db.runAsync('SELECT COUNT(tracks.uid) FROM tracks WHERE tracks.uid = ?;', [track.uid]);
    return count_sql.changes !== 0;
}

function track_to_sqllite_insertion(track: Track): any[] {
    const to_array: any[] = [];
    to_array.push(track.uid ?? "");
    to_array.push(track.title ?? "");
    to_array.push(JSON.stringify(track.artists ?? []));
    to_array.push(track.duration ?? 0);
    to_array.push(track.explicit ?? false);
    to_array.push(track.unreleased ?? false);
    to_array.push(JSON.stringify(track.album ?? {"name": "", "uri": ""}));
    to_array.push(track.plays ?? 0);
    to_array.push(track.imported_id ?? "");
    to_array.push(track.illusi_id ?? "");
    to_array.push(track.youtube_id ?? "");
    to_array.push(track.youtubemusic_id ?? "");
    to_array.push(track.soundcloud_id ?? 0);
    to_array.push(track.soundcloud_permalink ?? "");
    to_array.push(track.spotify_id ?? "");
    to_array.push(track.amazonmusic_id ?? "");
    to_array.push(track.applemusic_id ?? "");
    to_array.push(track.artwork_url ?? "");
    to_array.push(track.thumbnail_uri ?? "");
    to_array.push(track.media_uri ?? "");
    to_array.push(track.lyrics_uri ?? "");
    const meta: TrackMetaData = {
        "added_date": new Date(),
        "last_played_date": new Date(),
        "plays": 0,
    };
    to_array.push(is_empty(track.meta) ? JSON.stringify(meta) : JSON.stringify(track.meta));
    return to_array;
}

export async function insert_track(track: Track) {
    if( await track_exists(track) ) return;
    if(Prefs.get_pref('auto_cache_thumbnails')) download_thumbnail(track);
    const sql_table = obj_to_sql_table(undefined, ExampleObj.track_example0, false);
    await db.runAsync(`INSERT INTO tracks ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`, track_to_sqllite_insertion(track));
    await fetch_track_data();
}
export async function update_track(track_uid: string, new_track: Track){
    await db.runAsync(`UPDATE tracks SET ${obj_to_update_sql(new_track)} WHERE uid = ?`, track_uid);
    await fetch_track_data();
}
export async function update_track_meta_data(track_uid: string, new_meta: TrackMetaData){
    await db.runAsync(`UPDATE tracks SET meta='${JSON.stringify(new_meta)}' WHERE uid = ?`, track_uid);
    await fetch_track_data();
}

export async function update_track_with_new_track_data(old_track: Track, new_track: Track){
    const merged_track = merge_track_with_new_track(old_track, new_track);
    await update_track(merged_track.uid, merged_track);
}
export async function insert_track_playlist(playlist_uid: string, track_uid: string) {
    await db.runAsync(`INSERT INTO playlists_tracks (uid, track_uid) values (?, ?)`, [playlist_uid, track_uid]);
}

export async function delete_track(uid: string) {
    await db.runAsync(`DELETE FROM tracks WHERE uid=?`, uid);
    await clean_directories();
}
export async function delete_track_playlist(playlist_uid: string, track_uid: string) {
    await db.runAsync(`DELETE FROM playlists_tracks WHERE uid = ? AND track_uid = ?`, [playlist_uid, track_uid]);
}

export async function insert_recently_played_track(track: Track){
    // await db.runAsync("DELETE FROM recently_played_tracks where uid = ?", [track.uid]);
    const sql_table = obj_to_sql_table(undefined, ExampleObj.track_example0, false);
    await db.runAsync(`INSERT INTO recently_played_tracks ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`, track_to_sqllite_insertion(track));
}
export async function recently_played_tracks(): Promise<Track[]>{
    const recently_played_sql_tracks: SQLTrack[] = await db.getAllAsync('SELECT * FROM recently_played_tracks');
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
        await db.execAsync('DELETE FROM recently_played_tracks');
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
    const playlists: SQLPlaylist[] = await db.getAllAsync("SELECT * FROM playlists");
    return Promise.all(playlists.map(async(playlist) => await sql_playlist_to_playlist(playlist)));
}
export async function all_playlists_names(): Promise<{"title": string}[]> {
    const playlists_names = await db.getAllAsync("SELECT title FROM playlists");
    return playlists_names as {"title": string}[];
}
export async function playlist_data(playlist_uid: string, ignore_tracks = false) {
    const playlists: SQLPlaylist[] = await db.getAllAsync(`SELECT * FROM playlists WHERE uid = '${playlist_uid}'`);
    return await sql_playlist_to_playlist(playlists[0], ignore_tracks);
}
export async function update_playlist(playlist_uid: string, new_playlist: Playlist){
    await db.runAsync(`UPDATE playlists ${obj_to_update_sql(new_playlist)} WHERE uid = ?`, playlist_uid);
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
    const playlist_uid = generate_new_uid(playlist_name);
    await db.runAsync('INSERT INTO playlists (uid, title, pinned, thumbnail_uri, sort, public, description, date, inherited_playlists, linked_playlists) Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [playlist_uid, playlist_name, false, "", "OLDEST", false, "", new Date().toISOString(), JSON.stringify([]), JSON.stringify([])]);
    return playlist_uid;
}
export async function delete_playlist(playlist_uid: string) {
    await db.execAsync(`DELETE FROM playlists WHERE uid='${playlist_uid}'`);
    await db.execAsync(`DELETE FROM playlists_tracks WHERE uid='${playlist_uid}'`);
}
export async function delete_all_playlists() {
    const playlists = await all_playlists_data();
    for(const playlist of playlists){
        await delete_playlist(playlist.uuid);
    }
}
export async function pin_unpin_playlist(playlist_uid: string, pin: boolean) {
    if(pin)
        await db.runAsync(`UPDATE playlists SET pinned=true WHERE uid='${playlist_uid}'`);
    else
        await db.execAsync(`UPDATE playlists SET pinned=false WHERE uid='${playlist_uid}'`);
}
export async function playlist_tracks(playlist_uid: string, seen_playlist_uids = new Set<string>(), skip_inheritance = false) {
    const playlist: SQLTrack[] = await db.getAllAsync(`SELECT * FROM tracks AS t JOIN playlists_tracks AS p ON p.track_uid = t.uid AND p.uid = '${playlist_uid}' ORDER BY p.id`);
    let tracks: Track[] = playlist.map(track => sql_track_to_track(track)); 
    if(skip_inheritance) return tracks;
    const cplaylist_data = await playlist_data(playlist_uid, true);
    for(const inherited_playlist of cplaylist_data.inherited_playlists){
        if(!seen_playlist_uids.has(playlist_uid)){
            seen_playlist_uids.add(playlist_uid);
            const inherited_tracks = await playlist_tracks(inherited_playlist.uuid, seen_playlist_uids);
            switch (inherited_playlist.mode) {
                case "INCLUDE": tracks = array_include<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "EXCLUDE": tracks = array_exclude<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid); break;
                case "MASK"   : tracks = array_mask<Track>(tracks, inherited_tracks, (a: Track,b: Track) => a.uid === b.uid);    break;
            }
        }
    }
    return tracks;
}
export async function is_playlist_pinned(playlist_uid: string): Promise<boolean> {
    const playlists: SQLPlaylist[] = await db.getAllAsync(`SELECT pinned FROM playlists WHERE uid='${playlist_uid}'`);
    return Boolean(playlists[0].pinned);
}

export async function empty_backpack(){
    await db.execAsync(`DELETE FROM backpack`);
}
export async function delete_from_backpack(uid: string){
    await db.runAsync(`DELETE FROM backpack WHERE uid='${uid}'`);
}
export async function backpack_tracks(): Promise<Track[]>{
    const sql_tracks: SQLTrack[] = await db.getAllAsync('SELECT * FROM backpack');
    const tracks: Track[] = sql_tracks.map(sql_track => sql_track_to_track(sql_track));
    for(let i = 0; i < tracks.length; i++) tracks[i].playback!.artwork = Illusive.illusi_dark_icon;
    return tracks;
}
export async function add_to_backpack(uid: string){
    const track: Track = await track_from_uid(uid);
    const all_promises: Promises = [];
    const sql_table = obj_to_sql_table(undefined, ExampleObj.track_example0, false);
    all_promises.push( delete_track(uid) );
    all_promises.push( db.runAsync(`INSERT INTO backpack ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`, track_to_sqllite_insertion(track)) );

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
    await db.execAsync('UPDATE tracks SET thumbnail_uri=""');
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
    await FileSystem.deleteAsync(sqlite_directory()+database_path, {"idempotent": true});
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

export async function recreate_all_tables(){
    // console.log(((await db.runAsync("DROP table tracks")).changes));
    // console.log(((await db.runAsync("DROP table playlists")).changes));

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
    const current_tracks = (await db.getAllAsync("SELECT * from tracks"));
    if(all_legacy_1307_table_names.includes("tracks") && current_tracks.length === 0){
        Alert.alert("Updating to 14.0.0 BETA");
        await move_unsorted_media_to_folders();
        const all_promises: Promises = [];
        for(const legacy_1307_track of legacy_1307_tracks)
            all_promises.push( insert_track(await legacy_1307_track_to_track(legacy_1307_track)) );
        for(const legacy_1307 of legacy_1307_playlists){
            const legacy_1307_tracks = await get_legacy_1307_playlist_tracks(db_pre_1307, legacy_1307.playlist_name);
            const playlist_uid = await create_playlist(legacy_1307.playlist_name);
            for(const legacy_1307_track of legacy_1307_tracks)
                all_promises.push( insert_track_playlist(playlist_uid, legacy_1307_track.uid) );
        }
        await Promise.all(all_promises);
    }
}