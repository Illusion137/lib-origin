import { SQLfs } from '@illusive/sql/sql_fs';
import { sqlite } from '@native/sqlite/sqlite';
import type { GenericSQLiteDatabase, SQLiteRunResult, SQLiteToSQL } from '@native/sqlite/sqlite.base';
import { drizzle } from 'drizzle-orm/libsql/web';
import * as schema from "./schema"
import { reinterpret_cast } from '@common/cast';

export const db_path = "illusi-db-1400.sqlite3";
export const sqlite_location = async() => (SQLfs.document_directory('SQLite')).replace('file://', '');

let db_connection_handle: Awaited<ReturnType<ReturnType<typeof sqlite>['create_database_connection']>>;
let db_database_handle: Awaited<ReturnType<ReturnType<typeof sqlite>['create_database_handle']>>;
export let db_get: <V>(runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL) => Promise<V|undefined>;
export let db_all: <V>(runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL) => Promise<V[]>;
export let db_run: (runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL) => Promise<SQLiteRunResult>;

const mocking_bird = reinterpret_cast<GenericSQLiteDatabase>(drizzle.mock({ schema }));

export async function load_database(path?: string){
    db_connection_handle = await sqlite().create_database_connection({
        name: path ?? db_path
    });
    db_database_handle = await sqlite().create_database_handle(db_connection_handle);
    db_get = async<V>(runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL): Promise<V|undefined> => {
        const sql = runnable(mocking_bird).toSQL();
        return await sqlite().db_get<V>(db_connection_handle, sql.sql, sql.params);
    }
    db_all = async<V>(runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL): Promise<V[]> => {
        const sql = runnable(mocking_bird).toSQL();
        return await sqlite().db_all<V>(db_connection_handle, sql.sql, sql.params);
    }
    db_run = async(runnable: (db: GenericSQLiteDatabase) => SQLiteToSQL): Promise<SQLiteRunResult> => {
        const sql = runnable(mocking_bird).toSQL();
        return await sqlite().db_run(db_connection_handle, sql.sql, sql.params);
    }
}