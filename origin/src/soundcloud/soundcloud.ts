import { CookieJar } from "@common/utils/cookie_util";
import type { BaseOpts, FetchMethod, PromiseResult, ResponseError, ResponseSuccess } from "@common/types";
import { extract_all_strings_from_pattern, extract_string_from_pattern, is_empty, milliseconds_of, urlid } from "@common/utils/util";
import type { HydratablePlaylist, HydratableUser, Hydration, UserData } from "@origin/soundcloud/types/Hydration";
import type { ArtistRecommendation, ArtistShortcut, ArtistUser, ClientSearchOf, HistoryTrack, LikedTrack, Playlist, QueryOutput, Search, SearchOf, Track, User } from "@origin/soundcloud/types/Search";
import { encode_params } from "@common/utils/fetch_util";
import rozfetch, { type RoZFetchRequestInit } from "@common/rozfetch";
import { generror } from "@common/utils/error_util";
import { try_json_parse } from "@common/utils/parse_util";
import { reinterpret_cast } from '@common/cast';
import type { ArtistStories } from "./types/ArtistStories";
import BufferRN from "buffer/";
import type { SoundCloudMixedSelection } from "./types/MixedSelection";
const Buffer = BufferRN.Buffer;

export namespace SoundCloud {
    const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
    type Opts = BaseOpts & { client_id?: (string | ResponseError) };
    let app_version = 1774492604;
    const client_cache = { client: { client_id: null as null | string, user_id: null as null | string }, enabled: true };

    export function enable_cache(enable: boolean) { client_cache.enabled = enable; }
    export function client_cache_full() { return client_cache.enabled && client_cache.client.client_id !== null; }
    export function client_cache_user_full() { return client_cache.enabled && client_cache.client.user_id !== null; }

