import { ipcRenderer } from "electron";
import type { fs } from "@native/fs/fs";
import type { ffmpeg } from "@native/ffmpeg/ffmpeg";
import type { miscnative } from "@native/miscnative/miscnative";
import type { sqlite } from "@native/sqlite/sqlite";
import type { mmkv } from "@native/mmkv/mmkv";
import type { asset_loader } from "@native/asset_loader/asset_loader";

export const preload_electron = {
    temp_directory: async (...args: Parameters<ReturnType<(typeof fs)>["temp_directory"]>) => await ipcRenderer.invoke("temp_directory", ...args),
    document_directory: async (...args: Parameters<ReturnType<(typeof fs)>["document_directory"]>) => await ipcRenderer.invoke("document_directory", ...args),
    read_as_string: async (...args: Parameters<ReturnType<(typeof fs)>["read_as_string"]>) => await ipcRenderer.invoke("read_as_string", ...args),
    read_directory: async (...args: Parameters<ReturnType<(typeof fs)>["read_directory"]>) => await ipcRenderer.invoke("read_directory", ...args),
    get_info: async (...args: Parameters<ReturnType<(typeof fs)>["get_info"]>) => await ipcRenderer.invoke("get_info", ...args),
    write_file_as_string: async (...args: Parameters<ReturnType<(typeof fs)>["write_file_as_string"]>) => await ipcRenderer.invoke("write_file_as_string", ...args),
    move: async (...args: Parameters<ReturnType<(typeof fs)>["move"]>) => await ipcRenderer.invoke("move", ...args),
    copy: async (...args: Parameters<ReturnType<(typeof fs)>["copy"]>) => await ipcRenderer.invoke("copy", ...args),
    make_directory: async (...args: Parameters<ReturnType<(typeof fs)>["make_directory"]>) => await ipcRenderer.invoke("make_directory", ...args),
    remove: async (...args: Parameters<ReturnType<(typeof fs)>["remove"]>) => await ipcRenderer.invoke("remove", ...args),
    download_to_file: async (...args: Parameters<ReturnType<(typeof fs)>["download_to_file"]>) => await ipcRenderer.invoke("download_to_file", ...args),
    execute_args: async (...args: Parameters<ReturnType<(typeof ffmpeg)>["execute_args"]>) => await ipcRenderer.invoke("execute_args", ...args),
    keep_mobile_awake: async (...args: Parameters<ReturnType<(typeof miscnative)>["keep_mobile_awake"]>) => await ipcRenderer.invoke("keep_mobile_awake", ...args),
    create_database_connection: async (...args: Parameters<ReturnType<(typeof sqlite)>["create_database_connection"]>) => await ipcRenderer.invoke("create_database_connection", ...args),
    create_database_handle: async (...args: Parameters<ReturnType<(typeof sqlite)>["create_database_handle"]>) => await ipcRenderer.invoke("create_database_handle", ...args),
    db_execute: async (...args: Parameters<ReturnType<(typeof sqlite)>["db_execute"]>) => await ipcRenderer.invoke("db_execute", ...args),
    load_mmkv: async (...args: Parameters<ReturnType<(typeof mmkv)>["load_mmkv"]>) => await ipcRenderer.invoke("load_mmkv", ...args),
    set_string: async (...args: Parameters<ReturnType<(typeof mmkv)>["set_string"]>) => await ipcRenderer.invoke("set_string", ...args),
    get_string: async (...args: Parameters<ReturnType<(typeof mmkv)>["get_string"]>) => await ipcRenderer.invoke("get_string", ...args),
    set_boolean: async (...args: Parameters<ReturnType<(typeof mmkv)>["set_boolean"]>) => await ipcRenderer.invoke("set_boolean", ...args),
    get_boolean: async (...args: Parameters<ReturnType<(typeof mmkv)>["get_boolean"]>) => await ipcRenderer.invoke("get_boolean", ...args),
    set_number: async (...args: Parameters<ReturnType<(typeof mmkv)>["set_number"]>) => await ipcRenderer.invoke("set_number", ...args),
    get_number: async (...args: Parameters<ReturnType<(typeof mmkv)>["get_number"]>) => await ipcRenderer.invoke("get_number", ...args),
    contains_key: async (...args: Parameters<ReturnType<(typeof mmkv)>["contains_key"]>) => await ipcRenderer.invoke("contains_key", ...args),
    get_keys: async (...args: Parameters<ReturnType<(typeof mmkv)>["get_keys"]>) => await ipcRenderer.invoke("get_keys", ...args),
    remove_key: async (...args: Parameters<ReturnType<(typeof mmkv)>["remove_key"]>) => await ipcRenderer.invoke("remove_key", ...args),
    clear_memory_cache: async (...args: Parameters<ReturnType<(typeof mmkv)>["clear_memory_cache"]>) => await ipcRenderer.invoke("clear_memory_cache", ...args),
    clear_all: async (...args: Parameters<ReturnType<(typeof mmkv)>["clear_all"]>) => await ipcRenderer.invoke("clear_all", ...args),
    get_asset: async (...args: Parameters<ReturnType<(typeof asset_loader)>["get_asset"]>) => await ipcRenderer.invoke("get_asset", ...args),
};