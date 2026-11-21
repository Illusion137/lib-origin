import { extract_string_from_pattern, random_between, random_of } from '@common/utils/util';
import type { Body, Children, LyricsPreloadedState } from '@origin/genius/types/Lyrics';
import type { Result, Search } from '@origin/genius/types/Search';
import { generror, generror_catch } from '@common/utils/error_util';
import { base_get_headers } from '@common/headers_base';
import rozfetch, { type RoZFetchRequestInit } from '@common/rozfetch';
import { try_json_eval, try_json_parse } from '@common/utils/parse_util';
import { CookieJar } from '@common/utils/cookie_util';

export namespace Genius {
	interface Opts { fetch_opts?: RoZFetchRequestInit }

	const first_impression = random_between(1723098160164, Date.now());
	const random_values = {
		search_engines: [
			{ name: 'google', referrer: 'https://www.google.com/', domain: 'www.google.com' },
			{ name: 'bing', referrer: 'https://www.bing.com/', domain: 'www.bing.com' },
			{ name: 'duckduckgo', referrer: 'https://duckduckgo.com/', domain: 'duckduckgo.com' }
		],
		tags: ['rap', 'rock', 'pop', 'rb', 'country'],
		user_agents: [
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
		],
		assembly_uids: [
			'd81ac3d8-a309-42b2-939e-a5232ff3e9a9',
			'3f6c1a52-7b0e-4d8a-9c14-5e2b8a7d6f01',
			'a2b9e4c7-1d35-4f60-8e72-c0d9b3a15f48'
		]
	};
	function random_mp(): string {
		const search_engine = random_of(random_values.search_engines);
		const mp = {
			'$search_engine': search_engine.name,
			'$initial_referrer': search_engine.referrer,
			'$initial_referring_domain': search_engine.domain,
			'AMP': false,
			'genius_platform': 'web',
			'Logged In': false,
			'Mobile Site': false,
			'Tag': random_of(random_values.tags),
			'user_agent': random_of(random_values.user_agents),
			'assembly_uid': random_of(random_values.assembly_uids)
		};
		return encodeURIComponent(JSON.stringify(mp));
	}

	const cookie_jar = CookieJar.fromString(`_genius_ab_test_cohort=57; _ab_tests_identifier=a6c83eb7-958b-409a-b099-6c60682babfc; _genius_ab_test_tonefuse_cohort=22; _genius_ab_test_tonefuse_interstitial_cohort=53; genius_outbrain_rollout_percentage=89; genius_first_impression=${first_impression}; mp_mixpanel__c=3; mp_77967c52dc38186cc1aadebdd19e2a82_mixpanel=${random_mp()}`);

	export async function setup_session() {
		const response = await rozfetch('https://genius.com', {
			headers: {
				...base_get_headers({}),
				cookie: cookie_jar.toString()
			},
			body: null,
			method: 'GET'
		});
		if ('error' in response) {
			// fallback session
			cookie_jar.merge(CookieJar.fromString('_csrf_token=%2FI%2Fiyte2gVlcsEED%2Fqd9VB8IukE3mGXBaZYaQjdVwL4%3D; _rapgenius_session=BAh7BzoPc2Vzc2lvbl9pZEkiJWQ1YmIwMDUyMzQ1ODkwODg3ZDc1MmNlYzc2M2JkYjc1BjoGRUY6EF9jc3JmX3Rva2VuSSIxL0kvaXl0ZTJnVmxjc0VFRC9xZDlWQjhJdWtFM21HWEJhWllhUWpkVndMND0GOwZG--fc4bc2e16237964102e5daa10c841ab0e40342d1'));
			return response;
		}
		cookie_jar.updateWithFetch(response);
		return null;
	}

