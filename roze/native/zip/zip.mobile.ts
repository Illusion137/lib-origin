import type { Zip } from "@native/zip/zip.base";
import { listZipContents, streamFileFromZip, unzipFile, createZipFile } from 'react-native-zip-stream';
import type JSZip from "jszip";
import { fs } from "@native/fs/fs";
import { generror, generror_catch } from "@common/utils/error_util";

let jszip_ctor_cache: (new () => JSZip) | null = null;
async function get_jszip(): Promise<new () => JSZip> {
    if (jszip_ctor_cache) return jszip_ctor_cache;
    jszip_ctor_cache = (await import("jszip")).default as unknown as new () => JSZip;
    return jszip_ctor_cache;
}

let buffer_cache: BufferConstructor | null = null;
async function get_buffer(): Promise<BufferConstructor> {
    if (buffer_cache) return buffer_cache;
    buffer_cache = (await import("buffer/")).Buffer as unknown as BufferConstructor;
    return buffer_cache;
}

const JSZIP_CACHE_MAX = 4;
const jszip_cache = new Map<string, Promise<JSZip | null>>();

function to_file_uri(file_path: string): string {
    return file_path.startsWith("file://") ? file_path : "file://" + file_path;
}

async function load_jszip(file_path: string): Promise<JSZip | null> {
    const cached = jszip_cache.get(file_path);
    if (cached !== undefined) return cached;
    const loader = (async (): Promise<JSZip | null> => {
        const base64 = await fs().read_as_string(to_file_uri(file_path), { encoding: "base64" });
        if (typeof base64 !== "string") return null;
        const JSZipCtor = await get_jszip();
        return new JSZipCtor().loadAsync(base64, { base64: true });
    })();
    if (jszip_cache.size >= JSZIP_CACHE_MAX) {
        const oldest = jszip_cache.keys().next().value;
        if (oldest !== undefined) jszip_cache.delete(oldest);
    }
    jszip_cache.set(file_path, loader);
    return loader;
}

function native_entry_names(contents: unknown): string[] {
    const extract_list = (value: unknown): string[] | null => {
        if (Array.isArray(value)) return value as string[];
        if (value && typeof value === "object") {
            const maybe_list =
                (value as { entries?: unknown }).entries ??
                (value as { files?: unknown }).files ??
                (value as { items?: unknown }).items ??
                (value as { list?: unknown }).list ??
                (value as { contents?: unknown }).contents;
            if (Array.isArray(maybe_list)) return maybe_list as string[];
        }
        return null;
    };
    const map_names = (items: unknown[]): string[] =>
        items
            .map((entry: unknown) => {
                if (typeof entry === "string") return entry;
                if (entry && typeof entry === "object") {
                    const maybe_name =
                        (entry as { path?: unknown }).path ??
                        (entry as { name?: unknown }).name ??
                        (entry as { filename?: unknown }).filename ??
                        (entry as { fileName?: unknown }).fileName ??
                        (entry as { entryName?: unknown }).entryName ??
                        (entry as { entry?: unknown }).entry ??
                        (entry as { file_path?: unknown }).file_path;
                    if (typeof maybe_name === "string") return maybe_name;
                }
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                return entry ? String(entry) : "";
            })
            .filter((name) => name.length > 0);

    const list = extract_list(contents);
    return list ? map_names(list) : [];
}

export const mobile_zip: Zip = {
    list_entries: async (file_path) => {
        try {
            const names = native_entry_names(await listZipContents(file_path));
            if (names.length > 0) return names;
        } catch {
            // fall through to the JS reader
        }
        try {
            const archive = await load_jszip(file_path);
            if (archive === null) return generror("Failed to read zip file for fallback listing", "MEDIUM", { file_path });
            console.log(Object.keys(archive.files));
            return Object.keys(archive.files);
        } catch (e) {
            return generror_catch(e, "Failed to extract zip contents", "MEDIUM", { file_path });
        }
    },
    stream_entry: async (file_path, entry) => {
        const Buffer = await get_buffer();
        if (jszip_cache.has(file_path)) {
            const archive = await load_jszip(file_path);
            const file = archive?.file(entry);
            if (file) return Buffer.from(await file.async("uint8array"));
        }
        try {
            const data = await streamFileFromZip(file_path, entry, "arraybuffer");
            return Buffer.from(data as ArrayBuffer);
        } catch (e) {
            try {
                const archive = await load_jszip(file_path);
                const file = archive?.file(entry);
                if (file) return Buffer.from(await file.async("uint8array"));
            } catch {
                // fall through to the original error
            }
            return generror_catch(e, "Failed to stream zip entry", "MEDIUM", { file_path, entry });
        }
    },
    extract_all: async (file_path, destination_path) => {
        try {
            return await unzipFile(file_path, destination_path) as boolean;
        } catch (e) {
            return generror_catch(e, "Failed to extract zip", "MEDIUM", { file_path, destination_path });
        }
    },
    create_zip: async (source_path, destination_path) => {
        try {
            return await createZipFile(destination_path, source_path) as boolean;
        } catch (e) {
            return generror_catch(e, "Failed to create zip", "MEDIUM", { source_path, destination_path });
        }
    }
};
