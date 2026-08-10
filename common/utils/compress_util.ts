import { deflateRawSync, inflateRawSync } from "zlib";

export function compress_string_to_base64(str: string): string {
    return deflateRawSync(Buffer.from(str, "utf-8")).toString("base64");
}
export function decompress_base64_to_string(base64: string): string {
    return inflateRawSync(Buffer.from(base64, "base64")).toString("utf-8");
}
