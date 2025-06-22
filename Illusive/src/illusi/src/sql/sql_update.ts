import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';
import { Playlist, PlaylistsTracks, Promises, SQLAlter, SQLPlaylist, SQLTable, SQLTrack, SQLType, Track } from '../../../types';
import { create_delete_triggers_if_not_exists, create_timestamp_triggers_if_not_exists, db_exec_async, db_get_all_async, db_run_async, move_unsorted_media_to_folders, recreate_all_tables, sql_drop_table, sql_select, sql_update, sql_update_table, sql_where } from '../sql/sql_utils';
import { db, db_pre_1307 } from './database';
import { get_legacy_1307_playlist_tracks, get_legacy_1307_playlists, get_legacy_1307_track_data, legacy_1307_track_to_track } from './sql_legacy_1307';
import { all_playlists_data, create_playlist, insert_track_playlist, update_playlist } from './sql_playlists';
import { insert_track } from './sql_tracks';
import { is_empty } from '../../../../../origin/src/utils/util';
import * as uuid from 'react-native-uuid';
import { Prefs } from '../../../prefs';
import { version_greater_than } from '../../../illusive_utilts';
import { ExampleObj } from '../example_objs';

export async function get_all_tables(database: SQLite.SQLiteDatabase) {
    const tables = await database.getAllAsync(`${sql_select("sqlite_master", "*")} ${sql_where<{ type: string }>(["type", "table"])}`);
    return tables as SQLTable[];
}

function get_sql_table_column_properties(table: SQLTable): { 'column_name': string, 'type': SQLType }[] {
    const column_props: { 'column_name': string, 'type': SQLType }[] = [];
    const inner_sql = table.sql.slice(table.sql.indexOf('(') + 1, table.sql.indexOf(')'));
    for (const prop of inner_sql.split(', ').map((prop => prop.trim()))) {
        const [column_name, type] = prop.split(' ');
        column_props.push({ column_name: column_name, type: type as SQLType });
    }
    return column_props;
}
async function alter_sql(database: SQLite.SQLiteDatabase, alter: SQLAlter) {
    const tables = await get_all_tables(database);
    const selected_table_index = tables.findIndex((table) => table.name == alter.table);
    if (selected_table_index === -1) return;

    const table_column_props = get_sql_table_column_properties(tables[selected_table_index]);
    const selected_column_index = table_column_props.findIndex((props) => props.column_name == alter.column_name);
    const column_props = table_column_props[selected_column_index];

    if (alter.action === 'ADD' && column_props === undefined) {
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} ${alter.column_name} ${alter.type}`);
    } else if (alter.action === 'DROP' && column_props !== undefined) {
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} COLUMN ${alter.column_name}`);
    } else if (alter.action === 'RENAME' && column_props !== undefined && column_props.column_name !== alter.new_column_name) {
        await database.execAsync(`ALTER TABLE ${alter.table} ${alter.action} COLUMN ${alter.column_name} TO ${alter.new_column_name}`);
    } else return;
    Alert.alert("Altered SQL Table: ", `Changes ${JSON.stringify(alter)}`);
}

