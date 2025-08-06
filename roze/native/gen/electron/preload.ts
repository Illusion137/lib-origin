import { ipcRenderer } from "electron";
import type { fs } from "@native/fs/fs";

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
};