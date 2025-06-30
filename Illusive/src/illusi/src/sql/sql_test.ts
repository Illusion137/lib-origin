import * as SQLite from '@op-engineering/op-sqlite';
import path from 'path';
import { Alert } from 'react-native';
import { SQLTrack, Track } from '../../../types';
import { get_legacy_1307_playlist_tracks, get_legacy_1307_playlists, get_legacy_1307_track_data, legacy_1307_track_to_track } from './sql_legacy_1307';
import { create_playlist, insert_all_tracks_playlist } from './sql_playlists';
import { insert_all_tracks } from './sql_tracks';
import { get_all_tables } from './sql_update';
import { db_get_all_async, destroy_all_tables, move_unsorted_media_to_folders, recreate_all_tables, sql_select } from './sql_utils';
import { sqlite_location } from './database';

export async function test_import_1307_sqldb(__path: string) {
    const name = path.basename(__path).replace(".sqlite3", "101.sqlite3");
    const old_db = SQLite.open({name: name, location: sqlite_location});
    await destroy_all_tables();
    await recreate_all_tables();

    const legacy_1307_tracks = await get_legacy_1307_track_data(old_db);
    const legacy_1307_playlists = await get_legacy_1307_playlists(old_db);
    const all_legacy_1307_table_names = (await get_all_tables(old_db)).map(table => table.name);
    const current_tracks = (await db_get_all_async<SQLTrack>(sql_select<Track>("tracks", "*")));
    if(all_legacy_1307_table_names.includes("tracks") && current_tracks.length === 0) {
        Alert.alert("Updating to 14.0.0 BETA");
        await move_unsorted_media_to_folders();
        await insert_all_tracks(
            await Promise.all(
                legacy_1307_tracks.map(async(track) => await legacy_1307_track_to_track(track))
            )
        );
        for(const legacy_1307 of legacy_1307_playlists) {
            const legacy_1307_tracks = await get_legacy_1307_playlist_tracks(old_db, legacy_1307.playlist_name);
            const playlist_uuid = await create_playlist(legacy_1307.playlist_name);
            await insert_all_tracks_playlist(playlist_uuid, legacy_1307_tracks.map(track => track.uid));
        }
    }
    old_db.close();
}