import { describe, it, expect } from 'vitest';
import {
	is_empty, is_number, error_undefined, empty_undefined, small_string, single_case,
	urlid, join_uri, large_number_string, pad_value_left, extract_string_from_pattern,
	extract_strings_from_pattern, extract_all_strings_from_pattern, round_decimal_place,
	milliseconds_of, seconds_of, minutes_of, hours_of, days_of, weeks_of, chunkify,
	chunkify_back, closest_to, cycle, filter_by_set, groupby, empty_join, empty_join_dot,
	version_split, version_greater_than, version_greater_equal_to, recreate, json_catch,
	safe_date_iso, has_file_extension, extract_file_extension, batch_requests, get_main_key,
	seeded_random_of
} from './util';
import { remove, remove_topic } from './clean_util';
import {
	parse_time, parse_runs, parse_pdf_date, force_json_parse,
	force_json_parse_array, try_json_parse, try_json_eval
} from './parse_util';
import { Cookie, CookieJar } from './cookie_util';
import {
	compress_string_to_base64, decompress_base64_to_string, compress_object, decompress_object
} from './compress_util';
import { google_query, encode_params } from './fetch_util';

describe('util.ts', () => {
	describe('is_empty', () => {
		it('treats nullish, zero, empty and whitespace as empty', () => {
			for (const v of [undefined, null, 0, NaN, '', '   ', '0', {}, []])
				expect(is_empty(v)).toBe(true);
		});
		it('treats non-empty values as non-empty', () => {
			for (const v of ['hello', 5, [1], { a: 1 }])
				expect(is_empty(v)).toBe(false);
		});
	});

	it('is_number only accepts real numbers', () => {
		expect(is_number(5)).toBe(true);
		expect(is_number(NaN)).toBe(false);
		expect(is_number('5')).toBe(false);
	});

	it('error_undefined collapses error objects to undefined', () => {
		expect(error_undefined({ error: new Error('x') })).toBeUndefined();
		expect(error_undefined('value')).toBe('value');
	});

	it('empty_undefined returns undefined for empty strings', () => {
		expect(empty_undefined('')).toBeUndefined();
		expect(empty_undefined('x')).toBe('x');
	});

	it('small_string truncates past the length', () => {
		expect(small_string('abc', 50)).toBe('abc');
		expect(small_string('a'.repeat(60))).toBe('a'.repeat(50) + '...');
	});

	it('single_case capitalizes the first letter', () => {
		expect(single_case('hello')).toBe('Hello');
		expect(single_case('WORLD')).toBe('World');
		expect(single_case('ab')).toBe('AB');
		expect(single_case('a')).toBe('A');
	});

	it('urlid strips protocol and www plus extra tokens', () => {
		expect(urlid('https://www.youtube.com/watch')).toBe('youtube.com/watch');
		expect(urlid('http://example.com/a', '/a')).toBe('example.com');
		expect(urlid('')).toBe('');
	});

	it('join_uri joins without doubling slashes', () => {
		expect(join_uri('a', 'b', 'c')).toBe('a/b/c');
		expect(join_uri('a/', 'b')).toBe('a/b');
		expect(join_uri('a')).toBe('a');
	});

	it('large_number_string inserts thousands separators', () => {
		expect(large_number_string(1234567)).toBe('1,234,567');
		expect(large_number_string(999)).toBe('999');
	});

	it('pad_value_left left-pads with zeros', () => {
		expect(pad_value_left(5, 3)).toBe('005');
		expect(pad_value_left(1234, 3)).toBe('1234');
	});

	describe('pattern extraction', () => {
		it('extract_string_from_pattern returns the first group or an error', () => {
			expect(extract_string_from_pattern('abc123', /([0-9]+)/, 'INFO')).toBe('123');
			expect(extract_string_from_pattern('abc', /([0-9]+)/, 'INFO')).toHaveProperty('error');
		});
		it('extract_strings_from_pattern returns all groups or empty', () => {
			expect(extract_strings_from_pattern('a1b2', /a(\d)b(\d)/)).toEqual(['1', '2']);
			expect(extract_strings_from_pattern('nope', /a(\d)b(\d)/)).toEqual([]);
		});
		it('extract_all_strings_from_pattern collects every match', () => {
			expect(extract_all_strings_from_pattern('a1a2a3', /a(\d)/g)).toEqual(['1', '2', '3']);
		});
	});

	it('round_decimal_place rounds to the given places', () => {
		expect(round_decimal_place(3.14159, 2)).toBe(3.14);
		expect(round_decimal_place(3.7, 0)).toBe(4);
		expect(round_decimal_place(2.5, 0)).toBe(3);
		expect(round_decimal_place(1234, -2)).toBe(1234);
	});

	it('time helpers convert from a unit spec', () => {
		expect(milliseconds_of({ seconds: 1 })).toBe(1000);
		expect(milliseconds_of({ days: 1 })).toBe(86_400_000);
		expect(seconds_of({ minutes: 1 })).toBe(60);
		expect(minutes_of({ hours: 1 })).toBe(60);
		expect(hours_of({ days: 1 })).toBe(24);
		expect(days_of({ weeks: 1 })).toBe(7);
		expect(weeks_of({ weeks: 2 })).toBe(2);
	});

	it('chunkify splits front to back', () => {
		expect(chunkify([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('chunkify_back splits with a short leading chunk', () => {
		expect(chunkify_back([1, 2, 3, 4, 5], 2)).toEqual([[1], [2, 3], [4, 5]]);
	});

	it('closest_to finds the nearest member', () => {
		expect(closest_to(5, [1, 4, 9])).toBe(4);
	});

	it('cycle advances and wraps around', () => {
		expect(cycle(2, [1, 2, 3])).toBe(3);
		expect(cycle(3, [1, 2, 3])).toBe(1);
	});

	it('filter_by_set dedupes by key', () => {
		expect(filter_by_set([{ id: 1 }, { id: 1 }, { id: 2 }], x => x.id)).toEqual([{ id: 1 }, { id: 2 }]);
	});

	it('groupby buckets by key', () => {
		expect(groupby([{ t: 'a', v: 1 }, { t: 'a', v: 2 }, { t: 'b', v: 3 }], x => x.t)).toEqual({
			a: [{ t: 'a', v: 1 }, { t: 'a', v: 2 }],
			b: [{ t: 'b', v: 3 }]
		});
	});

	it('empty_join drops empty values before joining', () => {
		expect(empty_join(['a', '', null, 'b'], '-')).toBe('a-b');
		expect(empty_join_dot(['a', 'b'])).toBe('a • b');
	});

	describe('version comparison', () => {
		it('version_split parses a dotted version', () => {
			expect(version_split('1.2.3')).toEqual([1, 2, 3]);
		});
		it('version_greater_than is strict', () => {
			expect(version_greater_than('1.2.3', '1.2.2')).toBe(true);
			expect(version_greater_than('2.0.0', '1.9.9')).toBe(true);
			expect(version_greater_than('1.2.3', '1.2.3')).toBe(false);
			expect(version_greater_than('a.b.c', '1.0.0')).toBe(false);
		});
		it('version_greater_equal_to allows equality', () => {
			expect(version_greater_equal_to('1.2.3', '1.2.3')).toBe(true);
			expect(version_greater_equal_to('1.2.2', '1.2.3')).toBe(false);
		});
	});

	it('recreate deep clones without sharing references', () => {
		const original = { a: 1, b: [2, 3] };
		const clone = recreate(original);
		expect(clone).toEqual(original);
		expect(clone).not.toBe(original);
		expect(clone.b).not.toBe(original.b);
	});

	it('json_catch wraps Errors but passes values through', () => {
		const err = new Error('boom');
		expect(json_catch(err)).toEqual({ error: err });
		expect(json_catch({ a: 1 })).toEqual({ a: 1 });
	});

	it('safe_date_iso falls back to epoch on invalid dates', () => {
		expect(safe_date_iso(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
		expect(safe_date_iso(new Date('not a date'))).toBe('1970-01-01T00:00:00.000Z');
	});

	it('file extension helpers read and fall back', () => {
		expect(has_file_extension('song.mp3')).toBe(true);
		expect(has_file_extension('song')).toBe(false);
		expect(extract_file_extension('FILE.TXT')).toBe('.txt');
		expect(extract_file_extension('noext', 'photo')).toBe('.jpg');
		expect(extract_file_extension('noext')).toBe('.txt');
	});

	it('batch_requests resolves every fn in order', async () => {
		const fns = [1, 2, 3, 4, 5].map(n => () => Promise.resolve(n));
		expect(await batch_requests(fns, 2)).toEqual([1, 2, 3, 4, 5]);
	});

	it('get_main_key returns the first key', () => {
		expect(get_main_key({ a: 1, b: 2 })).toBe('a');
	});

	it('seeded_random_of is deterministic for a fixed generator', () => {
		const gen = () => 0.5;
		expect(seeded_random_of(gen, ['a', 'b', 'c', 'd'])).toBe('c');
	});
});

describe('clean_util.ts', () => {
	it('remove strips each target once for strings, all for globals', () => {
		expect(remove('a-b-c', '-')).toBe('ab-c');
		expect(remove('aXbXc', /X/g)).toBe('abc');
	});
	it('remove_topic drops the topic suffix and handle', () => {
		expect(remove_topic('Artist - Topic')).toBe('Artist');
		expect(remove_topic('Song (@handle)')).toBe('Song ');
	});
});

describe('parse_util.ts', () => {
	it('parse_time reads clock strings into seconds', () => {
		expect(parse_time('1:30')).toBe(90);
		expect(parse_time('1:00:00')).toBe(3600);
		expect(parse_time(undefined)).toBeNaN();
	});
	it('parse_runs concatenates run text', () => {
		expect(parse_runs([{ text: 'a' }, { text: 'b' }])).toBe('a b');
		expect(parse_runs([{ text: 'a' }, { text: 'b' }], ',')).toBe('a,b');
		expect(parse_runs(undefined)).toBe('');
	});
	it('parse_pdf_date parses the D: prefix and falls back otherwise', () => {
		expect(parse_pdf_date('D:20230115120000').getFullYear()).toBe(2023);
		expect(parse_pdf_date('garbage').getTime()).toBe(0);
	});
	it('force_json_parse returns defaults on failure', () => {
		expect(force_json_parse('{"a":1}')).toEqual({ a: 1 });
		expect(force_json_parse('nope')).toEqual({});
		expect(force_json_parse_array('[1,2]')).toEqual([1, 2]);
		expect(force_json_parse_array('nope')).toEqual([]);
	});
	it('try_json_parse returns an error object on failure', () => {
		expect(try_json_parse('{"a":1}')).toEqual({ a: 1 });
		expect(try_json_parse('nope')).toHaveProperty('error');
	});
	it('try_json_eval evaluates loose object literals', () => {
		expect(try_json_eval('{a:1}')).toEqual({ a: 1 });
	});
});

describe('cookie_util.ts', () => {
	it('Cookie.fromString parses name, value and attributes', () => {
		const cookie = Cookie.fromString('name=value; Domain=example.com; Path=/; Secure; HttpOnly');
		const data = cookie.getData();
		expect(data.name).toBe('name');
		expect(data.value).toBe('value');
		expect(data.domain).toBe('example.com');
		expect(data.path).toBe('/');
		expect(data.secure).toBe(true);
		expect(data.http_only).toBe(true);
	});
	it('Cookie.fromString keeps equals signs inside the value', () => {
		expect(Cookie.fromString('token=a=b=c').getData().value).toBe('a=b=c');
	});
	it('Cookie.toString serializes name=value', () => {
		expect(Cookie.fromString('a=1').toString()).toBe('a=1');
	});
	it('hasExpired compares against the expiry date', () => {
		expect(Cookie.fromString('a=1; Expires=Thu, 01 Jan 2099 00:00:00 GMT').hasExpired()).toBe(false);
		expect(Cookie.fromString('a=1; Expires=Thu, 01 Jan 2000 00:00:00 GMT').hasExpired()).toBe(true);
		expect(Cookie.fromString('a=1').hasExpired()).toBe(false);
	});
	it('CookieJar.fromString builds a lookupable jar', () => {
		const jar = CookieJar.fromString('a=1; b=2');
		expect(jar.hasCookieName('a')).toBe(true);
		expect(jar.hasCookieName('z')).toBe(false);
		expect(jar.getCookie('b')?.toString()).toBe('b=2');
		expect(jar.toString()).toBe('a=1; b=2');
	});
	it('CookieJar dedupes by name keeping the first', () => {
		expect(CookieJar.fromStrings(['a=1', 'a=2']).getCookie('a')?.toString()).toBe('a=1');
	});
	it('merge replaces existing cookies and appends new ones', () => {
		const jar = CookieJar.fromStrings(['a=1', 'b=2']);
		jar.merge(CookieJar.fromStrings(['a=99', 'c=3']));
		expect(jar.getCookie('a')?.toString()).toBe('a=99');
		expect(jar.getCookie('b')?.toString()).toBe('b=2');
		expect(jar.hasCookieName('c')).toBe(true);
	});
});

describe('compress_util.ts', () => {
	it('string compression round-trips', () => {
		expect(decompress_base64_to_string(compress_string_to_base64('hello world'))).toBe('hello world');
	});
	it('object compression round-trips', () => {
		const obj = { a: 1, b: 'x', c: [1, 2, 3] };
		expect(decompress_object(compress_object(obj))).toEqual(obj);
	});
});

describe('fetch_util.ts', () => {
	it('google_query encodes and plus-joins spaces', () => {
		expect(google_query('hello world')).toBe('hello+world');
		expect(google_query('a&b')).toBe('a%26b');
	});
	it('encode_params builds a query string', () => {
		expect(encode_params({ a: 1, b: 'x y' })).toBe('a=1&b=x%20y');
		expect(encode_params({ a: 1 }, ['k', 'v'])).toBe('a=1&k=v');
		expect(encode_params({ a: { x: 1 } })).toBe('a=' + encodeURIComponent(JSON.stringify({ x: 1 })));
	});
});
