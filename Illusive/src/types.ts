import type * as Origin from "@origin/index";
import type { CookieJar } from "@common/utils/cookie_util"
import type { ResponseError} from "@common/types";
import { TimedCache } from "@common/types"
// import type { Chapter } from "@origin/youtube_dl/types";
import { Constants } from "@illusive/constants";
import type { Prefs } from "@illusive/prefs";
import { remove } from "@common/utils/clean_util";
import type { BasePref } from "@native/mmkv/mmkv_utils";
import type { RoZFetchRequestInit } from "@common/rozfetch";
import type { YouTubeDL } from '@origin/youtube_dl/index';

type ArtworkCacheType = 'force-cache';

export type SQLTables = "sqlite_master"
    | "new_releases" | "artists"
    | "tracks" | "tracks_deleted" 
    | "recently_played_tracks" | "recently_played_tracks_deleted" 
    | "backpack" | "backpack_deleted" 
    | "playlists" | "playlists_deleted"
    | "playlists_tracks" | "playlists_tracks_deleted";
export interface ImageArtwork {
    uri: string
    cache: ArtworkCacheType
}
export type Artwork = ImageArtwork | string | number
export type Promises = Promise<unknown>[]

export interface Route<T> {"key": string, "name": string, "params": T, path: string}

export type SQLType = "INTEGER" | "TEXT" | "BOOLEAN" | "DATETIME";
export type SQLAlter = {"table": SQLTables, "action": "DROP",   'column_name': string} | 
                       {"table": SQLTables, "action": "RENAME", 'column_name': string, 'new_column_name': string} |
                       {"table": SQLTables, "action": "ADD",    'column_name': string, 'type': SQLType}

export type LoadingState = "NONE" | "LOADING" | "COMPLETE";
export type PlayingState = "OFF" | "LOADING" | "ON";
export type EditMode = "NONE" | "DOWNLOAD" | "DELETE" | "EDIT";
export type DownloadTrackResult = "GOOD" | "EXISTS" | ResponseError;
export type SetState = any;
export interface SQLCount {"COUNT(1)": number}

export type SortType = "ALPHABETICAL" | "ALPHABETICAL_REVERSE" 
    | "NEWEST" | "OLDEST" 
    | "DURATION_HILOW" | "DURATION_LOWHI" 
    | "PLAYS_HILOW" | "PLAYS_LOWHI" 
    | "VIEWS_HILOW" | "VIEWS_LOWHI"
    | "ADDED_DATE_HILOW" | "ADDED_DATE_LOWHI"
    | "DOWNLOAD_DATE_HILOW" | "DOWNLOAD_DATE_LOWHI"
    | "LAST_PLAYED_DATE_HILOW" | "LAST_PLAYED_DATE_LOWHI"
    | "LAST_SAMPLED_DATE_HILOW" | "LAST_SAMPLED_DATE_LOWHI"
    | "LONGEST_PLAYED_HILOW" | "LONGEST_PLAYED_LOWHI"

export type OnErrorCallback = (err: ResponseError) => void

export type BottomAlertType = "GOOD"|"INFO"|"WARN"|"ERROR";

export interface SQLTable {
    name: string
    rootpage: number
    sql: string
    tbl_name: string
    type: string
}
export type Runs = {text: string, navigationEndpoint: any}[];

export type PrefEntry = [Prefs.PrefOptions, BasePref<unknown>];
export interface GroupSection<T> {title: string, data: T[]};

export type HexColor = `#${string}`;
export type IntString = `${number}`;
export type ISOString = `${IntString}-${IntString}-${IntString}T${IntString}:${IntString}:${IntString}.${IntString}Z`;
export type Primitives = string|boolean|number;

export type ArtistSortMode = "NEWEST"|"OLDEST"|"MOST_PLAYED"|"LEAST_PLAYED";
export type AlbumSortMode = "NEWEST"|"OLDEST"|"MOST_PLAYED_ARTISTS"|"LEAST_PLAYED_ARTISTS";

export interface QueryFlag<T> {
    flag: string;
    description: string;
    condition: (obj: T, args: string[]) => boolean;
    args?: number;
}

