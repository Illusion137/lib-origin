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

export function load_database() {
	try {
		db = sqlite().open_database(db_path, get_database_location()[get_native_platform()]);
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
