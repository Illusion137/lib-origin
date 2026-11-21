import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult } from '@common/types';
import { generror } from '@common/utils/error_util';
import type { LRCRedSong } from './types';

/** lrc.red (https://lrc.red): TTML lyrics keyed by ISRC. No key needed. */
export namespace LRCRed {
	const BASE_URL = 'https://lrc.red';
	const USER_AGENT = 'LIB_ORIGIN v21.0.0 (https://github.com/Illusion137/lib-origin)';

	type Opts = BaseOpts;

	/** `CC-XXX-YY-NNNNN` in any case, hyphens or spaces optional; null when it isn't an ISRC. */
	export function normalize_isrc(isrc: string): string | null {
		const normalized = isrc.replace(/[\s-]/gu, '').toUpperCase();
		return /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/u.test(normalized) ? normalized : null;
	}

	async function get<T = never>(isrc: string, extension: string, accept: string, opts: Opts) {
		const id = normalize_isrc(isrc);
		if (!id) return generror('lrc.red: not a valid ISRC', 'INFO', { isrc });
		const response = await rozfetch<T>(`${BASE_URL}/s/${id}.${extension}`, {
			headers: { 'User-Agent': USER_AGENT, 'Accept': accept },
			ignore_fail_request: true,
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		if (response.status === 404) return generror('lrc.red: lyrics not found', 'INFO', { isrc: id, status: 404 });
		if (!response.ok) return generror(`lrc.red request failed with status ${response.status}`, 'LOW', { isrc: id, status: response.status });
		return response;
	}

	export async function get_ttml(isrc: string, opts: Opts = {}): PromiseResult<string> {
		const response = await get(isrc, 'ttml', 'application/ttml+xml', opts);
		if ('error' in response) return response;
		const ttml = await response.text();
		return ttml.trim() ? ttml : generror('lrc.red: lyrics not found', 'INFO', { isrc });
	}

	/** Song metadata plus the TTML (`source`), in one request. */
	export async function get_song(isrc: string, opts: Opts = {}): PromiseResult<LRCRedSong> {
		const response = await get<LRCRedSong>(isrc, 'song.json', 'application/json', opts);
		if ('error' in response) return response;
		return await response.json();
	}
}
