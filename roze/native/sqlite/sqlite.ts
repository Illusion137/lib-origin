import type { SQLiteModule } from '@native/sqlite/sqlite.base';
import { get_native_platform } from '@native/native_mode';

let sqlite_instance: SQLiteModule;

export async function load_native_sqlite(): Promise<SQLiteModule> {
	if (sqlite_instance) return sqlite_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native SQLiteModule is NOT implemented");
			break;
		case "NODE":
			try {
				sqlite_instance = (await import("./sqlite.node.ts")).node_sqlite;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				sqlite_instance = (await import("./sqlite.mobile.ts")).mobile_sqlite;
			} catch (e) { console.error(e); }
			break;
	}
	return sqlite_instance;
}

export function sqlite(): SQLiteModule {
	if (sqlite_instance) return sqlite_instance;
	console.error(new Error("Native Module [sqlite/SQLiteModule] is NOT loaded"));
	return sqlite_instance;
}
