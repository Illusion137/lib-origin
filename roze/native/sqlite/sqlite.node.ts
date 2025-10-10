import { generate_new_uid } from "@common/utils/util";
import { sqlite_connection_map, sqlite_database_map, type GenericSQLiteDatabase, type SQLite, type SQLiteConnectionOpts, type SQLiteDatabaseHandle } from "@native/sqlite/sqlite.base";
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const node_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => {
        const connection = new Database(opts.name);
        const connection_id = generate_new_uid("sqlite-connection-id-");
        sqlite_connection_map[connection_id] = connection;
        return connection_id;
    },
    create_database_handle: async(connection_id: string) => {
        const connection = sqlite_connection_map[connection_id];
        const database = drizzle({client: connection as any});
        const database_id = generate_new_uid("sqlite-database-id-");
        sqlite_database_map[database_id] = database;
        return database_id;
    },
    exec: async<T>(database_handle: SQLiteDatabaseHandle, fn: (db: GenericSQLiteDatabase) => Promise<T>) => {
        const database = sqlite_database_map[database_handle];
        return await fn(database);
    }
};