import type { BaseOpts, PromiseResult } from "@common/types";
import { urlid } from "@common/utils/util";
import type { Config } from "@origin/amazon_music/types/Config";
import type { CreatePlaylist } from "@origin/amazon_music/types/CreatePlaylist";
import type { AmazonSearchTrack, SearchResult } from "@origin/amazon_music/types/SearchResult";
import type { ShowHome } from "@origin/amazon_music/types/ShowHome";
import type { AmazonTrack, CreateAndBindMethod } from "@origin/amazon_music/types/ShowHomeCreateAndBindMethod";
import type { AmazonMusicLibraryPlaylist, ShowLibraryHome } from "@origin/amazon_music/types/ShowLibraryHome";
import rozfetch from "@common/rozfetch";
import { try_json_parse } from "@common/utils/parse_util";
import { generror } from "@common/utils/error_util";
import { wait } from "@common/utils/timed_util";
import { base_get_headers, base_post_headers } from "@common/headers_base";

export namespace AmazonMusic {
    interface AuthHeader {
        interface: string,
        token: string,
        expirationMS: number
    }
    interface Opts extends BaseOpts { client?: Config }
    const client_cache = {client: null as Config|null, enabled: true};

    export function enable_cache(enable: boolean) { client_cache.enabled = enable; }
    export function client_cache_full() { return client_cache.enabled && client_cache.client !== null}

    function get_headers(opts: Opts){
        return {
            ...base_get_headers(opts),
            "if-none-match": "W/\"7d0-ftBuOfVR2/DK+r1ZmQnASQUtmQw\"",
            "Referer": "https://music.amazon.com/my/library",
        };
    }
    async function get_response<T>(url: string, opts: Opts){
        return await rozfetch<T>(url, {headers: get_headers(opts), ...opts.fetch_opts});
    }
    
    function post_headers(opts: Opts){
        return {
            ...base_post_headers(opts),
            "Referer": "https://music.amazon.com/",
        };
    }
    async function post_response<T>(url: string, opts: Opts, body: RequestInit['body']){
        return await rozfetch<T>(url, {headers: post_headers(opts), method: "POST", body: body, ...opts.fetch_opts});
    }
    function get_x_amzn_auth(amzn_music: Config) {
        return {
            interface: "ClientAuthenticationInterface.v1_0.ClientTokenElement",
            accessToken: amzn_music.accessToken
        }
    }
    function get_amzn_csrf(amzn_music: Config) {
        return {
            interface: "CSRFInterface.v1_0.CSRFHeaderElement",
            token: amzn_music.csrf.token,
            timestamp: amzn_music.csrf.ts,
            rndNonce: amzn_music.csrf.rnd
        }
    }
    function get_amzn_video_player_token(auth_header: AuthHeader) {
        return {
            interface: auth_header?.interface ?? {},
            token: auth_header?.token ?? "",
            expirationMS: auth_header?.expirationMS ?? 0
        }
    }
    function get_x_amzn_body_headers(amzn_music: Config, auth_header?: AuthHeader, playlist_url = "https://music.amazon.com/my/library") {
        const x_amzn_auth = get_x_amzn_auth(amzn_music);
        const x_amzn_csrf = get_amzn_csrf(amzn_music);
        const x_amzn_video_player_token = auth_header ? JSON.stringify(get_amzn_video_player_token(auth_header)) : "";
        return {
            "x-amzn-authentication": JSON.stringify(x_amzn_auth),
            "x-amzn-device-model": "WEBPLAYER",
            "x-amzn-device-width": "1920",
            "x-amzn-device-family": "WebPlayer",
            "x-amzn-device-id": amzn_music.deviceId,
            "x-amzn-user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "x-amzn-session-id": amzn_music.sessionId,
            "x-amzn-device-height": "1080",
            "x-amzn-request-id": "449fef43-8891-44ab-896c-6ed4c9ec1e77",
            "x-amzn-device-language": amzn_music.displayLanguage,
            "x-amzn-currency-of-preference": "USD",
            "x-amzn-os-version": "1.0",
            "x-amzn-application-version": amzn_music.version,
            "x-amzn-device-time-zone": "America/Phoenix",
            "x-amzn-timestamp": amzn_music.csrf.ts,
            "x-amzn-csrf": JSON.stringify(x_amzn_csrf),
            "x-amzn-music-domain": "music.amazon.com",
            "x-amzn-referer": "",
            "x-amzn-affiliate-tags": "",
            "x-amzn-ref-marker": "",
            "x-amzn-page-url": playlist_url,
            "x-amzn-weblab-id-overrides": "",
            "x-amzn-video-player-token": x_amzn_video_player_token,
            "x-amzn-feature-flags": "hd-supported,uhd-supported"
        };
    }
    function get_user_hash() {
        return { level: 'SONIC_RUSH_MEMBER' };
    }
    function get_deeplink(url: string){
        const trimmed_url = urlid(url, "music.amazon.com");
        return {
            interface: "DeeplinkInterface.v1_0.DeeplinkClientInformation",
            deeplink: trimmed_url
        };
    }