    function requires_cookies(opts: Opts): ResponseError | ResponseSuccess {
        if (opts.cookie_jar === undefined || opts.cookie_jar.getCookies().length === 0) return generror("No cookies supplied", "INFO", { opts });
        return { success: true };
    }
    export function clean_permalink(permalink?: string) {
        if (permalink === undefined) return "";
        return urlid(permalink, "m.soundcloud.com/", "soundcloud.com/", /\?.+/);
    }
    function page_method_options(opts: Opts): RoZFetchRequestInit {
        const essential_cookie_names = ['oauth_token', 'datadome', '_soundcloud_session', 'sc_anonymous_id'];
        const cookie_string = essential_cookie_names
            .map(name => opts.cookie_jar?.getCookie(name))
            .filter(Boolean)
            .map(c => c!.toString())
            .join('; ');
        return {
            headers: {
                "User-Agent": USER_AGENT,
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
                "cookie": cookie_string
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            cache_opts: {
                cache_ms: milliseconds_of({ hours: 1 }),
                cache_mode: "file"
            },
            ...opts.fetch_opts
        }
    }
    function api_method_options(opts: Opts): RoZFetchRequestInit {
        const datadome_cookie = opts.cookie_jar?.getCookie('datadome');
        const oauth_cookie = opts.cookie_jar?.getCookie('oauth_token');
        const essential_cookie_names = ['oauth_token', 'datadome', '_soundcloud_session', 'sc_anonymous_id'];
        const cookie_string = essential_cookie_names
            .map(name => opts.cookie_jar?.getCookie(name))
            .filter(Boolean)
            .map(c => c!.toString())
            .join('; ');
        return {
            headers: {
                "User-Agent": USER_AGENT,
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
                "cookie": cookie_string
            },
            body: null,
            method: "GET",
            cache_opts: {
                cache_ms: milliseconds_of({ hours: 1 }),
                cache_ms_fail: milliseconds_of({ seconds: 10 }),
                cache_mode: "file"
            },
            ...opts.fetch_opts
        }
    }
    function post_api_headers(opts: Opts) {
        if (opts.cookie_jar === undefined) opts.cookie_jar === new CookieJar([]);
        const oauth_cookie = opts.cookie_jar?.getCookie('oauth_token');
        const datadome_cookie = opts.cookie_jar?.getCookie('datadome');
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
    export async function get_client_id(opts: Opts & { scripts?: string[], url?: string }) {
        if (client_cache_full()) return { client_id: client_cache.client.client_id!, hydration: null };
        let hydration: null | Awaited<ReturnType<typeof get_hydration>> = null;
        if (!opts.scripts) {
            hydration = await get_hydration(opts.url ?? "https://soundcloud.com/", { cookie_jar: opts.cookie_jar });
            if ("error" in hydration) return hydration;
            opts.scripts = hydration.scripts_urls;
        }

        for (const asset_script of asset_scripts(opts.scripts)) {
            const response = await rozfetch(asset_script, api_method_options({ ...opts, fetch_opts: { ...opts.fetch_opts, cache_opts: undefined } }));
            if ("error" in response) return response;
            const extracted = extract_string_from_pattern(await response.text(), /client_id: ?"(.+?)"/si, "INFO");
            if (typeof extracted === "object") continue;
            return { client_id: extracted, hydration };
        }
        return generror("Can't find client_id", "MEDIUM", { opts });
    }
    export async function extract_from_page(url: string, pattern: RegExp, opts: Opts): PromiseResult<{ extracted: string, full: string }> {
        const response = await rozfetch(url, page_method_options(opts));
        if ("error" in response) return response;
        const text = await response.text();
        const exec = pattern.exec(text);
        if (exec?.[1] === undefined) return generror("Couldn't extract pattern: extractFromPage", "MEDIUM", { url, pattern, opts });
        return { extracted: exec[1], full: text };
    }
    export async function get_hydration(url: string, opts: Opts): PromiseResult<{ hydration: Hydration, scripts_urls: string[] }> {
        const hydration_text = await extract_from_page(url, /__sc_hydration ?= ?(.+?);<\/script>/si, opts);
        if ("error" in hydration_text) return { error: hydration_text.error };
        const hydration = try_json_parse<Hydration>(hydration_text.extracted);
        if ("error" in hydration) return hydration;

        const version_string = extract_string_from_pattern(hydration_text.full, /window.__sc_version ?= ?"(.+?)"/si, "MEDIUM");
        if (typeof version_string === "object") return version_string;
        app_version = parseInt(version_string);

        const scripts = extract_all_strings_from_pattern(hydration_text.full, /<script.+?src="(.+?)".*?>/gsi);
        return { hydration, scripts_urls: scripts };
    }
    export function asset_scripts(scripts: string[]) {
        return scripts.filter(script => script.includes("assets"));
    }
    export function get_locale_params(opts: Opts) {
        return {
            client_id: opts.client_id as string,
            linked_partitioning: 1,
            app_version,
            app_locale: "en"
        }
    }
    export async function apiget<T>(opts: Opts & { path: string, params?: Record<string, any>, hydration_url?: string, requires_cookies?: boolean }) {
        if (opts.requires_cookies ?? false) {
            const has_cookies = requires_cookies(opts);
            if ("error" in has_cookies) return has_cookies;
        }
        let hydration = {} as Awaited<ReturnType<typeof get_hydration>>;
        if (opts.client_id === undefined) {
            hydration = await get_hydration(opts.hydration_url ?? `https://soundcloud.com/`, opts);
            if ("error" in hydration) return hydration;
            if (opts.client_id === undefined) {
                const client_id = await get_client_id({ ...opts, scripts: hydration.scripts_urls });
                if (!("error" in client_id)) {
                    opts.client_id = client_id.client_id;
                }
                else return client_id;
            }
        }
        const params = {
            ...opts.params,
            ...get_locale_params(opts)
        }
        const response = await rozfetch<SearchOf<T>>(`https://api-v2.soundcloud.com/${opts.path}?${encode_params(params)}`, api_method_options(opts));
        if ("error" in response) return response;
        const response_search_of = await response.json();
        if ("error" in response_search_of) return response_search_of;
        return { data: response_search_of, client_id: opts.client_id, hydration };
    }
    export async function apiget_cast<T>(opts: Opts & { path: string, params?: Record<string, any>, hydration_url?: string, requires_cookies?: boolean }) {
        return reinterpret_cast<{ data: T, client_id: string | ResponseError, hydration: Awaited<ReturnType<typeof get_hydration>> }>(apiget(opts));
    }
    export async function apipost<T>(opts: Opts & { path: string, params?: Record<string, any>, payload: object | null, method?: FetchMethod, hydration_url?: string, }) {
        const has_cookies = requires_cookies(opts);
        if ("error" in has_cookies) return has_cookies;
        let hydration = {} as Awaited<ReturnType<typeof get_hydration>>;
        if (opts.client_id === undefined) {
            hydration = await get_hydration(opts.hydration_url ?? `https://soundcloud.com/`, opts);
            if ("error" in hydration) return hydration;
            if (opts.client_id === undefined) {
                const client_id = await get_client_id({ ...opts, scripts: hydration.scripts_urls });
                if (!("error" in client_id)) {
                    opts.client_id = client_id.client_id;
                }
                else return client_id;
            }
        }
        const params = {
            ...opts.params,
            ...get_locale_params(opts)
        }
        const response = await rozfetch<T>(`https://api-v2.soundcloud.com/${opts.path}?${encode_params(params)}`, { method: opts.method ?? "POST", body: opts.payload === null ? null : JSON.stringify(opts.payload), headers: post_api_headers(opts), ...opts.fetch_opts });
        if ("error" in response) return response;
        return { data: response, client_id: opts.client_id, hydration };
    }
    export function combine_continuation<T>(current: SearchOf<T>, next: SearchOf<T>): SearchOf<T> {
        return {
            collection: current.collection.concat(next.collection),
            next_href: next.next_href,
            query_urn: null
        }
    }
    export async function continuation<T>(next_href: string, opts: Opts, depth = -1): Promise<SearchOf<T>> {
        try {
            if (next_href === null || next_href === undefined || next_href === "" || depth === 0) throw new Error();
            const locale_params = get_locale_params(opts);
            const next_response = await rozfetch<SearchOf<T>>(`${next_href}&${encode_params(locale_params)}`, api_method_options(opts));
            if ("error" in next_response) throw next_response.error;
            const next_data = await next_response.json();
            if ("error" in next_data) throw next_data.error;
            if (depth === 1) return next_data;
            const combined_data = combine_continuation<T>(next_data, await continuation(next_data.next_href, opts, depth - 1));
            return combined_data;
        } catch (_) {
            return {
                collection: [],
                next_href: "",
                query_urn: null
            }
        }
    }
    type SearchType = "EVERYTHING" | "TRACKS" | "PEOPLE" | "ALBUMS" | "PLAYLISTS";
    function search_type_to_api_method(search_type: SearchType): string {
        switch (search_type) {
            case "EVERYTHING": return "search?";
            case "TRACKS": return "search/tracks?";
            case "PEOPLE": return "search/users?";
            case "ALBUMS": return "search/albums?";
            case "PLAYLISTS": return "search/playlists_without_albums?";
        }
    }
    export async function try_user_id(url: string, opts: Opts) {
        if (client_cache_user_full()) return [client_cache.client.client_id, client_cache.client.user_id!];
        const hydration = await get_hydration(url, opts);
        if ("error" in hydration) return hydration;
        const anonymous_hydration = hydration.hydration.find(item => item.hydratable === "anonymousId");
        if (opts.client_id === undefined) {
            const client_id = await get_client_id({ ...opts, scripts: hydration.scripts_urls });
            if (!("error" in client_id)) {
                opts.client_id = client_id.client_id;
            }
            else return client_id;
        }
        // TODO investigate this
        const res: [string | undefined | ResponseError, string | undefined] = [opts.client_id ?? client_cache.client?.client_id, anonymous_hydration?.data];
        if (typeof res[0] === "object" && !is_empty(res)) return res[0];
        if (client_cache.enabled) {
            if (!is_empty(res[0]))
                client_cache.client.client_id = (res[0] as string);
            if (!is_empty(res[1]))
                client_cache.client.user_id = res[1]!;
        }
        return res;
    }
    export async function search(search_type: "TRACKS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ClientSearchOf<Track>>
    export async function search(search_type: "PEOPLE", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ClientSearchOf<User>>
    export async function search(search_type: "ALBUMS" | "PLAYLISTS", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ClientSearchOf<Playlist>>
    export async function search(search_type: "EVERYTHING", opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ClientSearchOf<Playlist | Track | User>>
    export async function search(search_type: SearchType, opts: Opts & { "query": string, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ClientSearchOf<Playlist | Track | User>> {
        const hydration = await try_user_id(`https://soundcloud.com/search?${encode_params({ q: opts.query })}`, opts);
        if ("error" in hydration) return hydration;
        opts.client_id = hydration[0]!;
        if (typeof opts.client_id === "object") return opts.client_id;
        const params = {
            ...get_locale_params(opts),
            q: opts.query,
            variant_ids: "",
            facet: search_type === "EVERYTHING" ? "model" : "genre", // TODO: COULD ALSO BE "genre" 
            user_id: hydration[1],
            limit: opts.limit ?? 20,
            offset: opts.offset ?? 0,
        }
        const search_response = await rozfetch<Search>(`https://api-v2.soundcloud.com/${search_type_to_api_method(search_type ?? "EVERYTHING")}${encode_params(params)}`, api_method_options(opts));
        if ("error" in search_response) return search_response;
        const search_data = await search_response.json();
        if ("error" in search_data) return search_data;
        const result = combine_continuation<Playlist | Track | User>(search_data, await continuation<Playlist | Track | User>(search_data.next_href, opts, opts.depth ?? 0));
        return { data: result, client_id: opts.client_id };
    }
    type ArtistMode = "ALL" | "POPULAR_TRACKS" | "TRACKS" | "ALBUMS" | "PLAYLISTS" | "REPOSTS";
    function artist_mode_to_api_method(artist_mode: ArtistMode): string {
        switch (artist_mode) {
            case "ALL": return "spotlight";
            case "POPULAR_TRACKS": return "toptracks";
            case "TRACKS": return "tracks";
            case "ALBUMS": return "albums";
            case "PLAYLISTS": return "playlists_without_albums";
            case "REPOSTS": return "reposts";
        }
    }

    export async function permalink_to_artist_id(opts: Opts & { "artist_permalink": string }) {
        opts.artist_permalink = urlid(opts.artist_permalink, "soundcloud.com/");
        opts.artist_permalink = `https://soundcloud.com/${opts.artist_permalink}`;
        if (opts.client_id === undefined) {
            const client_id = await get_client_id({});
            if ("error" in client_id) return client_id;
            opts.client_id = client_id.client_id;
        }
        const params = {
            ...get_locale_params(opts),
            url: opts.artist_permalink
        };

        const resolve_response = await rozfetch<UserData>(`https://api-v2.soundcloud.com/resolve?${encode_params(params)}`, api_method_options(opts));
        if ("error" in resolve_response) return resolve_response;

        const resolved_user = await resolve_response.json();
        if ("error" in resolved_user) return resolved_user;
        return { id: String(resolved_user.id), client_id: opts.client_id, hydration: { hydratable: "user", data: resolved_user } as HydratableUser };
    }

    export async function get_artist(mode: "POPULAR_TRACKS" | "TRACKS" | "REPOSTS", opts: Opts & { "artist_permalink"?: string, "artist_id"?: string, "user_hyrdration"?: HydratableUser, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ArtistUser<Track>>
    export async function get_artist(mode: "ALBUMS" | "PLAYLISTS", opts: Opts & { "artist_permalink"?: string, "artist_id"?: string, "user_hyrdration"?: HydratableUser, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ArtistUser<Playlist>>
    export async function get_artist(mode: ArtistMode, opts: Opts & { "artist_permalink"?: string, "artist_id"?: string, "user_hyrdration"?: HydratableUser, "depth"?: number, "limit"?: number, "offset"?: number }): PromiseResult<ArtistUser<Playlist | User | Track>> {
        let artist_id = clean_permalink(opts.artist_id);
        const user_hyrdration: HydratableUser = {} as never;
        if (!is_empty(opts.artist_permalink)) {
            const potential_artist_id = await permalink_to_artist_id({ artist_permalink: opts.artist_permalink! });
            if ("error" in potential_artist_id) return potential_artist_id;
            artist_id = potential_artist_id.id;
            opts.client_id = potential_artist_id.client_id;
            opts.user_hyrdration = potential_artist_id.hydration;
        }
        const params = {
            ...get_locale_params(opts),
            representation: "",
            limit: opts.limit ?? 20,
            offset: opts.offset ?? 0,
        }
        const repost_mode_str = mode === "REPOSTS" ? "stream/" : "";
        const artist_response = await rozfetch<Search>(`https://api-v2.soundcloud.com/${repost_mode_str}users/${artist_id}/${artist_mode_to_api_method(mode ?? "ALL")}?${encode_params(params)}`, api_method_options(opts));
        if ("error" in artist_response) return artist_response;
        const artist = await artist_response.json();
        if ("error" in artist) return artist;
        return { user: user_hyrdration, artist_data: combine_continuation<Playlist | User | Track>(artist, await continuation<Playlist | User | Track>(artist.next_href, opts, opts.depth ?? 0)) };
    }
    export async function get_playlist(opts: Opts & ({ playlist_path: string })) {
        const hydration = await get_hydration(`https://soundcloud.com/${clean_permalink(opts.playlist_path)}`, opts);
        if ("error" in hydration) return hydration;
        if (opts.client_id === undefined) {
            const client_id = await get_client_id({ ...opts, scripts: hydration.scripts_urls });
            if (!("error" in client_id)) {
                opts.client_id = client_id.client_id;
            }
            else return client_id;
        }
        if (typeof opts.client_id === "object") return opts.client_id;
        const playlist_hyrdration: HydratablePlaylist = hydration.hydration.find((hydratable) => hydratable.hydratable == "playlist") as HydratablePlaylist;

        const locale_params = {
            client_id: opts.client_id,
            linked_partitioning: 1,
            app_version,
            app_locale: "en"
        }
        const opts_params = {
            ids: playlist_hyrdration.data.tracks.map(track => String(track.id)).join(",")
        }
        const params = Object.assign(locale_params, opts_params);
        const playlist_tracks_response = await rozfetch<Track[]>(`https://api-v2.soundcloud.com/tracks?${encode_params(params)}`, { headers: post_api_headers(opts), method: "GET", ...opts.fetch_opts });
        if ("error" in playlist_tracks_response) return playlist_tracks_response;
        const playlist_tracks = await playlist_tracks_response.json();
        if ("error" in playlist_tracks) return playlist_tracks;
        return { hydration: playlist_hyrdration, tracks: playlist_tracks, client_id: opts.client_id };
    }
    export async function get_tracks(opts: Opts & { track_ids: string[] }) {
        return await apiget_cast<Track[]>({
            ...opts, path: `tracks`, params: { ids: opts.track_ids.join(',') }
        });
    }
    export async function get_mix(opts: Opts & { track_id: string, limit?: number, offset?: number }) {
        return await apiget<Track>({
            ...opts, path: `tracks/${opts.track_id}/related`, params: {
                ...(opts.cookie_jar ? { user_id: get_self_user_id(opts.cookie_jar) } : {}),
                limit: opts.limit ?? 50, offset: opts.offset ?? 0
            }
        });
    }
    export async function listening_history(opts: Opts & { limit?: number, offset?: number }) {
        return await apiget<HistoryTrack>({ ...opts, path: `me/play-history/tracks`, params: { limit: opts.limit ?? 50, offset: opts.offset ?? 0 } });
    }
    export async function liked_music(opts: Opts & { limit?: number, offset?: number }) {
        return await apiget<LikedTrack>({ ...opts, path: `users/${get_self_user_id(opts.cookie_jar!)}/track_likes`, params: { limit: opts.limit ?? 50, offset: opts.offset ?? 0 } });
    }
    export async function artists_shortcuts(opts: Opts & { limit?: number, offset?: number }) {
        return await apiget<ArtistShortcut>({ ...opts, path: `me/artist-shortcuts`, params: { limit: opts.limit ?? 1000, offset: opts.offset ?? 0, requires_cookies: true } });
    }
    export async function artists_shortcuts_stories(opts: Opts & { artist_urn: string; }) {
        return await apiget_cast<ArtistStories>({ ...opts, path: `me/artist-shortcuts/stories/${opts.artist_urn}` });
    }
    export async function artists_shortcuts_stories_read(opts: Opts & { artist_urns: string[] }) {
        const payload = {
            read_receipts: opts.artist_urns.map(urn => (
                {
                    artist: urn,
                    last_update_read: (new Date().toISOString().split('.')[0] + 'Z')
                }
            ))
        }
        return await apipost<null>({ ...opts, path: `me/artist-shortcuts/read-updates`, payload });
    }
    export async function mixed_selections(opts: Opts) {
        return await apiget_cast<SoundCloudMixedSelection>({ ...opts, path: `mixed-selections` });
    }
    export async function query_suggestions(opts: Opts & { query: string; limit?: number, offset?: number }){
        return await apiget<QueryOutput>({ ...opts, path: `search/queries`, params: { q: opts.query, limit: opts.limit ?? 1000, offset: opts.offset ?? 0 } });
    }
    export async function who_to_follow(opts: Opts & { limit?: number, offset?: number }) {
        return await apiget<ArtistRecommendation>({ ...opts, path: `me/suggested/users/who_to_follow`, params: { limit: opts.limit ?? 1000, offset: opts.offset ?? 0 } });
    }
    export async function following(opts: Opts & { limit?: number, offset?: number }) {
        return await apiget<User>({ ...opts, path: `users/${get_self_user_id(opts.cookie_jar!)}/followings`, params: { limit: opts.limit ?? 12, offset: opts.offset ?? 0 } });
    }
    export async function follow_artist(opts: Opts & { artist_id: string }) {
        const has_cookies = requires_cookies(opts);
        if ("error" in has_cookies) return has_cookies;
        const user_id = get_self_user_id(opts.cookie_jar!);
        const client_id = opts.client_id ? {client_id: opts.client_id} : await get_client_id(opts);
        if("error" in client_id) return client_id;
        if(typeof client_id.client_id === "object" && "error" in client_id.client_id) return client_id.client_id;
        const signature = generate_follow_signature_v1(user_id, client_id.client_id, opts.artist_id);
        return await apipost<User>({ ...opts, path: `me/followings/${opts.artist_id}`, params: { signature }, payload: null });
    }
    export async function unfollow_artist(opts: Opts & { artist_id: string; }) {
        return await apipost<User>({ ...opts, path: `me/followings/${opts.artist_id}`, params: { }, payload: null, method: "DELETE" });
    }
    export async function is_following(opts: Opts & { artist_id: string }) {
        const user_id = get_self_user_id(opts.cookie_jar!);
        const result = await apiget<number>({ ...opts, path: `users/${user_id}/followings/ids`, params: {limit: 5000}, requires_cookies: true });
        if ("error" in result) return result;
        return { following: result.data.collection.includes(Number(opts.artist_id)), client_id: result.client_id };
    }
    export async function you_redirect(opts: Opts) {
        const has_cookies = requires_cookies(opts);
        if ("error" in has_cookies) return has_cookies;
        const redirect_response = await rozfetch("https://soundcloud.com/you", page_method_options(opts));
        if ("error" in redirect_response) return redirect_response;
        if (!redirect_response.redirected) return generror("Response not redirected", "MEDIUM", { opts });
        return redirect_response.headers.get("Location")?.replace("//", "");
    }
    function extract_playlist_name(permalink: string) {
        return extract_string_from_pattern(clean_permalink(permalink), /\*+?\/sets\/(.+)/, "MEDIUM");
    }
    export async function create_playlist(opts: Opts & ({ sharing: "public" | "private", title: string, track_uids: number[] })): PromiseResult<Playlist> {
        const payload = {
            playlist: {
                title: opts.title,
                sharing: opts.sharing,
                tracks: opts.track_uids,
                _resource_id: "f-177",
                _resource_type: "playlist"
            }
        }
        const post = await apipost<Playlist>({ ...opts, path: `playlists`, params: {}, payload });
        if ("error" in post) return post;
        return await post.data.json();
    }
    export async function delete_playlist(opts: Opts & { playlist_id: string }) {
        const playlist_id = extract_playlist_name(opts.playlist_id);
        if (typeof playlist_id === "object") return playlist_id;
        return await apipost({ ...opts, path: `playlists/${playlist_id}`, params: {}, payload: null, method: "DELETE" });
    }

    export function get_self_user_id(cookie_jar: CookieJar) {
        const ajs_user_id = cookie_jar.getCookie('ajs_user_id')?.getData().value ?? cookie_jar.getCookie('sc_tracking_user_id')?.getData().value ?? "";
        return decodeURIComponent(ajs_user_id).replace(/"/g, '').split(':')[2];
    }
    export async function get_all_user_playlists(opts: Opts) {
        const has_cookies = requires_cookies(opts);
        if ("error" in has_cookies) return has_cookies;
        const hydration = await get_hydration(`https://soundcloud.com/`, opts);
        if ("error" in hydration) return hydration;
        if (opts.client_id === undefined) {
            const client_id = await get_client_id({ ...opts, scripts: hydration.scripts_urls });
            if (!("error" in client_id)) {
                opts.client_id = client_id.client_id;
            }
            else return client_id;
        }
        if (typeof opts.client_id === "object") return opts.client_id;
        const user_playlists = await get_artist("PLAYLISTS", { ...opts, client_id: opts.client_id, artist_id: get_self_user_id(opts.cookie_jar!) });
        if ("error" in user_playlists) return user_playlists;
        return { data: user_playlists.artist_data.collection, client_id: opts.client_id, hydration };
    }

    export async function add_tracks_to_playlist(opts: Opts & { playlist_name: string, track_ids: number[] }) {
        const playlist_name = extract_playlist_name(opts.playlist_name);
        if (typeof playlist_name === "object") return playlist_name;
        const playlists = await get_all_user_playlists(opts);
        if ("error" in playlists) return playlists;
        opts.client_id = playlists.client_id;
        const found_playlist = playlists.data.find(playlist => playlist.permalink === playlist_name)!;
        const payload = {
            playlist: {
                tracks: found_playlist.tracks.map(track => track.id).concat(opts.track_ids)
            }
        };
        return await apipost({ ...opts, path: `playlists/${found_playlist.id}`, params: {}, payload, method: "PUT" });
    }
    export async function delete_tracks_to_playlist(opts: Opts & { playlist_name: string, track_ids: number[] }) {
        const playlist_name = extract_playlist_name(opts.playlist_name);
        if (typeof playlist_name === "object") return playlist_name;
        const playlists = await get_all_user_playlists(opts);
        if ("error" in playlists) return { ok: false };
        opts.client_id = playlists.client_id;
        const found_playlist = playlists.data.find(playlist => playlist.permalink === playlist_name)!;
        const payload = {
            playlist: {
                tracks: found_playlist.tracks.map(track => track.id).filter(track_id => !opts.track_ids.includes(track_id))
            }
        };
        return await apipost({ ...opts, path: `playlists/${found_playlist.id}`, params: {}, payload, method: "PUT" });
    }
    export async function try_connect_session(opts: Opts) {
        const has_cookies = requires_cookies(opts);
        if ("error" in has_cookies) return { ok: false };
        const params = {
            ...get_locale_params(opts)
        }
        const oauth_cookie = opts.cookie_jar?.getCookie('oauth_token');
        if (oauth_cookie === undefined) return { ok: false };
        const payload = {
            session: {
                access_token: oauth_cookie.getData().value
            }
        };
        const controller = new AbortController();
        const abort = setTimeout(() => { controller.abort(); }, 5000);
        try {
            const response = await rozfetch(`https://api-auth.soundcloud.com/connect/session?${encode_params(params)}`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: post_api_headers(opts),
                signal: controller.signal,
                ...opts.fetch_opts
            });
            clearTimeout(abort);
            if ("error" in response) return { ok: false };
            opts.cookie_jar?.updateWithFetch(response);
            return { ok: true };
        }
        catch (_) {
            clearTimeout(abort);
            return { ok: false };
        }
    }

    // TODO: Note this is suject to change, so instead extract it from the scripts, but this is a good point for investigating SC signatures
    export function generate_follow_signature_v1(user_id: string, client_id: string, followee_id: string){
        const FOLLOWS_SIGNATURE_SECRET = "5Dpr3ubBw8LFtbvQcd4Hx6hU";
        const FOLLOWS_SIGNATURE_VERSION = "1";
        // a = userAgent.split(/[ /]/); a[a[0].length % a.length]
        const ua_parts = USER_AGENT.split(/[ /]/);
        const ua_part = ua_parts["Mozilla".length % ua_parts.length];
        const raw_signature = FOLLOWS_SIGNATURE_VERSION + FOLLOWS_SIGNATURE_SECRET + client_id + FOLLOWS_SIGNATURE_SECRET + followee_id + user_id + ua_part;

        // UTF-8 bytes (matches browser's unescape(encodeURIComponent(s)))
        const bytes = Buffer.from(raw_signature, "utf8");
        let seed = 7996111;
        for (const byte of bytes) {
            seed = (seed >>> 1) + ((seed & 1) << 23);
            seed += byte;
            seed &= 0xFFFFFF;
        }
        return `${FOLLOWS_SIGNATURE_VERSION}:${seed.toString(16)}`;
    }
}

// TODO clear this when migrate to extract sigpatching from scripts
// [FOLLOWING SIGNATURE NOTES]
// from: https://a-v2.sndcdn.com/assets/54-c56123af.js
/*
signature: r(1273).sign(
    r(18).currentUserId(), 
    e, 
    r(6).get("client_id"), 
    r(1274).__FOLLOWS_SIGNATURE_SECRET__
)
*/
// signature: 1:24476f
// signature: 1:24476f
// signature: 1:a08ed5
// signature: `${SIG_VERSION}:24476f`