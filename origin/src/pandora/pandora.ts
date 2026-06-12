import rozfetch from "@common/rozfetch";
import type { BaseOpts, FetchMethod, PromiseResult, ResponseError } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import { generror } from "@common/utils/error_util";
import { urlid } from "@common/utils/util";
import type { PandoraAlbum, PandoraAnnotation, PandoraArtist, PandoraPlaylistTracks, PandoraSearchResult, PandoraTrack, PandoraType } from "@origin/pandora/types";

export type { PandoraAlbum, PandoraAnnotation, PandoraArtist, PandoraArtwork, PandoraPlaylist, PandoraPlaylistTracks, PandoraSearchResult, PandoraStation, PandoraTrack, PandoraType } from "@origin/pandora/types";

export namespace Pandora {
	const BASE_URL = "https://www.pandora.com";
	const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

	type Opts = BaseOpts;

	function get_csrf_token(opts: Opts): string | undefined {
		return opts.cookie_jar?.getCookie("csrftoken")?.getData()?.value;
	}

	function get_auth_token(opts: Opts): string | undefined {
		return opts.cookie_jar?.getCookie("auth_token")?.getData()?.value
			?? opts.cookie_jar?.getCookie("authToken")?.getData()?.value;
	}

	function api_headers(opts: Opts): Record<string, string> {
		const csrf = get_csrf_token(opts);
		const auth = get_auth_token(opts);
		const cookie_str = opts.cookie_jar?.toString();
		return {
			"User-Agent": USER_AGENT,
			"Accept": "application/json",
			"Accept-Language": "en-US,en;q=0.9",
			"Content-Type": "application/json",
			"Origin": BASE_URL,
			"Referer": `${BASE_URL}/`,
			...(csrf ? { "X-CsrfToken": csrf } : {}),
			...(auth ? { "X-AuthToken": auth } : {}),
			...(cookie_str ? { "Cookie": cookie_str } : {})
		};
	}

	export async function ensure_csrf(opts: Opts): PromiseResult<{ ok: true }> {
		if (get_csrf_token(opts)) return { ok: true };
		const response = await rozfetch(`${BASE_URL}/`, {
			method: "HEAD",
			headers: { "User-Agent": USER_AGENT },
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		opts.cookie_jar?.updateWithFetch(response);
		if (!get_csrf_token(opts)) return generror("Could not get Pandora CSRF token", "MEDIUM", { opts });
		return { ok: true };
	}

	export async function apiget<T>(path: string, params: Record<string, any> = {}, opts: Opts = {}): PromiseResult<T> {
		const csrf = await ensure_csrf(opts);
		if ("error" in csrf) return csrf;
		const query = Object.keys(params).length > 0 ? `?${encode_params(params)}` : "";
		const response = await rozfetch<T>(`${BASE_URL}/api/v1/${path}${query}`, {
			method: "GET",
			headers: api_headers(opts),
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		return await response.json();
	}

	export async function apipost<T>(path: string, payload: object, opts: Opts = {}, method: FetchMethod = "POST"): PromiseResult<T> {
		const csrf = await ensure_csrf(opts);
		if ("error" in csrf) return csrf;
		const response = await rozfetch<T>(`${BASE_URL}/api/v1/${path}`, {
			method,
			headers: api_headers(opts),
			body: JSON.stringify(payload),
			...opts.fetch_opts
		});
		if ("error" in response) return response;
		return await response.json();
	}

	export function url_to_id(url: string): string {
		return urlid(url, "pandora.com/", "www.pandora.com/", /\?.*/);
	}

	export async function search(opts: Opts & { query: string, types?: PandoraType[], page_size?: number }): PromiseResult<PandoraSearchResult> {
		return apipost<PandoraSearchResult>("search/fulltext", {
			query: opts.query,
			types: opts.types ?? ["TR", "AR", "AL", "PL", "SF"],
			pageSize: opts.page_size ?? 20
		}, opts);
	}

	export async function annotate(opts: Opts & { pandora_ids: string[] }): PromiseResult<PandoraAnnotation> {
		return apipost<PandoraAnnotation>("catalog/annotateObjects", { pandoraIds: opts.pandora_ids }, opts);
	}

	export async function get_track(opts: Opts & { pandora_id: string }): PromiseResult<PandoraTrack> {
		const annotation = await annotate({ ...opts, pandora_ids: [opts.pandora_id] });
		if ("error" in (annotation as object)) return annotation as ResponseError;
		const track = (annotation as PandoraAnnotation)[opts.pandora_id];
		if (!track) return generror("Track not found in annotation", "MEDIUM", { pandora_id: opts.pandora_id });
		return track as PandoraTrack;
	}

	export async function get_artist(opts: Opts & { pandora_id: string }): PromiseResult<PandoraArtist> {
		const annotation = await annotate({ ...opts, pandora_ids: [opts.pandora_id] });
		if ("error" in (annotation as object)) return annotation as ResponseError;
		const artist = (annotation as PandoraAnnotation)[opts.pandora_id];
		if (!artist) return generror("Artist not found in annotation", "MEDIUM", { pandora_id: opts.pandora_id });
		return artist as PandoraArtist;
	}

	export async function get_album(opts: Opts & { pandora_id: string }): PromiseResult<PandoraAlbum> {
		const annotation = await annotate({ ...opts, pandora_ids: [opts.pandora_id] });
		if ("error" in (annotation as object)) return annotation as ResponseError;
		const album = (annotation as PandoraAnnotation)[opts.pandora_id];
		if (!album) return generror("Album not found in annotation", "MEDIUM", { pandora_id: opts.pandora_id });
		return album as PandoraAlbum;
	}

	export async function get_playlist(opts: Opts & { pandora_id: string, page_size?: number, start_index?: number }): PromiseResult<PandoraPlaylistTracks> {
		return apipost<PandoraPlaylistTracks>("v4/catalog/getPlaylistFragment", {
			pandoraId: opts.pandora_id,
			isRecentlyPlayedSort: false,
			pageSize: opts.page_size ?? 50,
			startIndex: opts.start_index ?? 0
		}, opts);
	}

	export async function get_station_playlist(opts: Opts & { station_id: string }): PromiseResult<PandoraPlaylistTracks> {
		return apipost<PandoraPlaylistTracks>("station/getPlaylist", {
			stationId: opts.station_id,
			isStartOfSession: false,
			audioFormat: "aacplus",
			supportedFormats: ["aacplus", "mp3-hifi"]
		}, opts);
	}

	export async function get_home(opts: Opts): PromiseResult<{ recipes: { pandoraId: string, title: string }[] }> {
		return apipost("v7/playlist/getThumbs", { pageSize: 50 }, opts);
	}
}
