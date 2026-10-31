import * as V2 from '@illusive/db/database';
import * as Legacy from '@illusive/legacy/1810/database';
import { DatabaseBoot } from '@illusive/db/boot';
import { SyncEngine } from '@illusive/db/sync/sync_engine';
import { upload_sqlite_db } from '@illusive/document_picker';
import { alert_error } from '@illusive/illusi/src/alert';
import { SQLfs } from './sql_fs';
import { GLOBALS } from '@illusive/globals';

export namespace SQLDev {
	/** Loads an 1810 database file and starts over from it: v2 is rebuilt by the migration on the next launch */
	export async function load_sql_file(new_db_path: string) {
		SyncEngine.stop();
		await DatabaseBoot.stop_migration();
		if (Legacy.is_database_connected()) await Legacy.db.$client.close();
		if (V2.is_database_connected()) await V2.db.$client.close();
		await V2.delete_database();
		await Legacy.delete_database();
		await SQLfs.copy_to_sqlite_directory(new_db_path, Legacy.db_path);
		GLOBALS.global_var.bottom_alert('Loaded SQLite file; restart Illusi to migrate it', 'GOOD');
	}
	export async function fetch_and_load_new_sqlite_file() {
		const new_db_path = await upload_sqlite_db();
		if ('error' in new_db_path) {
			alert_error(new_db_path);
			return;
		}
		if (!new_db_path.uri) {
			alert_error('uri is empty');
			return;
		}
		await load_sql_file(new_db_path.uri);
	}
}
