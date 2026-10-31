import Innertube, { ClientType, Log } from 'youtubei.js';
import type { CookieJar } from '@common/utils/cookie_util';
import type { RoZFetchRequestInit } from '@common/rozfetch';
import { RCache } from '@origin/youtube/rcache';
import { fs, load_native_fs } from '@native/fs/fs';

export namespace YouTubeSession {
	export interface Opts { cookie_jar?: CookieJar; fetch_opts?: RoZFetchRequestInit }
	export interface Config { retrieve_player?: boolean }

	let preloaded_cookies: string | undefined;
	const session_cache = new Map<string, Promise<Innertube>>();
	const botguard_cache = new Map<string, Innertube['botguard']>();

	export function preload_cookies(cookie?: string) {
		preloaded_cookies = cookie ?? (typeof process !== 'undefined' ? process?.env?.YOUTUBE_COOKIE_JAR : undefined);
	}

	function resolve_cookie(opts: Opts): string | undefined {
		const jar = opts.cookie_jar?.toString();
		return jar !== undefined && jar !== '' ? jar : preloaded_cookies;
	}

	function cache_key(cookie: string | undefined, client_type: ClientType, retrieve_player: boolean): string {
		return `${client_type}|${retrieve_player ? 'p' : ''}|${cookie ?? ''}`;
	}

	async function create_session(opts: Opts, client_type: ClientType, retrieve_player: boolean): Promise<Innertube> {
		Log.setLevel(Log.Level.NONE);
		await load_native_fs();
		const cookie = resolve_cookie(opts);
		return await Innertube.create({
			client_type,
			cache: new RCache(true, await fs().temp_directory()),
			cookie,
			retrieve_player
		});
	}

	export async function get(opts: Opts, client_type: ClientType = ClientType.WEB, config: Config = {}): Promise<Innertube> {
		const retrieve_player = config.retrieve_player ?? false;
		const key = cache_key(resolve_cookie(opts), client_type, retrieve_player);
		let session = session_cache.get(key);
		if (session === undefined) {
			session = create_session(opts, client_type, retrieve_player);
			session_cache.set(key, session);
		}
		botguard_cache.set(key, (await session).botguard);
		return await session;
	}

	export async function get_botguard(opts: Opts, client_type: ClientType = ClientType.WEB, config: Config = {}): Promise<Innertube['botguard']> {
		const retrieve_player = config.retrieve_player ?? false;
		const key = cache_key(resolve_cookie(opts), client_type, retrieve_player);
		let botguard = botguard_cache.get(key);
		if (!botguard) {
			await get(opts, client_type, config);
			botguard = botguard_cache.get(key);
		}
		return botguard!;
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

	export function refresh(opts: Opts, client_type: ClientType = ClientType.WEB, config: Config = {}) {
		session_cache.delete(cache_key(resolve_cookie(opts), client_type, config.retrieve_player ?? false));
	}

	export function clear() {
		session_cache.clear();
	}
}
