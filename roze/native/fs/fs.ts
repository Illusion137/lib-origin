import type { EncodingOpts, FileSystem } from "./fs.base";
import { get_native_platform } from "../native_mode";
import { gen_uuid } from "../../../origin/src/utils/util";
import type { FileExtension } from "../../../origin/src/utils/types";

export let fs: FileSystem;
switch(get_native_platform()){
    case "WEB": throw new Error("Web Native Filesystem is NOT implemented");
    case "NODE": try {fs = require("./fs.node").node_fs;} catch(e) {} break;
    case "REACT_NATIVE": try {fs = require("./fs.mobile").mobile_fs;} catch(e) {} break;
}

export function gen_temp_file_name(prefix?: string): string{
    return (prefix ?? "") + gen_uuid();
}

export function get_temp_file_path(file_extension: FileExtension): string{
    return fs.temp_directory(gen_temp_file_name() + file_extension);
}

export async function use_temp_file_keep(file_contents: string, file_extension: FileExtension, opts: EncodingOpts){
    const temp_file_path = get_temp_file_path(file_extension);
    await fs.write_file_as_string(temp_file_path, file_contents.replaceAll('\\', '/'), opts);
    return temp_file_path;
}

export async function use_temp_file(file_contents: string, file_extension: FileExtension, opts: EncodingOpts, on_file_created: (temp_file_path: string) => Promise<void>){
    const temp_file_path = await use_temp_file_keep(file_contents, file_extension, opts);
    await on_file_created(temp_file_path);
    // TODO: look into cleanup
    await fs.remove(temp_file_path);
}