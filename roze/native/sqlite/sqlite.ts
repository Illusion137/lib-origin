import type { SQLite } from "@native/sqlite/sqlite.base";
import { get_native_platform } from "@native/native_mode";

export let sqlite: SQLite;
switch (get_native_platform()) {
	case "WEB":
		console.error("Web Native SQLite is NOT implemented");
		break;
	case "ELECTRON_RENDERER":
		console.error("Electron Renderer Native SQLite is NOT implemented");
		break;
	case "NODE":
		try {
			sqlite = require("./sqlite.node").node_sqlite;
		} catch (e) {}
		break;
	case "REACT_NATIVE":
		try {
			sqlite = require("./sqlite.mobile").mobile_sqlite;
		} catch (e) {}
		break;
}
