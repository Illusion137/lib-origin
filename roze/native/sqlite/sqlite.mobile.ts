/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { SQLiteModule, RawSQLiteConnection } from '@native/sqlite/sqlite.base';
import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

function wrap_op_sqlite_client(client: any): RawSQLiteConnection {
	return {
		execute_sync: (sql, params = []) =>
			(client.executeSync(sql, params) as { rows: any[] }).rows,
		execute_async: async (sql, params = []) =>
			(await client.executeWithHostObjects(sql, params) as { rows: any[] }).rows,
		execute_statement: async (sql, params) => {
			if (params !== undefined) await client.execute(sql, params);
			else await client.execute(sql);
		},
		execute_transaction: (fn) => client.transaction(fn),
	};
}

export const mobile_sqlite: SQLiteModule = {
	open_database: (name, location) => {
		const conn = open({ name, location });
		return drizzle(conn);
	},
	open_raw_connection: (name, location) => {
		const conn = open({ name, location });
		return wrap_op_sqlite_client(conn);
	},
	wrap_client: (client) => wrap_op_sqlite_client(client),
};
