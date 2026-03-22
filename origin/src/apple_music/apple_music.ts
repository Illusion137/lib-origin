import { base_get_headers, base_post_headers } from "@common/headers_base";
import rozfetch from "@common/rozfetch";
import type { BaseOpts, FetchMethod } from "@common/types";
import { generror } from "@common/utils/error_util";
import { encode_params } from "@common/utils/fetch_util";
import { try_json_parse } from "@common/utils/parse_util";
import { extract_string_from_pattern, urlid } from "@common/utils/util";
import type { Album } from "@origin/apple_music/types/Album";
import type { CreatePlaylist } from "@origin/apple_music/types/CreatePlaylist";
import type { GetArtistData } from "@origin/apple_music/types/GetArtist";
import type { MyPlaylists } from "@origin/apple_music/types/MyPlaylists";
import type { Playlist } from "@origin/apple_music/types/Playlist";
import type { Search } from "@origin/apple_music/types/Search";
import type { SerializedServerData } from "@origin/apple_music/types/type";
import type { UserPlaylist } from "@origin/apple_music/types/UserPlaylist";

// Thanks to Lafou for providing test playlists such as:
// https://music.apple.com/us/playlist/zayboy-loveish/pl.u-4JommGltMdrNMl

export namespace AppleMusic {
	type Opts = BaseOpts;
	const client_cache = { client: { authorization: null as string | null }, enabled: true };

