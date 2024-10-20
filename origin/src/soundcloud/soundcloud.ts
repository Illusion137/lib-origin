import { CookieJar } from "../utils/cookie_util";
import { encode_params, extract_all_strings_from_pattern, extract_string_from_pattern, is_empty, remove, url_to_id } from "../utils/util";
import { ArtistRecommendation, ArtistShortcut, ArtistUser, ClientSearchOf, HistoryTrack, LikedTrack, Playlist, Search, SearchOf, Track, User } from "./types/Search";
import { HydratablePlaylist, HydratableUser, Hydration } from "./types/Hydration";
import { FetchMethod, ResponseError, ResponseSuccess } from "../utils/types";

export namespace SoundCloud {
    type Opts = { cookie_jar?: CookieJar, client_id?: (string|ResponseError) }
    let app_version = 1727431820;
    function requires_cookies(opts: Opts): ResponseError | ResponseSuccess{
        if(opts.cookie_jar === undefined || opts.cookie_jar.getCookies().length === 0) return {"error": "No cookies supplied"};
        return {"success": true};
    }
    export function clean_permalink(permalink?: string){
        if(permalink === undefined) return "";
        return remove(url_to_id(permalink), "m.soundcloud.com/", "soundcloud.com/", /\?.+/);
    }
    function page_method_options(cookie_jar?: CookieJar): RequestInit {
        return {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "upgrade-insecure-requests": "1",
                "cookie": cookie_jar?.toString() as string
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        }
    }
    function api_method_options(cookie_jar?: CookieJar): RequestInit {
        const datadome_cookie = cookie_jar?.getCookie('datadome');
        const oauth_cookie = cookie_jar?.getCookie('oauth_token');
        return {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "authorization": oauth_cookie !== undefined ? `OAuth ${oauth_cookie.getData().value}` : undefined as unknown as string,
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-datadome-clientid": datadome_cookie?.getData()?.value as string,
                "Referer": "https://soundcloud.com/",
                "Referrer-Policy": "origin",
                "cookie": cookie_jar?.toString() as string
            },
            "body": null,
            "method": "GET"
        }
    }
    function post_api_headers(cookie_jar: CookieJar){
        if(cookie_jar === undefined) cookie_jar === new CookieJar([]);
        const oauth_cookie = cookie_jar.getCookie('oauth_token');
        const datadome_cookie = cookie_jar.getCookie('datadome');
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "authorization": oauth_cookie !== undefined ? `OAuth ${oauth_cookie.getData().value}` : undefined as unknown as string,
            "content-type": "application/json",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-datadome-clientid": datadome_cookie?.getData().value as string,
            "Referer": "https://soundcloud.com/",
            "Referrer-Policy": "origin"
        }
    }
    export async function get_client_id(asset_scripts: string[], cookie_jar?: CookieJar) {
        for(const asset_script of asset_scripts){
            const response = await fetch(asset_script, api_method_options(cookie_jar));
            if(!response.ok) continue;
            const extracted = extract_string_from_pattern(await response.text(), /client_id: ?"(.+?)"/si);
            if(typeof extracted === "object") continue;
            return extracted;
        }
        return {"error": "Can't find client_id"};
    }
    export async function extract_from_page(url: string, pattern: RegExp, opts: Opts): PromiseError<{extracted: string, full: string}> {
        const response = await fetch(url, page_method_options(opts.cookie_jar));
        if (!response.ok) return {"error": "Response not ok: extractFromPage"};
        const text = await response.text();
        const exec = pattern.exec(text);
        if (exec === null || exec[1] === undefined) return {"error": "Couldn't extract pattern: extractFromPage"};
        return {extracted: exec[1], full: text};
    }
    export async function get_hydration(url: string, opts: Opts): PromiseError<{hydration: Hydration, scripts_urls: string[]}>{
        const hydration_text = await extract_from_page(url, /__sc_hydration ?= ?(.+?);<\/script>/si, opts);
        if ("error" in hydration_text) return {"error": hydration_text.error};
        const hydration: Hydration = JSON.parse(hydration_text.extracted);
        
        const version_string = extract_string_from_pattern(hydration_text.full, /window.__sc_version ?= ?"(.+?)"/si);
        if (typeof version_string === "object") return version_string;
        app_version = parseInt(version_string);
        
        const scripts = extract_all_strings_from_pattern(hydration_text.full, /<script.+?src="(.+?)".*?>/gsi);
        return {hydration: hydration, scripts_urls: scripts};
    }
    export function asset_scripts(scripts: string[]){
        return scripts.filter(script => script.includes("assets"));
    }
    export function get_locale_params(opts: Opts){
        return {
            client_id: <string>opts.client_id,
            linked_partitioning: 1,
            app_version: app_version,
            app_locale: "en"
        }
    }
    export async function apiget<T>(opts: Opts & {path: string, params?: Record<string, any>, hydration_url?: string, requires_cookies?: boolean}){
        if(opts.requires_cookies ?? false) {
            const has_cookies = requires_cookies(opts);
            if("error" in has_cookies) return has_cookies;
        }
        let hydration = <Awaited<ReturnType<typeof get_hydration>>>{};
        if(opts.client_id === undefined){
            hydration = await get_hydration(opts.hydration_url ?? `https://soundcloud.com/`, opts);
            if("error" in hydration) return hydration;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        }
        const params = {
            ...opts.params,
            ...get_locale_params(opts)
        }
        const response = await fetch(`https://api-v2.soundcloud.com/${opts.path}?${encode_params(params)}`, api_method_options(opts.cookie_jar));
        if(!response.ok) return {"error": String(response.status)};
        return {data: <SearchOf<T>> await response.json(), client_id: opts.client_id, hydration: hydration};
    }
    export async function apipost(opts: Opts & {path: string, params?: Record<string, any>, payload: object|null, method?: FetchMethod, hydration_url?: string, }){
        const has_cookies = requires_cookies(opts);
        if("error" in has_cookies) return has_cookies;
        let hydration = <Awaited<ReturnType<typeof get_hydration>>>{};
        if(opts.client_id === undefined){
            hydration = await get_hydration(opts.hydration_url ?? `https://soundcloud.com/`, opts);
            if("error" in hydration) return hydration;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        }
        const params = {
            ...opts.params,
            ...get_locale_params(opts)
        }
        const response = await fetch(`https://api-v2.soundcloud.com/playlists?${encode_params(params)}`, {method: opts.method ?? "POST", body: opts.payload === null ? null : JSON.stringify(opts.payload), headers: post_api_headers(opts.cookie_jar!)});
        if(!response.ok) return {"error": String(response.status)};
        return {data: response, client_id: opts.client_id, hydration: hydration};
    }
    type SCResult = {
        "collection": any[],
        "next_href": string,
        "query_urn": string|null
    }
    export function combine_continuation(current: SCResult, next: SCResult){
        return {
            "collection": current.collection.concat(next.collection),
            "next_href": next.next_href,
            "query_urn": null
        }
    }
    export async function continuation(next_href: string, opts: Opts, depth = -1): Promise<SCResult>{
        try {
            if(next_href === null || next_href === undefined || next_href === "" || depth === 0) throw null;
            const locale_params = get_locale_params(opts);
            const next_response = await fetch(`${next_href}&${encode_params(locale_params)}`, api_method_options());
            if(!next_response.ok) throw next_response.status;
            const next_data: SCResult = await next_response.json();
            if(depth === 1) return next_data;
            const combined_data = combine_continuation(next_data, await continuation(next_data.next_href, opts, depth - 1));
            return combined_data;
        } catch (error) { 
            return {
                "collection": [],
                "next_href": "",
                "query_urn": null
            }
        }
    }
    type SearchType = "EVERYTHING" | "TRACKS" | "PEOPLE" | "ALBUMS" | "PLAYLISTS"; 
    function search_type_to_api_method(search_type: SearchType): string{
        switch(search_type){ 
            case "EVERYTHING": return "search?";
            case "TRACKS": return "search/tracks?";
            case "PEOPLE": return "search/users?";
            case "ALBUMS": return "search/albums?";
            case "PLAYLISTS": return "search/playlists_without_albums?";
        }
    }
    type PromiseError<T>  = Promise<T|ResponseError>;
    export async function search(search_type: "TRACKS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<Track>>
    export async function search(search_type: "PEOPLE", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<User>>
    export async function search(search_type: "ALBUMS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<Playlist>>
    export async function search(search_type: "PLAYLISTS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<Playlist>>
    export async function search(search_type: "EVERYTHING", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<Playlist|Track|User>>
    export async function search(search_type: SearchType, opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ClientSearchOf<Playlist|Track|User>> {
        const hydration = await get_hydration(`https://soundcloud.com/search?${encode_params({q: opts.query})}`, opts);
        if("error" in hydration) return hydration;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        const anonymous_hydration = hydration.hydration.find(item => item.hydratable === "anonymousId");
        if (typeof opts.client_id === "object") return opts.client_id;
        const params = {
            ...get_locale_params(opts),
            q: opts.query,
            variant_ids: "",
            facet: "model",
            user_id: anonymous_hydration?.data,
            limit: opts.limit ?? 20,
            offset: opts.offset ?? 0,
        }
        const search_response = await fetch(`https://api-v2.soundcloud.com/${search_type_to_api_method(search_type ?? "EVERYTHING")}${encode_params(params)}`, api_method_options(opts.cookie_jar));
        if(!search_response.ok) return {"error": `${search_response.status} : ${search_response.statusText}`};
        const search_data: Search = await search_response.json() as Search;
        const result: SearchOf<Playlist|Track|User> = combine_continuation(search_data, await continuation(search_data.next_href, opts, opts.depth ?? 0) ) as unknown as SearchOf<Playlist|Track|User>;
        return {data: result, client_id: opts.client_id!};
    }
    type ArtistMode = "ALL" | "POPULAR_TRACKS" | "TRACKS" | "ALBUMS" | "PLAYLISTS" | "REPOSTS";
    function artist_mode_to_api_method(artist_mode: ArtistMode): string{
        switch(artist_mode){ 
            case "ALL": return "spotlight";
            case "POPULAR_TRACKS": return "toptracks";
            case "TRACKS": return "tracks";
            case "ALBUMS": return "albums";
            case "PLAYLISTS": return "playlists_without_albums";
            case "REPOSTS": return "reposts";
        }
    }
    export async function get_artist(mode: "POPULAR_TRACKS", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<ArtistUser<Track>>
    export async function get_artist(mode: "TRACKS", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number })        : PromiseError<ArtistUser<Track>>
    export async function get_artist(mode: "REPOSTS", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number })       : PromiseError<ArtistUser<Track>>
    export async function get_artist(mode: "ALBUMS", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number })        : PromiseError<ArtistUser<Playlist>>
    export async function get_artist(mode: "PLAYLISTS", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number })     : PromiseError<ArtistUser<Playlist>>
    export async function get_artist(mode: ArtistMode = "ALL", opts: Opts & { "artist_permalink"?: string, "artist_id"?: string, "depth"?: number, "limit"?: number, "offset"?: number }) : PromiseError<ArtistUser<Playlist|User|Track>> {
        let artist_id = clean_permalink(opts.artist_id);
        let user_hyrdration: HydratableUser = <never>{};
        if(!is_empty(opts.artist_permalink)){
            const hydration = await get_hydration(`https://soundcloud.com/${clean_permalink(opts.artist_permalink)}`, opts);
            if("error" in hydration) return hydration;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id; 
            if (typeof opts.client_id === "object") return opts.client_id;
            user_hyrdration = hydration.hydration.find((hydratable) => hydratable.hydratable == "user") as HydratableUser;
            artist_id = String(user_hyrdration.data.id);
        }
        const params = {
            ...get_locale_params(opts),
            representation: "",
            limit: opts.limit ?? 20,
            offset: opts.offset ?? 0,
        }
        const repost_mode_str = mode === "REPOSTS" ? "stream/" : "";
        const artist_response = await fetch(`https://api-v2.soundcloud.com/${repost_mode_str}users/${artist_id}/${artist_mode_to_api_method(mode ?? "ALL")}?${encode_params(params)}`, api_method_options(opts.cookie_jar) );
        if(!artist_response.ok) return {"error": `${artist_response.status} : ${artist_response.statusText}` };
        const artist: Search = await artist_response.json() as Search;
        return {"user": user_hyrdration, "artist_data": combine_continuation(artist, await continuation(artist.next_href, opts, opts.depth ?? 0)) as unknown as SearchOf<Playlist|User|Track>};
    }
    export async function get_playlist(opts: Opts & ({ playlist_path: string })) {
        const hydration = await get_hydration(`https://soundcloud.com/${clean_permalink(opts.playlist_path)}`, opts);
        if("error" in hydration) return hydration;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") return opts.client_id;
        const playlist_hyrdration: HydratablePlaylist = hydration.hydration.find((hydratable) => hydratable.hydratable == "playlist") as HydratablePlaylist;

        const locale_params = {
            client_id: opts.client_id,
            linked_partitioning: 1,
            app_version: app_version,
            app_locale: "en"
        }
        const opts_params = {
            ids: playlist_hyrdration.data.tracks.map(track => String(track.id)).join(",")
        }
        const params = Object.assign(locale_params, opts_params);
        const playlist_tracks_response = await fetch(`https://api-v2.soundcloud.com/tracks?${encode_params(params)}`, { "headers": post_api_headers(opts.cookie_jar!), "method": "GET" });
        if(!playlist_tracks_response.ok) return {"error": String(playlist_tracks_response.status)};;
        const playlist_tracks: Track[] = await playlist_tracks_response.json();
        return { "hydration": playlist_hyrdration, "tracks": playlist_tracks, "client_id": opts.client_id };
    }
    export async function get_mix(opts: Opts & {track_id: string, limit?: number, offset?: number}){
        return await apiget<Track>({...opts, path: `tracks/${opts.track_id}/related`, params: {user_id: get_self_user_id(opts.cookie_jar!), limit: opts.limit ?? 50, offset: opts.offset ?? 0}});
    }
    export async function listening_history(opts: Opts & {limit?: number, offset?: number}){
        return await apiget<HistoryTrack>({...opts, path: `me/play-history/tracks`, params: {limit: opts.limit ?? 50, offset: opts.offset ?? 0}});
    }
    export async function liked_music(opts: Opts & {limit?: number, offset?: number}){
        return await apiget<LikedTrack>({...opts, path: `users/${get_self_user_id(opts.cookie_jar!)}/track_likes`, params: {limit: opts.limit ?? 50, offset: opts.offset ?? 0}});
    }
    export async function new_tracks(opts: Opts & {limit?: number, offset?: number}){
        return await apiget<ArtistShortcut>({...opts, path: `me/artist-shortcuts`, params: {limit: opts.limit ?? 1000, offset: opts.offset ?? 0}});
    }
    export async function who_to_follow(opts: Opts & {limit?: number, offset?: number}){
        return await apiget<ArtistRecommendation>({...opts, path: `me/suggested/users/who_to_follow`, params: {limit: opts.limit ?? 1000, offset: opts.offset ?? 0}});
    }
    export async function following(opts: Opts & {limit?: number, offset?: number}){
        return await apiget<User>({...opts, path: `users/${get_self_user_id(opts.cookie_jar!)}/followings`, params: {limit: opts.limit ?? 12, offset: opts.offset ?? 0}});
    }
    export async function you_redirect(opts: Opts){
        const has_cookies = requires_cookies(opts);
        if("error" in has_cookies) return has_cookies;
        const redirect_response = await fetch("https://soundcloud.com/you", page_method_options(opts.cookie_jar));
        if(redirect_response.redirected === false) return {"error": "Response not redirected"};
        return redirect_response.headers.get("Location")?.replace("//", "");
    }
    function extract_playlist_name(permalink: string){
        return extract_string_from_pattern( clean_permalink(permalink), /\*+?\/sets\/(.+)/);
    }
    export async function create_playlist(opts: Opts & ({ sharing: "public"|"private", title: string, track_uids: number[] })){
        const payload = {
            "playlist": {
                "title": opts.title,
                "sharing": opts.sharing,
                "tracks": opts.track_uids,
                "_resource_id": "f-177",
                "_resource_type": "playlist"
            }
        }
        return await apipost({...opts, path: `playlists`, params: {}, payload: payload});
    }
    export async function delete_playlist(opts: Opts & {playlist_id: string}){
        const playlist_id = extract_playlist_name( opts.playlist_id);
        if(typeof playlist_id === "object") return playlist_id;
        return await apipost({...opts, path: `playlists/${playlist_id}`, params: {}, payload: null, method: "DELETE"});
    }

    export function get_self_user_id(cookie_jar: CookieJar){
        const ajs_user_id = cookie_jar.getCookie('ajs_user_id')!.getData().value;
        return decodeURIComponent(ajs_user_id).replace(/"/g,'').split(':')[2];
    }
    export async function get_all_user_playlists(opts: Opts){
        const has_cookies = requires_cookies(opts);
        if("error" in has_cookies) return has_cookies;
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if("error" in hydration) return hydration;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") return opts.client_id;
        const user_playlists = await get_artist("PLAYLISTS", {...opts, client_id: opts.client_id, artist_id: get_self_user_id(opts.cookie_jar!)});
        if("error" in user_playlists) return user_playlists;
        return {data: user_playlists.artist_data.collection, client_id: opts.client_id, hydration: hydration};
    }
    export async function add_tracks_to_playlist(opts: Opts & {playlist_name: string, track_ids: number[]}){
        const playlist_name = extract_playlist_name(opts.playlist_name);
        if(typeof playlist_name === "object") return playlist_name;
        const playlists = await get_all_user_playlists(opts);
        if("error" in playlists) return playlists;
        opts.client_id = playlists.client_id;
        const found_playlist = playlists.data.find(playlist => playlist.permalink === playlist_name)!;
        const payload = {
            "playlist": {
                "tracks": found_playlist.tracks.map(track => track.id).concat(opts.track_ids)
            }
        };
        return await apipost({...opts, path: `playlists/${found_playlist.id}`, params: {}, payload: payload, method: "PUT"});
    }
    export async function delete_tracks_to_playlist(opts: Opts & {playlist_name: string, track_ids: number[]}){
        const playlist_name = extract_playlist_name(opts.playlist_name);
        if(typeof playlist_name === "object") return playlist_name;
        const playlists = await get_all_user_playlists(opts);
        if("error" in playlists) return {ok: false};
        opts.client_id = playlists.client_id;
        const found_playlist = playlists.data.find(playlist => playlist.permalink === playlist_name)!;
        const payload = {
            "playlist": {
                "tracks": found_playlist.tracks.map(track => track.id).filter(track_id => !opts.track_ids.includes(track_id) )
            }
        };
        return await apipost({...opts, path: `playlists/${found_playlist.id}`, params: {}, payload: payload, method: "PUT"});
    }
}