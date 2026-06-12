import type { drizzle as op_sqlite_drizzle } from 'drizzle-orm/op-sqlite';

export type DrizzleDB = ReturnType<typeof op_sqlite_drizzle>;

export type SQLiteRow = Record<string, any>;

export interface RawSQLiteConnection {
	execute_sync: (sql: string, params?: any[]) => SQLiteRow[];
	execute_async: (sql: string, params?: any[]) => Promise<SQLiteRow[]>;
	execute_statement: (sql: string, params?: any[]) => Promise<void>;
	execute_transaction: (fn: () => Promise<void>) => Promise<void>;
}

export interface SQLiteModule {
	open_database: (name: string, location: string) => DrizzleDB;
	open_raw_connection: (name: string, location: string) => RawSQLiteConnection;
	wrap_client: (client: any) => RawSQLiteConnection;
}
