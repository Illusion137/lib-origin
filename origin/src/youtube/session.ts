import Innertube, { ClientType, Log } from 'youtubei.js';
import type { CookieJar } from '@common/utils/cookie_util';
import type { RoZFetchRequestInit } from '@common/rozfetch';
import { RCache } from '@origin/youtube/rcache';
import { fs, load_native_fs } from '@native/fs/fs';

export namespace YouTubeSession {
	export interface Opts { cookie_jar?: CookieJar; fetch_opts?: RoZFetchRequestInit }

	let preloaded_cookies: string | undefined;
	const session_cache = new Map<string, Promise<Innertube>>();

	export function preload_cookies(cookie?: string) {
		preloaded_cookies = cookie ?? (typeof process !== 'undefined' ? process?.env?.YOUTUBE_COOKIE_JAR : undefined);
	}

	function resolve_cookie(opts: Opts): string | undefined {
		const jar = opts.cookie_jar?.toString();
		return jar !== undefined && jar !== '' ? jar : preloaded_cookies;
	}

	function cache_key(cookie: string | undefined, client_type: ClientType): string {
		return `${client_type}|${cookie ?? ''}`;
	}

	async function create_session(opts: Opts, client_type: ClientType): Promise<Innertube> {
		Log.setLevel(Log.Level.NONE);
		await load_native_fs();
		const cookie = resolve_cookie(opts);
		return await Innertube.create({
			client_type,
			cache: new RCache(true, await fs().temp_directory()),
			cookie,
			retrieve_player: false
		});
	}

	export async function get(opts: Opts, client_type: ClientType = ClientType.WEB): Promise<Innertube> {
		const key = cache_key(resolve_cookie(opts), client_type);
		let session = session_cache.get(key);
		if (session === undefined) {
			session = create_session(opts, client_type);
			session_cache.set(key, session);
			session.catch(() => session_cache.delete(key));
		}
		return await session;
	}

	export async function resolve_channel_id(opts: Opts, input: string): Promise<string> {
		const trimmed = input.trim();
		const channel_match = /\/channel\/(UC[A-Za-z0-9_-]{22})/.exec(trimmed);
		if (channel_match) return channel_match[1];
		if (/^UC[A-Za-z0-9_-]{22}$/.test(trimmed)) return trimmed;
		const handle_match = /(?:youtube\.com\/)?(@[A-Za-z0-9._-]+)/.exec(trimmed);
		if (handle_match) {
			const session = await get(opts);
			const resolved = await session.resolveURL(`https://www.youtube.com/${handle_match[1]}`);
			return resolved.payload.browseId as string;
		}
		return trimmed;
	}

	export function refresh(opts: Opts, client_type: ClientType = ClientType.WEB) {
		session_cache.delete(cache_key(resolve_cookie(opts), client_type));
	}

	export function clear() {
		session_cache.clear();
	}
}
