import { CookieJar } from "../utils/cookie_util";
import { encode_params, extract_string_from_pattern, url_to_id } from "../utils/util";
import { MyPlaylists } from "./types/MyPlaylists";
import { Playlist } from "./types/Playlist";
import { SerializedServerData } from "./types/type";
import { UserPlaylist } from "./types/UserPlaylist";

export namespace AppleMusic {
    type Opts = { "cookie_jar"?: CookieJar };
    export async function extract_serialized_server_data(html: string, opts: Opts) {
        const serialized_server_data_regex = /<script type=\"application\/json\" id=\"serialized-server-data\">(.+?)<\/script>/s;
        const extraction = extract_string_from_pattern(html, serialized_server_data_regex);
        if (typeof extraction === "object") return extraction;
        const bearer_path = extract_string_from_pattern(html, /<script type=\"module\" crossorigin src=\"(.+?)\"><\/script>/);
        if (typeof bearer_path === "object") return bearer_path;
        const bearer = await get_bearer(bearer_path, opts);
        if(typeof bearer === "object") return bearer;
        return {"data": JSON.parse(extraction) as SerializedServerData, "authorization": bearer};
    }
    async function get_response(url: string, opts: Opts) {
        const response = await fetch(url, {
            "headers": {
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": opts.cookie_jar?.toString() as string
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "credentials": "include",
            "body": null,
            "method": "GET"
        });
        return response;
    }
    export async function get_serialized_server_data(url: string, opts: Opts) {
        const response = await get_response(url, opts);
        if (!response.ok) return { "error": String(response.status) };
        const text = await response.text();
        return await extract_serialized_server_data(text, opts);
    }
    function get_api_headers(bearer: string, opts: Opts) {
        const cookie_jar = opts.cookie_jar as CookieJar;
        const media_user_token_cookie = cookie_jar.getCookie("media-user-token");
        const media_user_token = media_user_token_cookie?.getData().value as string;
        return {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'authorization': 'Bearer ' + bearer,
            'cookie': cookie_jar.toString(),
            'media-user-token': media_user_token,
            'origin': 'https://music.apple.com',
            'priority': 'u=1, i',
            'referer': 'https://music.apple.com/',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        }
    }
    export async function get_bearer(path: string, opts: Opts) {
        const response = await fetch(`https://music.apple.com${path}`, {
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "priority": "u=1",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "script",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referer": "https://music.apple.com/",
                "Referrer-Policy": "strict-origin",
                "cookie": opts.cookie_jar?.toString() as string,
            },
            "body": null,
            "method": "GET"
        });
        if (!response.ok) return { "error": String(response.status) };
        const js = await response.text();
        const bearer = extract_string_from_pattern(js, /const .+? ?= ?["'`]([a-zA-Z0-9-.]{200,})["'`]/i);
        return bearer;
    }
    async function api_check_response(opts: Opts, bearer: string, path: string, params: object, payload: null|object, method: "GET"|"POST"|"DELETE" = "GET") {
        try {
            if(opts.cookie_jar === undefined) throw "CookieJar is empty";
            const url = `https://amp-api.music.apple.com/v1/${path}?${encode_params(params as Record<string, string>)}`;
            const response = await fetch(url, { method: method, "body": payload === null ? null : JSON.stringify(payload), "credentials": "include", "referrerPolicy": "strict-origin", headers: get_api_headers(bearer, opts) });
            return response;
        } catch (error) { return { "error": String(error) } }
    }
    export async function get_playlist(playlist_path: string, opts: Opts) {
        const playlist_response = await get_serialized_server_data(`https://music.apple.com/${playlist_path}`, opts);
        if ("error" in playlist_response) return playlist_response;
        if(playlist_path.match(/us\/playlist\/.+?\/.+/)){ // Non-user playlist
            const playlist = playlist_response.data as Playlist;
            return {"data": playlist[0].data, "authorization": playlist_response.authorization};
        }
        else { // User playlist
            const params = {
                "art%5Blibrary-music-videos%3Aurl%5D": "c,f",
                "art%5Burl%5D": "f",
                "extend": "hasCollaboration,isCollaborativeHost",
                "extend%5Blibrary-playlists%5D": "tags",
                "fields%5Bmusic-videos%5D": "artistUrl,artwork,durationInMillis,url",
                "fields%5Bsongs%5D": "artistUrl,artwork,durationInMillis,url",
                "format%5Bresources%5D": "map",
                "include": "catalog,artists,tracks",
                "include%5Blibrary-playlists%5D": "catalog,tracks,playlists",
                "include%5Bplaylists%5D": "curator",
                "include%5Bsongs%5D": "artists",
                "l": "en-US",
                "omit%5Bresource%5D": "autos",
                "platform": "web",
                "relate": "catalog"
            };
            const playlist_id = url_to_id(playlist_path, "us/", "library/", "playlist/", "?l=en-US");
            const api_playlists_response = await api_check_response(opts, playlist_response.authorization, `me/library/playlists/${playlist_id}`, params, null);
            if ("error" in api_playlists_response) return api_playlists_response;
            if(!api_playlists_response.ok) return {"error": String(api_playlists_response.status)};
            const user_playlist: UserPlaylist = await api_playlists_response.json();
            return {"data": user_playlist, "authorization": playlist_response.authorization};
        }
    }
    export async function get_playlist_continuation(playlist_id: string, offset: number, authorization: string, opts: Opts){
        const params = {
            "l": "en-US",
            "offset": offset,
            "art%5Burl%5D": "f",
            "fields%5Bsongs%5D": "artistUrl,url",
            "format%5Bresources%5D": "map",
            "include": "catalog",
            "platform": "web",
        };
        const playlists_response = await api_check_response(opts, authorization, `me/library/playlists/${playlist_id}/tracks`, params, null);
        if ("error" in playlists_response) return playlists_response;
        return await playlists_response.json() as UserPlaylist;
    }
    export async function account_playlists(opts: Opts) {
        const data = await get_serialized_server_data("https://music.apple.com/us/library/all-playlists/", opts);
        if("error" in data) return data;
        const params = {
            "art%5Burl%5D": "f",
            "extend": "hasCollaboration",
            "extend%5Blibrary-playlists%5D": "tags",
            "fields%5Bplaylists%5D": "curatorName",
            "format%5Bresources%5D": "map",
            "include": "catalog",
            "l": "en-US",
            "offset": 0,
            "omit%5Bresource%5D": "autos",
            "platform": "web"
        }
        const playlists_response = await api_check_response(opts, data.authorization, "me/library/playlist-folders/p.playlistsroot/children", params, null);
        if ("error" in playlists_response) return playlists_response;
        return await playlists_response.json() as MyPlaylists;
    }
    export async function add_tracks_to_playlist(playlist_id: string, track_ids: {id: string, type: "songs"}[], opts: Opts) {
        const data = await get_serialized_server_data("https://music.apple.com/us/library/all-playlists/", opts);
        if("error" in data) return data;
        const params = {
            "art%5Burl%5D": "f",
            "l": "en-US",
            "representation": "resources"
        };
        const payload = {
            "data": track_ids
        }
        const playlists_response = await api_check_response(opts, data.authorization, `me/library/playlists/${playlist_id}/tracks`, params, payload, "POST");
        return playlists_response;
    }
    export async function remove_track_from_playlist(playlist_id: string, track_id: string, authorization: string, opts: Opts) {
        const params = {
            "ids[library-songs]": track_id,
            "mode": "all",
            "art%5Burl%5D": "f"
        };
        const playlists_response = await api_check_response(opts, authorization, `me/library/playlists/${playlist_id}/tracks`, params, null, "DELETE");
        return playlists_response;
    }
    export async function create_playlist(playlist_name: string, description: string, is_public: boolean, tracks: {"id": string, "type": "songs"}[], opts: Opts) {
        const data = await get_serialized_server_data("https://music.apple.com/us/library/all-playlists/", opts);
        if("error" in data) return data;
        const params = {
            "art%5Burl%5D": "f",
            "l": "en-US",
        };
        const payload = {
            "attributes": {
                "name": playlist_name,
                "description": description,
                "isPublic": is_public
            },
            "relationships": { "tracks": { "data": tracks } }
        };
        const playlists_response = await api_check_response(opts, data.authorization, "me/library/playlists", params, payload, "POST");
        return playlists_response;
    }
    export async function delete_playlist(playlist_id: string, opts: Opts) {
        const data = await get_serialized_server_data("https://music.apple.com/us/library/all-playlists/", opts);
        if("error" in data) return data;
        const params = {
            "art%5Burl%5D": "f"
        };
        const playlists_response = await api_check_response(opts, data.authorization, `me/library/playlists/${playlist_id}`, params, null, "DELETE");
        return playlists_response;
    }
}