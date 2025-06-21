import * as SQLite from 'expo-sqlite';
import { is_empty } from "../../../../../origin/src/utils/util";
import { Illusive } from '../../../illusive';
import { extract_file_extension } from '../../../illusive_utilts';
import { CompactPlaylist, Primitives, SQLTables, Track } from "../../../types";
import { ExampleObj } from '../example_objs';
import * as GLOBALS from '../globals';
import { db, db_path, reasign_db } from './database';
import * as SQLfs from './sql_fs';
import { document_directory, sqlite_directory, thumbnail_directory } from './sql_fs';
import { alert_error } from '../alert';

export async function db_exec_async(source: string){
    try {
        await db.execAsync(source);
    } catch (error) {
        if(!(error as Error).message.includes("UNIQUE constraint failed")){
            alert_error({error: error as Error});
            alert_error(`SQL: ${source}`);
        }
    }
}
export async function db_run_async(source: string, params?: SQLite.SQLiteBindParams) {
    try {
        if(params !== undefined)
            await db.runAsync(source, params);
        else await db.runAsync(source);
    } catch (error) {
        if(!(error as Error).message.includes("UNIQUE constraint failed")){
            alert_error({error: error as Error});
            alert_error(`SQL: ${source}`);
        }
    }
}
export function db_get_all_sync<T>(source: string, ...params: SQLite.SQLiteVariadicBindParams) {
    try {
        return db.getAllSync<T>(source, params);
    } catch (error) {
        if(!(error as Error).message.includes("UNIQUE constraint failed")){
            alert_error({error: error as Error});
            alert_error(`SQL: ${source}`);
        }
        return [];
    }
}
export async function db_get_all_async<T>(source: string, ...params: SQLite.SQLiteVariadicBindParams) {
    try {
        return await db.getAllAsync<T>(source, params);
    } catch (error) {
        if(!(error as Error).message.includes("UNIQUE constraint failed")){
            alert_error({error: error as Error});
            alert_error(`SQL: ${source}`);
        }
        return [];
    }
}

export async function sql_update<T extends Record<string, any>>(table: SQLTables, item: {uid: string}|{id:number}, key: keyof T, value: any) {
    if(!("uid" in item))
        return sql_all(db, sql_update_table(table), `SET ${String(key)}='${value}'`, sql_where<{id: string}>(["id", item.id]));
    return sql_all(db, sql_update_table(table), `SET ${String(key)}='${value}'`, sql_where<{uid: string}>(["uid", item.uid]));
}
export async function create_table<T extends Record<string, any>>(table: SQLTables, obj: T) {
    await db.execAsync(sql_create_table<T>(table, obj));
}

export function sql_select<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*" | "COUNT(1)", limit?: number, order_by?: "ASC"|"DESC") {
    return `SELECT ${String(what)} FROM ${table}` + (order_by ? ` ORDER BY id ${order_by}` : "") + (limit ? ` LIMIT ${limit}` : "");
}
export function sql_select_count<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*") {
    return `SELECT COUNT(${table}.${String(what)}) FROM ${table}`;
}
export function sql_insert(table: SQLTables) {
    return `INSERT INTO ${table}`;
}
export function sql_insert_values<T extends Record<string, any>>(table: SQLTables, example_obj: T) {
    const sql_table = obj_to_sql_table(undefined, example_obj, false);
    return `${sql_insert(table)} ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`;
}
export function sql_where<T extends Record<string, any>>(...args: [keyof T, Primitives][]) {
    return `WHERE ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${arg[1]}'`: arg[1]}`).join(' AND ')}`;
}
export function sql_set<T extends Record<string, any>>(...args: [keyof T, Primitives][]) {
    return `SET ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${sql_serialize(arg[1])}'`: arg[1]}`).join(' AND ')}`;
}
export function sql_create_table<T extends Record<string, any>>(table: SQLTables, obj: T) {
    return `CREATE TABLE IF NOT EXISTS ${table} ${obj_to_sql_table("id INTEGER PRIMARY KEY, Timestamp DATETIME", obj, true)}`;
}
export function sql_delete_from(table: SQLTables) {
    return `DELETE FROM ${table}`;
}
export function sql_drop_table(table: SQLTables) {
    return `DROP table ${table}`;
}
export function sql_update_table(table: SQLTables) {
    return `UPDATE ${table}`;
}

