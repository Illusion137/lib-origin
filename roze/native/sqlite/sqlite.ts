import type { SQLite } from "@native/sqlite/sqlite.base";
import { get_native_platform } from "@native/native_mode";

let sqlite_instance: SQLite;

export async function load_native_sqlite(): Promise<SQLite>{
	if (sqlite_instance) return sqlite_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native SQLite is NOT implemented");
			break;
		case "NODE":
			try {
				sqlite_instance = (await import("./sqlite.node.js")).node_sqlite;
			} catch (e) { console.error(e); }
			break;
		case "REACT_NATIVE":
			try {
				sqlite_instance = (await import("./sqlite.mobile.js")).mobile_sqlite;
			} catch (e) { console.error(e); }
			break;
	}
	return sqlite_instance;
}

export function sqlite(): SQLite {
	if (sqlite_instance) return sqlite_instance;
    console.error(new Error("Native Module [sqlite/SQLite] is NOT loaded"));
	return sqlite_instance;
}