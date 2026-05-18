import { HmacSHA1, enc } from "crypto-js";
import rozfetch from "@common/rozfetch";
import type { BaseOpts, PromiseResult } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { generror } from "@common/utils/error_util";
import { urlid } from "@common/utils/util";
import type { Album, ApiList, Artist, Playlist, Track } from "@origin/audiomack/types";

export type { Album, ApiList, Artist, Playlist, Track } from "@origin/audiomack/types";

export namespace Audiomack {
	const BASE_URL = "https://api.audiomack.com/v1";
	const CONSUMER_KEY = "audiomack-web";
	const CONSUMER_SECRET = "bd8a07e9f23fbe9d808646b730f89b8e";
	const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

	type Opts = BaseOpts;

	function percent_encode(str: string): string {
		return encodeURIComponent(str)
			.replace(/!/g, "%21").replace(/'/g, "%27")
			.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
	}

	export function sign_params(method: string, base_url: string, params: Record<string, any> = {}): Record<string, string> {
		const str_params: Record<string, string> = {};
		for (const [k, v] of Object.entries(params)) str_params[k] = String(v);
		const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
		const timestamp = String(Math.floor(Date.now() / 1000));
		const oauth: Record<string, string> = {
			oauth_consumer_key: CONSUMER_KEY,
			oauth_nonce: nonce,
			oauth_signature_method: "HMAC-SHA1",
			oauth_timestamp: timestamp,
			oauth_version: "1.0",
		};
		const all = { ...str_params, ...oauth };
		const param_str = Object.keys(all).sort()
			.map(k => `${percent_encode(k)}=${percent_encode(all[k])}`)
			.join("&");
		const base = `${method}&${percent_encode(base_url)}&${percent_encode(param_str)}`;
		const sig = HmacSHA1(base, `${CONSUMER_SECRET}&`).toString(enc.Base64);
		return { ...all, oauth_signature: sig };
	}

	function base_headers(): Record<string, string> {
		return {
			"User-Agent": USER_AGENT,
			"Accept": "application/json, text/plain, */*",
			"Accept-Language": "en-US,en;q=0.9",
			"Origin": "https://audiomack.com",
			"Referer": "https://audiomack.com/",
		};
	}

	export async function apiget<T>(path: string, params: Record<string, any> = {}, opts: Opts = {}): PromiseResult<T> {
		const base_url = `${BASE_URL}/${path}`;
		const signed = sign_params("GET", base_url, params);
		const response = await rozfetch<T>(`${base_url}?${encode_params(signed)}`, {
			method: "GET",
			headers: base_headers(),
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		return await response.json();
	}

	export function url_to_slug(url: string): string {
		return urlid(url, "audiomack.com/", "m.audiomack.com/");
	}

	export async function search(opts: Opts & { query: string, limit?: number, page?: number, show?: string }): PromiseResult<ApiList<Track | Album | Playlist>> {
		return apiget("search", {
			q: opts.query,
			limit: opts.limit ?? 20,
			page: opts.page ?? 1,
			show: opts.show ?? "music",
			sort: "popular"
		}, opts);
	}

	export async function get_song(opts: Opts & { artist_slug: string, song_slug: string }): PromiseResult<Track> {
		const artist = url_to_slug(opts.artist_slug);
		const song = url_to_slug(opts.song_slug);
		return apiget(`music/song/${artist}/${song}`, {}, opts);
	}

	export async function get_album(opts: Opts & { artist_slug: string, album_slug: string }): PromiseResult<Album> {
		const artist = url_to_slug(opts.artist_slug);
		const album = url_to_slug(opts.album_slug);
		return apiget(`music/album/${artist}/${album}`, {}, opts);
	}

	export async function get_playlist(opts: Opts & { playlist_slug: string }): PromiseResult<Playlist> {
		return apiget(`playlists/${url_to_slug(opts.playlist_slug)}`, {}, opts);
	}

	export async function get_artist(opts: Opts & { artist_slug: string }): PromiseResult<Artist> {
		return apiget(`artists/${url_to_slug(opts.artist_slug)}`, {}, opts);
	}

	export async function get_trending(opts: Opts & { genre?: string, limit?: number, page?: number } = {}): PromiseResult<ApiList<Track>> {
		return apiget("trending/songs", {
			...(opts.genre ? { genre: opts.genre } : {}),
			limit: opts.limit ?? 20,
			page: opts.page ?? 1
		}, opts);
	}

	export async function get_song_from_url(opts: Opts & { url: string }): PromiseResult<Track> {
		const slug = url_to_slug(opts.url);
		const parts = slug.split("/");
		if (parts.length < 3 || parts[1] !== "song")
			return generror("Invalid audiomack song URL", "LOW", { url: opts.url });
		const [artist_slug, , song_slug] = parts;
		return get_song({ artist_slug, song_slug, ...opts });
	}
}
