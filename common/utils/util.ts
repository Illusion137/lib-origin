import type { ResponseError } from '@common/types';
import { generror } from '@common/utils/error_util';
import uuid from 'react-native-uuid';

export function generate_new_uid(prefix_name: string) {
	return prefix_name?.replace(/[^a-zA-Z0-9]/g,'') + '-' + new Date().getTime().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15);
}
export function gen_uuid(): string{
    return uuid.v4();
}
export function decode_hex(hex: string) {
	return hex.replace(/\\x22/g, '"').replace(/\\x7b/g, '{').replace(/\\x7d/g, '}').replace(/\\x5b/g, '[').replace(/\\x5d/g, ']').replace(/\\x3b/g, ';').replace(/\\x3d/g, '=').replace(/\\x27/g, '\'').replace(/\\\\/g, 'doubleAntiSlash').replace(/\\/g, '').replace(/doubleAntiSlash/g, '\\')
}

export function small_string(str: string, length = 50){
    if(str.length < length) return str;
    return str.slice(0, length) + '...';
}
export function extract_string_from_pattern(str: string, pattern: RegExp) {
	const body_groups = pattern.exec(str);
	if(body_groups === null) return generror('Unable to extract pattern NULL found', {str: small_string(str)});
	if(body_groups.length < 2) return generror('Unable to extract pattern Not sufficient groups', {str: small_string(str)});
	const extracted = body_groups[1];
	return extracted;
}
export function extract_all_strings_from_pattern(str: string, pattern: RegExp) {
    const matched = str.matchAll(pattern);
    const match_spread = [...matched];
    return match_spread.map(match => match?.[1]).filter(match => match !== undefined);
}

export function round_decimal_place(num: number, decimal_places: number){
	if(decimal_places === 0) return Math.round(num); 
	const multiplier = Math.pow(10, decimal_places);
	if(decimal_places < 0) return Math.round(num / multiplier) * multiplier;
	return Math.round(num * multiplier) / multiplier;
}

export function error_undefined<T>(value: T|ResponseError): T|undefined { return typeof value === "object" && value !== null && "error" in value ? undefined : value; }
export function empty_undefined(str: string) { return is_empty(str) ? undefined : str; }
export function urlid(url: string, ...remove_links: (string|RegExp)[]) { 
    let id = url.replace("https://", "").replace("www.", "").replace("http://", '').replace('https:','');
    for(const link of remove_links) { id = id.replace(link, ""); }
    return id;
}

declare const opaqueSym: unique symbol;
type NonEmptyArray<T> = [T, ...T[]];
type NonEmpty = string & { [opaqueSym]: "NonEmptyString" } | number | NonEmptyArray<any>;

export function is_empty(value: unknown): value is NonEmpty { return value === undefined || value === null || value === 0 || value === "" || (typeof value === "string" && (value.trim() === "" || value === "0")) || (typeof value === "object" && Object.keys(value).length === 0) || (typeof value === "number" && isNaN(value)); }

export function milliseconds_of(time: {years?: number, months?: number, weeks?: number, days?: number, hours?: number, minutes?: number, seconds?: number}): number {
	return ((time.years ?? 0) * 1000 * 60 * 60 * 24 * 365) +
		((time.months ?? 0) * 1000 * 60 * 60 * 24 * 30) 
		+ ((time.weeks ?? 0) * 1000 * 60 * 60 * 24 * 7) 
		+ ((time.days ?? 0) * 1000 * 60 * 60 * 24) 
		+ ((time.hours ?? 0) * 1000 * 60 * 60)
		+ ((time.minutes ?? 0) * 1000 * 60)
		+ ((time.seconds ?? 0) * 1000)
}
export function empty_join(vals: any[], join_with: string) {
    return vals.filter(val => !is_empty(val)).join(join_with);
}
export function empty_join_dot(vals: any[]) {
    return empty_join(vals, " • ");
}
export function chunkify<T>(array: T[], size: number): T[][]{
	const chunk_map: T[][] = [];
	for(let i = 0; i < array.length; i += size){
		chunk_map.push(array.slice(i, i + size));
	}
	return chunk_map;
}
export function is_number(numish: unknown): numish is number{
	return typeof numish === 'number' && !isNaN(numish);
}

export function json_catch(result: any){
    return result instanceof Error ? {error: result} : result;
}

export function safe_date_iso(date: Date): string{
	try { return date.toISOString(); }
	catch(e) { return new Date(0).toISOString(); }
}

export function has_file_extension(path: string){
    const extracted = extract_string_from_pattern(path, /(\.[0-9a-z]+$)/i);
    return typeof extracted === "string";
}

export function extract_file_extension(path: string, mime?: "photo"|"video"|"none") {
    const extracted = extract_string_from_pattern(path, /(\.[0-9a-z]+$)/i);
    if(typeof extracted === "object"){
        switch(mime){
            case "none": return "";
            case "photo": return ".jpg";
            case "video": return ".mp4";
            case undefined:
            default: return ".txt";
        }
    }
    return extracted;
}

export function shuffle_array<T>(array: T[]) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

export function closest_to(target: number, array: number[]) {
    return array.reduce(function(prev, curr) {
        return (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
    });
}

export function cycle<T>(value: T, values: T[]): T {
    const value_index = values.findIndex(item => item === value);
    if(value_index === values.length - 1) return values[0];
    return values[value_index + 1];
}
export function character_count(haystack: string, needle: string) {
    let count = 0;
    for(const char of haystack) if(char === needle) count++;
    return count;
}

export function pad_value_left(value: unknown, padding: number) {
    return String(value).padStart(padding, "0");
}

export function random_of<T>(arr: T[]): T {
    const randidx = Math.floor(Math.random() * (Math.floor(arr.length) - 0) + 0);
    return arr[randidx];
}
export function seeded_random_of<T>(gen: () => number, arr: T[]): T {
    const randidx = Math.floor(gen() * (Math.floor(arr.length) - 0) + 0);
    return arr[randidx];
}

export function groupby<T>(items: T[], keyGetter: (t: T) => any): Record<string, T[]> {
    return items.reduce((accumulator: any, item) => {
        const key = keyGetter(item);
        (accumulator[key] = accumulator[key] || []).push(item);
        return accumulator;
    }, {});
};

export function version_greater_than(version: string, other_version: string): boolean{
    try {
        const [major, minor, patch] = version.split('.').map(item => parseInt(item));
        const [other_major, other_minor, other_patch] = other_version.split('.').map(item => parseInt(item));
        if(isNaN(major) || isNaN(minor) || isNaN(patch) || isNaN(other_major) || isNaN(other_minor) || isNaN(other_patch)) return false;
        if(major > other_major) return true;
        if(major === other_major && minor > other_minor) return true;
        if(major === other_major && minor === other_minor && patch > other_patch) return true;
        return false;
    }
    catch(e) {
        return false;
    }
}

export function single_case(str: string): string {
    if(str.length <= 2) return str.toUpperCase();
    const split = str.toLowerCase().split('');
    split[0] = split?.[0].toUpperCase();
    return split.join('');
}

export function recreate<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}