import { SQLfs } from '@illusive/sql/sql_fs';
import { open, type DB } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { generror_catch } from '@common/utils/error_util';
import {
    get_native_platform,
    type NativePlatform
} from '@native/native_mode';
import { fs } from '@native/fs/fs';

export const db_path = "illusi-db-1810.sqlite3";
export const sqlite_location = async () => (SQLfs.document_directory('SQLite')).replace('file://', '');

export let db: ReturnType<typeof drizzle>;

// TODO for the love of fuck add transactions :3

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

export function load_legacy_1720_database(): DB {
    const sqlite_name = 'illusi-db-1400.sqlite3';
    const database_client = open({
        name: sqlite_name,
        location: get_database_location()[get_native_platform()]
    });
    return database_client;
}

export async function delete_database() {
    const db_delete_path = (get_database_location()[get_native_platform()]) + "/" + db_path;
    await fs().remove(db_delete_path);
    console.warn(db_delete_path, "DATABASE HAS BEEN REMOVED");
}

export function load_database() {
    try {
        const database_client = open({
            name: db_path,
            location: get_database_location()[get_native_platform()]
        });
        db = drizzle(database_client);
        return {};
    }
    catch (e) {
        console.error(e);
        return generror_catch(e, "Unable to load main database", {});
    }
}

export function is_database_connected() {
    return db !== undefined;
}