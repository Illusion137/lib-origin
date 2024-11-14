import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as GLOBALS from '../globals';
import { is_empty } from "../../../../../origin/src/utils/util";
import { Primitives, SQLTables, Track } from "../../../types";
import { Illusive } from '../../../illusive';
import { extract_file_extension } from '../../../illusive_utilts';
import CookieManager from '@react-native-community/cookies';
import { Prefs } from '../../../prefs';
import { ExampleObj } from '../example_objs';
import path from 'path';
import { document_directory, media_directory, sqlite_directory, thumbnail_directory } from './sql_fs';
import { db, db_path, reasign_db } from './database';

export async function sql_update<T extends Record<string, any>>(table: SQLTables, item: {uid: string}, key: keyof T, value: any){
    return sql_all(db, sql_update_table(table), `SET ${String(key)}='${value}'`, sql_where<{uid: string}>(["uid", item.uid]))
}
export async function create_table<T extends Record<string, any>>(table: SQLTables, obj: T){
    await db.execAsync(sql_create_table<T>(table, obj));
}

export function sql_select<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*"){
    return `SELECT ${String(what)} FROM ${table}`;
}
export function sql_select_count<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*"){
    return `SELECT COUNT(${table}.${String(what)}) FROM ${table}`;
}
export function sql_insert(table: SQLTables){
    return `INSERT INTO ${table}`;
}
export function sql_insert_values<T extends Record<string, any>>(table: SQLTables, example_obj: T){
    const sql_table = obj_to_sql_table(undefined, example_obj, false);
    return `${sql_insert(table)} ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`;
}
export function sql_where<T extends Record<string, any>>(...args: [keyof T, Primitives][]){
    return `WHERE ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${arg[1]}'`: arg[1]}`).join(' AND ')}`;
}
export function sql_set<T extends Record<string, any>>(...args: [keyof T, Primitives][]){
    return `SET ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${arg[1]}'`: arg[1]}`).join(' AND ')}`;
}
export function sql_create_table<T extends Record<string, any>>(table: SQLTables, obj: T){
    return `CREATE TABLE IF NOT EXISTS ${table} ${obj_to_sql_table("id INTEGER PRIMARY KEY", obj, true)}`;
}
export function sql_delete_from(table: SQLTables){
    return `DELETE FROM ${table}`;
}
export function sql_drop_table(table: SQLTables){
    return `DROP table ${table}`;
}
export function sql_update_table(table: SQLTables){
    return `UPDATE ${table}`;
}

export function obj_to_sql_table(primary: string|undefined, obj: Record<string, any>, types: boolean){
    const key_values = is_empty(primary) ? [] : [primary];
    for(const key of Object.keys(obj)){
        if(types === true)
            switch(typeof obj[key]){
                case "object": key_values.push(`${key} TEXT`); break;
                case "string": key_values.push(`${key} TEXT`); break;
                case "number": key_values.push(`${key} INTEGER`); break;
                case "boolean": key_values.push(`${key} BOOLEAN`); break;
                default: break;
            }
        else if(typeof obj[key] !== "undefined") key_values.push(`${key}`);
    }
    return `(${key_values.join(", ")})`;
}
export function sql_table_to_query_variadics(sql_table: string){
    const qarr: string[] = [];
    for(const _ in sql_table.split(','))
        qarr.push('?');
    return `(${qarr.join(', ')})`;
}
function sql_serialize(str: string){
    return str.replace("'", "''");
}
export function obj_to_update_sql(obj: Record<string, any>, serialize_strings?: boolean){
    const updation: string[] = [];
    const keys = Object.keys(obj);
    for(const key of keys){
        const value = obj[key];
        switch(typeof value){
            case "string": (serialize_strings ?? false) ? updation.push(`${key}='${sql_serialize(value)}'`) : updation.push(`${key}='${value}'`); break;
            case "object": updation.push(`${key}='${sql_serialize(JSON.stringify(value))}'`); break;
            case "undefined": break;
            default: updation.push(`${key}=${value}`); break;
        }
    }
    return updation;
}

export async function sql_all(db: SQLite.SQLiteDatabase, ...args: string[]){
    return await db.getAllAsync(args.join(" "));
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
    reasign_db(await SQLite.openDatabaseAsync(db_path));
    await create_default_directories();
    await recreate_all_tables();
    if(!Prefs.get_pref('keep_prefs')){
        await CookieManager.clearAll();
        await Prefs.reset_prefs();
    }
    GLOBALS.global_var.sql_tracks = [];
}


export async function create_default_directories(){
    for(const directory of Illusive.default_directories)
        if(!(await FileSystem.getInfoAsync(document_directory(directory))).exists)
            await FileSystem.makeDirectoryAsync(document_directory(directory))
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