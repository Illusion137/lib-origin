import type { SQLite, SQLiteConnectionOpts } from "@native/sqlite/sqlite.base";
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export const node_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => new Database(opts.name),
    create_database_handle: async(connection: unknown) => drizzle({client: connection as any})
};