export interface AlphabetScroll {
    all_alphabet_fast_scroll_locations: number[],
    current_position: number,
    top_scroll: number
}
export interface ConvertToUUIDURI { uuid_uri: string };
export interface ConvertToTitle { title: string };
export type ConvertTo = ConvertToUUIDURI | ConvertToTitle;
export interface BaseLinkerLink {
    link_uuid: string;
    illusi_uuid: string;
    service_uri: IllusiveURI;
    full_service_playlist: boolean;
    on_startup: boolean;
}
export interface IncomingLinkerLink extends BaseLinkerLink{
    type: "INCOMING";
}
export interface OutgoingLinkerLink extends BaseLinkerLink{
    type: "OUTGOING";
}
export type LinkerLink = IncomingLinkerLink | OutgoingLinkerLink;

export interface DefaultPlaylist {
    name: string;
    force_order?: boolean;
    check_existing_tracks?: boolean;
    track_function: () => Promise<Track[]>;
    four_track_function: () => Promise<Track[]>
};
export interface ResolvedDefaultPlaylist {
    name: string;
    force_order?: boolean;
    check_existing_tracks?: boolean;
    four_tracks: Track[];
};

export interface QueueTrack {
    uid: string
    playback: {artwork: Artwork}
    artists: NamedUUID[]
    title: string
};

export interface IllusiveThumbnail {
    url: string
    height: number
    width: number
}

export interface Downloading {
    track: Track;
    uid: string
    progress: number
    execution_id: number
    progress_updater?: SetState
    redownload: boolean;
    duration: number
}
export interface LyricsDownloading {
    track: Track; 
    uid: string;
}
export type LyricsDownloadingResult = ResponseError | string;

export type IllusiveURI = `${MusicServiceURI}:${string}`;
export type NamedUUID = {name: string, uuid: string, uri?: never} | {name: string, uuid?: never, uri: IllusiveURI|null};

export interface SQLArtist {
    uri: string;
    name: string;
    artwork_url: string;
}

export type ExplicitMode = "NONE" | "EXPLICIT" | "CLEAN";
interface Basic_Album<T, U, V> {
    uuid: string
    artwork_thumbnails: T
    title: string
    artists: U
    uris: V
    explicit?: ExplicitMode
}
export type SQLAlbum = Basic_Album<string, string, string>;
export type Album = Basic_Album<IllusiveThumbnail[], NamedUUID[], IllusiveURI[]>;

interface TrackDownloadingData {
    progress: number
    saved: boolean
    playlist_saved: boolean
}
export interface TrackPlaybackData {
    added: boolean
    successful: boolean
    artwork: Artwork
}
export interface TrackMetaData {
    plays: number;
    added_date: ISOString;
    last_played_date: ISOString;
    downloaded_date?: ISOString;
    last_sampled_date?: ISOString;
    begdur?: number;
    enddur?: number;
    nsplit?: number;
    age_restricted?: boolean;
    chapters?: YouTubeDL.Chapter[];
    songs?: YTDescriptionSong[];
    unavailable?: boolean;
}
// Regex
// \s+.+?: (.+?)\n
interface Basic_Track<T, U, V, X> {
    id?: number;
    uid: string
    title: string
    alt_title?: string
    artists: T
    duration: number
    prods?: string
    genre?: string
    tags?: X
    explicit?: ExplicitMode
    unreleased?: boolean
    album?: V
    plays?: number
    imported_id?: string
    illusi_id?: string
    youtube_id?: string
    youtubemusic_id?: string
    soundcloud_id?: number
    soundcloud_permalink?: string
    spotify_id?: string
    amazonmusic_id?: string
    applemusic_id?: string
    bandlab_id?: string
    artwork_url?: string
    thumbnail_uri?: string
    media_uri?: string
    lyrics_uri?: string
    meta?: U
    playback?: TrackPlaybackData
    downloading_data?: TrackDownloadingData
}

export type Track = Basic_Track<NamedUUID[], TrackMetaData, NamedUUID, string[]>

export interface SmallTrack {
    title: Track['title'],
    artists: string,
    duration: Track['duration'];
    youtube_id: Track['youtube_id'];
    soundcloud_permalink: Track['soundcloud_permalink'];
}
export type SmallTrackRaw = [SmallTrack['title'], SmallTrack['artists'], SmallTrack['duration'], SmallTrack['youtube_id'], SmallTrack['soundcloud_permalink']];

