import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult, ResponseError } from '@common/types';
import { encode_params } from '@common/utils/fetch_util';
import { generror } from '@common/utils/error_util';
import { Buffer } from 'buffer/';
import { inflateSync } from 'zlib';
import type { KuGouDownloadResponse, KuGouLyrics, KuGouLyricsCandidate, KuGouLyricsSearchParams, KuGouLyricsSearchResponse, KuGouSong, KuGouSongSearchResponse } from './types';

export namespace KuGou {
	const SONG_SEARCH_URL = 'http://msearchcdn.kugou.com/api/v3/search/song';
	const LYRICS_URL = 'https://krcs.kugou.com';
	const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
	const KRC_KEY = [0x40, 0x47, 0x61, 0x77, 0x5e, 0x32, 0x74, 0x47, 0x51, 0x36, 0x31, 0x2d, 0xce, 0xd2, 0x6e, 0x69];

	type Opts = BaseOpts;

	const is_response_error = (value: unknown): value is ResponseError => typeof value === 'object' && value !== null && 'error' in value && typeof value.error === 'object';

	/** Wrapped: KuGou bodies carry an `error` string of their own, which would read as a lib-origin error. */
	async function get_json<T>(url: string, opts: Opts): PromiseResult<{ body: T }> {
		const response = await rozfetch<T>(url, { headers: { 'User-Agent': USER_AGENT }, ...opts.fetch_opts });
		if ('error' in response) return response;
		const json: unknown = await response.json();
		if (is_response_error(json)) return json;
		return { body: json as T };
	}

	export async function search_songs(keyword: string, opts: Opts = {}, page_size = 10): PromiseResult<KuGouSong[]> {
		const query = encode_params({ keyword, pagesize: page_size, page: 1, plat: 0, version: 9108 });
		const fetched = await get_json<KuGouSongSearchResponse>(`${SONG_SEARCH_URL}?${query}`, opts);
		if ('error' in fetched) return fetched;
		const response = fetched.body;
		if (response.status !== 1) return generror(`KuGou song search failed with status ${response.status}`, 'LOW', { keyword, errcode: response.errcode });
		return response.data?.info ?? [];
	}

	export async function search_lyrics(params: KuGouLyricsSearchParams, opts: Opts = {}): PromiseResult<KuGouLyricsCandidate[]> {
		const query = encode_params({
			ver: 1, man: 'yes', client: 'mobi', keyword: params.keyword,
			...(params.duration_ms ? { duration: Math.round(params.duration_ms) } : {}),
			...(params.hash ? { hash: params.hash } : {})
		});
		const fetched = await get_json<KuGouLyricsSearchResponse>(`${LYRICS_URL}/search?${query}`, opts);
		if ('error' in fetched) return fetched;
		const response = fetched.body;
		if (response.status !== 200) return generror(`KuGou lyrics search failed with status ${response.status}`, 'LOW', { params, errmsg: response.errmsg });
		return response.candidates ?? [];
	}

	/** Decrypts a downloaded KRC file: a 4-byte `krc1` header, then zlib data XORed with a fixed key. Throws on bad input. */
	export function decrypt_krc(data: Uint8Array): string {
		const body = data.subarray(4).map((b, i) => b ^ KRC_KEY[i % KRC_KEY.length]);
		return Buffer.from(inflateSync(body)).toString('utf8');
	}

	/** Downloads one candidate. `krc` (the default) is word-synced; `lrc` is line-synced. */
	export async function download_lyrics(candidate: Pick<KuGouLyricsCandidate, 'id' | 'accesskey'>, fmt: 'krc' | 'lrc' = 'krc', opts: Opts = {}): PromiseResult<KuGouLyrics> {
		const query = encode_params({ ver: 1, client: 'pc', id: candidate.id, accesskey: candidate.accesskey, fmt, charset: 'utf8' });
		const fetched = await get_json<KuGouDownloadResponse>(`${LYRICS_URL}/download?${query}`, opts);
		if ('error' in fetched) return fetched;
		const response = fetched.body;
		if (response.status !== 200 || !response.content) return generror(`KuGou lyrics download failed with status ${response.status}`, 'LOW', { id: candidate.id, info: response.info });
		const bytes = Buffer.from(response.content, 'base64');
		if (response.contenttype === 2) return { format: 'PLAIN', text: bytes.toString('utf8') };
		if (fmt === 'lrc') return { format: 'LRC', text: bytes.toString('utf8').replace(/^\uFEFF/u, '') };
		try {
			return { format: 'KRC', text: decrypt_krc(Uint8Array.from(bytes)) };
		} catch (err) {
			return generror(`KuGou: failed to decrypt KRC: ${err instanceof Error ? err.message : String(err)}`, 'LOW', { id: candidate.id });
		}
	}
}
