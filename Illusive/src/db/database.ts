import { SQLfs } from '@illusive/sql/sql_fs';
import { sqlite } from '@native/sqlite/sqlite';

export const db_path = "illusi-db-1400.sqlite3";
export const sqlite_location = async() => (await SQLfs.document_directory('SQLite')).replace('file://', '');

let db_connection: Awaited<ReturnType<typeof sqlite.create_database_connection>>;
export let db: Awaited<ReturnType<typeof sqlite.create_database_handle>>;
export async function load_database(path?: string){
    db_connection = await sqlite.create_database_connection({
        name: path ?? db_path
    });
    db = await sqlite.create_database_handle(db_connection);
}