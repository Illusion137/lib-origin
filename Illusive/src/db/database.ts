import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { document_directory } from '@illusive/illusi/src/sql/sql_fs';

export const db_path = "illusi-db-1400.sqlite3";
export const sqlite_location = async() => (await document_directory('SQLite')).replace('file://', '');

export let db_connection: ReturnType<typeof open>;
export let db: ReturnType<typeof drizzle>;
export async function load_database(){
    db_connection = open({
        name: db_path
    });
    db = drizzle(db_connection);
}