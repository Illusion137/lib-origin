import { error_undefined } from "@common/utils/util";
import { GLOBALS } from "@illusive/globals";
import type { Promises } from "@illusive/types";
import { SQLfs } from "./sql_fs";

export namespace SQLUtils {
    export async function clean_directories_itemized(){
        const thumbnail_files = error_undefined(await SQLfs.read_directory(SQLfs.thumbnail_directory(""))) ?? [];
        const media_files     = error_undefined(await SQLfs.read_directory(SQLfs.media_directory(""))) ?? [];
        const lyrics_files    = error_undefined(await SQLfs.read_directory(SQLfs.lyrics_directory(""))) ?? [];
    
        const thumbnail_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({thumbnail_uri}) => thumbnail_uri).filter(item => item !== undefined));
        const media_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({media_uri}) => media_uri).filter(item => item !== undefined));
        const lyrics_uri_set = new Set(GLOBALS.global_var.sql_tracks.map(({lyrics_uri}) => lyrics_uri).filter(item => item !== undefined));
    
        const files_to_delete = {
            thumbnails: thumbnail_files.filter(file => !thumbnail_uri_set.has(file)).map(file => SQLfs.thumbnail_directory(file)),
            media: media_files.filter(file => !media_uri_set.has(file)).map(file => SQLfs.media_directory(file)),
            lyrics: lyrics_files.filter(file => !lyrics_uri_set.has(file)).map(file => SQLfs.lyrics_directory(file)),
        };
    
        return files_to_delete;
    }
    
    export async function clean_directories() {
        const deletion_promises: Promises = [];
        const files_to_delete = await clean_directories_itemized();
    
        files_to_delete.thumbnails.forEach(file => deletion_promises.push(SQLfs.delete_item(file)));
        files_to_delete.media.forEach(file => deletion_promises.push(SQLfs.delete_item(file)));
        files_to_delete.lyrics.forEach(file => deletion_promises.push(SQLfs.delete_item(file)));
    
        await Promise.all(deletion_promises);
        return deletion_promises.length;
    }
}