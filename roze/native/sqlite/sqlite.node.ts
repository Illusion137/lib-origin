import type { SQLiteModule, RawSQLiteConnection, DrizzleDB } from '@native/sqlite/sqlite.base';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'node:path';

function wrap_better_sqlite3_client(client: InstanceType<typeof Database>): RawSQLiteConnection {
	return {
		execute_sync: (sql, params = []) =>
			client.prepare(sql).all(...params) as any[],
		execute_async: async (sql, params = []) =>
			client.prepare(sql).all(...params) as any[],
		execute_statement: async (sql, params = []) => {
			client.prepare(sql).run(...params);
		},
		// better-sqlite3 transactions are sync; fn must not rely on async DB ops inside
		execute_transaction: async (fn) => {
			await fn();
		},
	};
}

export const node_sqlite: SQLiteModule = {
	open_database: (name, location) => {
		const conn = new Database(join(location, name));
		return drizzle(conn) as unknown as DrizzleDB;
	},
	open_raw_connection: (_name, _location) => {
		throw new Error("open_raw_connection is not supported on Node — no legacy mobile database exists on desktop");
	},
	wrap_client: (client) => wrap_better_sqlite3_client(client),
};
