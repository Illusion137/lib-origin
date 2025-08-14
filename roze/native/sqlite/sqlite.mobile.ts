import type { SQLite, SQLiteConnectionOpts } from "@native/sqlite/sqlite.base";

import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

export const mobile_sqlite: SQLite = {
    create_database_connection: async(opts: SQLiteConnectionOpts) => open(opts),
    create_database_handle: async(connection: unknown) => drizzle(connection)
};