export async function fix_to_new_update(version: string) {

    // UPDATE 13.0.4 BETA
    if (!version_greater_than(version, "13.0.4")) {
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'RENAME', column_name: 'thumbnail_URI', new_column_name: 'thumbnail_uri' });
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'ADD', column_name: 'sort', type: 'TEXT' });
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'ADD', column_name: 'public', type: "BOOLEAN" });
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'ADD', column_name: 'public_uid', type: "TEXT" });
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'ADD', column_name: 'inherited_playlists_json', type: "TEXT" });
        await alter_sql(db_pre_1307, { table: 'playlists', action: 'ADD', column_name: 'linked_playlists_json', type: "TEXT" });
    }

    // UPDATE 13.0.5 BETA
    if (!version_greater_than(version, "13.0.5")) {
        await alter_sql(db_pre_1307, { table: 'tracks', action: 'ADD', column_name: 'views', type: "INTEGER" });
        await alter_sql(db_pre_1307, { table: 'recently_played_tracks', action: 'ADD', column_name: 'views', type: "INTEGER" });
    }

    // UPDATE 14.0.0 BETA
    if (!version_greater_than(version, "14.0.0")) {
        try {
            const current_tracks = (await db_get_all_async<SQLTrack>(sql_select<Track>("tracks", "*")));
            const legacy_1307_tracks = await get_legacy_1307_track_data(db_pre_1307);
            const legacy_1307_playlists = await get_legacy_1307_playlists(db_pre_1307);
            const all_legacy_1307_table_names = (await get_all_tables(db_pre_1307)).map(table => table.name);
            if (all_legacy_1307_table_names.includes("tracks") && current_tracks.length === 0) {
                Alert.alert("Updating to 14.0.0 BETA");
                await move_unsorted_media_to_folders();
                const all_promises: Promises = [];
                for (const legacy_1307_track of legacy_1307_tracks)
                    all_promises.push(insert_track(await legacy_1307_track_to_track(legacy_1307_track)));
                for (const legacy_1307 of legacy_1307_playlists) {
                    const legacy_1307_tracks = await get_legacy_1307_playlist_tracks(db_pre_1307, legacy_1307.playlist_name);
                    const playlist_uuid = await create_playlist(legacy_1307.playlist_name);
                    for (const legacy_1307_track of legacy_1307_tracks)
                        all_promises.push(insert_track_playlist(playlist_uuid, legacy_1307_track.uid));
                }
                await Promise.all(all_promises);
            }
        } catch (error) { }
    }

    // UPDATE 14.1.4 BETA
    if (!version_greater_than(version, "14.1.4")) {
        try {
            const all_1403_playlist_data = await all_playlists_data();
            if (all_1403_playlist_data.length > 0 && all_1403_playlist_data.every((playlist) => playlist.public_uuid === "0" && (playlist.public as any) === "OLDEST")) {
                await db_run_async(sql_drop_table("playlists"));
                await recreate_all_tables();
                for (const playlist of all_1403_playlist_data) {
                    const playlist_uuid = await create_playlist(playlist.title);
                    await update_playlist(playlist_uuid, playlist);
                }
                Alert.alert("Updated Illusi to 14.1.4 BETA");
            }
        } catch (error) { }

        await alter_sql(db, { table: 'tracks', action: 'ADD', column_name: 'alt_title', type: "TEXT" });
        await alter_sql(db, { table: 'backpack', action: 'ADD', column_name: 'alt_title', type: "TEXT" });
        await alter_sql(db, { table: 'recently_played_tracks', action: 'ADD', column_name: 'alt_title', type: "TEXT" });
    }

    // UPDATE 14.5.10 BETA
    if (!version_greater_than(version, "14.5.10")) {
        try {
            const current_tracks = (await db_get_all_async<SQLTrack>(sql_select<Track>("tracks", "*")));
            if (current_tracks.some(track => is_empty(track.illusi_id))) {
                for (const track of current_tracks) {
                    if (is_empty(track.illusi_id)) {
                        await sql_update<Track>("tracks", { uid: track.uid }, "illusi_id", uuid.default.v4());
                    }
                }
                Alert.alert("Updated Illusi to 14.5.10 BETA");
            }
        } catch (error) { }
    }

    // UPDATE 14.5.12 BETA
    if (!version_greater_than(version, "14.5.12")) {
        try {
            const current_tracks = (await db_get_all_async<SQLTrack>(sql_select<Track>("tracks", "*")));
            if (current_tracks.some(track => track.prods === "[]")) {
                for (const track of current_tracks) {
                    if (track.prods === "[]") {
                        await sql_update<Track>("tracks", { uid: track.uid }, "prods", "");
                    }
                    else {
                        await sql_update<Track>("tracks", { uid: track.uid }, "prods", track.prods?.trim() ?? "");
                    }
                }
                Alert.alert("Updated Illusi to 14.5.12 BETA");
            }
        } catch (error) { }
    }

    if (!version_greater_than(version, "14.6.12")) {
        // await db_exec_async( sql_drop_table("backpack_deleted") );
        // await db_exec_async( sql_drop_table("playlists_deleted") );
        // await db_exec_async( sql_drop_table("playlists_tracks_deleted") );
        // await db_exec_async( sql_drop_table("recently_played_tracks_deleted") );
        // await db_exec_async( sql_drop_table("tracks_deleted") );

        // await db_exec_async("DROP TRIGGER tracks_deleted_Trigger");
        // await db_exec_async("DROP TRIGGER playlists_deleted_Trigger");
        // await db_exec_async("DROP TRIGGER playlists_tracks_deleted_Trigger");
        // await db_exec_async("DROP TRIGGER recently_played_tracks_deleted_Trigger");
        // await db_exec_async("DROP TRIGGER backpack_deleted_Trigger");

        // return;

        await alter_sql(db, { table: 'tracks', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await alter_sql(db, { table: 'tracks_deleted', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await create_timestamp_triggers_if_not_exists("tracks");
        await create_timestamp_triggers_if_not_exists("tracks_deleted");
        await create_delete_triggers_if_not_exists("tracks", "tracks_deleted", ExampleObj.track_example0);

        await alter_sql(db, { table: 'playlists', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await alter_sql(db, { table: 'playlists_deleted', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await create_timestamp_triggers_if_not_exists("playlists");
        await create_timestamp_triggers_if_not_exists("playlists_deleted");
        await create_delete_triggers_if_not_exists("playlists", "playlists_deleted", ExampleObj.playlist_example0);

        await alter_sql(db, { table: 'playlists_tracks', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await alter_sql(db, { table: 'playlists_tracks_deleted', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await create_timestamp_triggers_if_not_exists("playlists_tracks");
        await create_timestamp_triggers_if_not_exists("playlists_tracks_deleted");
        await create_delete_triggers_if_not_exists("playlists_tracks", "playlists_tracks_deleted", ExampleObj.playlists_tracks_example0);

        await alter_sql(db, { table: 'recently_played_tracks', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await alter_sql(db, { table: 'recently_played_tracks_deleted', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await create_timestamp_triggers_if_not_exists("recently_played_tracks");

        await alter_sql(db, { table: 'backpack', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await alter_sql(db, { table: 'backpack_deleted', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
        await create_timestamp_triggers_if_not_exists("backpack");
        await create_timestamp_triggers_if_not_exists("backpack_deleted");
        await create_delete_triggers_if_not_exists("backpack", "backpack_deleted", ExampleObj.track_example0);

        type Timestamped<T> = T & { Timestamp: string; id: number };

        const current_tracks = (await db_get_all_async<Timestamped<SQLTrack>>(sql_select<Track>("tracks", "*")));
        if (current_tracks.some(track => track.Timestamp === null)) {
            for (const track of current_tracks.filter(track => track.Timestamp === null)) {
                await sql_update<Timestamped<Track>>("tracks", track, "illusi_id", track.illusi_id);
            }
            const current_backpack_tracks = (await db_get_all_async<Timestamped<SQLTrack>>(sql_select<Track>("backpack", "*")));
            for (const track of current_backpack_tracks.filter(track => track.Timestamp === null)) {
                await sql_update<Timestamped<Track>>("backpack", track, "illusi_id", track.illusi_id);
            }
            const current_recently_played_tracks = (await db_get_all_async<Timestamped<SQLTrack>>(sql_select<Track>("recently_played_tracks", "*")));
            for (const track of current_recently_played_tracks.filter(track => track.Timestamp === null)) {
                await sql_update<Timestamped<Track>>("recently_played_tracks", track, "illusi_id", track.illusi_id);
            }
            const current_playlists = (await db_get_all_async<Timestamped<SQLPlaylist>>(sql_select<SQLPlaylist>("playlists", "*")));
            for (const playlist of current_playlists.filter(playlist => playlist.Timestamp === null)) {
                await sql_update<Timestamped<Playlist>>("playlists", playlist, "public_uuid", playlist.public_uuid);
            }
            const current_playlists_tracks = (await db_get_all_async<Timestamped<PlaylistsTracks>>(sql_select<PlaylistsTracks>("playlists_tracks", "*")));
            for (const playlist_tracks of current_playlists_tracks.filter(playlist_tracks => playlist_tracks.Timestamp === null)) {
                await sql_update<Timestamped<PlaylistsTracks>>("playlists_tracks", playlist_tracks, "Timestamp", "STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')");
            }
        }
    }

    if (!version_greater_than(version, "15.1.1")) {
        try {
            await alter_sql(db, { table: 'new_releases', action: "ADD", column_name: 'Timestamp', type: "DATETIME" });
            await create_timestamp_triggers_if_not_exists("new_releases");
            if ((await get_all_tables(db)).find(item => item.name === "seen_new_releases")) {
                await db_exec_async(sql_drop_table("seen_new_releases" as any));
                Alert.alert("Updated Illusi to 15.1.1 BETA");
            }
        } catch (error) {

        }
    }

    if (!version_greater_than(version, "15.1.2")) {
        try {
            if ((await get_all_tables(db)).find(item => item.name === "recently_played_tracks_deleted")) {
                await db_exec_async("DROP TRIGGER recently_played_tracks_deleted_Trigger");
                await db_exec_async(sql_drop_table("recently_played_tracks_deleted"));
                Alert.alert("Updated Illusi to 15.1.2 BETA");
            }
        } catch (error) {

        }
    }

    if (!version_greater_than(version, "16.0.1")) {
        try {
            await alter_sql(db, { table: 'playlists', action: "ADD", column_name: 'archived', type: "BOOLEAN" });
            if((await db_get_all_async<SQLPlaylist>(sql_select<Playlist>("playlists", "*"))).some(playlist => playlist.archived === null)){
                await db_run_async(`${sql_update_table("playlists")} SET archived=false`);
                Alert.alert("Updated Illusi to 16.0.1");
            }
        } catch (error) {

        }
    }

    await Prefs.save_pref('latest_version', version);
}