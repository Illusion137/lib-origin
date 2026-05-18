import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { generror } from "@common/utils/error_util";
import { extract_string_from_pattern, urlid } from "@common/utils/util";
import type { TidalAlbum, TidalArtist, TidalList, TidalPlaylist, TidalSearchResult, TidalTrack } from "@origin/tidal/types";

export type { TidalAlbum, TidalArtist, TidalList, TidalPlaylist, TidalSearchResult, TidalTrack } from "@origin/tidal/types";

export namespace Tidal {
	const BASE_URL = "https://api.tidal.com/v1";
	const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
	const DEFAULT_COUNTRY = "US";
	const token_cache = { token: null as string | null, enabled: true };

	type Opts = BaseOpts & { country_code?: string };

	export function enable_cache(enable: boolean) { token_cache.enabled = enable; }
	export function token_cache_full() { return token_cache.enabled && token_cache.token !== null; }

	export async function get_client_token(opts: Opts): PromiseResult<string> {
		if (token_cache_full()) return token_cache.token!;
		const response = await rozfetch("https://listen.tidal.com/", {
			method: "GET",
			headers: {
				"User-Agent": USER_AGENT,
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9",
				...(opts.cookie_jar ? { "Cookie": opts.cookie_jar.toString() } : {})
			},
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		const html = await response.text();
		const script_src = extract_string_from_pattern(html, /<script[^>]+src="([^"]+\/main\.[^"]+\.js)"/, "INFO");
		if (typeof script_src === "string") {
			const script_response = await rozfetch(script_src.startsWith("http") ? script_src : `https://listen.tidal.com${script_src}`, {
				method: "GET",
				headers: { "User-Agent": USER_AGENT }
			});
			if (!("error" in script_response)) {
				const js = await script_response.text();
				for (const pattern of [/clientId:"([^"]{10,})"/i, /client_id:"([^"]{10,})"/i, /"clientId"\s*:\s*"([^"]{10,})"/i]) {
					const found = extract_string_from_pattern(js, pattern, "INFO");
					if (typeof found === "string" && found.length > 5) {
						if (token_cache.enabled) token_cache.token = found;
						return found;
					}
				}
			}
		}
		for (const pattern of [/"clientId"\s*:\s*"([^"]{10,})"/i, /TIDAL_CLIENT_ID['"]\s*:\s*["']([^"']{10,})["']/i]) {
			const found = extract_string_from_pattern(html, pattern, "INFO");
			if (typeof found === "string" && found.length > 5) {
				if (token_cache.enabled) token_cache.token = found;
				return found;
			}
		}
		return generror("Could not extract Tidal client token from web player", "MEDIUM", { opts });
	}

	function api_headers(token: string, opts: Opts): Record<string, string> {
		const cookie_str = opts.cookie_jar?.toString();
		return {
			"User-Agent": USER_AGENT,
			"Accept": "application/json",
			"Accept-Language": "en-US,en;q=0.9",
			"X-Tidal-Token": token,
			"Origin": "https://listen.tidal.com",
			"Referer": "https://listen.tidal.com/",
			...(cookie_str ? { "Cookie": cookie_str } : {})
		};
	}

	export async function apiget<T>(path: string, params: Record<string, any> = {}, opts: Opts = {}): PromiseResult<T> {
		const token = await get_client_token(opts);
		if (typeof token === "object") return token;
		const country = opts.country_code ?? DEFAULT_COUNTRY;
		const query = encode_params({ countryCode: country, ...params });
		const response = await rozfetch<T>(`${BASE_URL}/${path}?${query}`, {
			method: "GET",
			headers: api_headers(token, opts),
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