export function obj_to_sql_table(primary: string|undefined, obj: Record<string, any>, types: boolean) {
    const key_values = is_empty(primary) ? [] : [primary];
    for(const key of Object.keys(obj)) {
        if(types === true)
            switch(typeof obj[key]) {
                case "object": key_values.push(`${key} TEXT`); break;
                case "string": key_values.push(`${key} TEXT`); break;
                case "number": key_values.push(`${key} INTEGER`); break;
                case "boolean": key_values.push(`${key} BOOLEAN`); break;
                default:
            }
        else if(typeof obj[key] !== "undefined") key_values.push(`${key}`);
    }
    return `(${key_values.join(", ")})`;
}
export function sql_table_to_query_variadics(sql_table: string) {
    const qarr: string[] = [];
    sql_table.split(',').forEach(_ => qarr.push('?'));
    return `(${qarr.join(', ')})`;
}
function sql_serialize(str: string) {
    return str.replace(/'/g, "''");
}
export function obj_to_update_sql(obj: Record<string, any>, example_obj?: Record<string, any>) {
    const updation: string[] = [];
    let keys;
    if(example_obj !== undefined) {
        const obj_keys = Object.keys(example_obj);
        for(let i = 0; i < obj_keys.length; i++)
            if(example_obj[obj_keys[i]] === undefined) delete example_obj[obj_keys[i]];
        const new_obj_keys = Object.keys(example_obj);
        keys = Object.keys(obj).filter(key => new_obj_keys.includes(key));
    }
    else keys = Object.keys(obj);
    
    for(const key of keys) {
        const value = obj[key];
        switch(typeof value) {
            case "string": updation.push(`${key}='${sql_serialize(value)}'`); break;
            case "object": updation.push(`${key}='${sql_serialize(JSON.stringify(value))}'`); break;
            case "undefined": break;
            default: updation.push(`${key}=${value}`);
        }
    }
    return updation;
}

export async function sql_all(db: SQLite.SQLiteDatabase, ...args: string[]) {
    return await db.getAllAsync(args.join(" "));
}

export function update_global_track_property<T extends keyof Track>(uid: Track['uid'], prop: T, value: Track[T]){
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx][prop] = value;
}
export function update_global_track_all_property<T extends keyof Track>(prop: T, value: Track[T]){
    for(let i = 0; i < GLOBALS.global_var.sql_tracks.length; i++){
        GLOBALS.global_var.sql_tracks[i][prop] = value;
    }
}
export function update_global_track_item(uid: Track['uid'], new_track: Track){
    const idx = GLOBALS.global_var.sql_tracks.findIndex(item => item.uid === uid);
    if(idx !== -1) GLOBALS.global_var.sql_tracks[idx] = new_track;
}

export async function download_thumbnail(track: Track) {
    const best_artwork = await Illusive.get_best_track_artwork(document_directory(""), track);
    if(typeof best_artwork === "object" && is_empty(track.thumbnail_uri)) {
        const ext = extract_file_extension(best_artwork.uri, "photo");
        const thumbnail_uri = track.uid + ext;
        const thumbnail_download = SQLfs.create_download_resumeable(best_artwork.uri, thumbnail_directory(thumbnail_uri));
        await thumbnail_download.downloadAsync();
        await sql_update<Track>("tracks", track, "thumbnail_uri", thumbnail_uri);
        update_global_track_property(track.uid, 'thumbnail_uri', thumbnail_uri);
        update_global_track_property(track.uid, 'playback', {...track.playback!, artwork: Illusive.get_track_artwork(document_directory(""), track)});
        return track.uid + ext;
    }
    return undefined;
}

export async function move_unsorted_media_to_folders() {
    for(const file of await SQLfs.read_directory(document_directory(""))) {
        const info = await SQLfs.info(document_directory(file));
        if(!info.isDirectory && info.exists) {
            if(info.uri.includes(".mp4") || info.uri.includes(".mp3") || info.uri.includes(".m4a"))
                await SQLfs.move_to_media_directory(info.uri);
        }
    }
    for(const file of await SQLfs.read_directory(document_directory("CachedThumbnails"))) {
        const info = await SQLfs.info(document_directory("CachedThumbnails") + file);
        if(!info.isDirectory && info.exists) {
            if(info.uri.includes(".webp") || info.uri.includes(".png") || info.uri.includes(".jpg"))
                await SQLfs.move_to_thumbnail_directory(info.uri);
        }
    }
}

