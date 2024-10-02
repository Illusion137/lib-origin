import * as sha1 from 'sha1-uint8array'
import { Cookie, CookieJar } from "../utils/cookie_util";
import { encode_params, extract_string_from_pattern, get_main_key, google_query, parse_runs } from "../utils/util";
import { YTCFG } from "./types/YTCFG";
import * as Parser from "./parser";
import { Continuation } from "./types/Continuation";
import { ContinuedResults_0 } from './types/ContinuedResults_0';
import { ResponseError } from '../utils/types';
import { InitialData } from './types/types';
import { Content4, MusicCarouselShelfRenderer } from './types/ArtistResults_0';
import { ArtistResults_1 } from './types/ArtistResults_1';

export namespace YouTubeMusic {
    // const user_agent = 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Mobile Safari/537.36';
    const user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

    type Opts = { cookie_jar?: CookieJar };
    type Privacy = "PUBLIC" | "UNLISTED" | "PRIVATE";
    interface ICFG {
        initial_data: InitialData[],
        ytcfg: YTCFG
    };

    export function get_sapisid_hash_auth0(SAPISID: string, epoch: Date, ORIGIN = 'https://music.youtube.com') {
        const time_stamp_seconds_str = String(epoch.getTime()).slice(0, 10);
        const data_string = [time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
        const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
        const sha_digest = sha1.createHash().update(data).digest("hex");
        const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest}`
        return SAPISIDHASH;
    }
    export function get_sapisid_hash_auth1(SAPISID: string, epoch: Date, ORIGIN = 'https://music.youtube.com') {
        const time_stamp_seconds_str = String(epoch.getTime()).slice(0, 10);
        const data_string = [time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
        const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
        const sha_digest = sha1.createHash().update(data).digest("hex");
        const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest} SAPISID1PHASH ${time_stamp_seconds_str}_${sha_digest} SAPISID3PHASH ${time_stamp_seconds_str}_${sha_digest}`
        return SAPISIDHASH;
    }

