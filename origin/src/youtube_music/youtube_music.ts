import * as Parser from "@origin/youtube_music/parser";
import type { CookieJar } from "@common/utils/cookie_util";
import type { PromiseResult, ResponseError } from '@common/types';
import { extract_string_from_pattern, is_empty, json_catch, urlid } from "@common/utils/util";
import type { CreatePlaylist } from "@origin/youtube/types/CreatePlaylist";
import type { MusicCarouselShelfRenderer } from '@origin/youtube_music/types/ArtistResults_0';
import type { ArtistResults_1 } from '@origin/youtube_music/types/ArtistResults_1';
import type { Continuation } from "@origin/youtube_music/types/Continuation";
import type { ContinuedResults_0 } from '@origin/youtube_music/types/ContinuedResults_0';
import type { InitialData } from '@origin/youtube_music/types/types';
import type { YTCFG } from '@origin/youtube_music/types/YTCFG';
import type { YTError } from "@origin/youtube_music/types/Error";
import fetch from "@origin/utils/orifetch";
import type { Proxy } from "@origin/proxy/proxy";
import type { ContinuationItemRenderer } from "@origin/youtube_music/types/PlaylistResults_0";
import type { SearchSuggestions } from "@origin/youtube_music/types/SearchSuggestions";
import { sapisid_hash_auth0, sapisid_hash_auth1 } from "@common/utils/auth_utilt";
import { generror, generror_fetch } from "@common/utils/error_util";
import { parse_runs, try_json_eval } from "@common/utils/parse_util";
import { encode_params, google_query } from "@common/utils/fetch_util";
import { get_native_platform } from "@native/native_mode";

export namespace YouTubeMusic {
	// const user_agent = 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36';
	const user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
	let ytcfg_cache: YTCFG;

	interface Opts { cookie_jar?: CookieJar, proxy?: Proxy.Proxy }
	type Privacy = "PUBLIC" | "UNLISTED" | "PRIVATE";
	interface ICFG {
		initial_data: InitialData[],
		ytcfg: YTCFG
	};

	export function get_sapisid_hash_auth0(SAPISID: string, epoch: Date, ORIGIN = 'https://music.youtube.com') {
		return sapisid_hash_auth0(SAPISID, epoch, ORIGIN);
	}
	export function get_sapisid_hash_auth1(SAPISID: string, epoch: Date, ytcfg: object, ORIGIN = 'https://music.youtube.com') {
		return sapisid_hash_auth1(SAPISID, epoch, ytcfg as any, ORIGIN);
	}

