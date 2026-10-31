import { generror_catch } from '@common/utils/error_util';
import { apply_pragmas, database_file_exists, database_location } from '@illusive/db/database';
import { fs } from '@native/fs/fs';
import type { DrizzleDB, RawSQLiteConnection } from '@native/sqlite/sqlite.base';
import { sqlite } from '@native/sqlite/sqlite';

/** The pre-Illusi-API database. It stays the live database until its migration into db/database finishes. */
export const db_path = 'illusi-db-1810.sqlite3';

export let db: DrizzleDB;

export async function legacy_database_exists() {
	return database_file_exists(db_path);
}

export function load_legacy_1720_database(): RawSQLiteConnection {
	const sqlite_name = 'illusi-db-1400.sqlite3';
	return sqlite().open_raw_connection(sqlite_name, database_location());
}

export function load_database() {
	try {
		db = sqlite().open_database(db_path, database_location());
		apply_pragmas(db);
		return {};
	} catch (e) {
		console.error(e);
		return generror_catch(e, 'Unable to load legacy database', 'CRITICAL', {});
	}
}

export function is_database_connected() {
	return db !== undefined;
}

export async function delete_database() {
	const path = database_location() + '/' + db_path;
	for (const suffix of ['', '-wal', '-shm']) {
		const info = await fs().get_info(path + suffix);
		if (info.exists) await fs().remove(path + suffix);
	}
}

// Test-only, like use_database in db/database.
export function use_database(instance: DrizzleDB) {
	db = instance;
}
