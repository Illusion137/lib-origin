import { reinterpret_cast } from "@common/cast";
import { gen_uuid } from "@common/utils/util";
import { sqlite_connection_map, sqlite_database_map, type SQLite, type SQLiteConnectionOpts, type SQLiteDatabaseHandle } from "@native/sqlite/sqlite.base";

import { open, type DB } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

export const mobile_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => {
        const connection = open(opts);
        const connection_id = gen_uuid();
        sqlite_connection_map.set(connection_id, connection);
        return connection_id;
    },
    create_database_handle: async(connection: unknown) => {
        const database = drizzle(connection);
        const database_id = gen_uuid();
        sqlite_database_map.set(database_id, database);
        return database_id;
    },
    db_get: async<T>(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<DB>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepareStatement(sql_query);
        await query.bind(sql_params);
        const result = reinterpret_cast<T[]>((await query.execute()).rows);
        return result[0];
    },
    db_all: async<T>(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<DB>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepareStatement(sql_query);
        await query.bind(sql_params);
        return reinterpret_cast<T[]>((await query.execute()).rows);
    },
    db_run: async(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<DB>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepareStatement(sql_query);
        await query.bind(sql_params);
        const result = await query.execute();
        return { changes: result.rowsAffected };
    }
};