	export function enable_cache(enable: boolean) {
		client_cache.enabled = enable;
	}
	export function client_cache_full() {
		return client_cache.enabled && client_cache.client.authorization !== null;
	}
	export function playlist_urlid(playlist_url: string) {
		return urlid(playlist_url, "music.apple.com/", "us/", "library/", "album/", "playlist/", "?l=en-US", /.+?\//);
	}
	export function artist_urlid(playlist_url: string) {
		return urlid(playlist_url, "music.apple.com/", "us/", "artist/", "playlist/", "?l=en-US", /.+?\//);
	}
	async function extract_serialized_server_data(html: string, opts: Opts) {
		const serialized_server_data_regex = /<script type="application\/json".+?id="serialized-server-data">(.+?)<\/script>/s;
		const extraction = extract_string_from_pattern(html, serialized_server_data_regex, "MEDIUM");
		if (typeof extraction === "object") return extraction;
		const data = try_json_parse<SerializedServerData>(extraction);
		if ("error" in data) return data;
		if (client_cache_full()) return { authorization: client_cache.client.authorization!, data: data };
		const bearer_path = extract_string_from_pattern(html, /<script type="module" crossorigin src="(.+?)"><\/script>/, "MEDIUM");
		if (typeof bearer_path === "object") return bearer_path;
		const bearer = await get_bearer(bearer_path, opts);
		if (typeof bearer === "object") return bearer;

		return { data: data, authorization: bearer };
	}
	async function get_response(url: string, opts: Opts) {
		const response = await rozfetch(url, {
			headers: base_get_headers(opts),
			referrerPolicy: "strict-origin-when-cross-origin",
			credentials: "include",
			redirect: "follow",
			method: "GET",
			...opts.fetch_opts
		});
		return response;
	}
	export async function get_serialized_server_data(url: string, opts: Opts) {
		const response = await get_response(url, opts);
		if ("error" in response) return response;
		const text = await response.text();
		return await extract_serialized_server_data(text, opts);
	}
	function get_api_headers(bearer: string, opts: Opts) {
		const cookie_jar = opts.cookie_jar;
		const media_user_token_cookie = cookie_jar?.getCookie("media-user-token");
		const media_user_token = media_user_token_cookie?.getData()?.value;
		return {
			...base_post_headers(opts),
			authorization: "Bearer " + bearer,
			"media-user-token": media_user_token as string,
			origin: "https://music.apple.com",
			referer: "https://music.apple.com/",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
		};
	}
	async function get_bearer(path: string, opts: Opts) {
		const response = await get_response(`https://music.apple.com${path}`, opts);
		if ("error" in response) return response;
		const js = await response.text();
		const bearer = extract_string_from_pattern(js, /const .+? ?= ?["'`]([a-zA-Z0-9-._]{200,})["'`]/i, "MEDIUM");
		return bearer;
	}
	type CheckCookies = "CHECK_COOKIES" | "NO_CHECK_COOKIES";
	async function api_check_response<T>(opts: Opts, check_cookies: CheckCookies, bearer: string, path: string, params: Record<string, unknown>, payload: null | object, method: FetchMethod = "GET") {
		if (check_cookies === "CHECK_COOKIES" && opts.cookie_jar === undefined) return generror("CookieJar is empty", "INFO", { opts, bearer, path, params, payload, method });
		const url = `https://amp-api.music.apple.com/v1/${path}?${encode_params(params)}`;
		return await rozfetch<T>(url, { method, body: payload === null ? null : JSON.stringify(payload), credentials: "include", referrerPolicy: "strict-origin", headers: get_api_headers(bearer, opts), ...opts.fetch_opts });
	}
	export async function try_cached_client(url: string, opts: Opts) {
		if (client_cache_full()) return client_cache.client;
		else return await get_serialized_server_data(url, opts);
	}
	export async function search(query: string, opts: Opts) {
		const search_response = await get_serialized_server_data(`https://music.apple.com/us/search?term=${encodeURIComponent(query)}`, opts);
		if ("error" in search_response) return search_response;
		const params = {
			"art%5Bmusic-videos%3Aurl%5D": "c",
			"art%5Burl%5D": "f",
			extend: "artistUrl",
			"fields%5Balbums%5D": "artistName,artistUrl,artwork,contentRating,editorialArtwork,editorialNotes,name,playParams,releaseDate,url,trackCount",
			"fields%5Bartists%5D": "url,name,artwork",
			"format%5Bresources%5D": "map",
			"include%5Balbums%5D": "artists",
			"include%5Bmusic-videos%5D": "artists",
			"include%5Bsongs%5D": "artists",
			"include%5Bstations%5D": "radio-show",
			l: "en-US",
			limit: "21",
			"omit%5Bresource%5D": "autos",
			platform: "web",
			"relate%5Balbums%5D": "artists",
			"relate%5Bsongs%5D": "albums",
			term: query,
			types: "activities,albums,apple-curators,artists,curators,editorial-items,music-movies,music-videos,playlists,record-labels,songs,stations,tv-episodes,uploaded-videos",
			with: "lyricHighlights,lyrics,naturalLanguage,serverBubbles,subtitles"
		};
		const api_search_response = await api_check_response<Search>(opts, "NO_CHECK_COOKIES", search_response.authorization, `catalog/us/search`, params, null);
		if ("error" in api_search_response) return api_search_response;
		const search_result = await api_search_response.json();
		if ("error" in search_result) return search_result;
		return { data: search_result, authorization: search_response.authorization };
	}
	export async function get_artist(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as GetArtistData, authorization: artist_response.authorization };
	}
	export async function get_artist_tracks(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}/see-all?section=top-songs`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as unknown, authorization: artist_response.authorization };
	}
	export async function get_artist_singles(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}/see-all?section=singles`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as unknown, authorization: artist_response.authorization };
	}
	export async function get_artist_albums(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}/see-all?section=full-albums`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as unknown, authorization: artist_response.authorization };
	}
	export async function get_artist_appears_on(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}/see-all?section=appears-on-albums`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as unknown, authorization: artist_response.authorization };
	}
	export async function get_artist_similar_artists(artist_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/artist/${artist_urlid(artist_id)}/see-all?section=similar-artists`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as unknown, authorization: artist_response.authorization };
	}
	export async function get_album(album_id: string, opts: Opts) {
		const artist_response = await get_serialized_server_data(`https://music.apple.com/us/album/${playlist_urlid(album_id)}`, opts);
		if ("error" in artist_response) return artist_response;
		return { data: artist_response.data[0].data as Album, authorization: artist_response.authorization };
	}
	export async function get_playlist(playlist_path: string, opts: Opts) {
		const playlist_response = await get_serialized_server_data(`https://music.apple.com/${urlid(playlist_path, "music.apple.com/")}`, opts);
		if ("error" in playlist_response) return playlist_response;
		if ((playlist_response?.data as Playlist)?.[0]?.intent?.$kind == "PlaylistDetailPageIntent") {
			// Non-user playlist
			const playlist = playlist_response.data as Playlist;
			return { data: playlist[0].data, authorization: playlist_response.authorization };
		} else {
			// User playlist
			const params = {
				"art%5Blibrary-music-videos%3Aurl%5D": "c,f",
				"art%5Burl%5D": "f",
				extend: "hasCollaboration,isCollaborativeHost",
				"extend%5Blibrary-playlists%5D": "tags",
				"fields%5Bmusic-videos%5D": "artistUrl,artwork,durationInMillis,url",
				"fields%5Bsongs%5D": "artistUrl,artwork,durationInMillis,url",
				"format%5Bresources%5D": "map",
				include: "catalog,artists,tracks",
				"include%5Blibrary-playlists%5D": "catalog,tracks,playlists",
				"include%5Bplaylists%5D": "curator",
				"include%5Bsongs%5D": "artists",
				l: "en-US",
				"omit%5Bresource%5D": "autos",
				platform: "web",
				relate: "catalog"
			};
			const playlist_id = playlist_urlid(playlist_path);
			try {
				const api_playlists_response = await api_check_response<UserPlaylist>(opts, "CHECK_COOKIES", playlist_response.authorization, `me/library/playlists/${playlist_id}`, params, null);
				if ("error" in api_playlists_response) throw api_playlists_response.error;
				const user_playlist = await api_playlists_response.json();
				if ("error" in user_playlist) throw user_playlist.error;
				return { data: user_playlist, authorization: playlist_response.authorization };
			} catch (_) {
				const api_playlists_response = await api_check_response<UserPlaylist>(opts, "NO_CHECK_COOKIES", playlist_response.authorization, `catalog/us/playlists/${playlist_id}`, params, null);
				if ("error" in api_playlists_response) return api_playlists_response;
				const user_playlist = await api_playlists_response.json();
				if ("error" in user_playlist) return user_playlist;
				return { data: user_playlist, authorization: playlist_response.authorization };
			}
		}
	}

	export async function get_playlist_continuation(playlist_id: string, offset: number, authorization: string, opts: Opts) {
		try {
			const params = {
				l: "en-US",
				offset: offset,
				"art%5Burl%5D": "f",
				"fields%5Bsongs%5D": "artistUrl,url",
				"format%5Bresources%5D": "map",
				include: "catalog",
				platform: "web"
			};
			const playlists_response = await api_check_response<UserPlaylist>(opts, "NO_CHECK_COOKIES", authorization, `me/library/playlists/${playlist_urlid(playlist_id)}/tracks`, params, null);
			if ("error" in playlists_response) throw playlists_response.error;
			return await playlists_response.json();
		} catch (_) {
			const params = {
				l: "en-US",
				offset: offset,
				"art%5Burl%5D": "f",
				"fields%5Bsongs%5D": "artistUrl,url",
				"format%5Bresources%5D": "map",
				include: "catalog",
				platform: "web"
			};
			const playlists_response = await api_check_response<UserPlaylist>(opts, "NO_CHECK_COOKIES", authorization, `catalog/us/playlists/${playlist_urlid(playlist_id)}/tracks`, params, null);
			if ("error" in playlists_response) return playlists_response;
			return await playlists_response.json();
		}
	}
	export async function account_playlists(opts: Opts) {
		const data = await try_cached_client("https://music.apple.com/us/library/all-playlists/", opts);
		if ("error" in data) return data;
		const params = {
			"art%5Burl%5D": "f",
			extend: "hasCollaboration",
			"extend%5Blibrary-playlists%5D": "tags",
			"fields%5Bplaylists%5D": "curatorName",
			"format%5Bresources%5D": "map",
			include: "catalog",
			l: "en-US",
			offset: 0,
			"omit%5Bresource%5D": "autos",
			platform: "web"
		};
		const playlists_response = await api_check_response<MyPlaylists>(opts, "CHECK_COOKIES", data.authorization!, "me/library/playlist-folders/p.playlistsroot/children", params, null);
		if ("error" in playlists_response) return playlists_response;
		return await playlists_response.json();
	}
	export async function add_tracks_to_playlist(playlist_id: string, track_ids: { id: string; type: "songs" }[], opts: Opts) {
		const data = await try_cached_client("https://music.apple.com/us/library/all-playlists/", opts);
		if ("error" in data) return data;
		const params = {
			"art%5Burl%5D": "f",
			l: "en-US",
			representation: "resources"
		};
		const payload = {
			data: track_ids
		};
		const playlists_response = await api_check_response(opts, "CHECK_COOKIES", data.authorization!, `me/library/playlists/${playlist_urlid(playlist_id)}/tracks`, params, payload, "POST");
		return playlists_response;
	}
	export async function remove_track_from_playlist(playlist_id: string, track_id: string, authorization: string, opts: Opts) {
		const params = {
			"ids[library-songs]": track_id,
			mode: "all",
			"art%5Burl%5D": "f"
		};
		const playlists_response = await api_check_response(opts, "CHECK_COOKIES", authorization, `me/library/playlists/${playlist_urlid(playlist_id)}/tracks`, params, null, "DELETE");
		return playlists_response;
	}
	export async function create_playlist(playlist_name: string, description: string, is_public: boolean, tracks: { id: string; type: "songs" }[], opts: Opts) {
		const data = await try_cached_client("https://music.apple.com/us/library/all-playlists/", opts);
		if ("error" in data) return data;
		const params = {
			"art%5Burl%5D": "f",
			l: "en-US"
		};
		const payload = {
			attributes: {
				name: playlist_name,
				description,
				isPublic: is_public
			},
			relationships: { tracks: { data: tracks } }
		};
		const playlists_response = await api_check_response<CreatePlaylist>(opts, "CHECK_COOKIES", data.authorization!, "me/library/playlists", params, payload, "POST");
		if ("error" in playlists_response) return playlists_response;
		return await playlists_response.json();
	}
	export async function delete_playlist(playlist_id: string, opts: Opts) {
		const data = await try_cached_client("https://music.apple.com/us/library/all-playlists/", opts);
		if ("error" in data) return data;
		const params = {
			"art%5Burl%5D": "f"
		};
		const playlists_response = await api_check_response(opts, "CHECK_COOKIES", data.authorization!, `me/library/playlists/${playlist_urlid(playlist_id)}`, params, null, "DELETE");
		return playlists_response;
	}
}