    export function get_ad_signal_params(epoch: Date) {
        return {
            "params": [
                { "key": "dt", "value": String(epoch.getTime()) }, // Epoch Time
                { "key": "flash", "value": "0" },
                { "key": "frm", "value": "0" },
                { "key": "u_tz", "value": "-420" },
                { "key": "u_his", "value": "11" },
                { "key": "u_h", "value": "1080" }, // Monitor Height
                { "key": "u_w", "value": "1920" }, // Monitor With
                { "key": "u_ah", "value": "1032" },
                { "key": "u_aw", "value": "1920" },
                { "key": "u_cd", "value": "24" },
                { "key": "bc", "value": "31" },
                { "key": "bih", "value": "911" },
                { "key": "biw", "value": "963" },
                { "key": "brdim", "value": "2560,0,2560,0,1920,0,1920,1032,980,911" },
                { "key": "vis", "value": "1" },    // Visibility%
                { "key": "wgl", "value": "true" }, // WEBGL
                { "key": "ca_type", "value": "image" }
            ]
        };
    }
    export function playlist_url_to_id(playlist_url: string){
        return playlist_url.replace("https://", "").replace("www.", "").replace("music.youtube.com/playlist?list=", "");
    }
    export function get_post_headers(cookie_jar: CookieJar, epoch: Date){
        const SAPISID = cookie_jar.getCookie("SAPISID")?.getData().value;
        if (SAPISID === undefined) throw "SAPISID doesn't exist";
        return {
            "User-Agent": user_agent,
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": get_sapisid_hash_auth0(SAPISID, epoch),
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
            "cookie": cookie_jar?.toString() as string,
            "Referer": "https://music.youtube.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    }
    function get_payload_context(ytcfg: YTCFG, epoch: Date){
        return { 
            adSignalsInfo: get_ad_signal_params(epoch),
            request: ytcfg.INNERTUBE_CONTEXT.request,
            client: ytcfg.INNERTUBE_CONTEXT.client,
            user: ytcfg.INNERTUBE_CONTEXT.user
        };
    }
    function extract_initial_data(html: string) {
        const initial_data_regex = /initialData.push\(({.+?})/gs;
        const initial_data: InitialData[] = [];

        const matches = [...html.matchAll(initial_data_regex)];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i][1];
            let evaluated;
            const route: {
                path: string,
                params: object,
                data: string
            } = eval("evaluated = " + match);
            const data: InitialData = JSON.parse(route.data);
            initial_data.push(data);
        }
        return initial_data;
    }
    function extract_ytcfg(html: string): YTCFG {
        const ytcfg_data_regex = /ytcfg.set\((\{.+?\})\);/gs;
        const extracted = extract_string_from_pattern(html, ytcfg_data_regex);
        let evaluated;
        const ytcfg: YTCFG = eval("evaluated = " + extracted);
        return ytcfg;
    }
    async function get_initial_data_config(opts: Opts, url: string): Promise<ICFG | ResponseError> {
        try {
            const page_response = await fetch(url, {
                "headers": {
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
                    "cookie": opts.cookie_jar?.toString() as string,
                },
                "credentials": "include",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            });
            const page_html = await page_response.text();
            return {
                initial_data: extract_initial_data(page_html),
                ytcfg: extract_ytcfg(page_html)
            };
        } catch (error) { return { "error": String(error) }; }
    }
    async function parse_initial(opts: Opts, init_url: string, parser: (contents: any) => any): Promise<any | ResponseError> {
        try {
            const icfg = await get_initial_data_config(opts, init_url);
            if ("error" in icfg) throw icfg.error;
            return {
                "icfg": icfg,
                "data": parser(icfg.initial_data)
            };
        } catch (error) { return { "error": String(error) }; }
    }
    type ICFGData<T> = { icfg: ICFG, data: T };
    type SearchMode = "All" | "Songs" | "Videos" | "Albums" | "Community playlists" | "Artists" | "Episodes" | "Profiles";
    type Endpoint = { "query": string, "params": string };
    export async function get_home(opts: Opts)   : Promise<ICFGData<ReturnType<typeof Parser.parse_home_contents>>>                           { return await parse_initial(opts, "https://music.youtube.com/", Parser.parse_home_contents); }
    export async function get_explore(opts: Opts): Promise<ICFGData<ReturnType<typeof Parser.parse_explore_contents>>>                        { return await parse_initial(opts, "https://music.youtube.com/explore", Parser.parse_explore_contents); }
    export async function get_playlist(opts: Opts, playlist_id: string): Promise<ICFGData<ReturnType<typeof Parser.parse_playlist_contents>>> { return await parse_initial(opts, `https://music.youtube.com/playlist?list=${playlist_id}`, Parser.parse_playlist_contents); }
    export async function get_artist(opts: Opts, artist_id: string): Promise<ICFGData<ReturnType<typeof Parser.parse_artist_contents>>>       { return await parse_initial(opts, `https://music.youtube.com/channel/${artist_id}`, Parser.parse_artist_contents); }
    export async function get_artist_tracks(opts: Opts, artist_id: string){
        try {
            const artist_response = await get_artist(opts, artist_id);
            const music_shelf_renderer_endpoint_id: string = artist_response.data.top_shelf.bottomEndpoint.browseEndpoint.browseId.replace("VL", "") as string;
            const playlist_response = await get_playlist(opts, music_shelf_renderer_endpoint_id);
            return playlist_response;
        } catch (error) { return { "error": String(error) }; }
    }
    export async function get_artist_albums(opts: Opts, artist_id: string){
        try {
            const artist_response = await get_artist(opts, artist_id);
            const albums_shelf = artist_response.data.shelfs.find(shelf => shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text === "Albums") as MusicCarouselShelfRenderer;
            const singles_shelf = artist_response.data.shelfs.find(shelf => shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0].text === "Singles") as MusicCarouselShelfRenderer;
            const albums_shelf_has_endpoint = albums_shelf?.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint !== undefined;
            const singles_shelf_has_endpoint = singles_shelf?.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint !== undefined;
            if(!albums_shelf_has_endpoint && !singles_shelf_has_endpoint){
                const merged_shelf = albums_shelf.contents.concat(singles_shelf.contents);
                return merged_shelf.sort((album1, album2) => Parser.find_album_year(album1) - Parser.find_album_year(album2))
            }
            let browse_endpoint: string;
            if(albums_shelf_has_endpoint) browse_endpoint = albums_shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint?.browseEndpoint.browseId as string;
            else                          browse_endpoint = singles_shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs[0]?.navigationEndpoint?.browseEndpoint.browseId as string;
            const payload = { "browseId": browse_endpoint };
            const browse_response = await post_check_response(opts, artist_response.icfg.ytcfg, "browse?prettyPrint=false", payload);
            if("error" in browse_response) throw browse_response.error;
            const browse_data: ArtistResults_1 = await browse_response.json();
            return browse_data.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].gridRenderer.items.map(item => item.musicTwoRowItemRenderer);
        } catch (error) { return { "error": String(error) }; }
    }
    export async function search(opts: Opts, search_query: string): Promise<ICFGData<ReturnType<typeof Parser.parse_search_contents>>>       { return await parse_initial(opts, `https://music.youtube.com/search?q=${google_query(search_query)}`, Parser.parse_search_contents); }
    export async function search_mode(opts: Opts, endpoint: Endpoint, ytcfg: YTCFG) {
        try {
            if(endpoint === undefined) throw "Endpoint Undefined";
            const payload = endpoint;
            const search_response = await post_check_response(opts, ytcfg, "search?prettyPrint=false", payload);
            if("error" in search_response) throw search_response.error;
            const browse_data = await search_response.json();
            return Parser.parse_search_contents([undefined, browse_data]);
        } catch (error) { return { "error": String(error) }; }
    }
    export async function full_search(opts: Opts, search_query: string, mode: SearchMode){
        try {
            const all_search = await search(opts, search_query);
            if(mode === "All") return all_search;
            return search_mode(opts, all_search.data.mode_endpoints.find(endpoint => endpoint.id == mode)?.endpoint as Endpoint, all_search.icfg.ytcfg);
        } catch (error) { return { "error": String(error) }; }
    }
    
    export async function get_library(opts: Opts): Promise<ICFGData<ReturnType<typeof Parser.parse_library_contents>>|ResponseError> { 
        try {
            const icfg = await get_initial_data_config(opts, "https://music.youtube.com/library");
            if ("error" in icfg) throw icfg.error;
            const payload = { "browseId": "FEmusic_liked_playlists" };
            const browse_response = await post_check_response(opts, icfg.ytcfg, "browse?prettyPrint=false", payload);
            if("error" in browse_response) throw browse_response.error;
            const browse_data = await browse_response.json();
            return {
                "icfg": icfg,
                "data": Parser.parse_library_contents(browse_data)
            };
        } catch (error) { return { "error": String(error) }; }
    }

    export async function get_continuation(opts: Opts, ytcfg: YTCFG, next_con: Continuation) {
        try {
            const query_params = {
                ctoken: next_con[0].nextContinuationData.continuation,
                continutation: next_con[0].nextContinuationData.continuation,
                type: "next",
                itct: next_con[0].nextContinuationData.clickTrackingParams,
                prettyPrint: false
            };
            const payload = {};
            const response = await post_check_response(opts, ytcfg, `browse?${encode_params(query_params)}`, payload);
            if("error" in response) throw response.error;
            return (await response.json()) as ContinuedResults_0;
        } catch (error) { return { "error": String(error) } }
    }
    async function post_check_response(opts: Opts, ytcfg: YTCFG, path: string, payload: object){
        try {
            if (opts.cookie_jar === undefined) throw "CookieJar is empty";
            const epoch = new Date();
            const merged_payload = {...payload, ...{context: get_payload_context(ytcfg, epoch)}}
            const url = `https://music.youtube.com/youtubei/v1/${path}`;
            const response = await fetch(url, { method: "POST", credentials: "include", headers: get_post_headers(opts.cookie_jar, epoch), body: JSON.stringify(merged_payload) });
            return response;
        } catch (error) { return { "error": String(error) } }
    }
    async function post_check_succeed(opts: Opts, ytcfg: YTCFG, path: string, payload: object){
        const response = await post_check_response(opts, ytcfg, path, payload);
        if("error" in response) return false;
        return response.ok;
    } 
    export async function post_like(opts: Opts, ytcfg: YTCFG, video_id: string, like_path: string){
        const payload = {
            target: { videoId: video_id },
        }
        return await post_check_succeed(opts, ytcfg, `${like_path}?prettyPrint=false`, payload);
    }
    export async function post_edit_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, actions: object[]){
        const payload = {
            actions: actions,
            playlistId: playlist_id
        }
        return await post_check_succeed(opts, ytcfg, "browse/edit_playlist?prettyPrint=false", payload);
    }
    export async function like_track(opts: Opts, ytcfg: YTCFG, video_id: string)    { return await post_like(opts, ytcfg, video_id, "like/like");       }
    export async function dislike_track(opts: Opts, ytcfg: YTCFG, video_id: string) { return await post_like(opts, ytcfg, video_id, "like/dislike");    }
    export async function unlike_track(opts: Opts, ytcfg: YTCFG, video_id: string)  { return await post_like(opts, ytcfg, video_id, "like/removelike"); }
    export async function create_playlist(opts: Opts, ytcfg: YTCFG, title: string, privacy: Privacy){
        const payload = {
            title: title,
            privacyStatus: privacy
        }
        return await post_check_succeed(opts, ytcfg, "playlist/create?prettyPrint=false", payload);
    }
    export async function delete_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string){
        const payload = {
            playlistId: playlist_id
        }
        return await post_check_succeed(opts, ytcfg, "playlist/delete?prettyPrint=false", payload);
    }
    export async function add_tracks_to_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, video_ids: string[]){
        const actions = video_ids.map((video_id) => { return { "addedVideoId": video_id, "action": "ACTION_ADD_VIDEO", "dedupeOption": "DEDUPE_OPTION_CHECK" } });
        return await post_edit_playlist(opts, ytcfg, playlist_id, actions);
    }
    export async function remove_tracks_to_playlist(opts: Opts, ytcfg: YTCFG, playlist_id: string, video_ids: {video_id: string, set_video_id: string}[]){
        const actions = video_ids.map((video_id) => { return { "removedVideoId": video_id.video_id, "action": "ACTION_REMOVE_VIDEO", "setVideoId": video_id.set_video_id } });
        return await post_edit_playlist(opts, ytcfg, playlist_id, actions);
    }
    export async function edit_playlist_data(opts: Opts, ytcfg: YTCFG, playlist_id: string, playlist_data: {
        name: string,
        description: string,
        privacy: Privacy
    }){
        const actions = [ 
            { "action": "ACTION_SET_PLAYLIST_PRIVACY",     "playlistPrivacy": playlist_data.privacy }, 
            { "action": "ACTION_SET_PLAYLIST_NAME",        "playlistName": playlist_data.name }, 
            { "action": "ACTION_SET_PLAYLIST_DESCRIPTION", "playlistDescription": playlist_data.description}
        ];
        return await post_edit_playlist(opts, ytcfg, playlist_id, actions);
    }
}