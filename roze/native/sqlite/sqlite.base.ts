import type { QueryResult } from "@op-engineering/op-sqlite";
import type { RunResult } from "better-sqlite3";
import type { entityKind } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export declare class GenericSQLiteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> extends BaseSQLiteDatabase<'async'|'sync', QueryResult|RunResult, TSchema> {
    static readonly [entityKind]: string;
}

export interface SQLiteConnectionOpts {
    name: string;
    location?: string;
}

export type SQLiteConnectionHandle = string;
export type SQLiteDatabaseHandle = string;
export interface SQLiteToSQL {
    toSQL: () => {
        sql: string;
        params: unknown[];
    }
}

export interface SQLiteRunResult {
    changes: number;
}

export interface SQLite {
    create_database_connection: (opts: SQLiteConnectionOpts) => Promise<SQLiteConnectionHandle>;
    create_database_handle: (connection_id: string) => Promise<SQLiteDatabaseHandle>;
    exec: <T>(database_handle: SQLiteDatabaseHandle, fn: (db: GenericSQLiteDatabase) => Promise<T>) => Promise<T>;
};

export const sqlite_connection_map: Record<SQLiteConnectionHandle, unknown> = {};
export const sqlite_database_map: Record<SQLiteDatabaseHandle, GenericSQLiteDatabase> = {};;