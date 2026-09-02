import type { CookieJar } from "@common/utils/cookie_util";
import type { FetchMethod, PromiseResult, ResponseError } from "@common/types";
import { is_empty, milliseconds_of, random_of, urlid } from '@common/utils/util';
import type { Album } from "@origin/spotify/types/Album";
import type { Artist } from "@origin/spotify/types/Artist";
import type { Collection } from "@origin/spotify/types/Collection";
import type { Credits } from "@origin/spotify/types/Credits";
import type { Home } from "@origin/spotify/types/Home";
import type { InLibrary } from "@origin/spotify/types/InLibrary";
import type { Library } from "@origin/spotify/types/Library";
import type { ProfileData } from "@origin/spotify/types/ProfileData";
import type { SearchResult } from "@origin/spotify/types/SearchResult";
import type { UserPlaylist } from "@origin/spotify/types/UserPlaylist";
import type { Proxy } from "@origin/proxy/proxy";
import type { AppServerConfig, FeatureFlags, RemoteConfig } from "@origin/spotify/types/Initial";
import { Secret, TOTP } from "otpauth";
import { encode_params } from "@common/utils/fetch_util";
import BufferRN from "buffer/";
import { generror } from "@common/utils/error_util";
import rozfetch, { type RoZFetchRequestInit, type RoZFetchResponse } from "@common/rozfetch";
import spotify_secrets_bytes from "./data/secret_bytes.json";
import persisted_queries_data from "./data/persisted_queries.json";
import type { SpotifyAccountAttributes, SpotifyAccountLibrary, SpotifyAddToPlaylist, SpotifyAddTracksToLibrary, SpotifyAPI, SpotifyArtistOverview, SpotifyChildEntities, SpotifyExtractedColors, SpotifyFeedBaselineLookup, SpotifyGetAlbum, SpotifyGetCollection, SpotifyGetPlaylist, SpotifyHome, SpotifyIsCurated, SpotifyPlaylistMetadata, SpotifyProfileAccountAttributes, SpotifyProfileAttributes, SpotifyQuery, SpotifyRecentlyPlayed, SpotifyRemoveFromLibrary, SpotifyRemoveFromPlaylist, SpotifyRequiresCredentials, SpotifySearch, SpotifyTracksInLibrary, SPVar } from "./types/api";
import { reinterpret_cast } from '../../../common/cast';
import { try_json_parse } from "@common/utils/parse_util";
import type { Query } from "./types/Query";
import type { SeekTables } from './types/SeekTables';
import type { AccountAttributes, ChildEntities, CuratedStatus, ExtractedColors, FeedBaseline, PlaylistMetadata, ProfileAttributes, RecentlyPlayed } from "./types/Results";