export async function delete_database(database: SQLite.SQLiteDatabase, database_path: string) {
    await database.closeAsync();
    await SQLfs.delete_item(sqlite_directory(database_path));
}
export async function delete_all_data() {
    await delete_database(db, db_path);
    for(const file of await SQLfs.read_directory(document_directory(""))) {
        try {
            if(!(file.includes("RCTAsyncLocalStorage") || file == 'RCTAsyncLocalStorage_V1'))
                await SQLfs.delete_item(document_directory(file));
        } catch (error) {}
    }
    reasign_db(await SQLite.openDatabaseAsync(db_path));
    await create_default_directories();
    await recreate_all_tables();
    GLOBALS.global_var.sql_tracks = [];
}

export async function create_default_directories() {
    for(const directory of Illusive.default_directories)
        if(!(await SQLfs.info(document_directory(directory))).exists)
            await SQLfs.mkdir(document_directory(directory))
}

export async function destroy_all_tables() {
    console.log(((await db.runAsync( sql_drop_table("tracks") )).changes));
    console.log(((await db.runAsync( sql_drop_table("recently_played_tracks") )).changes));
    console.log(((await db.runAsync( sql_drop_table("backpack") )).changes));
    console.log(((await db.runAsync( sql_drop_table("playlists") )).changes));
    console.log(((await db.runAsync( sql_drop_table("playlists_tracks") )).changes));
    console.log(((await db.runAsync( sql_drop_table("playlists_tracks") )).changes));
}
export async function recreate_all_tables() {
    // await destroy_all_tables();

    await create_table("tracks",                         ExampleObj.track_example0);
    await create_table("tracks_deleted",                 ExampleObj.track_example0);
    await create_table("recently_played_tracks",         ExampleObj.track_example0);
    await create_table("backpack",                       ExampleObj.track_example0);
    await create_table("backpack_deleted",               ExampleObj.track_example0);
    await create_table("playlists",                      ExampleObj.playlist_example0);
    await create_table("playlists_deleted",              ExampleObj.playlist_example0);
    await create_table("playlists_tracks",               ExampleObj.playlists_tracks_example0);
    await create_table("playlists_tracks_deleted",       ExampleObj.playlists_tracks_example0);
    await db.execAsync(sql_create_table<CompactPlaylist>("new_releases", ExampleObj.new_releases_example0).replace("title TEXT","title TEXT UNIQUE"));

    await create_default_directories();
}

export async function create_timestamp_triggers_if_not_exists(table: SQLTables){
    const triggers = await db_get_all_async<{name: string}>("select name from sqlite_master where type = 'trigger';");
    if(triggers.map(trigger => trigger.name).includes(`${table}_insert_Timestamp_Trigger`)) return;
    await db_exec_async(`
    CREATE TRIGGER ${table}_insert_Timestamp_Trigger
    AFTER INSERT ON ${table}
    BEGIN
    UPDATE ${table} SET Timestamp =STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE id = NEW.id;
    END;

    CREATE TRIGGER ${table}_update_Timestamp_Trigger
    AFTER UPDATE On ${table}
    BEGIN
        UPDATE ${table} SET Timestamp = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE id = NEW.id;
    END;   
    `);
}
export async function create_delete_triggers_if_not_exists<T extends Record<string, any>>(watch_table: SQLTables, copy_table: SQLTables, obj: T){
    const triggers = await db_get_all_async<{name: string}>("SELECT name from sqlite_master WHERE type = 'trigger';");
    if(triggers.map(trigger => trigger.name).includes(`${watch_table}_deleted_Trigger`)) return;
    const keys = Object.keys(obj).filter(key => obj[key] !== undefined);
    await db_exec_async(`
        CREATE TRIGGER ${watch_table}_deleted_Trigger
        BEFORE DELETE ON ${watch_table}
        FOR EACH ROW
        BEGIN
            INSERT INTO ${copy_table} (${keys.join(', ')}) VALUES (${keys.map(key => `OLD.${key}`).join(', ')});
        END;
    `);
}