	export function get_ad_signal_params(epoch: Date) {
		return {
			params: [
				{ key: "dt", value: String(epoch.getTime()) }, // Epoch Time
				{ key: "flash", value: "0" },
				{ key: "frm", value: "0" },
				{ key: "u_tz", value: "-420" },
				{ key: "u_his", value: "11" },
				{ key: "u_h", value: "1080" }, // Monitor Height
				{ key: "u_w", value: "1920" }, // Monitor With
				{ key: "u_ah", value: "1032" },
				{ key: "u_aw", value: "1920" },
				{ key: "u_cd", value: "24" },
				{ key: "bc", value: "31" },
				{ key: "bih", value: "911" },
				{ key: "biw", value: "963" },
				{ key: "brdim", value: "2560,0,2560,0,1920,0,1920,1032,980,911" },
				{ key: "vis", value: "1" },    // Visibility%
				{ key: "wgl", value: "true" }, // WEBGL
				{ key: "ca_type", value: "image" }
			]
		};
	}
	export function playlist_urlid(playlist_url: string) {
		return urlid(playlist_url, "music.youtube.com/", "playlist?list=", /\&.+/);
	}
	export function get_post_headers(cookie_jar: CookieJar|undefined, epoch: Date, ytcfg: YTCFG): Record<string, any> {
		const SAPISID = cookie_jar?.getCookie("SAPISID")?.getData()?.value;
		return {
			"User-Agent": user_agent,
			"accept": "*/*",
			"accept-language": "en-US,en;q=0.9",
			"authorization": SAPISID === undefined ? undefined : get_sapisid_hash_auth1(SAPISID, epoch, ytcfg),
			"content-type": "application/json",
			"priority": "u=1, i",
			"sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
			"sec-ch-ua-arch": "\"x86\"",
			"sec-ch-ua-bitness": "\"64\"",
			"sec-ch-ua-form-factors": "\"Desktop\"",
			"sec-ch-ua-full-version": "\"126.0.6478.127\"",
			"sec-ch-ua-full-version-list": "\"Not/A)Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"126.0.6478.127\", \"Google Chrome\";v=\"126.0.6478.127\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-model": "\"\"",
			"sec-ch-ua-platform": "\"Windows\"",
			"sec-ch-ua-platform-version": "\"15.0.0\"",
			"sec-ch-ua-wow64": "?0",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "same-origin",
			"sec-fetch-site": "same-origin",
			"x-client-data": "CIa2yQEIpLbJAQipncoBCPvuygEIlqHLAQj0mM0BCIWgzQEIqp7OAQj/oM4BCKeizgEI46XOAQjep84BCJqozgEIg6zOARihnc4BGPGnzgEY642lFw==",
			"x-goog-authuser": "0",
			"x-goog-visitor-id": "CgtVVWsxR3NiMXh1USjZp_G0BjIKCgJVUxIEGgAgWw%3D%3D",
			"x-origin": "https://music.youtube.com",
			"x-youtube-bootstrap-logged-in": "true",
			"x-youtube-client-name": "67",
			"x-youtube-client-version": "1.20240717.01.00",
			"Referer": "https://music.youtube.com/",
			"Referrer-Policy": "strict-origin-when-cross-origin",
			...(get_native_platform() === "NODE" ? {
				"cookie": cookie_jar?.toString() as string
			} : {
				"Cookies": cookie_jar?.toString() as string
			})
		}
	}
	function get_payload_context(ytcfg: YTCFG, epoch: Date) {
		return {
			adSignalsInfo: get_ad_signal_params(epoch),
			request: ytcfg.INNERTUBE_CONTEXT.request,
			client: ytcfg.INNERTUBE_CONTEXT.client,
			user: ytcfg.INNERTUBE_CONTEXT.user
		};
	}
	function extract_initial_data(html: string): InitialData[] {
		const initial_data_regex = /initialData.push\(({.+?})/gs;
		const initial_data: InitialData[] = [];

		const matches = [...html.matchAll(initial_data_regex)];
		for (const match of matches) {
			const imatch = match[1];
			const try_route = try_json_eval<{
				path: string,
				params: object,
				data: string
			}>(imatch);
            if("error" in try_route) return [];
			const data: InitialData = JSON.parse(try_route.data);
			initial_data.push(data);
		}
		return initial_data;
	}
	function extract_ytcfg(html: string): YTCFG|ResponseError {
		const ytcfg_data_regex = /ytcfg.set\((\{.+?\})\);/gs;
		const extracted = extract_string_from_pattern(html, ytcfg_data_regex);
		const ytcfg = try_json_eval<YTCFG>(extracted as string);
		return ytcfg;
	}

	function playlist_url_or_browse_url(id: string): string{
		id = playlist_urlid(id);
		if(id.includes('OLAK5uy') || id === "LM" || id === "WL" || id === "LL" || id.includes('PLnIB0XeUqT')){
			return `https://music.youtube.com/playlist?list=${id}`;
		}
		return `https://music.youtube.com/browse/${id}`;
	}

	async function get_initial_data_config(opts: Opts, url: string): Promise<ICFG | ResponseError> {
		try {
			const page_response = await fetch(url, {
				headers: {
					"User-Agent": user_agent,
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"accept-language": "en-US,en;q=0.9",
					"priority": "u=0, i",
					"sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
					"sec-ch-ua-arch": "\"x86\"",
					"sec-ch-ua-bitness": "\"64\"",
					"sec-ch-ua-form-factors": "\"Desktop\"",
					"sec-ch-ua-full-version": "\"126.0.6478.127\"",
					"sec-ch-ua-full-version-list": "\"Not/A)Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"126.0.6478.127\", \"Google Chrome\";v=\"126.0.6478.127\"",
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-model": "\"\"",
					"sec-ch-ua-platform": "\"Windows\"",
					"sec-ch-ua-platform-version": "\"15.0.0\"",
					"sec-ch-ua-wow64": "?0",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "none",
					"sec-fetch-user": "?1",
					"service-worker-navigation-preload": "true",
					"upgrade-insecure-requests": "1",
					"x-client-data": "CIa2yQEIpLbJAQipncoBCPvuygEIlqHLAQj0mM0BCIWgzQEIqp7OAQj/oM4BCKeizgEI46XOAQjep84BCJqozgEIg6zOARihnc4BGPGnzgEY642lFw==",
					...(get_native_platform() === "NODE" ? {
						"cookie": opts.cookie_jar?.toString() as string
					} : {
						"Cookies": opts.cookie_jar?.toString() as string
					})
				},
				method: "GET",
				proxy: opts.proxy
			});
			const page_html = await page_response.text();
            const ytcfg = extract_ytcfg(page_html);
            if("error" in ytcfg) return ytcfg;
			return {
				initial_data: extract_initial_data(page_html),
				ytcfg
			};
		} catch (error) {
			return { error: error as Error }; 
		}
	}
    interface ICFGData<T> { icfg: ICFG, data: T }
	type PromiseICFGData<T extends (...args: any) => any> = PromiseResult<ICFGData<ReturnType<T>>>;
	type SearchMode = "All" | "Songs" | "Videos" | "Albums" | "Community playlists" | "Artists" | "Episodes" | "Profiles";
	interface Endpoint { "query": string, "params": string }
	async function parse_initial<T extends (...args: any) => any>(opts: Opts, init_url: string, parser: (contents: any) => any): PromiseICFGData<T> {
		const icfg = await get_initial_data_config(opts, init_url);
		if ("error" in icfg) return icfg;
		return {
			icfg,
			data: parser(icfg.initial_data)
		};
	}
    async function post_check_response(opts: Opts, ytcfg: YTCFG, path: string, payload: object): PromiseResult<Response> {
        // if (opts.cookie_jar === undefined) return generror("YouTube Music post_check_response CookieJar is empty");
		const epoch = new Date();
		const merged_payload = { ...payload, ...{ context: get_payload_context(ytcfg, epoch) } }
		const url = `https://music.youtube.com/youtubei/v1/${path}`;
		const headers = get_post_headers(opts.cookie_jar, epoch, ytcfg);
		const response = await fetch(url, { method: "POST", proxy: opts.proxy, headers, body: JSON.stringify(merged_payload) });
		return response;
	}
    
	export async function get_home(opts: Opts): PromiseICFGData<typeof Parser.parse_home_contents> { return await parse_initial(opts, "https://music.youtube.com/", Parser.parse_home_contents); }
    export async function fetch_initial_data(opts: Opts){
        if(ytcfg_cache !== undefined) return {ok: true, ytcfg: ytcfg_cache};
        const home = await get_home(opts);
        if("error" in home) return {ok: false};
        ytcfg_cache = home.icfg.ytcfg;
        return {ok: true, ytcfg: home.icfg.ytcfg};
    } 
	export async function get_explore(opts: Opts): PromiseICFGData<typeof Parser.parse_explore_contents> { return await parse_initial(opts, "https://music.youtube.com/explore", Parser.parse_explore_contents); }
	export async function get_playlist(opts: Opts, playlist_id: string): PromiseICFGData<typeof Parser.parse_playlist_contents> { return await parse_initial(opts, playlist_url_or_browse_url(playlist_id), Parser.parse_playlist_contents); }
	export async function get_artist(opts: Opts, artist_id: string): PromiseICFGData<typeof Parser.parse_artist_contents> { return await parse_initial(opts, `https://music.youtube.com/channel/${artist_id.replace('/channel/', '')}`, Parser.parse_artist_contents); }
	export async function get_artist_tracks(opts: Opts, artist_id: string) {
		const artist_response = await get_artist(opts, artist_id);
		if ("error" in artist_response) return artist_response;
		const music_shelf_renderer_endpoint_id: string = artist_response.data.top_shelf.bottomEndpoint.browseEndpoint.browseId.replace("VL", "");
		const playlist_response = await get_playlist(opts, music_shelf_renderer_endpoint_id);
		return playlist_response;
	}
	export async function get_only_artist_tracks(opts: Opts, artist_response: ICFGData<ReturnType<typeof Parser.parse_artist_contents>>) {
		const music_shelf_renderer_endpoint_id: string|undefined = artist_response.data.top_shelf?.bottomEndpoint?.browseEndpoint?.browseId?.replace("VL", "");
		if(music_shelf_renderer_endpoint_id === undefined) return generror("Unable to fetch YouTube Music only Artist Tracks", {opts}); 
		const playlist_response = await get_playlist(opts, music_shelf_renderer_endpoint_id);
		return playlist_response;
	}
	export async function get_artist_albums(opts: Opts, artist_id: string) {
		const artist_response = await get_artist(opts, artist_id);
		if ("error" in artist_response) return artist_response;
		const albums_shelf = artist_response.data.shelfs.find(shelf => shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text === "Albums") as MusicCarouselShelfRenderer;
		const singles_shelf = artist_response.data.shelfs.find(shelf => shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text.includes("Single")) as MusicCarouselShelfRenderer;
		const albums_shelf_has_endpoint = albums_shelf?.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint !== undefined;
		const singles_shelf_has_endpoint = singles_shelf?.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint !== undefined;
		if (!albums_shelf_has_endpoint && !singles_shelf_has_endpoint) {
			const merged_shelf = albums_shelf.contents.concat(singles_shelf.contents);
			return merged_shelf.sort((album1, album2) => Parser.find_album_year(album1) - Parser.find_album_year(album2))
		}
		let browse_endpoint: string;
		if (albums_shelf_has_endpoint) browse_endpoint = albums_shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint?.browseEndpoint.browseId as string;
		else browse_endpoint = singles_shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint?.browseEndpoint.browseId as string;
		const payload = { browseId: browse_endpoint };
		const browse_response = await post_check_response(opts, artist_response.icfg.ytcfg, "browse?prettyPrint=false", payload);
		if ("error" in browse_response) return browse_response;
		const browse_data: ArtistResults_1 = await browse_response.json();
		return browse_data.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items.map(item => item.musicTwoRowItemRenderer);
	}
	export async function get_only_artist_albums(opts: Opts, ytcfg: YTCFG, artist_id: string) {
		const browse_endpoint: string = "MPAD" + artist_id.replace('/channel/', '');
		const payload = { browseId: browse_endpoint };
		const browse_response = await post_check_response(opts, ytcfg, "browse?prettyPrint=false", payload);
		if ("error" in browse_response) return browse_response;
		const browse_data: ArtistResults_1 = await browse_response.json();
		if(browse_data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.gridRenderer?.items === undefined) {
			return generror("YouTube Music Only Artist Albums: couldn't find albums", {opts, artist_id});
		}
		return {
			title: parse_runs(browse_data.header.musicHeaderRenderer.title.runs),
			data: browse_data.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items.map(item => item.musicTwoRowItemRenderer)
		};
	}
	export async function get_browse(opts: Opts, browse_id: string){
		return await parse_initial(opts, `https://music.youtube.com/browse/${browse_id}`, () => null);
	}
	export async function search(opts: Opts, search_query: string): PromiseICFGData<typeof Parser.parse_search_contents> { return await parse_initial(opts, `https://music.youtube.com/search?q=${google_query(search_query)}`, Parser.parse_search_contents); }
	export async function new_releases_albums(opts: Opts): PromiseICFGData<typeof Parser.parse_new_releases_albums> { return await parse_initial(opts, `https://music.youtube.com/new_releases/albums`, Parser.parse_new_releases_albums); }
	export async function search_mode(opts: Opts, endpoint: Endpoint, ytcfg: YTCFG) {
		if (endpoint === undefined) return generror("YouTube Music Search Mode Endpoint undefined", {opts});
		const payload = endpoint;
		const search_response = await post_check_response(opts, ytcfg, "search?prettyPrint=false", payload);
		if ("error" in search_response) return search_response;
		const browse_data = await search_response.json();
		return Parser.parse_search_contents([undefined, browse_data] as InitialData[]);
	}
	export async function full_search(opts: Opts, search_query: string, mode: SearchMode) {
		const all_search = await search(opts, search_query);
		if ("error" in all_search) return all_search;
		if (mode === "All") return all_search;
		return search_mode(opts, all_search.data.mode_endpoints.find(endpoint => endpoint.id == mode)?.endpoint as Endpoint, all_search.icfg.ytcfg);
	}

	export async function search_suggestions(opts: Opts, search_query: string, ytcfg?: YTCFG){
		if(is_empty(search_query)) return [];
		if(ytcfg === undefined) ytcfg = (await fetch_initial_data(opts)).ytcfg;
		if(ytcfg === undefined) return [];
		const search_suggestions_response = await post_check_response(opts, ytcfg, 'music/get_search_suggestions', {input: search_query});
		if("error" in search_suggestions_response) return [];
		if(!search_suggestions_response.ok) return [];
		const search_suggestions_data: SearchSuggestions = await search_suggestions_response.json().catch(json_catch);
		if("error" in search_suggestions_data) return [];
		return search_suggestions_data.contents.map(top_content => {
			return top_content.searchSuggestionsSectionRenderer.contents.filter(content => !("historySuggestionRenderer" in content)).map(content => {
				if("searchSuggestionRenderer" in content){
					return parse_runs(content.searchSuggestionRenderer.suggestion.runs, '');
				}
				else if("musicResponsiveListItemRenderer" in content){
					try {
						return Parser.parse_track_search_suggestion(content.musicResponsiveListItemRenderer);
					}
					catch { return undefined; }
				}
				else 
				return undefined;
			}).filter(content => content !== undefined);
		}).flat();
	}

	export async function get_library(opts: Opts): PromiseICFGData<typeof Parser.parse_library_contents> {
		const icfg = await get_initial_data_config(opts, "https://music.youtube.com/library");
		if ("error" in icfg) return icfg;
		const payload = { browseId: "FEmusic_liked_playlists" };
		const browse_response = await post_check_response(opts, icfg.ytcfg, "browse?prettyPrint=false", payload);
		if ("error" in browse_response) return browse_response;
		const browse_data = await browse_response.json() as InitialData|YTError;
        if("error" in browse_data) return generror(browse_data.error.message);
		return {
			icfg,
			data: Parser.parse_library_contents(browse_data)
		};
	}

	export async function get_continuation(opts: Opts, ytcfg: YTCFG, next_con: Continuation|ContinuationItemRenderer) {
		const query_params = Array.isArray(next_con) ? {
			ctoken: next_con[0].nextContinuationData.continuation,
			continutation: next_con[0].nextContinuationData.continuation,
			type: "next",
			itct: next_con[0].nextContinuationData.clickTrackingParams,
			prettyPrint: false
		} : {
			ctoken: next_con.continuationEndpoint.continuationCommand.token,
			continutation: next_con.continuationEndpoint.continuationCommand.token,
			type: "next",
			itct: next_con.continuationEndpoint.clickTrackingParams,
			prettyPrint: false
		}
		const payload = {
			continuation: query_params.ctoken,
		};
		const response = await post_check_response(opts, ytcfg, `browse?${encode_params(query_params)}`, payload);
		if ("error" in response) return response;
		return (await response.json()) as ContinuedResults_0;
	}

	async function post_check_succeed(opts: Opts, ytcfg: YTCFG, path: string, payload: object) {
		const response = await post_check_response(opts, ytcfg, path, payload);
		if ("error" in response) return false;
		return response.ok;
	}
	export async function post_like(opts: Opts, ytcfg: YTCFG, video_id: string, like_path: string) {
		const payload = {
			target: { videoId: video_id },
		}
		return await post_check_succeed(opts, ytcfg, `${like_path}?prettyPrint=false`, payload);
	}
	export async function post_edit_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, actions: object[]) {
		const payload = {
			actions,
			playlistId: playlist_id
		}
		return await post_check_succeed(opts, ytcfg, "browse/edit_playlist?prettyPrint=false", payload);
	}
	export async function like_track(opts: Opts, ytcfg: YTCFG, video_id: string) { return await post_like(opts, ytcfg, video_id, "like/like"); }
	export async function dislike_track(opts: Opts, ytcfg: YTCFG, video_id: string) { return await post_like(opts, ytcfg, video_id, "like/dislike"); }
	export async function unlike_track(opts: Opts, ytcfg: YTCFG, video_id: string) { return await post_like(opts, ytcfg, video_id, "like/removelike"); }
	export async function create_playlist(opts: Opts, ytcfg: YTCFG, title: string, privacy: Privacy) {
		const payload = {
			title,
			privacyStatus: privacy
		}
		const response = await post_check_response(opts, ytcfg, "playlist/create?prettyPrint=false", payload);
		if ("error" in response) return response;
		if (!response.ok) return generror_fetch(response, 'Failed to create YouTube Music playlist', opts, {title, privacy});
		return await response.json() as CreatePlaylist;
	}
	export async function delete_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string) {
		const payload = {
			playlistId: playlist_urlid(playlist_id)
		}
		return await post_check_succeed(opts, ytcfg, "playlist/delete?prettyPrint=false", payload);
	}
	export async function add_tracks_to_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, video_ids: string[]) {
		const actions = video_ids.map((video_id) => ({ addedVideoId: video_id, action: "ACTION_ADD_VIDEO", dedupeOption: "DEDUPE_OPTION_CHECK" }));
		return await post_edit_playlist(opts, ytcfg, playlist_urlid(playlist_id), actions);
	}
	export async function remove_tracks_to_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, video_ids: { video_id: string, set_video_id: string }[]) {
		const actions = video_ids.map((video_id) => ({ removedVideoId: video_id.video_id, action: "ACTION_REMOVE_VIDEO", setVideoId: video_id.set_video_id }));
		return await post_edit_playlist(opts, ytcfg, playlist_urlid(playlist_id), actions);
	}
	export async function edit_playlist_data(opts: Opts, ytcfg: YTCFG, playlist_id: string, playlist_data: {
		name: string,
		description: string,
		privacy: Privacy
	}) {
		const actions = [
			{ action: "ACTION_SET_PLAYLIST_PRIVACY", playlistPrivacy: playlist_data.privacy },
			{ action: "ACTION_SET_PLAYLIST_NAME", playlistName: playlist_data.name },
			{ action: "ACTION_SET_PLAYLIST_DESCRIPTION", playlistDescription: playlist_data.description }
		];
		return await post_edit_playlist(opts, ytcfg, playlist_urlid(playlist_id), actions);
	}
}