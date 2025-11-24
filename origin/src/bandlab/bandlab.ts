import rozfetch from "@common/rozfetch";
import type { BaseOpts } from "@common/types";
import { encode_params } from "@common/utils/fetch_util";
import type { BandLabAuthResponse } from "./types/types";
import type { BandlabArtist } from "./types/Artist";
import type { CookieJar } from "@common/utils/cookie_util";
import { generror } from "@common/utils/error_util";
import type { BandLabProjects } from "./types/ProjectsList";
import type { BandLabSong } from "./types/Song";
import type { BandlabSearchUsers } from "./types/SearchUser";
import type { BandLabSearchSongs } from "./types/SearchSong";
import type { BandLabPlaylist } from "./types/Playlist";
import { urlid } from "@common/utils/util";

export namespace BandLab {
    type Opts = BaseOpts & {auth_token?: string;};

    function api_headers(opts: Opts){
        opts.auth_token ??= opts.cookie_jar?.getCookie("sessionKey")?.getData().value;
        return {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": `Bearer ${opts.auth_token}`,
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-client-id": "BandLab-Web",
            "x-client-version": "10.1.342",
            "cookie": opts.cookie_jar?.toString() as string,
            "Referer": "https://www.bandlab.com/library/projects/recent"
        }
    }

    const base_api_url = "https://www.bandlab.com/api/v1.3/";
    async function api_post_data<T>(path: string, payload: Record<string, any>, opts: Opts){
        return await rozfetch<T>(`${base_api_url}${urlid(path, "bandlab.com/")}`, {
            ...opts.fetch_opts,
            "headers": api_headers(opts),
            "body": JSON.stringify(payload),
            "method": "POST"
        });
    }

    async function api_get_data<T>(path: string, opts: Opts){
        return await rozfetch<T>(`${base_api_url}${urlid(path, "bandlab.com/")}`, {
            ...opts.fetch_opts,
            "headers": api_headers(opts),
            "method": "GET"
        });
    }

    export async function get_client(opts: Opts){
        const auth_response = await api_post_data<BandLabAuthResponse>("chat/authorizations", {}, opts);
        if("error" in auth_response) return auth_response;
        const auth_data = await auth_response.json();
        if("error" in auth_data) return auth_data;
        return auth_data.accessToken;
    }

    function get_user_id_cookie(cookie_jar: CookieJar){
        return cookie_jar.getCookies().find(cookie => cookie.getData().name.includes("ab.storage.userId."));
    }

    export function parse_user_id(cookie_jar: CookieJar){
        const user_id_cookie = get_user_id_cookie(cookie_jar);
        if(!user_id_cookie) return undefined;
        const user_id = user_id_cookie.getData().value;
        const user_id_data: [
            ['g', string],
            ['e', "undefined"],
            ['c', `${number}`],
            ['l',`${number}`]
        ] = decodeURIComponent(user_id).split('|').map(a => a.split(':')) as any;
        return user_id_data;
    }

    export function get_user_uuid(cookie_jar: CookieJar){
        return parse_user_id(cookie_jar)?.[0][1];
    }

    export async function projects_list(user_uuid: string, opts: Opts & {limit?: number; offset?: number}){
        const params = {
            limit: opts.limit ?? 30,
            offset: opts.offset ?? 0
        };
        const projects_response = await api_get_data<BandLabProjects>(`users/${user_uuid}/songs?${encode_params(params)}`, opts);
        if("error" in projects_response) return projects_response;
        return await projects_response.json();
    }

    export async function self_projects_list(opts: Opts & {limit?: number; offset?: number}){
        if(!opts.cookie_jar) return generror("Bandlab Self-Projects-List requires cookies");
        const user_id_cookie = get_user_id_cookie(opts.cookie_jar);
        if(!user_id_cookie) return generror("Bandlab Self-Projects-List requires cookies");
        return await projects_list(get_user_uuid(opts.cookie_jar) ?? "", opts);
    }

    export async function search_user(query: string, opts: Opts & {limit?: number}){
        const params = {
            limit: opts.limit ?? 3,
            query
        };
        const search_response = await api_get_data<BandlabSearchUsers>(`search/users?${encode_params(params)}`, opts);
        if("error" in search_response) return search_response;
        return await search_response.json();
    }
    export async function search_songs(query: string, opts: Opts & {limit?: number}){
        const params = {
            limit: opts.limit ?? 3,
            query
        };
        const search_response = await api_get_data<BandLabSearchSongs>(`search/users?${encode_params(params)}`, opts);
        if("error" in search_response) return search_response;
        return await search_response.json();
    }

    export async function get_playlist(id: string, opts: Opts){
        const playlist_response = await api_get_data<BandLabPlaylist>(`collections/${id}`, opts);
        if("error" in playlist_response) return playlist_response;
        return await playlist_response.json();
    }
    
    export async function get_artist(id: string, opts: Opts){
        const artist_response = await api_get_data<BandlabArtist>(`users/${id}`, opts);
        if("error" in artist_response) return artist_response;
        return await artist_response.json();
    }

    export async function get_song_info(song_id: string, opts: Opts){
        const song_response = await api_get_data<BandLabSong>(`songs/${song_id}`, opts);
        if("error" in song_response) return song_response;
        return await song_response.json();
    }
    
    export async function get_download_url(song_id: string, opts: Opts){
        const song_info = await get_song_info(song_id, opts);
        if("error" in song_info) return song_info;
        return song_info?.revision?.mixdown?.file;
    }
};