	export async function search(query: string, opts: Opts & { per_page?: number }) {
		const search_response = await rozfetch<Search>(`https://genius.com/api/search/multi?per_page=${opts.per_page ?? 5}&q=${encodeURIComponent(query).split('%20').join('+')}`, {
			headers: {
				...base_get_headers({}),
				'accept': 'application/json, text/plain, */*',
				'x-requested-with': 'XMLHttpRequest',
				'cookie': cookie_jar.toString()
			},
			body: null,
			method: 'GET',
			...opts.fetch_opts
		});
		if ('error' in search_response) return search_response;
		const search_result = await search_response.json();
		return search_result;
	}
	export async function search_songs(query: string, opts: Opts) {
		const search_result = await search(query, opts);
		if ('error' in search_result) return search_result;

		const top_result_hits = search_result.response.sections.find(item => item.type === 'top_hit')?.hits;
		const song_top_result_hits = top_result_hits?.filter(hit => hit.index === 'song');

		const all_songs = song_top_result_hits ?? [];
		const song_hits = search_result.response.sections.find(item => item.type === 'song')?.hits;
		return all_songs.concat(song_hits ?? []);
	}
	const lyrics_fail_message = 'Failed to fetch lyrics for song';
	export const lyrics_no_continue_fail_message = 'Failed to fetch lyrics for song + no continues';
	export async function get_lyrics_preloaded_state(search_result: Result, opts: Opts) {
		try {
			const lyric_response = await rozfetch(`https://genius.com${search_result.path}`, {
				headers: {
					...base_get_headers({}),
					cookie: cookie_jar.toString()
				},
				referrerPolicy: 'strict-origin-when-cross-origin',
				body: null,
				method: 'GET',
				...opts.fetch_opts
			});
			if ('error' in lyric_response) return lyric_response;
			cookie_jar.updateWithFetch(lyric_response);
			const html: string = await lyric_response.text();
			const extract_preloaded_state = /window\.__PRELOADED_STATE__ ?= ?JSON.parse\(('.+?')\);/gis;
			const preloaded_state_string = extract_string_from_pattern(html, extract_preloaded_state, 'MEDIUM');
			if (typeof preloaded_state_string === 'object') return generror(lyrics_fail_message, 'CRITICAL', { path: search_result.path });
			const eval_preloaded_state_string = try_json_eval<string>(preloaded_state_string);
			if (typeof eval_preloaded_state_string === 'object') return eval_preloaded_state_string;
			const preloaded_state = try_json_parse<LyricsPreloadedState>(eval_preloaded_state_string);
			if ('error' in preloaded_state) return generror(lyrics_fail_message, 'CRITICAL', { path: search_result.path });
			return preloaded_state;
		} catch (e) {
			return generror_catch(e, lyrics_no_continue_fail_message, 'MEDIUM', {});
		}
	}
	export function parse_preloaded_state_lyrics(preloaded_state: LyricsPreloadedState) {
		try {
			return parse_lyrics_body(preloaded_state.songPage.lyricsData.body);
		} catch (e) {
			return generror_catch(e, 'Error in parsing Genius preloaded state', 'CRITICAL');
		}
	}
	export function parse_lyrics_body(body: Body | string | undefined | null) {
		try {
			const all_strings: string[][] = [];
			const parsed_body = typeof body === 'string' ? try_json_parse<Body>(body) : body;
			if (parsed_body !== undefined && parsed_body !== null && 'error' in parsed_body) return parsed_body;
			const initial_children: Children[] = parsed_body?.children as unknown as Children[];
			if (initial_children === undefined) return generror('Genius preloaded state is empty; likely no lyrics for this track', 'INFO');
			function recursive_parse(child: Children | string, collected: string[]): string[] {
				if (typeof child === 'string') return collected.concat([child]);
				if (typeof child === 'object' && 'children' in child) {
					return collected.concat(child.children.map(c => recursive_parse(c, [])).flat());
				}
				if (typeof child === 'object' && 'tag' in child && !('children' in child)) {
					if ((child as { tag: string }).tag === 'br') return collected.concat(['\n']);
					return collected.concat(['']);
				}
				return collected.concat(['']);
			}
			all_strings.push(...initial_children.map(c => recursive_parse(c, [])));
			return all_strings.flat().join('');
		} catch (e) {
			return generror_catch(e, 'Error in parsing Genius preloaded state', 'CRITICAL');
		}
	}
	export async function get_lyrics(search_result: Result, opts: Opts) {
		const preloaded_state = await get_lyrics_preloaded_state(search_result, opts);
		if ('error' in preloaded_state) return preloaded_state;
		return { lyrics: parse_preloaded_state_lyrics(preloaded_state), preloaded_state };
	}
}
