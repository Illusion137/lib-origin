import { SQLfs } from '@illusive/sql/sql_fs';
import { generror_catch } from '@common/utils/error_util';
import {
	get_native_platform,
	type NativePlatform
} from '@native/native_mode';
import { fs } from '@native/fs/fs';
import type { DrizzleDB, RawSQLiteConnection } from '@native/sqlite/sqlite.base';
import { sqlite } from '@native/sqlite/sqlite';

export const db_path = "illusi-db-1810.sqlite3";
export const sqlite_location = async () => (SQLfs.document_directory('SQLite')).replace('file://', '');

export let db: DrizzleDB;

function get_database_location() {
	const sqlite_location_mobile = SQLfs.document_directory('SQLite')
		.replace('file://', '')
		.replace('file:', '');
	const sqlite_location_desktop = SQLfs.document_directory(".illusi/sumi.sqlite");
	const sqlite_location_map: Record<NativePlatform, string> = {
		NODE: sqlite_location_desktop,
		REACT_NATIVE: sqlite_location_mobile,
		WEB: sqlite_location_desktop
	};
	return sqlite_location_map;
}

export function load_legacy_1720_database(): RawSQLiteConnection {
	const sqlite_name = 'illusi-db-1400.sqlite3';
	return sqlite().open_raw_connection(sqlite_name, get_database_location()[get_native_platform()]);
}

export async function delete_database() {
	const db_delete_path = (get_database_location()[get_native_platform()]) + "/" + db_path;
	await fs().remove(db_delete_path);
	console.warn(db_delete_path, "DATABASE HAS BEEN REMOVED");
}

// WAL + NORMAL drops the per-write fsync cost; the rest size the page cache,
// keep temp b-trees in memory, and mmap reads for large library scans.
const database_pragmas = [
	"PRAGMA journal_mode = WAL;",
	"PRAGMA synchronous = NORMAL;",
	"PRAGMA cache_size = -16000;",
	"PRAGMA temp_store = MEMORY;",
	"PRAGMA mmap_size = 134217728;"
];

export function load_database() {
	try {
		db = sqlite().open_database(db_path, get_database_location()[get_native_platform()]);
		const raw_connection = sqlite().wrap_client(db.$client);
		// better-sqlite3 rejects .all() on set-pragmas that return no rows, so node goes through .run()
		for (const pragma of database_pragmas) {
			if (get_native_platform() === "REACT_NATIVE") raw_connection.execute_sync(pragma);
			else void raw_connection.execute_statement(pragma);
		}
		return {};
	}
	catch (e) {
		console.error(e);
		return generror_catch(e, "Unable to load main database", "CRITICAL", {});
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
