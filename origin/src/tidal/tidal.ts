import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { urlid } from "@common/utils/util";
import type { TidalAlbum, TidalArtist, TidalList, TidalPlaylist, TidalSearchResult, TidalTrack } from "@origin/tidal/types";

export type { TidalAlbum, TidalArtist, TidalList, TidalPlaylist, TidalSearchResult, TidalTrack } from "@origin/tidal/types";

export namespace Tidal {
	const BASE_URL = "https://api.tidal.com/v1";
	const WEB_URL = "https://tidal.com";
	const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";
	const CLIENT_VERSION = "2026.9.1";
	const FALLBACK_CLIENT_TOKEN = "txNoH4kkV41MfH25";
	const DEFAULT_COUNTRY = "US";
	const token_cache = { token: null as string | null, enabled: true };

	type Opts = BaseOpts & { country_code?: string, user_token?: string };

	export function enable_cache(enable: boolean) { token_cache.enabled = enable; }
	export function token_cache_full() { return token_cache.enabled && token_cache.token !== null; }

	function extract_client_token(js: string): string | null {
		const entry = /\[\s*(`[^`]+`|"[^"]+"|'[^']+'|[A-Za-z_$][\w$]*)\s*,\s*\{\s*authType\s*:\s*[`"']clientCredentials[`"']\s*,\s*env\s*:\s*[`"']PROD[`"']/.exec(js);
		if (entry === null) return null;
		const key = entry[1];
		const quoted = /^[`"'](.+)[`"']$/.exec(key);
		if (quoted !== null) return quoted[1];
		const resolved = new RegExp("\\b" + key + "\\s*=\\s*[`\"']([A-Za-z0-9_-]{8,})[`\"']").exec(js);
		return resolved !== null ? resolved[1] : null;
	}

	export async function get_client_token(opts: Opts): PromiseResult<string> {
		if (token_cache_full()) return token_cache.token!;
		const page = await rozfetch(`${WEB_URL}/`, {
			method: "GET",
			headers: {
				"User-Agent": USER_AGENT,
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9",
				...(opts.cookie_jar ? { "Cookie": opts.cookie_jar.toString() } : {})
			},
			...opts.fetch_opts
		});
		if (!("error" in page)) {
			const html = await page.text();
			const scripts = [...new Set([...html.matchAll(/\/assets\/(?:store|index)[A-Za-z0-9._-]*\.js/g)].map(m => m[0]))];
			scripts.sort((a, b) => (a.includes("store") ? 0 : 1) - (b.includes("store") ? 0 : 1));
			for (const src of scripts.slice(0, 6)) {
				const asset = await rozfetch(`${WEB_URL}${src}`, { method: "GET" });
				if ("error" in asset) continue;
				const token = extract_client_token(await asset.text());
				if (token !== null) {
					if (token_cache.enabled) token_cache.token = token;
					return token;
				}
			}
		}
		return FALLBACK_CLIENT_TOKEN;
	}

	function api_headers(token: string, url: string, opts: Opts): Record<string, string> {
		const cookie_str = opts.cookie_jar?.toString();
		const headers: Record<string, string> = {
			"User-Agent": USER_AGENT,
			"Accept": "application/json",
			"Accept-Language": "en-US,en;q=0.9",
			"Origin": WEB_URL,
			"Referer": `${WEB_URL}/`,
			...(cookie_str ? { "Cookie": cookie_str } : {})
		};
		if (url.includes("/v2")) headers["x-tidal-client-version"] = CLIENT_VERSION;
		if (opts.user_token) headers.Authorization = `Bearer ${opts.user_token}`;
		else headers["X-Tidal-Token"] = token;
		return headers;
	}

	export async function apiget<T>(path: string, params: Record<string, any> = {}, opts: Opts = {}): PromiseResult<T> {
		const token = await get_client_token(opts);
		if (typeof token === "object") return token;
		const country = opts.country_code ?? DEFAULT_COUNTRY;
		const query = encode_params({ countryCode: country, ...params });
		const url = `${BASE_URL}/${path}?${query}`;
		const response = await rozfetch<T>(url, {
			method: "GET",
			headers: api_headers(token, url, opts),
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		return await response.json();
	}

	export function url_to_id(url: string): string {
		return urlid(url, "tidal.com/", "listen.tidal.com/", "browse/", "track/", "album/", "playlist/", "artist/", /\?.*/);
	}

	export async function search(opts: Opts & { query: string, types?: string[], limit?: number, offset?: number }): PromiseResult<TidalSearchResult> {
		return apiget("search", {
			query: opts.query,
			types: (opts.types ?? ["TRACKS", "ALBUMS", "ARTISTS", "PLAYLISTS"]).join(","),
			limit: opts.limit ?? 20,
			offset: opts.offset ?? 0
		}, opts);
	}

	export async function get_track(opts: Opts & { track_id: string | number }): PromiseResult<TidalTrack> {
		return apiget(`tracks/${url_to_id(String(opts.track_id))}`, {}, opts);
	}

	export async function get_album(opts: Opts & { album_id: string | number }): PromiseResult<TidalAlbum> {
		return apiget(`albums/${url_to_id(String(opts.album_id))}`, {}, opts);
	}

	export async function get_album_tracks(opts: Opts & { album_id: string | number, limit?: number, offset?: number }): PromiseResult<TidalList<TidalTrack>> {
		return apiget(`albums/${url_to_id(String(opts.album_id))}/tracks`, {
			limit: opts.limit ?? 100,
			offset: opts.offset ?? 0
		}, opts);
	}

	export async function get_playlist(opts: Opts & { playlist_uuid: string }): PromiseResult<TidalPlaylist> {
		return apiget(`playlists/${url_to_id(opts.playlist_uuid)}`, {}, opts);
	}

	export async function get_playlist_tracks(opts: Opts & { playlist_uuid: string, limit?: number, offset?: number }): PromiseResult<TidalList<TidalTrack>> {
		return apiget(`playlists/${url_to_id(opts.playlist_uuid)}/tracks`, {
			limit: opts.limit ?? 100,
			offset: opts.offset ?? 0
		}, opts);
	}

	export async function get_artist(opts: Opts & { artist_id: string | number }): PromiseResult<TidalArtist> {
		return apiget(`artists/${url_to_id(String(opts.artist_id))}`, {}, opts);
	}

	export async function get_artist_top_tracks(opts: Opts & { artist_id: string | number, limit?: number, offset?: number }): PromiseResult<TidalList<TidalTrack>> {
		return apiget(`artists/${url_to_id(String(opts.artist_id))}/toptracks`, {
			limit: opts.limit ?? 20,
			offset: opts.offset ?? 0
		}, opts);
	}

	export async function get_artist_albums(opts: Opts & { artist_id: string | number, limit?: number, offset?: number }): PromiseResult<TidalList<TidalAlbum>> {
		return apiget(`artists/${url_to_id(String(opts.artist_id))}/albums`, {
			limit: opts.limit ?? 20,
			offset: opts.offset ?? 0
		}, opts);
	}
}
