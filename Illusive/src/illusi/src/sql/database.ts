import * as SQLite from 'expo-sqlite';

export const db_pre_1307_path = "illusi-db.sqlite3";
export const db_pre_1307 = SQLite.openDatabaseSync(db_pre_1307_path); // Pre 14.0.0

export const db_path = "illusi-db-1400.sqlite3";
export let db = SQLite.openDatabaseSync(db_path);

export function reasign_db(new_db: SQLite.SQLiteDatabase) { db = new_db; }