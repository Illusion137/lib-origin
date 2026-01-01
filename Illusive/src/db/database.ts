import { SQLfs } from '@illusive/sql/sql_fs';
import { ANDROID_DATABASE_PATH,
IOS_LIBRARY_PATH,
open, type DB } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { Platform } from 'react-native';
import { generror_catch } from '@common/utils/error_util';
import { get_native_platform,
type NativePlatform } from '@native/native_mode';
import { fs } from '@native/fs/fs';

export const db_path = "illusi-db-1800.sqlite3";
export const sqlite_location = async() => (SQLfs.document_directory('SQLite')).replace('file://', '');

export let db: ReturnType<typeof drizzle>;

// TODO for the love of fuck add transactions :3

export function load_legacy_1720_database(): DB{
    const sqlite_name = 'illusi-db-1400.sqlite3';
    const sqlite_location_mobile = SQLfs.document_directory('SQLite')
        .replace('file://', '')
        .replace('file:', '');
    const sqlite_location_desktop = SQLfs.document_directory(".illusi/sumi.sqlite");
    const sqlite_location_map: Record<NativePlatform, string> = {
        NODE: sqlite_location_desktop,
        REACT_NATIVE: sqlite_location_mobile,
        WEB: sqlite_location_desktop
    };
    const database_client = open({
        name: sqlite_name,
        location: sqlite_location_map[get_native_platform()]
    });
    return database_client;
}

export async function delete_database(){
    const db_delete_path = (Platform.OS === 'ios' ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH) + "/" + db_path;
    await fs().remove(db_delete_path);
    console.warn(db_delete_path, "DATABASE HAS BEEN REMOVED");
}

export function load_database(path?: string){
    try {
        const database_client = open({
            name: path ?? db_path,
            location: Platform.OS === 'ios' ? IOS_LIBRARY_PATH : ANDROID_DATABASE_PATH
        });
        db = drizzle(database_client);
        return {};
    }
    catch(e){
        console.error(e);
        return generror_catch(e, "Unable to load main database", {path});
    }
}

export function is_database_connected(){
    return db !== undefined;
}