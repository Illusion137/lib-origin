import { Cookie, CookieJar } from "../utils/cookie_util";
import { ResponseError } from "../utils/types";
import { encode_params, is_empty } from '../utils/util';
import { Album } from "./types/Album";
import { Artist } from "./types/Artist";
import { Collection } from "./types/Collection";
import { Credits } from "./types/Credits";
import { Home } from "./types/Home";
import { InLibrary } from "./types/InLibrary";
import { Library } from "./types/Library";
import { ProfileData } from "./types/ProfileData";
import { SearchResult } from "./types/SearchResult";
import { UserPlaylist } from "./types/UserPlaylist";
import fetch from "../utils/orifetch";
import { Proxy } from "../proxy/proxy";
import { AppServerConfig, FeatureFlags, RemoteConfig } from "./types/Initial";

export namespace Spotify {
    interface ClientSession {
        accessToken: string,
        clientId: string,
        isAnonymous: boolean,
        accessTokenExpirationTimestampMs: number
    }
    interface ClientToken {
        granted_token: {
            token: string,
            expires_after_seconds: number,
            refresh_after_seconds: number,
            domains: string[],
        }
    }
    export interface Client {
        session: ClientSession,
        client_token: ClientToken
    }

    interface Opts { cookie_jar?: CookieJar, client?: Client, proxy?: Proxy.Proxy }
    const client_cache = { client: null as Client | null, enabled: true };

    export function enable_cache(enable: boolean) { client_cache.enabled = enable; }
    export function client_cache_full() { return client_cache.enabled && client_cache.client !== null }

    export const valid_playlist_regex = /(https?:\/\/)open\.spotify\.com\/(playlist)\/.+/i
    export const valid_album_regex = /(https?:\/\/)open\.spotify\.com\/(album)\/.+/i
    export const valid_collection_regex = /(https?:\/\/)open\.spotify\.com\/(collection)\/.+/i
    export const valid_artist_regex = /(https?:\/\/)open\.spotify\.com\/artist\/.+/i

    export function get_headers(client: (Client | undefined) = undefined, cookie_jar: (CookieJar | undefined) = undefined) {
        const default_headers: any = {
            // "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
            "sec-fetch-user": "?1",
            "accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en",
            "app-platform": "WebPlayer",
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "spotify-app-version": "1.2.21.625.gab84de47",
            "Referer": "https://open.spotify.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
            "upgrade-insecure-requests": "1",
            'Access-Control-Allow-Origin': '*',
        }
        if (cookie_jar !== undefined)
            default_headers['Cookies'] = cookie_jar.toString();
        if (client !== undefined) {
            default_headers['authorization'] = `Bearer ${client?.session.accessToken}`;
            default_headers['client-token'] = client?.client_token.granted_token.token;
        }
        return default_headers;
    }

    function extract_encoded_bullshit_from_id(id: string, page_html: string){
        const regex = new RegExp(`<script ?id="${id}".+?>(.+?)<\/script>`, "gis");
        return regex.exec(page_html)?.[1] ?? "";
    }
    function decode_spotify_bullshit<T>(inner_html: string): T {
        if(is_empty(inner_html)) return {} as T;
        return JSON.parse(decodeURIComponent(atob(inner_html).split('').map(e => `%${`00${e.charCodeAt(0).toString(16)}`.slice(-2)}`).join('')));
    }

    export async function get_client(url: string, cookie_jar: (CookieJar | undefined) = undefined): Promise<Client | ResponseError> {
        try {
            if (client_cache_full()) return client_cache.client!;

            const page_html = await (await fetch(url, {
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "priority": "u=0, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "cookie": cookie_jar?.toString() as string
                },
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
            })).text();

            const app_server_config = decode_spotify_bullshit<AppServerConfig>(extract_encoded_bullshit_from_id("appServerConfig", page_html));
            const feature_flags = decode_spotify_bullshit<FeatureFlags>(extract_encoded_bullshit_from_id("featureFlags", page_html));
            const seo_experiments = decode_spotify_bullshit<{}>(extract_encoded_bullshit_from_id("seoExperiments", page_html));
            const remote_config = decode_spotify_bullshit<RemoteConfig>(extract_encoded_bullshit_from_id("remoteConfig", page_html));

            feature_flags;
            seo_experiments;
            remote_config;

            const params = {
                "reason": "init",
                "productType": "web-player",
                "totp": new Date(), // Must get this through some more bullshit >:0
                "totpServer": "931951", // Must get this through some more bullshit >:0
                "totpVer": "5",
                "buildVer": "web-player_2025-04-07_1744049799707_46d7bac",
                "buildDate": "2025-04-07",
                "sTime": app_server_config.serverTime,
                "cTime": new Date().getTime(),
            };

            console.log(params);

            const access_token_response = await fetch(`https://open.spotify.com/get_access_token?${encode_params(params)}`, {
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "baggage": "sentry-environment=production,sentry-release=web-player_2025-04-07_1743996216152_35a52a3,sentry-public_key=de32132fc06e4b28965ecf25332c3a25,sentry-trace_id=7076667a13a24dcbb37548a8dc07ca6c,sentry-sample_rate=0.008,sentry-sampled=false",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "sentry-trace": "7076667a13a24dcbb37548a8dc07ca6c-87e90d5c8bfc26d2-0",
                    "Referer": "https://open.spotify.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "cookie": cookie_jar?.toString() as string
                },
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "GET",
            });

