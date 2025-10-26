import { fs } from "@native/fs/fs";
import { MD5 } from "crypto-js";
import path from "path-browserify";
import { try_json_parse } from "./utils/parse_util";
import { reinterpret_cast } from "./cast";

export namespace FSCache {
    type SerialType = "stringable"|"arraybuffer";
    const cache_file_extension = ".che";

    function cache_key(payload: any){
        return MD5(JSON.stringify(payload)).toString();
    }

    function serialze_data(data: unknown, serial_type: SerialType): string{
        switch(serial_type){
            case "stringable": {
                return JSON.stringify(data);
            }
            case "arraybuffer": {
                const uint8_array = new Uint8Array(reinterpret_cast<ArrayBuffer>(data));
                let binary_string = '';
                for (const uint8 of uint8_array) {
                    binary_string += String.fromCharCode(uint8);
                }
                const base64_string = btoa(binary_string); 
                return base64_string;
            }
        }
    }
    // function unserialize_data(serialized_data: string, serial_type: "arraybuffer"): ArrayBuffer
    // function unserialize_data(serialized_data: string, serial_type: "stringable"): unknown
    function unserialize_data<T extends SerialType>(serialized_data: string, serial_type: T): T extends "arraybuffer" ? ArrayBuffer : unknown{
        switch(serial_type){
            case "stringable": {
                const data = try_json_parse<unknown>(serialized_data);
                if(typeof data === "object" && data !== null && "error" in data) return reinterpret_cast<any>(0);
                return reinterpret_cast<any>(data);
            }
            case "arraybuffer": {
                const decoded_binary_string = atob(serialized_data); // 'atob' decodes Base64 to binary string
                const decoded_uint8_array = new Uint8Array(decoded_binary_string.length);
                for (let i = 0; i < decoded_binary_string.length; i++) {
                    decoded_uint8_array[i] = decoded_binary_string.charCodeAt(i);
                }
                return decoded_uint8_array.buffer;
            }
        }
    }

    async function generate_cache_file_path(opts: { directory?: string; cache_key: string }) {
        opts.directory ??= await fs().temp_directory();
        return path.join(opts.directory, opts.cache_key + cache_file_extension);
    }

    export async function clear_cache(payload: any, opts: { directory?: string; }){
        const file_path = await generate_cache_file_path({...opts, cache_key: cache_key(payload)});
        await fs().remove(file_path);
    }

    export async function check_cache<T>(payload: any, expire_ms: number, opts: { directory?: string; serial_type?: SerialType }): Promise<T|undefined>{
        const file_path = await generate_cache_file_path({...opts, cache_key: cache_key(payload)});
        const stats_result = await fs().get_info(file_path);
        if(!stats_result.exists) return undefined;
        if(stats_result.file_modified_ms + expire_ms < new Date().getTime()) {
            await fs().remove(file_path);
            return undefined;
        }
        const read_result = await fs().read_as_string(file_path, {encoding: "utf8"});
        if(typeof read_result === "object") return undefined;

        const data: T = reinterpret_cast<T>(unserialize_data(read_result, opts.serial_type ?? "stringable"));
        return data;
    }

    export async function insert_cache(payload: any, data: any, opts: { directory?: string; serial_type?: SerialType }){
        const write_result = await fs().write_file_as_string(await generate_cache_file_path({...opts, cache_key: cache_key(payload)}), serialze_data(data, opts.serial_type ?? "stringable"), {encoding: "utf8"});
        return {result: write_result, data};
    }
}