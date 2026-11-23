import type { ResponseError } from '@common/types';
import { deflateRawSync, inflateRawSync } from 'zlib';
import { generror_catch } from './error_util';
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
	let decompressed_string: string;
	try {
		decompressed_string = decompress_base64_to_string(compressed_obj);
	} catch (error) {
		return generror_catch(error, 'Failed to decompress', 'LOW', { compressed_obj });
	}
	return try_json_parse<T>(decompressed_string);
}

export function base64_to_url_safe(base64: string): string {
	return base64.replace(/\+/g, '-').replace(/\//g, '_');
}
export function url_safe_to_base64(text: string): string {
	const base64 = text.trim().replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+').replace(/=+$/, '');
	return base64 + '='.repeat((4 - (base64.length % 4)) % 4);
}
