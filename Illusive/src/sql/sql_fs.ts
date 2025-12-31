import { is_empty } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { fs } from '@native/fs/fs';
import path_lib from 'path-browserify';

export namespace SQLfs {


    let cached_temp_directory: (...paths: string[]) => string = () => "";
    let cached_document_directory: (...paths: string[]) => string = () => "";

    export async function cache_load_directories(){
        const hold_temp_directory = await fs().temp_directory();
        const hold_document_directory = await fs().document_directory();
        cached_temp_directory = (...paths: string[]) => {
            return path_lib.join(hold_temp_directory, ...paths);
        };
        cached_document_directory = (...paths: string[]) => {
            return path_lib.join(hold_document_directory, ...paths);
        };
    }

    function forward_item(item: string) {
        return !is_empty(item) ? item : "";
    }

    export function cache_directory(...paths: string[]) { return cached_temp_directory(...paths); }
    export function document_directory(...paths: string[]) { return cached_document_directory(...paths); }
    export function sqlite_directory(item: string) { return document_directory(Constants.sqlite_directory) + forward_item(item); }
    export function custom_thumbnail_directory(item: string) { return document_directory(Constants.custom_thumbnail_archive_path) + forward_item(item); }
    export function thumbnail_directory(item: string) { return  document_directory(Constants.thumbnail_archive_path) + forward_item(item); }
    export function media_directory(item: string) { return document_directory(Constants.media_archive_path) + forward_item(item); }
    export function lyrics_directory(item: string) { return document_directory(Constants.lyrics_archive_path) + forward_item(item); }
    
    async function copy_to(item: string, dir_func: (item: string) => string, new_name?: string) {
        const base_name = path_lib.basename(new_name ?? item);
        await fs().copy(item, dir_func(base_name), {});
        return dir_func(base_name);
    }
    
    async function move_to(item: string, dir_func: (item: string) => string, new_name?: string) {
        const base_name = path_lib.basename(new_name ?? item);
        await fs().move(item, dir_func(base_name), {});
        return dir_func(base_name);
    }
    
    export async function copy_to_custom_thumbnail_directory(item: string, new_name?: string) { return await copy_to(item, custom_thumbnail_directory, new_name); }
    export async function move_to_custom_thumbnail_directory(item: string, new_name?: string) { return await move_to(item, custom_thumbnail_directory, new_name); }
    export async function move_to_thumbnail_directory(item: string, new_name?: string) { return await move_to(item, thumbnail_directory, new_name); }
    export async function move_to_media_directory(item: string, new_name?: string) { return await move_to(item, media_directory, new_name); }
    export async function move_to_lyrics_directory(item: string, new_name?: string) { return await move_to(item, lyrics_directory, new_name); }
    export async function move_to_sqlite_directory(item: string, new_name?: string) { return await move_to(item, sqlite_directory, new_name); }
    
    export async function delete_folder_of_file(file_path: string, safe = true) {
        if(safe) {
            for(const dir of Constants.default_directories) 
                if(file_path.includes(dir)) return false;
        }
        await fs().remove(path_lib.dirname(file_path));
        return true;
    }
    
    export async function mkdir(path: string) { await fs().make_directory(path); }
    export async function info(path: string) { return await fs().get_info(path); }
    export async function delete_item(path: string) {
        if([media_directory(""), thumbnail_directory(""), lyrics_directory("")].includes(path)){
            return;
        }
        await fs().remove(path); 
    }
    export async function read_directory(path: string) { try { return await fs().read_directory(path); } catch(_) { return []; } }
    export async function download_to_file(uri: string, file_uri: string) { return fs().download_to_file(uri, file_uri); }
    
    export async function create_file(path: string, data: string){
        await fs().write_file_as_string(path, data, {encoding: 'utf8'});
        return path;
    }
    export async function read_file(path: string){
        return await fs().read_as_string(path, {encoding: 'utf8'});
    }
    export async function file_created_at(path: string){
        const file_info = await fs().get_info(path);
        if(file_info.exists) return new Date(file_info.file_modified_ms);
        return new Date(0);
    }
};
