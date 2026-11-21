import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult, ResponseError } from '@common/types';
import { generror } from '@common/utils/error_util';
import crypto from 'react-native-quick-crypto';
import { decrypt_qrc } from './qrc';
import type { QQMusicLyricBody, QQMusicLyrics, QQMusicSearchBody, QQMusicSong } from './types';

export namespace QQMusic {
	const API_URL = 'https://u.y.qq.com/cgi-bin/musics.fcg';
	const VERSION = 13020508;
	const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
	const SCRAMBLE = [89, 39, 179, 150, 218, 82, 58, 252, 177, 52, 186, 123, 120, 64, 242, 133, 143, 161, 121, 179];

	type Opts = BaseOpts;
	type Envelope<T> = { code?: number } & Record<string, { code?: number; data?: T } | number | undefined>;

	/** The `sign` query parameter: derived from the SHA-1 of the exact request body. */
	export function sign(body: string): string {
		const hash = crypto.createHash('sha1').update(body).digest('hex').toUpperCase();
		const pick = (indices: number[]) => indices.map(i => hash[i]).join('');
		const xored = SCRAMBLE.map((s, i) => s ^ parseInt(hash.slice(i * 2, i * 2 + 2), 16));
		const b64 = btoa(String.fromCharCode(...xored)).replace(/[/+=]/gu, '');
		return `zzc${pick([23, 14, 6, 36, 16, 7, 19])}${b64}${pick([16, 1, 32, 12, 19, 27, 8, 5])}`.toLowerCase();
	}

	async function call<T>(module: string, method: string, param: Record<string, unknown>, opts: Opts): PromiseResult<T> {
		const key = `${module}.${method}`;
		const wid = Array.from({ length: 32 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
		const comm = { wid, cv: VERSION, v: VERSION, QIMEI36: '8888888888888888', ct: '11', tmeAppID: 'qqmusic', format: 'json', inCharset: 'utf-8', outCharset: 'utf-8', uid: '3931641530' };
		const body = JSON.stringify({ comm, [key]: { module, method, param } });
		const response = await rozfetch<Envelope<T>>(`${API_URL}?sign=${sign(body)}`, {
			method: 'POST',
			body,
			headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/json', 'Referer': 'https://y.qq.com/', 'Origin': 'https://y.qq.com' },
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		const json = await response.json();
		if ('error' in json) return json as ResponseError;
		const part = json[key];
		const code = typeof part === 'object' ? part.code : json.code;
		if (json.code !== 0 || typeof part !== 'object' || part.code !== 0 || part.data === undefined) return generror(`QQ Music ${method} failed with code ${code}`, 'LOW', { module, method, code });
		return part.data;
	}

	/** Songs for a free-text query. The desktop search: the mobile one hides most non-Chinese catalog outside China. */
	export async function search_songs(query: string, opts: Opts = {}, count = 10): PromiseResult<QQMusicSong[]> {
		const data = await call<QQMusicSearchBody>('music.search.SearchCgiService', 'DoSearchForQQMusicDesktop', {
			searchid: String(Math.floor(Math.random() * 1e15)), query, search_type: 0, num_per_page: count, page_num: 1, highlight: 0, grp: 1
		}, opts);
		if ('error' in data) return data;
		const songs = data.body?.item_song?.length ? data.body.item_song : data.body?.song?.list ?? [];
		if (songs.length === 0 && data.meta?.is_filter === -11) return generror('QQ Music: too many requests (search results withheld)', 'LOW', { query, meta: data.meta });
		return songs;
	}

	/** A song's lyrics: word-synced QRC when QQ Music has it, otherwise line-synced LRC. */
	export async function get_lyrics(song_mid: string, opts: Opts = {}): PromiseResult<QQMusicLyrics> {
		const data = await call<QQMusicLyricBody>('music.musichallSong.PlayLyricInfo', 'GetPlayLyricInfo', {
			crypt: 1, ct: 11, cv: VERSION, lrc_t: 0, qrc: 1, qrc_t: 0, roma: 0, roma_t: 0, trans: 0, trans_t: 0, type: 1, songMid: song_mid
		}, opts);
		if ('error' in data) return data;
		const lyric = typeof data.lyric === 'string' ? data.lyric.trim() : '';
		if (!lyric) return generror('QQ Music: no lyrics found', 'INFO', { song_mid });
		if (lyric.startsWith('[')) return { format: 'LRC', text: lyric };
		try {
			const text = decrypt_qrc(lyric);
			return { format: text.includes('LyricContent=') ? 'QRC' : 'LRC', text };
		} catch (err) {
			return generror(`QQ Music: failed to decrypt lyrics: ${err instanceof Error ? err.message : String(err)}`, 'LOW', { song_mid });
		}
	}
}
