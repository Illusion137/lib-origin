import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { urlid } from "@common/utils/util";
import type { DeezerAlbum, DeezerArtist, DeezerList, DeezerPlaylist, DeezerSearch, DeezerTrack } from "@origin/deezer/types";

export type { DeezerAlbum, DeezerArtist, DeezerList, DeezerPlaylist, DeezerSearch, DeezerTrack } from "@origin/deezer/types";

export namespace Deezer {
	const BASE_URL = "https://api.deezer.com";
	const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

	type Opts = BaseOpts;

	function api_headers(opts: Opts): Record<string, string> {
		const cookie_str = opts.cookie_jar?.toString();
		return {
			"User-Agent": USER_AGENT,
			"Accept": "application/json",
			"Accept-Language": "en-US,en;q=0.9",
			"Origin": "https://www.deezer.com",
			"Referer": "https://www.deezer.com/",
			...(cookie_str ? { "Cookie": cookie_str } : {})
		};
	}

	export function get_arl(opts: Opts): string | undefined {
		return opts.cookie_jar?.getCookie("arl")?.getData()?.value;
	}

	export async function apiget<T>(path: string, params: Record<string, any> = {}, opts: Opts = {}): PromiseResult<T> {
		const query = Object.keys(params).length > 0 ? `?${encode_params(params)}` : "";
		const response = await rozfetch<T>(`${BASE_URL}/${path}${query}`, {
			method: "GET",
			headers: api_headers(opts),
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		return await response.json();
	}

	export function url_to_id(url: string): string {
		return urlid(url, "deezer.com/", "us/", "fr/", /^[a-z]{2}\//,
			"track/", "album/", "playlist/", "artist/", /\?.*/);
	}

	export async function search(opts: Opts & { query: string, type?: "track" | "album" | "playlist" | "artist" | "radio" | "podcast", limit?: number, index?: number }): PromiseResult<DeezerSearch<DeezerTrack | DeezerAlbum | DeezerPlaylist | DeezerArtist>> {
		const path = opts.type && opts.type !== "track" ? `search/${opts.type}` : "search";
		return apiget(path, {
			q: opts.query,
			limit: opts.limit ?? 25,
			...(opts.index !== undefined ? { index: opts.index } : {})
		}, opts);
	}

	export async function get_track(opts: Opts & { track_id: string | number }): PromiseResult<DeezerTrack> {
		return apiget(`track/${url_to_id(String(opts.track_id))}`, {}, opts);
	}

	export async function get_album(opts: Opts & { album_id: string | number }): PromiseResult<DeezerAlbum> {
		return apiget(`album/${url_to_id(String(opts.album_id))}`, {}, opts);
	}

	export async function get_album_tracks(opts: Opts & { album_id: string | number, limit?: number, index?: number }): PromiseResult<DeezerList<DeezerTrack>> {
		return apiget(`album/${url_to_id(String(opts.album_id))}/tracks`, {
			limit: opts.limit ?? 100,
			...(opts.index !== undefined ? { index: opts.index } : {})
		}, opts);
	}

	export async function get_playlist(opts: Opts & { playlist_id: string | number }): PromiseResult<DeezerPlaylist> {
		return apiget(`playlist/${url_to_id(String(opts.playlist_id))}`, {}, opts);
	}

	export async function get_playlist_tracks(opts: Opts & { playlist_id: string | number, limit?: number, index?: number }): PromiseResult<DeezerList<DeezerTrack>> {
		return apiget(`playlist/${url_to_id(String(opts.playlist_id))}/tracks`, {
			limit: opts.limit ?? 100,
			...(opts.index !== undefined ? { index: opts.index } : {})
		}, opts);
	}

	export async function get_artist(opts: Opts & { artist_id: string | number }): PromiseResult<DeezerArtist> {
		return apiget(`artist/${url_to_id(String(opts.artist_id))}`, {}, opts);
	}

	export async function get_artist_top(opts: Opts & { artist_id: string | number, limit?: number }): PromiseResult<DeezerList<DeezerTrack>> {
		return apiget(`artist/${url_to_id(String(opts.artist_id))}/top`, { limit: opts.limit ?? 50 }, opts);
	}

	export async function get_artist_albums(opts: Opts & { artist_id: string | number, limit?: number, index?: number }): PromiseResult<DeezerList<DeezerAlbum>> {
		return apiget(`artist/${url_to_id(String(opts.artist_id))}/albums`, {
			limit: opts.limit ?? 25,
			...(opts.index !== undefined ? { index: opts.index } : {})
		}, opts);
	}

	export async function get_artist_related(opts: Opts & { artist_id: string | number, limit?: number }): PromiseResult<DeezerList<DeezerArtist>> {
		return apiget(`artist/${url_to_id(String(opts.artist_id))}/related`, { limit: opts.limit ?? 20 }, opts);
	}

	export async function get_chart(opts: Opts & { genre_id?: number, limit?: number }): PromiseResult<{ tracks: DeezerList<DeezerTrack>, albums: DeezerList<DeezerAlbum>, artists: DeezerList<DeezerArtist>, playlists: DeezerList<DeezerPlaylist> }> {
		return apiget(`chart/${opts.genre_id ?? 0}`, { limit: opts.limit ?? 10 }, opts);
	}

	export async function get_user_playlists(opts: Opts & { limit?: number }): PromiseResult<DeezerList<DeezerPlaylist>> {
		return apiget("user/me/playlists", { limit: opts.limit ?? 25 }, opts);
	}
}
