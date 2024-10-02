import { CookieJar } from "../utils/cookie_util";
import { encode_params, extract_all_strings_from_pattern, extract_string_from_pattern } from "../utils/util";
import { ArtistUser, Playlist, Search, SearchOf, Track, User } from "./types/Search";
import { HydratablePlaylist, HydratableUser, Hydration } from "./types/Hydration";
import { UserTracks } from "./types/UserTracks";
import { ResponseError } from "../utils/types";

export namespace SoundCloud {
    type Opts = { cookie_jar?: CookieJar, client_id?: (string|ResponseError) }
    let app_version = 1727431820;

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
        return {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
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
        try {
            for(const asset_script of asset_scripts){
                const response = await fetch(asset_script, api_method_options(cookie_jar));
                if(!response.ok) continue;
                const extracted = extract_string_from_pattern(await response.text(), /client_id: ?"(.+?)"/si);
                if(typeof extracted === "object") continue;
                return extracted;
            }
            throw "Can't find client_id";
        } catch (error) { return { "error": String(error) }; }
    }
    export async function extract_from_page(url: string, pattern: RegExp, opts: Opts) {
        try {
            const response = await fetch(url, page_method_options(opts.cookie_jar));
            if (!response.ok) throw "Response not ok: extractFromPage";
            const text = await response.text();
            const exec = pattern.exec(text);
            if (exec === null || exec[1] === undefined) throw "Couldn't extract pattern: extractFromPage";
            return {extracted: exec[1], full: text};
        } catch (error) { return { "error": String(error) }; }
    }
    export async function get_hydration(url: string, opts: Opts){
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
    export async function continuation(next_href: string, locale_params: {"client_id": string}, opts: Opts, depth = -1): Promise<SCResult>{
        try {
            if(next_href === null || next_href === undefined || next_href === "" || depth === 0) throw null;
            const next_response = await fetch(`${next_href}&${encode_params(locale_params)}`, api_method_options());
            if(!next_response.ok) throw next_response.status;
            const next_data: SCResult = await next_response.json();
            if(depth === 1) return next_data;
            const combined_data = combine_continuation(next_data, await continuation(next_data.next_href, locale_params, opts, depth - 1));
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
    export async function search(search_type: "TRACKS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<Track>>
    export async function search(search_type: "PEOPLE", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<User>>
    export async function search(search_type: "ALBUMS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<Playlist>>
    export async function search(search_type: "PLAYLISTS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<Playlist>>
    export async function search(search_type: "EVERYTHING", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<Playlist|Track|User>>
    export async function search(search_type: SearchType, opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseError<SearchOf<Playlist|Track|User>> {
        try {
            const hydration = await get_hydration(`https://soundcloud.com/search?${encode_params({q: opts.query})}`, opts);
            if("error" in hydration) throw hydration.error;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
            const anonymous_hydration = hydration.hydration.find(item => item.hydratable === "anonymousId");
            if (typeof opts.client_id === "object") throw opts.client_id.error;
            const locale_params = {
                client_id: opts.client_id,
                linked_partitioning: 1,
                app_version: app_version,
                app_locale: "en"
            }
            const opts_params = {
                q: opts.query,
                variant_ids: "",
                facet: "model",
                user_id: anonymous_hydration?.data,
                limit: opts.limit ?? 20,
                offset: opts.offset ?? 0,
            }
            const params = Object.assign(locale_params, opts_params);
            const search_response = await fetch(`https://api-v2.soundcloud.com/${search_type_to_api_method(search_type ?? "EVERYTHING")}${encode_params(params)}`, api_method_options(opts.cookie_jar));
            if(!search_response.ok) throw `${search_response.status} : ${search_response.statusText}`;
            const search_data: Search = await search_response.json() as Search;
            const result: SearchOf<Playlist|Track|User> = combine_continuation(search_data, await continuation(search_data.next_href, locale_params, opts, opts.depth ?? 0) ) as unknown as SearchOf<Playlist|Track|User>;
            return result;
        } catch (error) { return { "error": String(error) }; }
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
    export async function get_artist(mode: ArtistMode = "ALL", opts: Opts & { "artist_id": string, "depth"?: number, "limit"?: number, "offset"?: number }) : PromiseError<ArtistUser<Playlist|User|Track>> {
        try {
            const hydration = await get_hydration(`https://soundcloud.com/${opts.artist_id}`, opts);
            if("error" in hydration) throw hydration.error;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id; 
            if (typeof opts.client_id === "object") throw opts.client_id.error;
            const user_hyrdration: HydratableUser = hydration.hydration.find((hydratable) => hydratable.hydratable == "user") as HydratableUser;
            const locale_params = {
                client_id: opts.client_id,
                linked_partitioning: 1,
                app_version: app_version,
                app_locale: "en"
            }
            const opts_params = {
                representation: "",
                limit: opts.limit ?? 20,
                offset: opts.offset ?? 0,
            }
            const params = Object.assign(locale_params, opts_params);
            const repost_mode_str = mode === "REPOSTS" ? "stream/" : "";
            const artist_response = await fetch(`https://api-v2.soundcloud.com/${repost_mode_str}users/${user_hyrdration.data.id}/${artist_mode_to_api_method(mode ?? "ALL")}?${encode_params(params)}`, api_method_options() );
            if(!artist_response.ok) throw `${artist_response.status} : ${artist_response.statusText}`;
            const artist: Search = await artist_response.json() as Search;
            return {"user": user_hyrdration, "artist_data": combine_continuation(artist, await continuation(artist.next_href, locale_params, opts, opts.depth ?? 0)) as unknown as SearchOf<Playlist|User|Track>};
        } catch (error) { return { "error": String(error) }; }
    }
    export async function get_playlist(opts: Opts & ({ "playlist_path": string })) {
        try {
            const hydration = await get_hydration(`https://soundcloud.com/${opts.playlist_path}`, opts);
            if("error" in hydration) throw hydration.error;
            opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
            if (typeof opts.client_id === "object") throw opts.client_id.error;
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
            const playlist_tracks_response = await fetch(`https://api-v2.soundcloud.com/tracks?${encode_params(params)}`, { "headers": post_api_headers(opts.cookie_jar ?? new CookieJar([])), "method": "GET" });
            if(!playlist_tracks_response.ok) throw playlist_tracks_response.ok;
            const playlist_tracks: Track[] = await playlist_tracks_response.json();
            return { "hydration": playlist_hyrdration, "tracks": playlist_tracks };
        } catch (error) { return { "error": String(error) }; }
    }
    export async function get_mix(opts: Opts & {track_id: string}){
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if("error" in hydration) throw hydration.error;
        if(opts.cookie_jar === undefined) return {"error": "Soundcloud Cookie Jar is undefined"};
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") return opts.client_id;
        const params = {
            user_id: get_self_user_id(opts.cookie_jar),
            client_id: opts.client_id,
            limit: 50,
            offest: 0,
            app_version: app_version,
            app_locale: "en"
        }
        const mix_response = await fetch(`https://api-v2.soundcloud.com/tracks/${opts.track_id}/related?${encode_params(params)}`, { "headers": post_api_headers(opts.cookie_jar), "method": "GET" });
        if(!mix_response.ok) return {"error": String(mix_response.status)};
        return await mix_response.json() as SearchOf<Track>;
    }
    export async function create_playlist(opts: Opts & ({ sharing: "public"|"private", title: string, track_uids: number[] })){
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if("error" in hydration) throw hydration.error;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") throw opts.client_id.error;
        const params = {
            client_id: opts.client_id,
            app_version: app_version,
            app_locale: "en"
        }
        const payload = {
            "playlist": {
                "title": opts.title,
                "sharing": opts.sharing,
                "tracks": opts.track_uids,
                "_resource_id": "f-177",
                "_resource_type": "playlist"
            }
        }
        const response = await fetch(`https://api-v2.soundcloud.com/playlists?${encode_params(params)}`, {method: "POST", body: JSON.stringify(payload), headers: post_api_headers(opts.cookie_jar!)});
        return response;
    }
    export async function delete_playlist(opts: Opts & {playlist_id: string}){
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if("error" in hydration) throw hydration.error;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") throw opts.client_id.error;
        const params = {
            client_id: opts.client_id,
            app_version: app_version,
            app_locale: "en"
        };
        const response = await fetch(`https://api-v2.soundcloud.com/playlists/${opts.playlist_id}?${encode_params(params)}`, {
            "headers": post_api_headers(opts.cookie_jar!),
            "body": null,
            "method": "DELETE"
        });
        return response;
    }
    export function get_self_user_id(cookie_jar: CookieJar){
        const ajs_user_id = cookie_jar.getCookie('ajs_anonymous_id')!.getData().value;
        return decodeURIComponent(ajs_user_id).replace(/"/g,'').split(':')[2];
    }
    export async function get_all_user_playlists(opts: Opts){
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if("error" in hydration) throw hydration.error;
        opts.client_id = opts.client_id === undefined ? await get_client_id(asset_scripts(hydration.scripts_urls), opts.cookie_jar) : opts.client_id;
        if (typeof opts.client_id === "object") throw opts.client_id.error;
        const user_playlists = await get_artist("PLAYLISTS", {cookie_jar: opts.cookie_jar, client_id: opts.client_id, artist_id: get_self_user_id(opts.cookie_jar!)});
        if("error" in user_playlists) return user_playlists;
        return user_playlists.artist_data.collection;
    }
    export async function add_tracks_to_playlist(opts: Opts & {playlist_name: string, track_ids: number[]}){
        const playlists = await get_all_user_playlists(opts);
        if("error" in playlists) return {ok: false};
        const found_playlist = playlists.find(playlist => playlist.permalink === opts.playlist_name)!;
        const params = {
            client_id: opts.client_id,
            app_version: app_version,
            app_locale: "en"
        };
        const payload = {
            "playlist": {
                "tracks": found_playlist.tracks.map(track => track.id).concat(opts.track_ids)
            }
        };
        const response = await fetch(`https://api-v2.soundcloud.com/playlists/${found_playlist.id}?${encode_params(params)}`, { "headers": post_api_headers(opts.cookie_jar!), "body": JSON.stringify(payload), "method": "PUT" });
        return response;
    }
    export async function deleteTracksToPlaylist(opts: Opts & {playlist_name: string, track_ids: number[]}){
        const playlists = await get_all_user_playlists(opts);
        if("error" in playlists) return {ok: false};
        const found_playlist = playlists.find(playlist => playlist.permalink === opts.playlist_name)!;
        const params = {
            client_id: opts.client_id,
            app_version: app_version,
            app_locale: "en"
        };
        const payload = {
            "playlist": {
                "tracks": found_playlist.tracks.map(track => track.id).filter(track_id => !opts.track_ids.includes(track_id) )
            }
        };
        const response = await fetch(`https://api-v2.soundcloud.com/playlists/${found_playlist.id}?${encode_params(params)}`, { "headers": post_api_headers(opts.cookie_jar!), "body": JSON.stringify(payload), "method": "PUT" });
        return response;
    }
}