    export function playlist_urlid(playlist_url: string){
        return urlid(playlist_url, "music.amazon.com/", "my/playlists/", /.+?\//);
    }

    export async function get_amzn_music_data(opts: Opts): PromiseResult<Config> {
        if(client_cache_full()) return client_cache.client!;
        const response = await get_response<Config>("https://music.amazon.com/config.json", opts);
        if("error" in response) return response;
        const config = await response.json();
        if("error" in config) return config;
        if(client_cache.enabled) client_cache.client = config;
        return config;
    }

    async function get_show_home_data(url: string, amzn_music: Config, opts: Opts): PromiseResult<ShowHome> {
        const deeplink = get_deeplink(url);
        
        const body = JSON.stringify({ deeplink: JSON.stringify(deeplink), headers: JSON.stringify(get_x_amzn_body_headers(amzn_music, undefined, url)) });

        const show_home_response = await post_response<ShowHome>("https://na.mesk.skill.music.a2z.com/api/showHome", opts, body);
        if("error" in show_home_response) return show_home_response;
        const show_home = await show_home_response.json();
        return show_home;
    }

    async function get_amzn_music_body_headers_default(playlist_url: string, amzn_music: Config, opts: Opts) {
        const show_home = await get_show_home_data(playlist_url, amzn_music, opts);
        if ("error" in show_home) return show_home;
        const auth_header = "header" in show_home.methods[0] ? try_json_parse<AuthHeader>(show_home.methods[0].header) : undefined;
        if(auth_header === undefined) return generror("Auth Header is undefined", {playlist_url, amzn_music, opts});
        if("error" in auth_header) return auth_header;
        const body_headers = get_x_amzn_body_headers(amzn_music, auth_header, playlist_url);
        return body_headers;
    }

    export async function account_playlists(opts: Opts): PromiseResult<AmazonMusicLibraryPlaylist[]> {
        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;
        const request_headers = await get_amzn_music_body_headers_default("https://music.amazon.com/my/library", amzn_music, opts);
        if ("error" in request_headers) return request_headers;
        const user_hash = get_user_hash();
        const request_payload = { headers: JSON.stringify(request_headers), userHash: JSON.stringify(user_hash) };
        const show_library_response = await post_response<ShowLibraryHome>("https://na.mesk.skill.music.a2z.com/api/showLibraryHome", opts, JSON.stringify(request_payload));
        if("error" in show_library_response) return show_library_response;
        const show_library = await show_library_response.json();
        if("error" in show_library) return show_library;
        if (show_library.methods[0].interface !== "TemplateListInterface.v1_0.BindTemplateMethod")
            return generror("TemplateListInterface not found in Show Library Home method interface", {opts});
        const playlists = show_library.methods[0].template?.widgets?.[1]?.items ?? [];
        return playlists;
    }

    export function get_track_id(track: { "primaryLink": { "deeplink": string } }) {
        return track.primaryLink.deeplink.replace(/\/.+?\/.+?\?trackAsin=/, '');
    }

    export async function get_playlist(playlist_url: string, opts: Opts): PromiseResult<{title: string, tracks: AmazonTrack[]}> {
        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;
        const show_home = await get_show_home_data(playlist_url, amzn_music, opts);
        if ("error" in show_home) return show_home;

        const template_list_index = show_home.methods.findIndex(method => method.interface === "TemplateListInterface.v1_0.CreateAndBindTemplateMethod");
        if (template_list_index === -1) return generror("Unable to find TemplateListInterface.v1_0.CreateAndBindTemplateMethod", {playlist_url, opts});
        const create_and_bind_method = show_home.methods[template_list_index] as CreateAndBindMethod;
        const amzn_track_data = create_and_bind_method.template.widgets[0].items;

        return { title: create_and_bind_method.template.headerImageAltText, tracks: amzn_track_data };
    }

    export async function search_tracks(query: string, opts: Opts): PromiseResult<AmazonSearchTrack[]> {
        const url = `https://music.amazon.com/search/${query.replace(/\s+/g, '+').replace(/[^A-Za-z0-9+]+/g, '')}`
        const filter = { IsLibrary: ["false"] };
        const keyword = {
            interface: "Web.TemplatesInterface.v1_0.Touch.SearchTemplateInterface.SearchKeywordClientInformation",
            keyword: ""
        }

        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;

        const user_hash = get_user_hash();
        const body_headers = await get_amzn_music_body_headers_default(url, amzn_music, opts);
        if ("error" in body_headers) return body_headers;

        const request_payload = {
            filter: JSON.stringify(filter),
            keyword: JSON.stringify(keyword),
            suggestedKeyword: query,
            userHash: JSON.stringify(user_hash),
            headers: JSON.stringify(body_headers)
        }
        const response = await post_response<SearchResult>("https://na.mesk.skill.music.a2z.com/api/showSearch", opts, JSON.stringify(request_payload));
        if("error" in response) return response;
        const search_result = await response.json();
        if("error" in search_result) return search_result;

        let song_widgets_index = 2;
        const widgets = search_result.methods[0].template.widgets
        for (let i = 0; i < widgets.length; i++) {
            if (widgets[i].header !== "Songs") continue;
            song_widgets_index = i;
        }
        const tracks = search_result.methods[0].template.widgets[song_widgets_index].items;
        return tracks;
    }
    export async function add_to_playlist(playlist_url: string, playlist_name: string, uids: string[], opts: Opts) {
        const playlist_id = playlist_urlid(playlist_url);

        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;

        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_body_headers_default(playlist_url, amzn_music, opts);
        if ("error" in request_headers) return request_headers;

        const selected_ids = {
            interface: "Web.PageInterface.v1_0.SelectedItemsClientInformation",
            ids: uids
        };

        const request_payload = {
            headers: JSON.stringify(request_headers),
            playlistId: playlist_id,
            playlistTitle: playlist_name,
            rejectDuplicate: "true",
            selectedIds: JSON.stringify(selected_ids),
            userHash: JSON.stringify(user_hash),
            version: "14",
        };
        const response = post_response("https://na.mesk.skill.music.a2z.com/api/add_tracks_to_playlist", opts, JSON.stringify(request_payload));
        return response;
    }
    export async function delete_from_playlist(playlist_url: string, track_ids: string[], delay: number, opts: Opts) {
        const playlist_id = playlist_urlid(playlist_url);

        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;

        const playlist = await get_playlist(playlist_url, { client: amzn_music });
        if ("error" in playlist) return playlist;

        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_body_headers_default(playlist_url, amzn_music, opts);
        if ("error" in request_headers) return request_headers;

        const result = { ok: true };
        for (const track_id of track_ids) {
            const playlist_item = playlist.tracks.find((item) => get_track_id(item) === track_id);
            const request_payload = {
                headers: JSON.stringify(request_headers),
                playlistId: playlist_id,
                trackEntryId: playlist_item?.id,
                trackId: track_id,
                userHash: JSON.stringify(user_hash),
            };
            await post_response("https://na.mesk.skill.music.a2z.com/api/removeTrackFromPlaylist", opts, JSON.stringify(request_payload));
            if (delay > 0) await wait(delay);
        }
        return result;
    }
    export async function create_playlist(playlist_name: string, opts: Opts) {
        const url = "https://music.amazon.com/my/library";
        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;

        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_body_headers_default(url, amzn_music, opts);
        if ("error" in request_headers) return request_headers;

        const playlist_info = { interface: "Web.TemplatesInterface.v1_0.Touch.PlaylistTemplateInterface.PlaylistClientInformation", name: playlist_name, path: "/my/library" };

        const request_payload = {
            headers: JSON.stringify(request_headers),
            playlistInfo: JSON.stringify(playlist_info),
            userHash: JSON.stringify(user_hash)
        };
        const response = await post_response<CreatePlaylist>("https://na.mesk.skill.music.a2z.com/api/create_playlist", opts, JSON.stringify(request_payload));
        // https://na.mesk.skill.music.a2z.com/api/addTracksToPlaylist?playlistId=df292c92-5c59-4a76-aa65-e893f7fbdf48&playlistTitle=Lafou&version=1&rejectDuplicate=false&userHash=%7B%22level%22%3A%22SONIC_RUSH_MEMBER%22%7D
        if("error" in response) return response;
        return await response.json();
    }
    export async function delete_playlist(playlist_url: string, opts: Opts) {
        const amzn_music = opts.client ?? await get_amzn_music_data(opts);
        if ("error" in amzn_music) return amzn_music;

        const user_hash = get_user_hash();
        const request_headers = await get_amzn_music_body_headers_default(playlist_url, amzn_music, opts);
        if ("error" in request_headers) return request_headers;

        const playlist_id = playlist_urlid(playlist_url);

        const request_payload = {
            headers: JSON.stringify(request_headers),
            id: playlist_id,
            userHash: JSON.stringify(user_hash)
        };
        const response = await post_response("https://na.mesk.skill.music.a2z.com/api/removePlaylist", opts, JSON.stringify(request_payload));
        return response;
    }
}