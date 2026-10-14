import type { ResponseError } from '@common/types';
import { deflateRawSync, inflateRawSync } from 'zlib';
import { try_json_parse } from './parse_util';

export function compress_string_to_base64(str: string): string {
	return deflateRawSync(Buffer.from(str, 'utf-8')).toString('base64');
}
export function decompress_base64_to_string(base64: string): string {
	return inflateRawSync(Buffer.from(base64, 'base64')).toString('utf-8');
}

export function compress_object<T extends object>(obj: T): string {
	return compress_string_to_base64(JSON.stringify(obj));
}
export function decompress_object<T extends object>(compressed_obj: string): T | ResponseError {
	const decompressed_string = decompress_base64_to_string(compressed_obj);
	return try_json_parse<T>(decompressed_string);
}