export type PlaylistInheritanceMode = "INCLUDE" | "EXCLUDE" | "MASK" | "INTERSECTION";
export interface InheritedPlaylist {
    uuid: string
    mode: PlaylistInheritanceMode
}
export interface InheritedSearch {
    query: string
    mode: PlaylistInheritanceMode
}
export type LinkedPlaylist = { max_depth: number, uri: IllusiveURI, uuid?: never } | { max_depth: number, uri?: never, uuid: string };
interface PlaylistVisualData {
    four_track?: Track[]
    track_count?: number
}
interface Basic_Playlist<T, U, V, X> {
    uuid: string
    title: string
    description?: string
    pinned?: boolean
    archived?: boolean
    thumbnail_uri?: string
    sort?: SortType
    public?: boolean
    public_uuid?: string
    inherited_playlists?: T
    inherited_searchs?: X
    linked_playlists?: U
    visual_data?: V
    date?: string
}
export type SQLPlaylistArray = [ string, string, string, boolean, boolean, string, SortType, boolean, string, string, string, string, string ];

export type SQLPlaylist = Basic_Playlist<string, string, string, string>
export type Playlist = Basic_Playlist<InheritedPlaylist[], LinkedPlaylist[], PlaylistVisualData, InheritedSearch[]>

export interface CompactPlaylistData {
    title: string
    four_track: Track[]
	check_existing_tracks?: boolean;
    track_count: number
    type: "PLAYLIST" | "LIBRARY"
    track_callback: () => Promise<Track[]>
    thumbnail_uri?: string;
    pinned?: boolean;
}
export interface SerializedCompactPlaylistData {
    title: string;
    tracks: Track[];
    type: "PLAYLIST" | "LIBRARY";
}

export interface PlaylistsTracks {
    uuid: string
    track_uid: string
}

export type CompactPlaylistType = "PLAYLIST" | "SAVED" | "ALBUM"
export type CompactPlaylistAlbumType = "ALBUM" | "SINGLE" | "EP" | "SINGLE/EP" | "SONG";
export interface Basic_CompactPlaylist<T, U, V, W> {
    title: T
    artist: U
    artwork_thumbnails?: V
    artwork_url?: string
    artwork_index?: number
    date?: ISOString
    explicit?: ExplicitMode
    type?: CompactPlaylistType
    album_type?: CompactPlaylistAlbumType
    song_track?: W|null
}
export type SQLCompactPlaylist = Basic_CompactPlaylist<string, string, string, string>;
export type CompactPlaylist = Basic_CompactPlaylist<NamedUUID, NamedUUID[], IllusiveThumbnail[], Track>;
export interface SQLTimestampedCompactPlaylist extends SQLCompactPlaylist {
    Timestamp: string
}
export interface TimestampedCompactPlaylist extends CompactPlaylist {
    Timestamp: string
}
export interface CompactArtist {
    name: NamedUUID
    profile_artwork_url?: Artwork
    is_official_artist_channel: boolean
}
export type SearchSuggestion = string|Track;
export interface MusicServicePlaylistBase {
    title: string
    creator?: NamedUUID[]
    description?: string
    artwork_url?: string
    date?: ISOString
}
export interface MusicServicePlaylist {
    tracks: Track[]
    title: string
    creator?: NamedUUID[]
    description?: string
    artwork_url?: string
    date?: ISOString
    continuation: Record<string, any> | null
    error?: ResponseError
}
export interface MusicServicePlaylistContinuation {
    tracks: Track[]
    continuation: Record<string, any> | null
    error?: ResponseError
}

export interface MusicSearchResponse {
    tracks: Track[]
    artists: CompactArtist[]
    playlists: CompactPlaylist[]
    albums: CompactPlaylist[]
    error?: ResponseError
    continuation: Record<string, any> | null
}

export interface StatefullMusicSearchResponse {
    state: "NONE"|"LOADING"|"FUFILLED";
    search_data: MusicSearchResponse;
}

export interface MusicServiceArtist {
    name: string
    latest_release?: CompactPlaylist
    tracks: Track[]
    tracks_continuation?: () => Track[]
    playlists: CompactPlaylist[]
    albums: CompactPlaylist[]
    singles_eps: CompactPlaylist[]
    appears_on?: CompactPlaylist[]
    background_artwork_url?: string
    profile_artwork_url?: Artwork
    similar_artists: CompactArtist[],
    error?: ResponseError
}
export interface YTDescriptionSong {
    artwork_url: string,
    title: string,
    artist: string,
    album?: string,
}
export interface DownloadFromIdResult {
    url: string;
    metadata?: {
        artist_id: string;
        chapters: YouTubeDL.Chapter[];
        songs?: YTDescriptionSong[]
    };
}

export interface IllusiveExplore {

}

export type ParsedUri = [MusicServiceURI, string]

