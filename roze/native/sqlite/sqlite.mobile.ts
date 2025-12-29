import { gen_uuid } from "@common/utils/util";
import { sqlite_connection_map, sqlite_database_map, type GenericSQLiteDatabase, type SQLite, type SQLiteConnectionHandle, type SQLiteConnectionOpts, type SQLiteDatabaseHandle } from "@native/sqlite/sqlite.base";
import { drizzle } from 'drizzle-orm/op-sqlite';
import { openSync, type DB } from '@op-engineering/op-sqlite';

declare module '@op-engineering/op-sqlite' {
  export function openSync(
    params?: {
        url: string;
        authToken: string;
        name: string;
        location?: string;
        libsqlSyncInterval?: number;
        libsqlOffline?: boolean;
        encryptionKey?: string;
        remoteEncryptionKey?: string;
    }
  ): DB;
}

export const mobile_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => {
        const connection = open(opts);
        const connection_id = gen_uuid();
        sqlite_connection_map[connection_id] = connection;
        return connection_id;
    },
    create_database_handle: async(connection_id: SQLiteConnectionHandle) => {
        const connection = sqlite_connection_map[connection_id];
        const database = drizzle(connection);
        const database_id = gen_uuid();
        sqlite_database_map[database_id] = database;
        return database_id;
    },
    exec: async<T>(database_handle: SQLiteDatabaseHandle, fn: (db: GenericSQLiteDatabase) => Promise<T>) => {
        const database = sqlite_database_map[database_handle];
        return await fn(database);
    },
    get_db: (database_handle: SQLiteDatabaseHandle) => {
        const database = sqlite_database_map[database_handle];
        return database;
    }
};