import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult } from '@common/types';
import { encode_params } from '@common/utils/fetch_util';
import { generror } from '@common/utils/error_util';
import { parse_ttml } from '@common/utils/ttml_util';
import type { BiniLyricsResult, BiniSearchParams, BiniSearchResponse } from './types';

export namespace BiniLyrics {
	const BASE_URL = 'https://lyrics-api.binimum.org/';
	const USER_AGENT = 'Illusi (https://github.com/Illusion137/lib-origin) raygoza.d@hotmail.com';

	type Opts = BaseOpts;

	export async function search(params: BiniSearchParams, opts: Opts = {}): PromiseResult<BiniSearchResponse> {
		const query = encode_params(params as Record<string, unknown>);
		const response = await rozfetch<BiniSearchResponse>(`${BASE_URL}?${query}`, {
			headers: { 'User-Agent': USER_AGENT },
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		return await response.json();
	}

	export async function get_ttml(lyrics_url: string, opts: Opts = {}): PromiseResult<string> {
		const response = await rozfetch(lyrics_url, {
			headers: { 'User-Agent': USER_AGENT },
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		return await response.text();
	}

	export async function get_lyrics(params: BiniSearchParams, opts: Opts = {}): PromiseResult<BiniLyricsResult> {
		const response = await search(params, opts);
		if ('error' in response) return response;
		const hit = response.results?.[0];
		if (!hit?.lyricsUrl) return generror('BiniLyrics: no results found', 'INFO', { params });
		const ttml = await get_ttml(hit.lyricsUrl, opts);
		if (typeof ttml !== 'string') return ttml;
		const lyrics = parse_ttml(ttml);
		if (lyrics === undefined) return generror('BiniLyrics: failed to parse TTML', 'LOW', { params, lyricsUrl: hit.lyricsUrl });
		return { hit, ttml, lyrics };
	}
}