const Buffer = BufferRN.Buffer;
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

    interface Opts { cookie_jar?: CookieJar, client?: Client, proxy?: Proxy.Proxy, fetch_opts?: RoZFetchRequestInit }
    const client_cache = { client: null as Client | null, enabled: true };
    const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

    export function enable_cache(enable: boolean) { client_cache.enabled = enable; }
    export function client_cache_full() { return client_cache.enabled && client_cache.client !== null }

    export const valid_playlist_regex = /(https?:\/\/)open\.spotify\.com\/(playlist)\/.+/i
    export const valid_album_regex = /(https?:\/\/)open\.spotify\.com\/(album)\/.+/i
    export const valid_collection_regex = /(https?:\/\/)open\.spotify\.com\/(collection)\/.+/i
    export const valid_artist_regex = /(https?:\/\/)open\.spotify\.com\/artist\/.+/i

    export function get_headers(client: (Client | undefined), cookie_jar: (CookieJar | undefined)): Record<string, string> {
        const default_headers = {
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
            'User-Agent': USER_AGENT,
            "upgrade-insecure-requests": "1",
            'Access-Control-Allow-Origin': '*',
            'Cookies': undefined as undefined | string,
            'authorization': undefined as undefined | string,
        }
        if (cookie_jar !== undefined)
            default_headers.Cookies = cookie_jar.toString();
        if (client !== undefined) {
            default_headers.authorization = `Bearer ${client?.session.accessToken}`;
            default_headers['client-token'] = client?.client_token.granted_token.token;
        }
        return reinterpret_cast<Record<string, string>>(default_headers);
    }

    export function post_headers(cookie_jar?: CookieJar) {
        return {
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
    }

    function extract_encoded_bullshit_from_id(id: string, page_html: string) {
        const regex = new RegExp(`<script ?id="${id}".+?>(.+?)</script>`, "gis");
        return regex.exec(page_html)?.[1] ?? "";
    }
    function decode_spotify_bullshit<T>(inner_html: string): ResponseError | T {
        if (is_empty(inner_html)) return {} as T;
        const uri_component = atob(inner_html).split('').map(e => `%${`00${e.charCodeAt(0).toString(16)}`.slice(-2)}`).join('');
        return try_json_parse<T>(decodeURIComponent(uri_component));
    }

    export function get_random_secret() {
        const secrets = spotify_secrets_bytes;
        return random_of(secrets);
    }

    function calculate_secret_token(hex: number[], version: number) {
        const token = hex.map((v, i) => v ^ ((i % version) + 9));
        const bufferToken = Buffer.from(token.join(""), "utf8").toString("hex");
        return Secret.fromHex(bufferToken);
    }

    //https://github.com/hmes98318/LavaShark/blob/0125cf31ba8f9f9f6ce6dec9e2003519a7a6b55e/src/lib/sources/Spotify.ts#L294
    export async function get_access_token_url(found_s_time?: number): PromiseResult<string> {
        // if (this.auth) return "https://accounts.spotify.com/api/token?grant_type=client_credentials";

        const selected_secret = get_random_secret();
        const token = calculate_secret_token(selected_secret.secret, selected_secret.version);

        const base_url = "https://open.spotify.com/api/token";

        const c_time = Date.now();
        let s_time = found_s_time;
        if (s_time === undefined) {
            const server_time_response = await rozfetch<{ serverTime: number }>("https://open.spotify.com/api/server-time/", {
                headers: {
                    Referer: "https://open.spotify.com/",
                    Origin: "https://open.spotify.com",
                    "User-Agent": USER_AGENT,
                },
            });
            if ("error" in server_time_response) {
                return server_time_response;
            }
            const server_time = await server_time_response.json();
            if ("error" in server_time) {
                return server_time;
            }
            s_time = server_time.serverTime;
        }

        const totp = new TOTP({
            secret: token,
            period: 30,
            digits: 6,
            algorithm: "SHA1",
        });

        const topt_server = totp.generate({
            timestamp: s_time * 1e3,
        });
        const totp_client = totp.generate({
            timestamp: c_time,
        });

        const params = {
            reason: "init",
            productType: "web-player",
            sTime: String(s_time),
            cTime: String(c_time),
            totp: totp_client,
            totpServer: topt_server,
            totpVer: "5",
            buildVer: selected_secret.version,
        };

        return `${base_url}?${encode_params(params)}`;
    }

    //https://github.com/hmes98318/LavaShark/blob/0125cf31ba8f9f9f6ce6dec9e2003519a7a6b55e/src/lib/sources/Spotify.ts#L294
    //https://github.com/iTsMaaT/discord-player-spotify/blob/master/src/internal/spotify.ts
    //https://github.com/misiektoja/spotify_monitor/blob/15273d2c75486798ad092e6c8bab29324ef61922/spotify_monitor.py#L1250
    export async function get_client(url?: string, cookie_jar?: CookieJar): Promise<Client | ResponseError> {
        url ??= "https://open.spotify.com/";
        if (client_cache_full()) return client_cache.client!;

        const page_response = await rozfetch(url, {
            headers: get_headers(undefined, cookie_jar),
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            cache_opts: {
                cache_ms: milliseconds_of({ minutes: 30 }),
                cache_mode: 'file',
                cache_on: "request"
            }
        });

        if ("error" in page_response) return page_response;

        const page_html = await page_response.text();

        const app_server_config = decode_spotify_bullshit<AppServerConfig>(extract_encoded_bullshit_from_id("appServerConfig", page_html));
        const feature_flags = decode_spotify_bullshit<FeatureFlags>(extract_encoded_bullshit_from_id("featureFlags", page_html));
        const seo_experiments = decode_spotify_bullshit<{}>(extract_encoded_bullshit_from_id("seoExperiments", page_html));
        const remote_config = decode_spotify_bullshit<RemoteConfig>(extract_encoded_bullshit_from_id("remoteConfig", page_html));

        if ("error" in app_server_config) { console.error(app_server_config); return app_server_config; }
        if ("error" in feature_flags) { console.error(feature_flags); return feature_flags; }
        if ("error" in seo_experiments) { console.error(seo_experiments); return seo_experiments; }
        if ("error" in remote_config) { console.error(remote_config); return remote_config; }

        const access_token_url = await get_access_token_url(app_server_config.serverTime);
        if (typeof access_token_url === "object" && "error" in access_token_url) return access_token_url;
        const access_token_response = await rozfetch<ClientSession>(access_token_url, {
            headers: {
                Referer: "https://open.spotify.com/",
                Origin: "https://open.spotify.com",
                'User-Agent': USER_AGENT,
                "cookie": cookie_jar?.toString() as string,
            }
        });
        if ("error" in access_token_response) return access_token_response;

        const session = await access_token_response.json();
        if ("error" in session) return session;

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

        const client_token_response = await rozfetch<ClientToken>("https://clienttoken.spotify.com/v1/clienttoken", {
            headers: post_headers(cookie_jar),
            body: JSON.stringify(client_token_payload),
            method: "POST",
        });

        if ("error" in client_token_response) {
            return client_token_response;
        }

        const client_token = await client_token_response.json();
        if ("error" in client_token) {
            return client_token;
        }


        const client = { session: session, client_token: client_token };
        if (client_cache.enabled) client_cache.client = client;
        return client;
    }
    export function uri_to_id(uri: string) {
        const split = uri.split(':');
        return split[split.length - 1];
    }
    export function url_to_id(url: string) {
        const id = urlid(url, /open.spotify.com\/.+?\//);
        if (id.split(':').length > 1) return uri_to_id(id);
        return id;
    }

    export async function getch_data_with_client<T>(url: string, credentials: SpotifyRequiresCredentials, opts: Opts) {
        if (credentials === "requires_credentials" && (!opts.cookie_jar?.hasCookieName("sp_dc"))) {
            return generror(`Spotify(GET): url["${url}"] failed from lack of credentials`, "INFO", { credentials, opts });
        }
        const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
        if ("error" in client) return client;

        const headers = get_headers(client, opts.cookie_jar);

        const response = await rozfetch<T>(url, { headers, ...opts.fetch_opts });
        if ("error" in response) return response;
        return await response.json();
    }
    export async function post_data_with_client<T>(url: string, payload: object, credentials: SpotifyRequiresCredentials, opts: Opts) {
        if (credentials === "requires_credentials" && (!opts.cookie_jar?.hasCookieName("sp_dc"))) {
            return generror(`Spotify(POST): url["${url}"] failed from lack of credentials`, "INFO", { credentials, opts });
        }
        const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
        if ("error" in client) return client;

        const headers = get_headers(client, opts.cookie_jar);

        const response = await rozfetch<T>(url, { headers, ...opts.fetch_opts, body: JSON.stringify(payload) });
        if ("error" in response) return response;
        return await response.json();
    }

    export interface PersistedQuery {
        type: "query" | "mutation" | "subscription";
        sha256Hash: string;
        method?: FetchMethod;
        version?: number;
        source?: string;
    }
    export const persisted_queries = persisted_queries_data as Record<string, PersistedQuery>;
    export type SpotifyOperationName = keyof typeof persisted_queries_data;

    export function operation_hash(operation_name: SpotifyOperationName): string { return persisted_queries[operation_name].sha256Hash; }
    export function operation_method(operation_name: SpotifyOperationName): FetchMethod { return persisted_queries[operation_name].method ?? "POST"; }
    export function operation_version(operation_name: SpotifyOperationName): number { return persisted_queries[operation_name].version ?? 2; }

    const operation_names = Object.keys(persisted_queries) as SpotifyOperationName[];
    export const api_persistant_queries = Object.fromEntries(operation_names.map(op => [op, operation_hash(op)])) as Record<SpotifyOperationName, string>;
    export const api_methods = Object.fromEntries(operation_names.map(op => [op, operation_method(op)])) as Record<SpotifyOperationName, FetchMethod>;
    export const api_version = Object.fromEntries(operation_names.map(op => [op, operation_version(op)])) as Record<SpotifyOperationName, number>;

    export async function query<R = unknown>(operation_name: SpotifyOperationName, variables: object = {}, credentials: SpotifyRequiresCredentials = "no_credentials", opts: Opts = {}): PromiseResult<R> {
        return await internal_api_query<R, SpotifyAPI>(reinterpret_cast<SpotifyAPI['operation_name']>(operation_name), reinterpret_cast<SpotifyAPI['var']>(variables), credentials, opts);
    }
    export async function internal_api_query<R, T extends SpotifyAPI>(operation_name: T['operation_name'], variables: T['var'], credentials: SpotifyRequiresCredentials, opts: Opts): PromiseResult<R> {
        if (credentials === "requires_credentials" && (!opts.cookie_jar?.hasCookieName("sp_dc"))) {
            return generror(`Spotify: op["${operation_name}"] failed from lack of credentials`, "INFO", { credentials, variables, opts });
        }
        const client = opts.client !== undefined ? opts.client : await get_client("https://open.spotify.com/", opts.cookie_jar);
        if ("error" in client) return client;

        const headers = get_headers(client, opts.cookie_jar);

        const query_base_url = `https://api-partner.spotify.com/pathfinder/v${api_version[operation_name]}/query`;
        const extensions = {
            persistedQuery: {
                version: 1,
                sha256Hash: api_persistant_queries[operation_name]
            }
        };
        const params = {
            operationName: operation_name,
            variables: variables,
            extensions: extensions
        };
        const method = api_methods[operation_name];
        let response: ResponseError | RoZFetchResponse<R>;
        if (method === "GET") {
            response = await rozfetch<R>(`${query_base_url}?${encode_params(params)}`, { headers, ...opts.fetch_opts, method });
        }
        else {
            response = await rozfetch<R>(query_base_url, { headers, ...opts.fetch_opts, method, body: JSON.stringify(params) });
        }
        if ("error" in response) return response;
        const data = await response.json();
        if (typeof data === "object" && data !== null && "error" in data) return data;
        return data;
    }
    export async function get_playlist(opts: SPVar<SpotifyGetPlaylist> & Opts): PromiseResult<UserPlaylist> {
        opts.var = {
            uri: `spotify:playlist:${opts.var.uri.replace('spotify:playlist:', '')}`,
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 100,
            enableWatchFeedEntrypoint: opts.var.enableWatchFeedEntrypoint ?? true
        };
        return await internal_api_query<UserPlaylist, SpotifyGetPlaylist>("fetchPlaylist", opts.var, "no_credentials", opts);
    }

    export async function get_album(opts: SPVar<SpotifyGetAlbum> & Opts): Promise<Album | ResponseError> {
        opts.var = {
            uri: `spotify:album:${url_to_id(opts.var.uri)}`,
            locale: "",
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 100
        };
        return await internal_api_query<Album, SpotifyGetAlbum>("getAlbum", opts.var, "no_credentials", opts);
    }
    export async function get_collection(opts: SPVar<SpotifyGetCollection> & Opts): Promise<Collection | ResponseError> {
        opts.var = {
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 100
        };
        return await internal_api_query<Collection, SpotifyGetCollection>("fetchLibraryTracks", opts.var, "requires_credentials", opts);
    }

    export async function get_query_suggestions(opts: SPVar<SpotifyQuery> & Opts): Promise<Query | ResponseError> {
        opts.var = {
            ...opts.var,
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 20,
            numberOfTopResults: opts.var.numberOfTopResults ?? 20,
            includeAuthors: opts.var.includeAuthors ?? false,
            includeEpisodeContentRatingsV2: opts.var.includeEpisodeContentRatingsV2 ?? false,
        };
        return await internal_api_query<Query, SpotifyQuery>("searchSuggestions", opts.var, "no_credentials", opts);
    }

    export async function get_profile_account_attributes(opts: SPVar<SpotifyProfileAccountAttributes> & Opts) {
        return await internal_api_query<ProfileData, SpotifyProfileAccountAttributes>("profileAndAccountAttributes", opts.var, "requires_credentials", opts);
    }

    export async function get_artist(opts: SPVar<SpotifyArtistOverview> & Opts): Promise<Artist | ResponseError> {
        opts.var = {
            uri: `spotify:artist:${url_to_id(opts.var.uri)}`,
            locale: opts.var.locale ?? "",
            includePrerelease: opts.var.includePrerelease ?? false
        };
        return await internal_api_query<Artist, SpotifyArtistOverview>("queryArtistOverview", opts.var, "no_credentials", opts);
    }

    async function search_base(operation_name: SpotifyOperationName, opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        opts.var = {
            searchTerm: opts.var.searchTerm,
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 10,
            numberOfTopResults: opts.var.numberOfTopResults ?? 5,
            includeAudiobooks: opts.var.includeAudiobooks ?? true,
            includeArtistHasConcertsField: opts.var.includeArtistHasConcertsField ?? false,
            includePreReleases: opts.var.includePreReleases ?? false,
            includeLocalConcertsField: opts.var.includeLocalConcertsField ?? false
        };
        return await internal_api_query<SearchResult, SpotifySearch>(reinterpret_cast<"searchDesktop">(operation_name), opts.var, "no_credentials", opts);
    }

    export async function search(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchDesktop", opts);
    }
    export async function search_tracks(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchTracks", opts);
    }
    export async function search_artists(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchArtists", opts);
    }
    export async function search_albums(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchAlbums", opts);
    }
    export async function search_playlists(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchPlaylists", opts);
    }
    export async function search_audiobooks(opts: SPVar<SpotifySearch> & Opts): Promise<SearchResult | ResponseError> {
        return await search_base("searchAudiobooks", opts);
    }

    export async function get_home(opts: SPVar<SpotifyHome> & Opts): Promise<Home | ResponseError> {
        opts.var = {
            homeEndUserIntegration: opts.var.homeEndUserIntegration ?? "INTEGRATION_WEB_PLAYER",
            timeZone: opts.var.timeZone ?? "America/Los_Angeles",
            sp_t: opts.var.sp_t,
            country: opts.var.country ?? "US",
            facet: opts.var.facet ?? "",
            sectionItemsLimit: opts.var.sectionItemsLimit ?? 10,
            includeEpisodeContentRatingsV2: opts.var.includeEpisodeContentRatingsV2 ?? true
        };
        return await internal_api_query<Home, SpotifyHome>("home", opts.var, "no_credentials", opts);
    }

    export async function account_library(opts: SPVar<SpotifyAccountLibrary> & Opts) {
        opts.var = {
            filters: opts.var.filters ?? [],
            order: opts.var.order ?? null,
            textFilter: opts.var.textFilter ?? "",
            features: opts.var.features ?? ["LIKED_SONGS", "YOUR_EPISODES_V2", "PRERELEASES", "PRERELEASES_V2", "CLIPS", "EVENTS"],
            limit: opts.var.limit ?? 10,
            offset: opts.var.offset ?? 0,
            flatten: opts.var.flatten ?? false,
            expandedFolders: opts.var.expandedFolders ?? [],
            folderUri: opts.var.folderUri ?? null,
            includeFoldersWhenFlattening: opts.var.includeFoldersWhenFlattening ?? true,
            withCuration: opts.var.withCuration ?? false
        };
        return await internal_api_query<Library, SpotifyAccountLibrary>("libraryV3", opts.var, "requires_credentials", opts);
    }

    export async function account_playlists(opts: SPVar<SpotifyAccountLibrary> & Opts) {
        return await account_library({ ...opts, var: { ...opts.var, filters: ["Playlists"] } });
    }

    export async function get_credits(opts: { "uri_id": string } & Opts) {
        const url = `https://spclient.wg.spotify.com/track-credits-view/v0/experimental/${opts.uri_id}/credits`;
        return await getch_data_with_client<Credits>(url, "no_credentials", opts);
    }

    // opts.uris EXAMPLE: "spotify:track:1xsY8IFXUrxeet1Fcmk4oC"
    export async function are_tracks_in_library(opts: SPVar<SpotifyTracksInLibrary> & Opts) {
        return await internal_api_query<InLibrary, SpotifyTracksInLibrary>("areEntitiesInLibrary", opts.var, "requires_credentials", opts);
    }

    export async function add_tracks_to_library(opts: SPVar<SpotifyAddTracksToLibrary> & Opts) {
        return await internal_api_query<{}, SpotifyAddTracksToLibrary>("addToLibrary", opts.var, "requires_credentials", opts);
    }

    // opts.playlist_uri EXAMPLE: "spotify:playlist:4uNs2lqeO0Ec43d2Sp3yp4"
    export async function add_tracks_to_playlist(opts: SPVar<SpotifyAddToPlaylist> & Opts) {
        opts.var = {
            uris: opts.var.uris,
            playlistUri: `spotify:playlist:${url_to_id(opts.var.playlistUri)}`,
            newPosition: {
                moveType: opts.var.newPosition?.moveType ?? "BOTTOM_OF_PLAYLIST",
                fromUid: opts.var.newPosition?.fromUid ?? null
            }
        };
        return await internal_api_query<{}, SpotifyAddToPlaylist>("addToPlaylist", opts.var, "requires_credentials", opts);
    }

    export async function delete_tracks_from_library(opts: SPVar<SpotifyRemoveFromLibrary> & Opts) {
        return await internal_api_query<{}, SpotifyRemoveFromLibrary>("removeFromLibrary", opts.var, "requires_credentials", opts);
    }

    export async function delete_tracks_from_playlist(opts: SPVar<SpotifyRemoveFromPlaylist> & Opts) {
        opts.var.playlistUri = `spotify:playlist:${url_to_id(opts.var.playlistUri)}`;
        return await internal_api_query<{}, SpotifyRemoveFromPlaylist>("removeFromPlaylist", opts.var, "requires_credentials", opts);

    }

    export async function create_playlist(opts: {
        "playlist_name": string
    } & Opts) {
        const payload = {
            ops: [{ kind: 6, updateListAttributes: { newAttributes: { values: { name: opts.playlist_name, formatAttributes: [], pictureSize: [] }, noValue: [] } } }]
        };
        return await post_data_with_client<{ uri: string, revision: string }>("https://spclient.wg.spotify.com/playlist/v2/playlist", payload, "requires_credentials", opts);
    }
    export async function delete_playlist(opts: {
        "playlist_uri": string
    } & Opts) {
        const payload = {
            deltas: [{ ops: [{ kind: 3, rem: { items: [{ uri: opts.playlist_uri }], itemsAsKey: true } }], info: { source: { client: 5 } } }], wantResultingRevisions: false, wantSyncResult: false, nonces: []
        }
        return await post_data_with_client<{}>("https://spclient.wg.spotify.com/playlist/v2/playlist", payload, "requires_credentials", opts);
    }

    export async function get_profile_attributes(opts: SPVar<SpotifyProfileAttributes> & Opts): PromiseResult<ProfileAttributes> {
        return await internal_api_query<ProfileAttributes, SpotifyProfileAttributes>("profileAttributes", opts.var ?? {}, "requires_credentials", opts);
    }

    export async function get_account_attributes(opts: SPVar<SpotifyAccountAttributes> & Opts): PromiseResult<AccountAttributes> {
        return await internal_api_query<AccountAttributes, SpotifyAccountAttributes>("accountAttributes", opts.var ?? {}, "requires_credentials", opts);
    }

    export async function fetch_recently_played(opts: SPVar<SpotifyRecentlyPlayed> & Opts): PromiseResult<RecentlyPlayed> {
        return await internal_api_query<RecentlyPlayed, SpotifyRecentlyPlayed>("fetchEntitiesForRecentlyPlayed", opts.var, "requires_credentials", opts);
    }

    export async function fetch_extracted_colors(opts: SPVar<SpotifyExtractedColors> & Opts): PromiseResult<ExtractedColors> {
        return await internal_api_query<ExtractedColors, SpotifyExtractedColors>("fetchExtractedColors", opts.var, "no_credentials", opts);
    }

    export async function get_playlist_metadata(opts: SPVar<SpotifyPlaylistMetadata> & Opts): PromiseResult<PlaylistMetadata> {
        opts.var = {
            uri: `spotify:playlist:${url_to_id(opts.var.uri)}`,
            offset: opts.var.offset ?? 0,
            limit: opts.var.limit ?? 100,
            enableWatchFeedEntrypoint: opts.var.enableWatchFeedEntrypoint ?? true
        };
        return await internal_api_query<PlaylistMetadata, SpotifyPlaylistMetadata>("fetchPlaylistMetadata", opts.var, "no_credentials", opts);
    }

    export async function lookup_child_entities(opts: SPVar<SpotifyChildEntities> & Opts): PromiseResult<ChildEntities> {
        return await internal_api_query<ChildEntities, SpotifyChildEntities>("lookupChildEntities", opts.var, "no_credentials", opts);
    }

    export async function are_entities_curated(opts: SPVar<SpotifyIsCurated> & Opts): PromiseResult<CuratedStatus> {
        return await internal_api_query<CuratedStatus, SpotifyIsCurated>("isCurated", opts.var, "requires_credentials", opts);
    }

    export async function feed_baseline_lookup(opts: SPVar<SpotifyFeedBaselineLookup> & Opts): PromiseResult<FeedBaseline> {
        return await internal_api_query<FeedBaseline, SpotifyFeedBaselineLookup>("feedBaselineLookup", opts.var, "no_credentials", opts);
    }

    export async function seektables(opts: {file_id: string} & Opts){
        const seektables_response = await rozfetch<SeekTables>(`https://seektables.spotifycdn.com/v1/seektable/${opts.file_id}`);
        if("error" in seektables_response) return seektables_response;
        const seektables_data = await seektables_response.json();
        if("error" in seektables_data) return seektables_data;
        return seektables_data;
    }
}