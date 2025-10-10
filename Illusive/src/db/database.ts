import { SQLfs } from '@illusive/sql/sql_fs';
import { sqlite } from '@native/sqlite/sqlite';
import type { GenericSQLiteDatabase } from '@native/sqlite/sqlite.base';

export const db_path = "illusi-db-1400.sqlite3";
export const sqlite_location = async() => (SQLfs.document_directory('SQLite')).replace('file://', '');

let db_connection_handle: Awaited<ReturnType<ReturnType<typeof sqlite>['create_database_connection']>>;
let db_database_handle: Awaited<ReturnType<ReturnType<typeof sqlite>['create_database_handle']>>;
export let db_exec: <V>(fn: (db: GenericSQLiteDatabase) => Promise<V>) => Promise<V>;

export async function load_database(path?: string, location?: string){
    db_connection_handle = await sqlite().create_database_connection({
        name: path ?? db_path,
        location: location
    });
    db_database_handle = await sqlite().create_database_handle(db_connection_handle);
    db_database_handle;
    db_exec = async<V>(runnable: (db: GenericSQLiteDatabase) => Promise<V>): Promise<V> => {
        return await sqlite().exec<V>(db_database_handle, runnable);
    }
}