import rozfetch from '@common/rozfetch';
import type { BaseOpts, PromiseResult, ResponseError } from '@common/types';
import { encode_params } from '@common/utils/fetch_util';
import { generror } from '@common/utils/error_util';
import { try_json_parse } from '@common/utils/parse_util';
import type { MusixmatchEnvelope, MusixmatchFoundLyrics, MusixmatchLyricsBody, MusixmatchMacroBody, MusixmatchOpts, MusixmatchRichsyncBody, MusixmatchRichsyncLine, MusixmatchSubtitleBody, MusixmatchTokenBody, MusixmatchTrack, MusixmatchTrackBody, MusixmatchTrackParams, MusixmatchTrackSearchBody } from './types';
import { milliseconds_of } from '@common/utils/util';

export namespace Musixmatch {
	const BASE_URL = 'https://apic.musixmatch.com/ws/1.1';
	const APP_IDS = ['android-player-v1.0', 'mac-ios-v2.0'];
	const TOKEN_TTL_MS = milliseconds_of({ hours: 6 });
	const CAPTCHA_COOLDOWN_MS = milliseconds_of({ hours: 2 });
	const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
	const PLACEHOLDER_TRACK_ID = 115264642;
	const GUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
		const random = Math.floor(Math.random() * 16);
		return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
	});

	type Opts = BaseOpts & MusixmatchOpts;
	type SendResult<T> = T | ResponseError | 'captcha' | 'renew';

	const tokens = new Map<string, { value: string; expires_at: number }>();
	const captcha_until_ms = new Map<string, number>();

	function request_headers() {
		return { 'User-Agent': USER_AGENT, 'Accept': 'application/json', 'Accept-Language': 'en' };
	}

	async function send<T>(app_id: string, endpoint: string, params: Record<string, unknown>, usertoken: string | undefined, opts: Opts): Promise<SendResult<T>> {
		const query = encode_params({ app_id, format: 'json', user_language: 'en', guid: GUID, t: Date.now(), ...(usertoken === undefined ? {} : { usertoken }), ...params });
		const response = await rozfetch<MusixmatchEnvelope<T>>(`${BASE_URL}/${endpoint}?${query}`, {
			headers: request_headers(),
			ignore_fail_request: true,
			...opts.fetch_opts
		});
		if ('error' in response) return response;
		const json = await response.json();
		if ('error' in json) return json;
		const header = json.message.header;
		if (header.status_code === 401 && header.hint?.toLowerCase().includes('captcha')) return 'captcha';
		if (header.status_code === 401 || header.status_code === 403 || response.status === 403) return 'renew';
		if (header.status_code !== 200) return generror(`Musixmatch ${endpoint} failed with status ${header.status_code}`, header.status_code === 404 ? 'INFO' : 'LOW', { header, endpoint });
		const body = json.message.body;
		if (Array.isArray(body) || body === '' || body === undefined) return generror(`Musixmatch ${endpoint} returned an empty body`, 'INFO', { endpoint });
		return body;
	}

	async function app_token(app_id: string, opts: Opts): Promise<SendResult<string>> {
		const cached = tokens.get(app_id);
		if (cached && cached.expires_at > Date.now()) return cached.value;
		const body = await send<MusixmatchTokenBody>(app_id, 'token.get', {}, undefined, opts);
		if (typeof body === 'string' || 'error' in body) return body === 'renew' ? generror('Musixmatch refused the token request', 'LOW', { app_id }) : body;
		if (/^0*$/.test(body.user_token) || body.user_token.startsWith('UpgradeOnly')) return generror('Musixmatch issued an anonymous placeholder token', 'LOW', { app_id });
		tokens.set(app_id, { value: body.user_token, expires_at: Date.now() + TOKEN_TTL_MS });
		return body.user_token;
	}

	function mark_captcha(app_id: string) {
		tokens.delete(app_id);
		captcha_until_ms.set(app_id, Date.now() + CAPTCHA_COOLDOWN_MS);
	}

	async function request<T>(endpoint: string, params: Record<string, unknown>, opts: Opts): PromiseResult<T> {
		const apps = opts.usertoken ? [opts.app_id ?? APP_IDS[0]] : APP_IDS.filter(app_id => (captcha_until_ms.get(app_id) ?? 0) <= Date.now());
		if (apps.length === 0) return generror('Musixmatch captcha cooldown is active for every app id', 'INFO');
		for (const app_id of apps) {
			for (let attempt = 0; attempt < 2; attempt++) {
				const usertoken = opts.usertoken ?? await app_token(app_id, opts);
				if (usertoken === 'captcha') {
					mark_captcha(app_id);
					break;
				}
				if (typeof usertoken === 'object') return usertoken;
				if (usertoken === 'renew') break;
				const body = await send<T>(app_id, endpoint, params, usertoken, opts);
				if (body === 'captcha') {
					mark_captcha(app_id);
					break;
				}
				if (body === 'renew') {
					tokens.delete(app_id);
					if (opts.usertoken) return generror('Musixmatch rejected the provided usertoken', 'LOW', { endpoint });
					continue;
				}
				return body;
			}
		}
		return generror('Musixmatch is asking for a captcha on every app id', 'LOW', { endpoint });
	}

	export async function get_token(opts: Opts = {}): PromiseResult<string> {
		if (opts.usertoken) return opts.usertoken;
		for (const app_id of APP_IDS.filter(id => (captcha_until_ms.get(id) ?? 0) <= Date.now())) {
			const token = await app_token(app_id, opts);
			if (token === 'captcha') mark_captcha(app_id);
			else if (typeof token === 'string' && token !== 'renew') return token;
			else if (typeof token === 'object') return token;
		}
		return generror('Musixmatch could not issue a token', 'LOW');
	}

	export async function search_tracks(query: string | Partial<MusixmatchTrackParams>, opts: Opts = {}): PromiseResult<MusixmatchTrack[]> {
		const params = typeof query === 'string' ? { q: query } : query;
		const body = await request<MusixmatchTrackSearchBody>('track.search', { f_has_lyrics: 'true', page_size: 10, page: 1, s_track_rating: 'desc', ...params }, opts);
		if ('error' in body) return body;
		return body.track_list.map(item => item.track);
	}

	export async function match_track(params: MusixmatchTrackParams, opts: Opts = {}): PromiseResult<MusixmatchTrack> {
		const body = await request<MusixmatchTrackBody>('matcher.track.get', { ...params }, opts);
		if ('error' in body) return body;
		if (body.track.track_id === PLACEHOLDER_TRACK_ID) return generror('Musixmatch returned its placeholder track', 'INFO', { params });
		return body.track;
	}

	export async function get_lyrics(track_id: number, opts: Opts = {}) {
		return await request<MusixmatchLyricsBody>('track.lyrics.get', { track_id }, opts);
	}

	export async function get_subtitle(track_id: number, params: { subtitle_format?: 'lrc' | 'mxm'; duration?: number } = {}, opts: Opts = {}) {
		return await request<MusixmatchSubtitleBody>('track.subtitle.get', {
			track_id,
			subtitle_format: params.subtitle_format ?? 'lrc',
			...(params.duration === undefined ? {} : { f_subtitle_length: Math.round(params.duration), f_subtitle_length_max_deviation: 1 })
		}, opts);
	}

	export async function get_richsync(track_id: number, duration?: number, opts: Opts = {}): PromiseResult<MusixmatchRichsyncLine[]> {
		const body = await request<MusixmatchRichsyncBody>('track.richsync.get', {
			track_id,
			...(duration === undefined ? {} : { f_richsync_length: Math.round(duration), f_richsync_length_max_deviation: 1 })
		}, opts);
		if ('error' in body) return body;
		return try_json_parse<MusixmatchRichsyncLine[]>(body.richsync.richsync_body);
	}

	export async function get_macro_subtitles(params: MusixmatchTrackParams, opts: Opts = {}) {
		return await request<MusixmatchMacroBody>('macro.subtitles.get', {
			namespace: 'lyrics_richsynched',
			optional_calls: 'track.richsync',
			subtitle_format: 'lrc',
			...params
		}, opts);
	}

	function macro_body<T>(call: { message: { body: T | [] | '' } } | undefined): T | undefined {
		const body = call?.message.body;
		return body === undefined || Array.isArray(body) || body === '' ? undefined : body;
	}

	export function richsync_to_lrc(lines: MusixmatchRichsyncLine[]): string {
		const stamp = (seconds: number, brackets: '[]' | '<>') => {
			const centiseconds = Math.round(Math.max(seconds, 0) * 100);
			const minutes = Math.floor(centiseconds / 6000);
			const rest = centiseconds % 6000;
			return `${brackets[0]}${String(minutes).padStart(2, '0')}:${String(Math.floor(rest / 100)).padStart(2, '0')}.${String(rest % 100).padStart(2, '0')}${brackets[1]}`;
		};
		return lines.map(line => `${stamp(line.ts, '[]')}${line.l.map(word => `${stamp(line.ts + word.o, '<>')}${word.c}`).join('')}`).join('\n');
	}

	export async function find_lyrics(params: MusixmatchTrackParams, opts: Opts = {}): PromiseResult<MusixmatchFoundLyrics> {
		const macro = await get_macro_subtitles(params, opts);
		if ('error' in macro) return macro;
		const track = macro_body(macro.macro_calls['matcher.track.get'])?.track;
		if (track === undefined || track.track_id === PLACEHOLDER_TRACK_ID) return generror('Musixmatch found no matching track', 'INFO', { params });
		const plain = macro_body(macro.macro_calls['track.lyrics.get'])?.lyrics.lyrics_body;
		const synced = macro_body(macro.macro_calls['track.subtitles.get'])?.subtitle_list[0]?.subtitle.subtitle_body;
		const richsync = macro_body(macro.macro_calls['track.richsync.get'])?.richsync;
		let richsync_lines = richsync === undefined ? undefined : try_json_parse<MusixmatchRichsyncLine[]>(richsync.richsync_body);
		if (richsync_lines === undefined && track.has_richsync === 1) {
			const fetched = await get_richsync(track.track_id, params.q_duration, opts);
			if (!('error' in fetched)) richsync_lines = fetched;
		}
		if (richsync_lines !== undefined && 'error' in richsync_lines) richsync_lines = undefined;
		return { track, plain, synced, richsync: richsync_lines };
	}
}
