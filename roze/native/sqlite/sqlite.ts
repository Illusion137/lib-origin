import type { SQLite } from "@native/sqlite/sqlite.base";
import { get_native_platform } from "@native/native_mode";

let sqlite_instance: SQLite;

export async function load_native_sqlite(): Promise<SQLite>{
	if (sqlite_instance) return sqlite_instance;
	switch (get_native_platform()) {
		case "WEB":
			console.error("Web Native SQLite is NOT implemented");
			break;
		case "ELECTRON_RENDERER":
			try {
				sqlite_instance = (await import("../gen/electron/modules/sqlite.electron_renderer")).electron_renderer_sqlite;
			} catch (e) {}
			break;
		case "NODE":
			try {
				sqlite_instance = (await import("./sqlite.node")).node_sqlite;
			} catch (e) {}
			break;
		case "REACT_NATIVE":
			try {
				sqlite_instance = (await import("./sqlite.mobile")).mobile_sqlite;
			} catch (e) {}
			break;
	}
	return sqlite_instance;
}

export function sqlite(): SQLite {
	if (sqlite_instance) return sqlite_instance;
    console.error(new Error("Native Module [sqlite/SQLite] is NOT loaded"));
	return sqlite_instance;
}