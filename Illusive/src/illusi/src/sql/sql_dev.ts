import * as SQLite from '@op-engineering/op-sqlite';
import * as SQLfs from './sql_fs';
import { create_playlist, unique_playlist_uuids_from_playlist_tracks } from "./sql_playlists";
import type { ResponseError } from '../../../../../origin/src/utils/types';
import { alert_error } from '../alert';
import { db, db_path, reasign_db, sqlite_location } from './database';

export async function load_sql_file(__path: string|ResponseError){
    if(typeof __path === "object") { alert_error(__path); return; }
    db.close();
    await SQLfs.move_to_sqlite_directory(__path, db_path);
    reasign_db(SQLite.open({ name: db_path, location: sqlite_location }));
}
export async function playlists_from_playlists_tracks(){
    const unique_uuids = await unique_playlist_uuids_from_playlist_tracks();
    let i = 97; // CHAR CODE A
    for(const uuid of unique_uuids)
        await create_playlist(String.fromCharCode(i++), uuid);
}