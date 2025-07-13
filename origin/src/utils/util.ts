import * as sha1 from 'sha1-uint8array'
import type { ResponseError } from './types';
import type { YTCFG } from '../youtube/types/YTCFG';
import type { CookieJar } from './cookie_util';
import { status_codes_descriptions } from './status_codes';
import uuid from 'react-native-uuid';

export function gen_uuid(): string{
    return uuid.v4();
}
export function decode_hex(hex: string) {
	return hex.replace(/\\x22/g, '"').replace(/\\x7b/g, '{').replace(/\\x7d/g, '}').replace(/\\x5b/g, '[').replace(/\\x5d/g, ']').replace(/\\x3b/g, ';').replace(/\\x3d/g, '=').replace(/\\x27/g, '\'').replace(/\\\\/g, 'doubleAntiSlash').replace(/\\/g, '').replace(/doubleAntiSlash/g, '\\')
}
export function generate_new_uid(prefix_name: string) {
	return prefix_name?.replace(/[^a-zA-Z0-9]/g,'') + '-' + new Date().getTime().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15);
}
export function encode_params(data: Record<string, unknown>, query?: [string, string]) {
	const encoded_params: string[] = [];
	for(const key of Object.keys(data)) {
		const param = data[key];
		encoded_params.push(`${key}=${encodeURIComponent(typeof(param) === "object" ? JSON.stringify(param) : param as string|number|boolean )}`);
	}
	if(query) 
		encoded_params.push(`${query[0]}=${query[1]}`);
	return encoded_params.join('&');
}
export function get_main_key(obj: object) { return Object.keys(obj)[0]; }
export function extract_string_from_pattern(str: string, pattern: RegExp) {
	const body_groups = pattern.exec(str);
	if(body_groups === null) return generror('Unable to extract pattern NULL found');
	if(body_groups.length < 2) return generror('Unable to extract pattern Not sufficient groups');
	const extracted = body_groups[1];
	return extracted;
}
export function extract_all_strings_from_pattern(str: string, pattern: RegExp) {
    const matched = str.matchAll(pattern);
    const match_spread = [...matched];
    return match_spread.map(match => match?.[1]).filter(match => match !== undefined);
}
export function parse_time(clock_time: string|undefined): number {
    if(clock_time === undefined) return NaN;
	let time = 0;
	const time_split = clock_time.split(":");
	for(let i = 0; i < time_split.length; i++) {
		const parsed = parseInt(time_split[time_split.length - 1 - i]);
		if(i == 0) time += parsed;
		else time += parsed * Math.pow(60,i);
	}
	return time;
}
export function youtube_views_number(views_string?: string): number {
    if(is_empty(views_string)) return 0;
    views_string = remove(views_string!, " views",  " view", " plays", " play");
    const last_char = views_string[views_string.length - 1];

    switch(last_char) {
        case 'B': return parseFloat(views_string) * 1000000000;
        case 'M': return parseFloat(views_string) * 1000000;
        case 'K': return parseFloat(views_string) * 1000;
        default: return parseFloat(views_string);
    }
}
export function round_decimal_place(num: number, decimal_places: number){
	if(decimal_places === 0) return Math.round(num); 
	const multiplier = Math.pow(10, decimal_places);
	if(decimal_places < 0) return Math.round(num / multiplier) * multiplier;
	return Math.round(num * multiplier) / multiplier;
}
export function parse_runs(runs: ({text: string}[]) | undefined, join_with?: string ): string {
    if(runs === undefined) return "";
    return runs.map(run => run.text).join(join_with ?? " ");
}
export async function wait(milliseconds: number) {
	return new Promise(function(resolve) { 
	  	setTimeout(resolve, milliseconds, 'HASH_TIMED_OUT');
	});
}
export async function call_wtimeout(promise: () => Promise<any>, timeout_milliseconds: number){
	return await Promise.race([
		promise(),
		wait(timeout_milliseconds)
	])
}
export function empty_undefined(str: string) { return is_empty(str) ? undefined : str; }
export function urlid(url: string, ...remove_links: (string|RegExp)[]) { 
    let id = url.replace("https://", "").replace("www.", "").replace("http://", '').replace('https:','');
    for(const link of remove_links) { id = id.replace(link, ""); }
    return id;
}
export function make_topic(title: string) { return `${title} - Topic`; }
export function remove_topic(title: string) { return title.replace(" - Topic", ''); }
declare const opaqueSym: unique symbol;
type NonEmptyArray<T> = [T, ...T[]];
type NonEmpty = string & { [opaqueSym]: "NonEmptyString" } | number | NonEmptyArray<any>;