            console.log(access_token_response);
            console.log(await access_token_response.json());

            if (!access_token_response.ok) throw new Error("Cant get Spotify Access-Token")

            const session: ClientSession = await access_token_response.json();

            const headers2 = {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://open.spotify.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "Cookies": cookie_jar?.toString() as string
            };

            const client_token_payload = {
                "client_data": {
                    "client_version": "1.2.62.97.g35a52a31",
                    "client_id": session.clientId,
                    "js_sdk_data": {
                        "device_brand": "unknown",
                        "device_model": "unknown",
                        "os": "macos",
                        "os_version": "10.15.7",
                        "device_id": "43fbb7e18261e87ed08dd0b5e9030674",
                        "device_type": "computer"
                    }
                }
            };

            const client_token = await fetch("https://clienttoken.spotify.com/v1/clienttoken", {
                headers: headers2,
                body: JSON.stringify(client_token_payload),
                method: "POST"
            });

            const client = { session: session, client_token: await client_token.json() as ClientToken };
            if (client_cache.enabled) client_cache.client = client;
            return client;
        } catch (error) { return { error: error as Error }; }
    }
    export function uri_to_id(uri: string) {
        const split = uri.split(':');
        return split[split.length - 1];
    }
    export async function get_playlist(playlist_id: string, opts: { "limit"?: number, "offset"?: number } & Opts): Promise<UserPlaylist | ResponseError> {
        try {
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);

            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "fetchPlaylist",
                variables: { uri: `spotify:playlist:${playlist_id}`, offset: opts.offset ?? 0, limit: opts.limit ?? 100 },
                extensions: { persistedQuery: { version: 1, sha256Hash: "73a3b3470804983e4d55d83cd6cc99715019228fd999d51429cc69473a18789d" } }
            }
            const playlist_data: UserPlaylist = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as UserPlaylist;

            return playlist_data;
        } catch (error) { return { error: error as Error }; }
    }
    export async function get_album(album_id: string, opts: { "limit"?: number, "offset"?: number } & Opts): Promise<Album | ResponseError> {
        try {
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);

            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "getAlbum",
                variables: { uri: `spotify:album:${album_id}`, locale: "", offset: opts.offset ?? 0, limit: opts.limit ?? 100 },
                extensions: { persistedQuery: { version: 1, sha256Hash: "46ae954ef2d2fe7732b4b2b4022157b2e18b7ea84f70591ceb164e4de1b5d5d3" } }
            }
            const album_data: Album = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as Album;

            return album_data;
        } catch (error) { return { error: error as Error }; }
    }
    export async function get_collection(opts: { "limit"?: number, "offset"?: number } & Opts): Promise<Collection | ResponseError> {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Spotify Collection");

            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);

            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "fetchLibraryTracks",
                variables: { offset: opts.offset ?? 0, limit: opts.limit ?? 100 },
                extensions: { persistedQuery: { version: 1, sha256Hash: "beaad62a3d5556d70764cebb98b588e44a0c06ade6136f6972aaca4e91f93807" } }
            };
            const collection_data: Collection = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as Collection;

            return collection_data;
        } catch (error) { return { error: error as Error }; }
    }

    export async function get_profile_account_attributes(opts: Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Profile Account Attributes");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client);
            const params = {
                operationName: "profileAndAccountAttributes",
                variables: {},
                extensions: { persistedQuery: { version: 1, sha256Hash: "e0298c5d974e4713ffdcc14980b285cd8e0826412c1ce33db57e0e576fea0f68" } }
            };
            const account_data: ProfileData = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as ProfileData;
            return account_data;
        } catch (error) { return { error: error as Error }; }
    }

    export async function get_artist(url: string, opts: { "locale"?: string, "include_pre_releases"?: boolean } & Opts): Promise<Artist | ResponseError> {
        try {
            if (valid_artist_regex.test(url) === false) throw new Error("Not a known Spotify Artist URL");

            const artist_id = url.replace(/https:\/\/open\.spotify\.com\/artist\//, '');
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "queryArtistOverview",
                variables: { uri: `spotify:artist:${artist_id}`, locale: opts.locale ?? "", includePrerelease: opts.include_pre_releases ?? true },
                extensions: { persistedQuery: { version: 1, sha256Hash: "da986392124383827dc03cbb3d66c1de81225244b6e20f8d78f9f802cc43df6e" } }
            }

            const artist_data = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as Artist;

            return artist_data;
        } catch (error) { return { error: error as Error }; }
    }

    export async function search(query: string, opts: {
        "limit"?: number,
        "offset"?: number,
        "top_results"?: number,
        "include_audiobooks"?: boolean,
        "include_has_concerts_field"?: boolean,
        "include_pre_releases"?: boolean,
        "include_local_concerts_field"?: boolean
    } & Opts): Promise<SearchResult | ResponseError> {
        try {
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client);

            const params = {
                operationName: "searchDesktop",
                variables: {
                    searchTerm: query.replace(/\s+/g, '+').replace(/[^A-Za-z0-9+]+/g, ''),
                    offset: opts.offset ?? 0,
                    limit: opts.limit ?? 10,
                    numberOfTopResults: opts.top_results ?? 5,
                    includeAudiobooks: opts.include_audiobooks ?? true,
                    includeArtistHasConcertsField: opts.include_has_concerts_field ?? false,
                    includePreReleases: opts.include_pre_releases ?? false,
                    includeLocalConcertsField: opts.include_local_concerts_field ?? false
                },
                extensions: { persistedQuery: { version: 1, sha256Hash: "7a60179c5d6b6c385e849438efb1398392ef159d82f2ad7158be5e80bf7817a9" } }
            }
            const search_data = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as SearchResult;
            return search_data;
        } catch (error) { return { error: error as Error }; }
    }

    export async function get_home(opts: {
        "sp_t_cookie": Cookie,
        "time_zone"?: string
        "country"?: string,
        "section_items_limit"?: number,
    } & Opts): Promise<Home | ResponseError> {
        try {
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client);

            const params = {
                operationName: "home",
                variables: { timeZone: opts.time_zone ?? "America/Los_Angeles", sp_t: opts.sp_t_cookie.toString(), country: opts.country ?? "US", facet: null, sectionItemsLimit: opts.section_items_limit ?? 10 },
                extensions: { persistedQuery: { version: 1, sha256Hash: "373a2db252f6a4620226c22808f016d634f748a36f06f03337e6158bf4f08bca" } }
            }
            const home_data = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json() as Home;
            return home_data;
        } catch (error) { return { error: error as Error }; }
    }

    export async function account_playlists(opts: Opts & { limit?: number }) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Spotify Account Playlists");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "libraryV3",
                variables: {
                    filters: ["Playlists"],
                    order: null,
                    textFilter: "",
                    features: ["LIKED_SONGS", "YOUR_EPISODES"],
                    limit: opts.limit ?? 10,
                    offset: 0,
                    flatten: false,
                    expandedFolders: [],
                    folderUri: null,
                    includeFoldersWhenFlattening: true,
                    withCuration: false
                },
                extensions: { persistedQuery: { version: 1, sha256Hash: "17d801ba80f3a3d7405966641818c334fe32158f97e9e8b38f1a92f764345df9" } }
            }
            const library: Library = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json();
            const playlist_items = library.data.me.libraryV3.items;
            return playlist_items;
        } catch (error) { return { error: error as Error }; }
    }

    export async function get_credits(opts: { "uri_id": string } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const credits: Credits = await (await fetch(`https://spclient.wg.spotify.com/track-credits-view/v0/experimental/${opts.uri_id}/credits`,
                { method: "GET", headers })).json();
            return credits;
        } catch (error) { return { error: error as Error }; }
    }

    // opts.uris EXAMPLE: "spotify:track:1xsY8IFXUrxeet1Fcmk4oC"
    export async function are_tracks_in_library(opts: { "uris": string[] } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const params = {
                operationName: "are_tracks_in_library",
                variables: { uris: opts.uris },
                extensions: { persistedQuery: { version: 1, sha256Hash: "beaad62a3d5556d70764cebb98b588e44a0c06ade6136f6972aaca4e91f93807" } }
            };
            const in_library: InLibrary = await (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?${encode_params(params)}`,
                { method: "GET", headers })).json();
            return in_library;
        } catch (error) { return { error: error as Error }; }
    }

    export async function add_tracks_to_library(opts: { "uris": string[] } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Add To Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                operationName: "addToLibrary",
                variables: { uris: opts.uris },
                extensions: { persistedQuery: { version: 1, sha256Hash: "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915" } }
            };
            const result = (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            return result;
        } catch (error) { return { error: error as Error }; }
    }

    // opts.playlist_uri EXAMPLE: "spotify:playlist:4uNs2lqeO0Ec43d2Sp3yp4"
    export async function add_tracks_to_playlist(opts: {
        "uris": string[],
        "playlist_uri": string,
        "move_type"?: "BOTTOM_OF_PLAYLIST"
        "from_uid"?: string
    } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Add To Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                operationName: "addToPlaylist",
                variables: {
                    uris: opts.uris,
                    playlistUri: opts.playlist_uri,
                    newPosition: {
                        moveType: opts.move_type ?? "BOTTOM_OF_PLAYLIST",
                        fromUid: opts.from_uid ?? null
                    }
                },
                extensions: { persistedQuery: { version: 1, sha256Hash: "47c69e71df79e3c80e4af7e7a9a727d82565bb20ae20dc820d6bc6f94def482d" } }
            };
            const result = (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            return result;
        } catch (error) { return { error: error as Error }; }
    }

    export async function delete_tracks_from_library(opts: { "uris": string[] } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Remove from Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                operationName: "removeFromLibrary",
                variables: { uris: opts.uris },
                extensions: { persistedQuery: { version: 1, sha256Hash: "a3c1ff58e6a36fec5fe1e3a193dc95d9071d96b9ba53c5ba9c1494fb1ee73915" } }
            };
            const result = (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            return result;
        } catch (error) { return { error: error as Error }; }
    }

    export async function delete_tracks_from_playlist(opts: {
        "uids": string[],
        "playlist_uri": string,
        "move_type"?: "BOTTOM_OF_PLAYLIST"
        "from_uid"?: string
    } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Add To Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                operationName: "removeFromPlaylist",
                variables: {
                    playlistUri: opts.playlist_uri,
                    uids: opts.uids
                },
                extensions: { persistedQuery: { version: 1, sha256Hash: "47c69e71df79e3c80e4af7e7a9a727d82565bb20ae20dc820d6bc6f94def482d" } }
            };
            const result = (await fetch(`https://api-partner.spotify.com/pathfinder/v1/query`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            return result;
        } catch (error) { return { error: error as Error }; }
    }

    export async function create_playlist(opts: {
        "playlist_name": string
    } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Add To Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                ops: [{ kind: 6, updateListAttributes: { newAttributes: { values: { name: opts.playlist_name, formatAttributes: [], pictureSize: [] }, noValue: [] } } }]
            }
            const response = (await fetch(`https://spclient.wg.spotify.com/playlist/v2/playlist`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            const result: ResponseError | { uri: string, revision: string } = await response.json();
            return result;
        } catch (error) { return { error: error as Error }; }
    }
    export async function delete_playlist(opts: {
        "playlist_uri": string
    } & Opts) {
        try {
            if (opts.cookie_jar === undefined) throw new Error("Undefined Cookies for Add To Spotify Library");
            const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
            if ("error" in client) throw client.error;
            const headers = get_headers(client, opts.cookie_jar);

            const payload = {
                deltas: [{ ops: [{ kind: 3, rem: { items: [{ uri: opts.playlist_uri }], itemsAsKey: true } }], info: { source: { client: 5 } } }], wantResultingRevisions: false, wantSyncResult: false, nonces: []
            }
            const result = (await fetch(`https://spclient.wg.spotify.com/playlist/v2/playlist`,
                { method: "POST", headers, body: JSON.stringify(payload) }));
            return result;
        } catch (error) { return { error: error as Error }; }
    }
}