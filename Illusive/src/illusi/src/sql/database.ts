import * as SQLite from '@op-engineering/op-sqlite';
import { document_directory } from '@illusive/illusi/src/sql/sql_fs';

export const sqlite_location = document_directory('SQLite').replace('file://', '');
export const db_pre_1307_path = "illusi-db.sqlite3";
export let db_pre_1307: SQLite.DB|undefined = undefined; 
export function try_load_db_pre_1307(){
    if(db_pre_1307 === undefined)
        db_pre_1307 = SQLite.open({ name: db_pre_1307_path, location: sqlite_location }); // Pre 14.0.0
}

export const db_path = "illusi-db-1400.sqlite3";
export let db = SQLite.open({ name: db_path, location: sqlite_location });;

export function reasign_db(new_db: SQLite.DB) { db = new_db; }