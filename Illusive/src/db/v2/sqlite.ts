import type { DrizzleDB, RawSQLiteConnection, SQLiteRow } from '@native/sqlite/sqlite.base';
import { sqlite } from '@native/sqlite/sqlite';
import { sql, type SQL } from 'drizzle-orm';

interface BetterSqliteClient {
	prepare: (source: string) => { all: (...params: unknown[]) => SQLiteRow[]; run: (...params: unknown[]) => unknown };
	exec: (source: string) => unknown;
}

function is_better_sqlite(client: unknown): client is BetterSqliteClient {
	return typeof (client as BetterSqliteClient).prepare === 'function' && typeof (client as BetterSqliteClient).exec === 'function';
}

export function raw(instance: DrizzleDB): RawSQLiteConnection {
	const client: unknown = instance.$client;
	if (!is_better_sqlite(client)) return sqlite().wrap_client(client);
	return {
		execute_sync: (source, params = []) => client.prepare(source).all(...params),
		execute_async: async (source, params = []) => client.prepare(source).all(...params),
		execute_statement: async (source, params = []) => {
			client.prepare(source).run(...params);
		},
		execute_transaction: async (fn) => {
			await fn();
		}
	};
}

let transaction_tail: Promise<unknown> = Promise.resolve();

export async function transaction<T>(instance: DrizzleDB, fn: (tx: DrizzleDB) => Promise<T>): Promise<T> {
	const run = async () => {
		const client: unknown = instance.$client;
		if (!is_better_sqlite(client)) return instance.transaction(async tx => fn(tx as unknown as DrizzleDB));
		client.exec('BEGIN');
		try {
			const result = await fn(instance);
			client.exec('COMMIT');
			return result;
		} catch (error) {
			client.exec('ROLLBACK');
			throw error;
		}
	};
	const result = transaction_tail.then(run, run);
	transaction_tail = result.catch(() => undefined);
	return result;
}

export function excluded<K extends string>(columns: readonly K[]): Record<K, SQL> {
	return Object.fromEntries(columns.map(column => [column, sql.raw(`excluded.${column}`)])) as Record<K, SQL>;
}

export const ROWS_PER_STATEMENT = 40;
export const IDS_PER_QUERY = 500;
