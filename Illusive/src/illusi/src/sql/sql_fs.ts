import * as FileSystem from 'expo-file-system';
import { is_empty } from '../../../../../origin/src/utils/util';
import { Illusive } from '../../../illusive';
import path from 'path';
import { alert_error } from '../alert';

function forward_item(item: string) {
    return !is_empty(item) ? item : "";
}
export function cache_directory(path: string) { return FileSystem.cacheDirectory + path; }
export function document_directory(path: string) { return FileSystem.documentDirectory + path; }
export function sqlite_directory(item: string) { return document_directory(Illusive.sqlite_directory) + forward_item(item); }
export function thumbnail_directory(item: string) { return document_directory(Illusive.thumbnail_archive_path) + forward_item(item); }
export function media_directory(item: string) { return document_directory(Illusive.media_archive_path) + forward_item(item); }
export function lyrics_directory(item: string) { return document_directory(Illusive.lyrics_archive_path) + forward_item(item); }

async function move_to(item: string, dir_func: (item: string) => string, new_name?: string) {
    const base_name = path.basename(new_name ?? item);
    await FileSystem.moveAsync({from: item, to: dir_func(base_name)});
    return dir_func(base_name);
}

export async function move_to_thumbnail_directory(item: string, new_name?: string) { return await move_to(item, thumbnail_directory, new_name); }
export async function move_to_media_directory(item: string, new_name?: string) { return await move_to(item, media_directory, new_name); }
export async function move_to_lyrics_directory(item: string, new_name?: string) { return await move_to(item, lyrics_directory, new_name); }
export async function move_to_sqlite_directory(item: string, new_name?: string) { return await move_to(item, sqlite_directory, new_name); }

export async function delete_folder_of_file(file_path: string, safe = true) {
    if(safe) {
        for(const dir of Illusive.default_directories) 
            if(file_path.includes(dir)) return false;
    }
    await FileSystem.deleteAsync(path.dirname(file_path), {idempotent: true});
    return true;
}

export async function mkdir(path: string) { return await FileSystem.makeDirectoryAsync(path); }
export async function info(path: string) { return await FileSystem.getInfoAsync(path); }
export async function delete_item(path: string) {
    if([media_directory(""), thumbnail_directory(""), lyrics_directory("")].includes(path)){
        alert_error({error: new Error(`Trying to delete important path: ${path}`)});
        return;
    }
    return await FileSystem.deleteAsync(path, {idempotent: true}); 
}
export async function read_directory(path: string) { try { return await FileSystem.readDirectoryAsync(path); } catch(e) { return []; } }
export function create_download_resumeable(uri: string, file_uri: string) { return FileSystem.createDownloadResumable(uri, file_uri); }