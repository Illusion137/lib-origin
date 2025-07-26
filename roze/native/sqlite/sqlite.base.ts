import type { QueryResult } from "@op-engineering/op-sqlite";
import type { RunResult } from "better-sqlite3";
import type { entityKind } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";

declare class GenericSQLiteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> extends BaseSQLiteDatabase<'async'|'sync', QueryResult|RunResult, TSchema> {
    static readonly [entityKind]: string;
}

export interface SQLite {
    create_database_connection: () => {}
    create_database_handle: () => GenericSQLiteDatabase
};