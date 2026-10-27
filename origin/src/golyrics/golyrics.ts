import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult, ResponseError } from '@common/types';
import { encode_params } from '@common/utils/fetch_util';
import { generror } from '@common/utils/error_util';
import { parse_ttml } from '@common/utils/ttml_util';
import type { GoLyricsError, GoLyricsOpts, GoLyricsParams, GoLyricsResponse, GoLyricsResult } from './types';

export namespace GoLyrics {
	const BASE_URL = 'https://api.betterlyrics.org/getLyrics';
	const USER_AGENT = 'LIB_ORIGIN v21.0.0 (https://github.com/Illusion137/lib-origin)';

	type Opts = BaseOpts & GoLyricsOpts;

	export async function get_ttml(params: GoLyricsParams, opts: Opts = {}): PromiseResult<string> {
		const query = encode_params({ s: params.song, a: params.artist, al: params.album, d: Math.round(params.duration) });
		const response = await rozfetch<GoLyricsResponse | GoLyricsError>(`${BASE_URL}?${query}`, {
			headers: { 'User-Agent': USER_AGENT, ...(opts.api_key ? { 'X-API-Key': opts.api_key } : {}) },
			ignore_fail_request: true,
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		if (!response.ok) {
			const body = await response.json();
			const api_error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? (body as unknown as GoLyricsError) : undefined;
			const message = api_error ? `${api_error.error}${api_error.message ? `: ${api_error.message}` : ''}` : `GoLyrics request failed with status ${response.status}`;
			return generror(message, response.status === 404 ? 'INFO' : 'LOW', { status: response.status, retry_after: response.headers.get('Retry-After'), cache_status: response.headers.get('X-Cache-Status'), params });
		}
		const data = await response.json();
		if ('error' in data && typeof data.error !== 'string') return data as ResponseError;
		if (!('ttml' in data) || typeof data.ttml !== 'string' || data.ttml.length === 0) return generror('GoLyrics: response contained no TTML', 'INFO', { params });
		return data.ttml;
	}

	export async function get_lyrics(params: GoLyricsParams, opts: Opts = {}): PromiseResult<GoLyricsResult> {
		const ttml = await get_ttml(params, opts);
		if (typeof ttml !== 'string') return ttml;
		const lyrics = parse_ttml(ttml);
		if (lyrics === undefined) return generror('GoLyrics: failed to parse TTML', 'LOW', { params });
		return { ttml, lyrics };
	}
}
