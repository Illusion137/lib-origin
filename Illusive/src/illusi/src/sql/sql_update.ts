import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';
import { insert_track } from './sql_tracks';
import { db, db_pre_1307 } from './database';
import { all_playlists_data, create_playlist, insert_track_playlist, update_playlist } from './sql_playlists';
import { Promises, SQLAlter, SQLTable, SQLType, Track } from '../../../types';
import { move_unsorted_media_to_folders, recreate_all_tables, sql_drop_table, sql_select, sql_where } from '../sql/sql_utils';
import { get_legacy_1307_playlist_tracks, get_legacy_1307_playlists, get_legacy_1307_track_data, legacy_1307_track_to_track } from './sql_legacy_1307';

export async function get_all_tables(database: SQLite.SQLiteDatabase) {
    const tables = await database.getAllAsync(`${sql_select("sqlite_master", "*")} ${sql_where<{type: string}>(["type", "table"])}`);
    return tables as SQLTable[];
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
    if(selected_table_index === -1) return;

    const table_column_props = get_sql_table_column_properties(tables[selected_table_index]);
    const selected_column_index = table_column_props.findIndex((props) => props.column_name == alter.column_name);
    if(selected_column_index === -1) return;
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

export async function fix_to_new_update(){
    // UPDATE 13.0.4 BETA
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
    try {        
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
    } catch (error) {}

    // UPDATE 14.1.4 BETA
    const all_1403_playlist_data = await all_playlists_data();
    if(all_1403_playlist_data.length > 0 && all_1403_playlist_data.every((playlist) => playlist.public_uuid === "0" && <any>playlist.public === "OLDEST")){
        await db.runAsync( sql_drop_table("playlists") );
        await recreate_all_tables();
        for(const playlist of all_1403_playlist_data){
            delete (<any>playlist).id;
            delete (<any>playlist).uuid;
            delete (<any>playlist).visual_data;
            const playlist_uuid = await create_playlist(playlist.title);
            await update_playlist(playlist_uuid, playlist);
        }
        Alert.alert("Updated Playlists to 14.1.4 BETA");
    }
}