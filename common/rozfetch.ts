import { json_catch } from "@common/utils/util";
import { ItemTimedCache, type PromiseResult, type ResponseError } from "@common/types";
import { md5 } from 'js-md5';
import { fs } from "@native/fs/fs";
import { try_json_parse } from "@common/utils/parse_util";
import { generror_catch, generror_fetch, is_timeout_error } from "@common/utils/error_util";
import pathlib from 'path';

interface RozFetchCacheOptsBase {
    cache_ms: number;
    cache_ms_fail?: number;
}
interface RozFetchCacheOptsMemory {
    cache_mode?: "memory"|"none";
}
interface RozFetchCacheOptsFile {
    cache_mode?: "file"|"all"|"none";
    cache_directory?: string;
}
type RozFetchCacheOpts = RozFetchCacheOptsBase & (RozFetchCacheOptsMemory|RozFetchCacheOptsFile);

export interface RozProxy {
    ip: string;
    port: number;
}
export interface RoZFetchRequestInit extends RequestInit {
    cache_opts?: RozFetchCacheOpts
    abort_ms?: number;
    proxy?: RozProxy;
}
type RozFetchText<T> = T extends never ? () => Promise<string> : never;
type RozFetchJSON<T> = T extends never ? never : () => PromiseResult<T>;
export interface RoZFetchResponse<T> extends Response {
    // text: RozFetchText<T>; // TODO Investigate
    json: RozFetchJSON<T>;
    invalidate_cache: () => Promise<void>;
    cache_timestamp: number;
    ok: true;
}

const cache_file_extension = '.che';
const rozfetch_cache = new ItemTimedCache<string, ResponseError|RoZFetchResponse<unknown>>();

export function rozfetch_cache_key(input: string, init?: RoZFetchRequestInit): string {
    return md5.hex(input + JSON.stringify(init));
}

function generate_cache_file_path(opts: {directory?: string, cache_key: string}){
    opts.directory ??= fs.temp_directory();
    return pathlib.join(opts.directory, opts.cache_key + cache_file_extension);
}

export async function invalidate_rozfetch_cache(init: RoZFetchRequestInit, cache_key: string){
    rozfetch_cache.remove(cache_key);
    if(init?.cache_opts && (init.cache_opts.cache_mode === "file" || init.cache_opts.cache_mode === "all")){
        const cache_file_path = generate_cache_file_path({cache_key, directory: init.cache_opts?.cache_directory});
        const file_info = await fs.get_info(cache_file_path);
        if(!file_info.exists) return;
        await fs.remove(cache_file_path);
    }
}

async function check_rozfetch_cache<T>(init: RoZFetchRequestInit, cache_key: string): PromiseResult<RoZFetchResponse<T>|undefined>{
    if(init?.cache_opts) init.cache_opts.cache_mode ??= "none";
    if(init.cache_opts?.cache_mode === "none") return;
    if(init?.cache_opts && (init.cache_opts.cache_mode === "memory" || init.cache_opts.cache_mode === "all")){
        const cache_response = rozfetch_cache.get(cache_key);
        if(cache_response) {
            if(!("error" in cache_response))
                cache_response.cache_timestamp = rozfetch_cache.get_raw(cache_key)?.created_at.getTime() ?? -1;
            return cache_response as RoZFetchResponse<T>;
        }
    }
    if(init?.cache_opts && (init.cache_opts.cache_mode === "file" || init.cache_opts.cache_mode === "all")){
        const cache_file_path = generate_cache_file_path({cache_key, directory: init.cache_opts.cache_directory});
        const file_info = await fs.get_info(cache_file_path);
        if(!file_info.exists) return;
        const data = await fs.read_as_string(cache_file_path, {encoding: "utf8"});
        if(typeof data === "object") return;
        const response = new Response() as RoZFetchResponse<T>;
        response.text = (async() => data) as RozFetchText<T>;
        response.json = (async() => try_json_parse<T>(data)) as RozFetchJSON<T>;
        response.invalidate_cache = async() => invalidate_rozfetch_cache(init, cache_key);
        response.cache_timestamp = file_info.file_modified_ms;
        if(init.cache_opts.cache_mode === "all"){
            rozfetch_cache.update(cache_key, response, init.cache_opts.cache_ms);
        }
        return response;
    }
    return;
}
async function write_cache_file(init: RoZFetchRequestInit, cache_key: string, text: string){
    if(init.cache_opts?.cache_mode === "file" || init.cache_opts?.cache_mode === "all"){
        const cache_file_path = generate_cache_file_path({cache_key, directory: init.cache_opts.cache_directory});
        await fs.write_file_as_string(cache_file_path, text, {encoding: "utf8"});
    }
}
async function update_rozfetch_cache<T>(init: RoZFetchRequestInit, response: RoZFetchResponse<T>, cache_key: string, err: ResponseError){
    if(!init?.cache_opts || init.cache_opts.cache_mode === "none") return;
    const lifespan_ms = !response.ok ? init.cache_opts.cache_ms_fail ?? init.cache_opts.cache_ms : init.cache_opts.cache_ms;
    const clone_response = response.clone();
    response.text = (async() => {
        const text = await clone_response.text();
        response.text = (async() => text) as RozFetchText<T>;
        await write_cache_file(init, cache_key, text);
        return text;
    }) as RozFetchText<T>;
    response.json = (async() => {
        const json: T = await clone_response.json();
        response.json = (async() => json) as RozFetchJSON<T>;
        await write_cache_file(init, cache_key, JSON.stringify(json));
        return json;
    }) as RozFetchJSON<T>;
    if(init.cache_opts.cache_mode === "memory" || init.cache_opts.cache_mode === "all"){
        rozfetch_cache.add(cache_key, !response.ok ? err: response, lifespan_ms);
    }
}

export const ABORT_MESSAGE = "[ABORTED_ROZFETCH]";
export default async function rozfetch<T = never>(input: string, init?: RoZFetchRequestInit): PromiseResult<RoZFetchResponse<T>> {
    try {
        const cache_key = rozfetch_cache_key(input, init);
        const cached_response = await check_rozfetch_cache<T>(init ?? {}, cache_key);
        if(cached_response !== undefined) return cached_response;
        
        const response = await fetch(input, {...init, signal: init?.abort_ms ? AbortSignal.timeout(init.abort_ms) : undefined}) as RoZFetchResponse<T>;
        response.json = (async() => response.clone().json().catch(json_catch)) as RozFetchJSON<T>;
        response.invalidate_cache = async() => invalidate_rozfetch_cache(init ?? {}, cache_key);
        response.cache_timestamp = -1;

        const err = generror_fetch(response, "rozfetch failed | response NOT ok", {}, {input, init});
        await update_rozfetch_cache(init ?? {}, response, cache_key, err);
        
        if(!response.ok) return err;
        return response;
    }
    catch(e: unknown){
        if(is_timeout_error(e)){
            const err = e as DOMException;
            const error: Error = new Error();
            error.name = err.name;
            error.message = ABORT_MESSAGE + err.message;
            error.stack = ABORT_MESSAGE + err.stack;
            error.cause = err.cause;
            return generror_catch(error, "rozfetch failed", {input, init});
        }
        return generror_catch(e, "rozfetch failed", {input, init});
    }
}