import { db, db_path, load_database } from "@illusive/db/database";
import { upload_sqlite_db } from "@illusive/document_picker";
import { alert_error } from "@illusive/illusi/src/alert";
import { SQLfs } from "./sql_fs";
import { GLOBALS } from "@illusive/globals";

export namespace SQLDev {
    export async function load_sql_file(new_db_path: string) {
        await db.$client.close();
        await SQLfs.copy_to_sqlite_directory(new_db_path, db_path);
        load_database();
        GLOBALS.global_var.bottom_alert("Successfully swapped SQLite files", "GOOD");
    }
    export async function fetch_and_load_new_sqlite_file() {
        const new_db_path = await upload_sqlite_db();
        if ("error" in new_db_path) {
            alert_error(new_db_path);
            return;
        }
        if (!new_db_path.uri) {
            alert_error("uri is empty");
            return;
        }
        await load_sql_file(new_db_path.uri);
    }
}