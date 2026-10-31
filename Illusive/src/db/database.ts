import { SQLfs } from '@illusive/sql/sql_fs';
import { generror_catch } from '@common/utils/error_util';
import {
	get_native_platform,
	type NativePlatform
} from '@native/native_mode';
import { fs } from '@native/fs/fs';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { sqlite } from '@native/sqlite/sqlite';

/** The normalized database that mirrors the Illusi API. The 1810 database is migrated into it (see db/migration). */
export const default_db_path = 'illusi-db-v2.sqlite3';
/** The file the open connection uses; the default one belongs to the first account that signed in */
export let db_path = default_db_path;
export const sqlite_location = async () => (SQLfs.document_directory('SQLite')).replace('file://', '');

export let db: DrizzleDB;

/** The file holding another account's library, kept apart from the default one */
export function account_db_path(user_id: string) {
	return `illusi-db-v2-${user_id.replace(/[^A-Za-z0-9_-]/g, '_')}.sqlite3`;
}

export function is_default_database() {
	return db_path === default_db_path;
}

/** Chooses the file the next load_database opens */
export function use_database_file(name: string) {
	db_path = name;
}

/** Closes a connection once nothing uses it any more */
export function close_database_of(instance: DrizzleDB | undefined) {
	const client = instance?.$client as { close?: () => void } | undefined;
	try {
		client?.close?.();
	} catch (e) {
		console.warn('Unable to close database', e);
	}
}

export function database_location() {
	const sqlite_location_mobile = SQLfs.document_directory('SQLite')
		.replace('file://', '')
		.replace('file:', '');
	const sqlite_location_desktop = SQLfs.document_directory('sumi.sqlite');
	const sqlite_location_map: Record<NativePlatform, string> = {
		NODE: sqlite_location_desktop,
		REACT_NATIVE: sqlite_location_mobile,
		WEB: sqlite_location_desktop
	};
	return sqlite_location_map[get_native_platform()];
}

export async function database_file_exists(name: string) {
	const info = await fs().get_info(`${database_location()}/${name}`);
	return info.exists && !info.is_directory;
}

export async function delete_database() {
	const db_delete_path = database_location() + '/' + db_path;
	// WAL sidecars left behind would be replayed into the next database created at this path
	for (const suffix of ['', '-wal', '-shm']) {
		const info = await fs().get_info(db_delete_path + suffix);
		if (info.exists) await fs().remove(db_delete_path + suffix);
	}
	console.warn(db_delete_path, 'DATABASE HAS BEEN REMOVED');
}

// WAL + NORMAL drops the per-write fsync cost; the rest size the page cache,
// keep temp b-trees in memory, and mmap reads for large library scans.
const database_pragmas = [
	'PRAGMA journal_mode = WAL;',
	'PRAGMA synchronous = NORMAL;',
	'PRAGMA cache_size = -16000;',
	'PRAGMA temp_store = MEMORY;',
	'PRAGMA mmap_size = 134217728;'
];

export function apply_pragmas(instance: DrizzleDB) {
	const raw_connection = sqlite().wrap_client(instance.$client);
	// better-sqlite3 rejects .all() on set-pragmas that return no rows, so node goes through .run()
	for (const pragma of database_pragmas) {
		if (get_native_platform() === 'REACT_NATIVE') raw_connection.execute_sync(pragma);
		else void raw_connection.execute_statement(pragma);
	}
}

export function load_database() {
	try {
		db = sqlite().open_database(db_path, database_location());
		apply_pragmas(db);
		return {};
	} catch (e) {
		console.error(e);
		return generror_catch(e, 'Unable to load main database', 'CRITICAL', {});
	}
}

export function is_database_connected() {
	return db !== undefined;
}

// Test-only: inject a preconstructed connection (e.g. in-memory better-sqlite3)
// so sql modules can run under vitest without the native bootstrap.
export function use_database(instance: DrizzleDB) {
	db = instance;
}
