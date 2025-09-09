import { reinterpret_cast } from "@common/cast";
import { generate_new_uid } from "@common/utils/util";
import { sqlite_connection_map, sqlite_database_map, type SQLite, type SQLiteConnectionOpts, type SQLiteDatabaseHandle } from "@native/sqlite/sqlite.base";
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

type SQLite3Database = ReturnType<typeof Database>;

export const node_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => {
        const connection = new Database(opts.name);
        const connection_id = generate_new_uid("sqlite-connection-id-");
        sqlite_connection_map.set(connection_id, connection);
        return connection_id;
    },
    create_database_handle: async(connection: unknown) => {
        const database = drizzle({client: connection as any});
        const database_id = generate_new_uid("sqlite-database-id-");
        sqlite_database_map.set(database_id, database);
        return database_id;
    },
    db_get: async<T>(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<SQLite3Database>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepare(sql_query);
        const result = reinterpret_cast<T[]>(query.reader ? query.all(...sql_params) : query.run(...sql_params));
        return result[0];
    },
    db_all: async<T>(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<SQLite3Database>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepare(sql_query);
        return reinterpret_cast<T[]>(query.all(...sql_params));
    },
    db_run: async(connection_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => {
        const connection = reinterpret_cast<SQLite3Database>(sqlite_connection_map.get(connection_handle));
        const query = connection.prepare(sql_query);
        return query.run(...sql_params);
    }
};