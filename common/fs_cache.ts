import { fs } from "@native/fs/fs";
import { MD5 } from "crypto-js";
import path from "path-browserify";

export namespace FSCache {
    const cache_file_extension = ".che";

    function cache_key(payload: any){
        return MD5(JSON.stringify(payload)).toString();
    }

    async function generate_cache_file_path(opts: { directory?: string; cache_key: string }) {
        opts.directory ??= await fs().temp_directory();
        return path.join(opts.directory, opts.cache_key + cache_file_extension);
    }

    export async function clear_cache(payload: any, opts: { directory?: string; }){
        const file_path = await generate_cache_file_path({...opts, cache_key: cache_key(payload)});
        await fs().remove(file_path);
    }

    export async function check_cache<T>(payload: any, expire_ms: number, opts: { directory?: string; }): Promise<T|undefined>{
        const file_path = await generate_cache_file_path({...opts, cache_key: cache_key(payload)});
        const stats_result = await fs().get_info(file_path);
        if(!stats_result.exists) return undefined;
        if(stats_result.file_modified_ms + expire_ms < new Date().getTime()) {
            await fs().remove(file_path);
            return undefined;
        }
        const read_result = await fs().read_as_string(file_path, {encoding: "utf8"});
        if(typeof read_result === "object") return undefined;

        const data: T = JSON.parse(read_result);
        return data;
    }

    export async function insert_cache(payload: any, data: any, opts: { directory?: string; }){
        const write_result = await fs().write_file_as_string(await generate_cache_file_path({...opts, cache_key: cache_key(payload)}), JSON.stringify(data), {encoding: "utf8"});
        return {result: write_result, data};
    }
}