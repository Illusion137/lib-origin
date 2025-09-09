import type { QueryResult } from "@op-engineering/op-sqlite";
import type { RunResult } from "better-sqlite3";
import type { entityKind } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

export declare class GenericSQLiteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> extends BaseSQLiteDatabase<'async'|'sync', QueryResult|RunResult, TSchema> {
    static readonly [entityKind]: string;
}

export interface SQLiteConnectionOpts {
    name: string;
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
    create_database_connection: (opts: SQLiteConnectionOpts) => Promise<SQLiteConnectionHandle>
    create_database_handle: (connection: unknown) => Promise<SQLiteDatabaseHandle>
    db_get: <T>(database_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => Promise<T|undefined>
    db_all: <T>(database_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => Promise<T[]>
    db_run: (database_handle: SQLiteDatabaseHandle, sql_query: string, sql_params: unknown[]) => Promise<SQLiteRunResult>
};

export const sqlite_connection_map = new Map<SQLiteConnectionHandle, unknown>();
export const sqlite_database_map = new Map<SQLiteDatabaseHandle, GenericSQLiteDatabase>();