export type MusicServiceType = "Illusi" | "Musi" | "YouTube" | "YouTube Music" | "Spotify" | "Amazon Music" | "Apple Music" | "SoundCloud" | "BandLab" | "API";
export type MusicServiceURI = "illusi" | "musi" | "youtube" | "youtubemusic" | "spotify" | "amazonmusic" | "applemusic" | "soundcloud" | "bandlab" | "api";
export type MusicServiceURIPath = "playlist" | "artist" | "album"
export type MusicServicePlaylistTitle = string;
export type MusicServicePlaylistURL = string;

export type CompactPlaylistsResult = {"playlists": CompactPlaylist[]} | ResponseError;
export type TrackMix = { "tracks": Track[], "error"?: Error } | ResponseError;

export interface MusicServiceMappedPlaylist {url: MusicServicePlaylistURL, compact_playlist: CompactPlaylist}
export interface SearchOpts {limit?: number; proxy?: Origin.Proxy.Proxy}
export interface ArtistOpts {proxy?: Origin.Proxy.Proxy}

const search_cache: TimedCache<string, MusicSearchResponse> = new TimedCache<string, MusicSearchResponse>(Constants.playlist_cache_duration_seconds * 1000);
export class MusicService {
    app_icon: string|number
    web_view_url?: string
    pref_cookie_jar?: Prefs.PrefOptions
    link_text: string
    valid_playlist_url_regex: RegExp
    required_cookie_credentials: string[]
    cookie_jar_callback?: () => CookieJar
    search?: (query: string, opts?: SearchOpts) => Promise<MusicSearchResponse>
    search_continuation?: (continuation_data: any) => Promise<MusicSearchResponse>
    explore?: () => Promise<IllusiveExplore>
    create_playlist?: (title: string) => Promise<string>
    delete_playlist?: (playlist_uri: string) => Promise<boolean>
    add_tracks_to_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
    delete_tracks_from_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
    get_user_playlists?: () => Promise<CompactPlaylistsResult>
    get_playlist: (url: string, fetch_opts?: RoZFetchRequestInit) => Promise<MusicServicePlaylist>
    get_playlist_continuation?: (continuation_data: any) => Promise<MusicServicePlaylistContinuation>
    download_from_id?: (id: string, quality: string) => Promise<DownloadFromIdResult | ResponseError>
    get_track_mix?: (id: string) => Promise<TrackMix>
    get_artist?: (id: string, opts?: ArtistOpts) => Promise<MusicServiceArtist>
    get_new_releases?: () => Promise<CompactPlaylist[]>
    get_latest_releases?: (id: string, opts?: ArtistOpts) => Promise<CompactPlaylist[]|undefined>
    constructor(s: {
        app_icon: string|number,
        web_view_url?: string,
        pref_cookie_jar?: Prefs.PrefOptions
        link_text: string,
        valid_playlist_url_regex: RegExp,
        required_cookie_credentials: string[],
        cookie_jar_callback?: () => CookieJar
        search?: (query: string, opts?: SearchOpts) => Promise<MusicSearchResponse>
        search_continuation?: (continuation_data: any) => Promise<MusicSearchResponse>
        explore?: () => Promise<IllusiveExplore>
        create_playlist?: (title: string) => Promise<string>
        delete_playlist?: (playlist_uri: string) => Promise<boolean>
        add_tracks_to_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
        delete_tracks_from_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
        get_user_playlists?: () => Promise<CompactPlaylistsResult>,
        get_playlist: (url: string, fetch_opts?: RoZFetchRequestInit) => Promise<MusicServicePlaylist>,
        get_playlist_continuation?: (continuation_data: any) => Promise<MusicServicePlaylistContinuation>,
        download_from_id?: (id: string, quality: string) => Promise<DownloadFromIdResult | ResponseError>,
        get_track_mix?: (id: string) => Promise<TrackMix>,
        get_artist?: (id: string, opts?: ArtistOpts) => Promise<MusicServiceArtist>,
        get_new_releases?: () => Promise<CompactPlaylist[]>
        get_latest_releases?: (id: string, opts?: ArtistOpts) => Promise<CompactPlaylist[]|undefined>,
    }) {
        this.app_icon = s.app_icon
        this.web_view_url = s.web_view_url;
        this.pref_cookie_jar = s.pref_cookie_jar;
        this.valid_playlist_url_regex = s.valid_playlist_url_regex;
        this.required_cookie_credentials = s.required_cookie_credentials;
        this.link_text = s.link_text;
        this.cookie_jar_callback = s.cookie_jar_callback;
        this.search = Constants.use_illusive_cahce ? async(query: string, opts?: SearchOpts) => {
            const key = query + ":MS:" + String(this.app_icon);
            if(search_cache.get(key)) return search_cache.get(key)!;
            return search_cache.update(key, await s.search!(query, opts));
        } : s.search;
        this.search_continuation = s.search_continuation;
        this.explore = s.explore;
        this.create_playlist = s.create_playlist;
        this.delete_playlist = s.delete_playlist;
        this.add_tracks_to_playlist = s.add_tracks_to_playlist !== undefined ? async(tracks: Track[], playlist_uri: string) =>  {
            if(tracks.length === 0) return true;
            return await s.add_tracks_to_playlist!(tracks, playlist_uri);
        } : undefined;
        this.delete_tracks_from_playlist = s.delete_tracks_from_playlist !== undefined ? async(tracks: Track[], playlist_uri: string) =>  {
            if(tracks.length === 0) return true;
            return await s.delete_tracks_from_playlist!(tracks, playlist_uri);
        } : undefined;
        this.get_user_playlists = s.get_user_playlists;
        this.get_playlist = s.get_playlist;
        this.get_playlist_continuation = s.get_playlist_continuation
        this.download_from_id = s.download_from_id;
        this.get_track_mix = s.get_track_mix;
        this.get_artist = s.get_artist;
        this.get_new_releases = s.get_new_releases;
        this.get_latest_releases = s.get_latest_releases;
    }
    has_credentials() {
        if (this.cookie_jar_callback === undefined) return false;
        for (const required_cookie_credential of this.required_cookie_credentials) {
            if (this.cookie_jar_callback?.().getCookie?.(required_cookie_credential) === undefined)
                return false;
        }
        return true;
    }
    async user_playlists_map(): Promise<{map: Map<MusicServicePlaylistTitle, MusicServiceMappedPlaylist>, error?: ResponseError}> {
        const map = new Map<MusicServicePlaylistTitle, MusicServiceMappedPlaylist>();
        if(this.get_user_playlists === undefined) return {error: {error: new Error("get_user_playlist is undefined")}, map};
        const account_playlists = await this.get_user_playlists();
        if("error" in account_playlists) return {error: account_playlists, map};
        const service_domain_map: Record<MusicServiceURI, string> = {
            illusi: "",
            musi: "",
            youtube: "https://www.youtube.com/playlist?list=",
            youtubemusic: "https://music.youtube.com/playlist?list=",
            spotify: "https://open.spotify.com/",
            amazonmusic: "https://music.amazon.com",
            applemusic: "https://music.apple.com/library/playlist/",
            soundcloud: "https://soundcloud.com/",
            bandlab: "https://www.bandlab.com/",
            api: "",
        };
        for(const playlist of account_playlists.playlists) {
            // eslint-disable-next-line prefer-const
            let [service, endpoint] = playlist.title.uri!.split(':') as [MusicServiceURI, string];
            if((["illusi", "musi", "api"] as MusicServiceURI[]).includes(service)) return {error: {error: new Error("Service lacks playlist list")}, map};
            endpoint = remove(endpoint, "m.soundcloud.com/", "soundcloud.com/")
            if(service === "spotify") {
                if(playlist.type === undefined) return {error: {error: new Error("Playlist Type is undefined")}, map};
                const type = playlist.type === "PLAYLIST" ? "playlist" : playlist.type === "ALBUM" ? "album" : "collection";
                map.set(playlist.title.name, {url: `${service_domain_map[service]}${type}/${endpoint}`, compact_playlist: playlist});
            } else
                map.set(playlist.title.name, {url: service_domain_map[service] + endpoint, compact_playlist: playlist});
        }
        return {map};
    }
    async get_rest_of_playlist(continuation_data: any) {
        const continued_tracks: Track[] = [];
        let i = 0;
        while(i++ <= Constants.safe_max_fetch_continues && continuation_data !== null) {
            const continuation = await this.get_playlist_continuation!(continuation_data);
            if("error" in continuation) break;
            continued_tracks.push(...continuation.tracks);
            continuation_data = continuation.continuation;
        }
        return continued_tracks;
    }
    async get_full_playlist(url: string) {
        const initial = await this.get_playlist(url);
        if("error" in initial) return initial;
        initial.tracks.push(...await this.get_rest_of_playlist(initial.continuation));
        return initial;
    }
}

export class PQueue<T> {
    elements: Record<number, T>
    head: number
    tail: number
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    get length() { return this.tail - this.head; }
    get is_empty() { return this.length === 0; }
    enqueue(element: T): void {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    peek() { return this.elements[this.head]; }
}