export function is_empty(value: unknown): value is NonEmpty { return value === undefined || value === null || value === 0 || value === "" || (typeof value === "string" && (value.trim() === "" || value === "0")) || (typeof value === "object" && Object.keys(value).length === 0) || (typeof value === "number" && isNaN(value)); }
export function remove_prod(title: string) { return title.replace(/\(.+?\)/g, '').replace(/prod\. .+/, ''); }
export function google_query(query: string) { return encodeURIComponent(query).split("%20").join("+"); }
export function remove(str: string, ...rs: (string|RegExp)[]) { for(const r of rs) str = str.replace(r, ''); return str; }
export function remove_special_chars(str: string) {
    const special_characters = "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
    for(const char of special_characters) str = remove(str, char);
    return str;
}
export function eval_json<T>(json: string): T {
    const result = eval("let evaluated = " + json + "; evaluated;");
    return result;
}
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
export function isNumber(numish: unknown): numish is number{
	return typeof numish === 'number' && !isNaN(numish);
}

export function args_prettystring(args: object, indent = 2){
	let str = '{\n';
	const keys = Object.keys(args);
	for(const key of keys){
		str +=  `${new Array(indent).fill(' ').join('')}${key}: ${JSON.stringify(args[key])}\n`;
	}
	str += '}'
	return str;
}
export function generror(msg: string, args: object = {}): ResponseError{
	return {error: new Error(`${msg}\n : args${args_prettystring(args)}`)};
}
export function generror_fetch(response: Response, msg: string, maybe_jar?: {cookie_jar?: CookieJar}, args: object = {}): ResponseError{
	return generror(`${msg};\n Response failed with status code ${response.status}(${status_codes_descriptions[response.status]}) : "${response.statusText}"${maybe_jar?.cookie_jar !== undefined ? " [Using Cookies]" : ""}`, args);
}

export function sapisid_hash_auth0(SAPISID: string, epoch: Date, ORIGIN: string) {
	const time_stamp_seconds_str = String(epoch.getTime()).slice(0, 10);
	const data_string = [time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
	const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
	const sha_digest = sha1.createHash().update(data).digest("hex");
	const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest}`
	return SAPISIDHASH;
}
// https://stackoverflow.com/questions/79378674/figuring-out-google-hashing-algorithm-for-sapisidhash-used-on-youtube-subscribe
/*
	Here's how the hash is generated:
	sha1([DATASYNC_ID, TIMESTAMP, SAPISID, ORIGIN].join(" "))
	WITH:
	DATASYNC_ID = ytcfg.data_.DATASYNC_ID.split('||')[0]
	TIMESTAMP = Math.floor(new Date().getTime() / 1E3)
	SAPISID = cookies['SAPISID']
	ORIGIN = "https://www.youtube.com"
	The authorization header seems to be a repeat of {TIMESTAMP}_{sha1_hash}_u for each of SAPISIDHASH, SAPISID1PHASH and SAPISID3PHASH:
	authorization: SAPISIDHASH {TIMESTAMP}_{sha1_hash}_u SAPISID1PHASH {TIMESTAMP}_{sha1_hash}_u SAPISID3PHASH {TIMESTAMP}_{sha1_hash}_u
*/
export function sapisid_hash_auth1(SAPISID: string, epoch: Date, ytcfg: YTCFG, ORIGIN: string) {
	const time_stamp_seconds_str = Math.floor(epoch.getTime() / 1E3);
	const datasync_id = (ytcfg.DATASYNC_ID ?? (ytcfg as any).data_.DATASYNC_ID).split('||')[0];

	const data_string = [datasync_id, time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
	const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
	const sha_digest = sha1.createHash().update(data).digest("hex");
	const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest}_u SAPISID1PHASH ${time_stamp_seconds_str}_${sha_digest}_u SAPISID3PHASH ${time_stamp_seconds_str}_${sha_digest}_u`
	return SAPISIDHASH;
}
export function try_json_parse<T>(json_string: string): T|ResponseError {
	try { return JSON.parse(json_string) as T; } catch (error) { return { error: error as Error }; }
}
export function clean_html_text(text: string) {
	return text.replace(/&#34;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\n/g, '');
}
export function json_catch(result: any){
    return result instanceof Error ? {error: result} : result;
}

export function clean_error_stack(error: Error){
	const at_regex = /at (.+?) /gs;
	const matches = [...error.stack!.matchAll(at_regex)]
	const bad_regexes: RegExp[] = [
		/anon_0_/i,
		/asyncGeneratorStep/i,
		/tryCallOne/i,
		/InternalBytecode/i,
		/invokeCallback/i,
		/callTimer/i,
		/callReact/i,
		/flushedQueue/i,
		/_next/i,
		/__guard/i,
		/anonymous/i,
		/apply/i,
	];
	const new_stack = matches.map(match => match[1]).filter(loc => !bad_regexes.some(regex => regex.test(loc)));
	return error.message + " \n " + new_stack.map(item => `at ${item}`).join(' \n');
}

export function safe_date_iso(date: Date): string{
	try {
		return date.toISOString();
	}
	catch(e) {
		return new Date(0).toISOString();
	}
}
export function base_response_fail_msg(response: Response){
	return `response failed to ${response.url} with status code: ${response.status}; msg: ${response.statusText}`;
}