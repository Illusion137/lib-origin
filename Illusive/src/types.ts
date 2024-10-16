import { CookieJar } from "../../origin/src/utils/cookie_util"
import { ResponseError } from "../../origin/src/utils/types"
import { remove } from "../../origin/src/utils/util";
import { Prefs } from "./prefs";

type ArtworkCacheType = 'force-cache';

export type SQLTables = "sqlite_master" | "tracks" | "recently_played_tracks" | "backpack" | "playlists" | "playlists_tracks";
export interface ImageArtwork {
    uri: string
    cache: ArtworkCacheType
}
export type Artwork = ImageArtwork | number
export type Promises = Promise<unknown>[]

export type Route<T> = {"key": string, "name": string, "params": T, path: string};

export type SQLType = "INTEGER" | "STRING" | "BOOLEAN";
export type SQLAlter = {"table": SQLTables, "action": "DROP",   'column_name': string} | 
                       {"table": SQLTables, "action": "RENAME", 'column_name': string, 'new_column_name': string} |
                       {"table": SQLTables, "action": "ADD",    'column_name': string, 'type': SQLType}

export type PlayingState = "OFF" | "LOADING" | "ON";
export type EditMode = "NONE" | "DOWNLOAD" | "DELETE" | "EDIT";
export type DownloadTrackResult = "GOOD" | "ERROR";
export type SetState = any;

export type SortType = "ALPHABETICAL" | "NEWEST" | "OLDEST"

export interface SQLTable {
    name: string
    rootpage: number
    sql: string
    tbl_name: string
    type: string
}
export type Runs = {text: string, navigationEndpoint: any}[];


export type HexColor = `#${string}`;
export type IntString = `${number}`;
export type ISOString = `${IntString}-${IntString}-${IntString}T${IntString}:${IntString}:${IntString}.${IntString}Z`;
export type Primitives = string|boolean|number;

export interface AlphabetScroll {
    all_alphabet_fast_scroll_locations: number[],
    current_position: number,
    top_scroll: number
}

interface Basic_LinkerLink<T extends MusicServiceType, F extends MusicServiceType> {
    from_playlist_url: F extends "Illusi" ? never : string
    from_depth: F extends "Illusi" ? never : string
    from_service: F
    to_service: T
    mode: "LIBRARY" | "PLAYLIST"
}
type LinkerLink_ToIllusi = Basic_LinkerLink<"Illusi", MusicServiceType>;
type LinkerLink_FromIllusi = Basic_LinkerLink<MusicServiceType, "Illusi">;

export type LinkerLink = LinkerLink_ToIllusi | LinkerLink_FromIllusi;

export interface DefaultPlaylist {
    name: string
    track_function: () => Promise<Track[]>
};
export interface ResolvedDefaultPlaylist {
    name: string
    tracks: Track[]
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
    uid: string
    progress: number
    execution_id: number
    progress_updater?: SetState
    duration: number
}

export type IllusiveURI = `${MusicServiceURI}:${string}`;
export type NamedUUID = {name: string, uuid: string, uri?: never} | {name: string, uuid?: never, uri: IllusiveURI|null};

interface Basic_Artist<T, U> {
    uuid: string
    avatar_thumbnails: T
    name: string
    uris: U
    verified?: boolean
}
export type SQLArtist = Basic_Artist<string, string>;
export type Artist = Basic_Artist<IllusiveThumbnail[], IllusiveURI[]>;

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
interface TrackPlaybackData {
    added: boolean
    successful: boolean
    artwork: Artwork
}
export interface TrackMetaData {
    plays: number
    added_date: Date
    last_played_date: Date
    downloaded_date?: Date
}
//Regex
//\s+.+?: (.+?)\n
interface Basic_Track<T, U, V, W, X> {
    uid: string
    title: string
    artists: T
    duration: number
    prods?: W
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
    artwork_url?: string
    thumbnail_uri?: string
    media_uri?: string
    lyrics_uri?: string
    meta?: U
    playback?: TrackPlaybackData
    downloading_data?: TrackDownloadingData
}
export type SQLTrackArray = [ string, string, string, number, string, string, string, ExplicitMode, boolean, string, number, string, string, string, string, number, string, string, string, string, string, string, string, string, string ];

export type SQLTrack = Basic_Track<string, string, string, string, string>
export type Track = Basic_Track<NamedUUID[], TrackMetaData, NamedUUID, string[], string[]>
export type SerializedTrack = Basic_Track<NamedUUID[], string, NamedUUID, string[], string[]>

type PlaylistInheritanceMode = "INCLUDE" | "EXCLUDE" | "MASK";
interface InheritedPlaylist {
    uuid: string
    mode: PlaylistInheritanceMode
}
type LinkedPlaylist = { max_depth: number, uri: IllusiveURI, uuid?: never } | { max_depth: number, uri?: never, uuid: string };
interface PlaylistVisualData {
    four_track?: Track[]
    track_count?: number
}
interface Basic_Playlist<T, U, V, X> {
    uuid: string
    title: string
    description?: string
    pinned?: boolean
    thumbnail_uri?: string
    sort?: SortType
    public?: boolean
    public_uuid?: string
    inherited_playlists?: T
    linked_playlists?: U
    visual_data?: V
    date?: X
}
export type SQLPlaylistArray = [ string, string, string, boolean, string, SortType, boolean, string, string, string, string ];

export type SQLPlaylist = Basic_Playlist<string, string, string, string>
export type Playlist = Basic_Playlist<InheritedPlaylist[], LinkedPlaylist[], PlaylistVisualData, Date>

export interface CompactPlaylistData {
    title: string
    four_track: Track[]
    track_count: number
    type: "PLAYLIST" | "LIBRARY"
    track_callback: () => Promise<Track[]>
}
export interface SerializedCompactPlaylistData {
    title: string
    tracks: SerializedTrack[]
    type: "PLAYLIST" | "LIBRARY"
}

export interface PlaylistsTracks {
    uuid: string
    track_uid: string
}

export type MaybeErrors = ResponseError[] | never;
export type CompactPlaylistType = "PLAYLIST" | "SAVED" | "ALBUM"
export interface CompactPlaylist {
    title: NamedUUID
    artist: NamedUUID[]
    artwork_thumbnails?: IllusiveThumbnail[]
    thumbnail_uri?: string
    date?: Date
    explicit?: ExplicitMode
    type?: CompactPlaylistType
}

export interface CompactArtist {
    name: NamedUUID
    profile_thumbnail_uri?: string
    is_official_artist_channel: boolean
}

export interface MusicServicePlaylist {
    tracks: Track[]
    title: string
    creator?: NamedUUID[]
    description?: string
    thumbnail_uri?: string
    date?: Date
    playlist_continuation: Record<string, any> | null
    error?: MaybeErrors
}
export interface MusicServicePlaylistContinuation {
    tracks: Track[]
    playlist_continuation: Record<string, any> | null
    error?: MaybeErrors
}

export interface MusicSearchResponse {
    tracks: Track[]
    artists: CompactArtist[]
    playlists: CompactPlaylist[]
    albums: CompactPlaylist[]
    error?: MaybeErrors
}

export interface a {

}
export interface IllusiveExplore {

}

export type ParsedUri = [MusicServiceURI, string]

export type MusicServiceType = "Illusi" | "Musi" | "YouTube" | "YouTube Music" | "Spotify" | "Amazon Music" | "Apple Music" | "SoundCloud" | "API";
export type MusicServiceURI = "illusi" | "musi" | "youtube" | "youtubemusic" | "spotify" | "amazonmusic" | "applemusic" | "soundcloud" | "api";
export type MusicServiceURIPath = "playlist" | "artist" | "album"
export type MusicServicePlaylistTitle = string;
export type MusicServicePlaylistURL = string;

export type CompactPlaylistsResult = {"playlists": CompactPlaylist[], "error"?: string};
export type TrackMix = { "tracks": Track[], "error"?: string };

export class MusicService {
    app_icon: string | number
    web_view_url?: string
    pref_cookie_jar?: Prefs.PrefOptions
    link_text: string
    valid_playlist_url_regex: RegExp
    required_cookie_credentials: string[]
    cookie_jar_callback?: () => CookieJar
    search?: (query: string) => Promise<MusicSearchResponse>
    explore?: () => Promise<IllusiveExplore>
    create_playlist?: (title: string) => Promise<boolean>
    delete_playlist?: (playlist_uri: string) => Promise<boolean>
    add_tracks_to_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
    delete_tracks_from_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
    get_user_playlists?: () => Promise<CompactPlaylistsResult>
    get_playlist: (url: string) => Promise<MusicServicePlaylist>
    get_playlist_continuation?: (continuation_data: any) => Promise<MusicServicePlaylistContinuation>
    download_from_id?: (id: string, quality: string) => Promise<{ "url": string } | ResponseError>
    get_track_mix?: (id: string) => Promise<TrackMix>
    has_credentials() {
        if (this.cookie_jar_callback === undefined) return false;
        for (const required_cookie_credential of this.required_cookie_credentials) {
            if (this.cookie_jar_callback().getCookie(required_cookie_credential) === undefined)
                return false;
        }
        return true;
    }
    async user_playlists_map(){
        const map = new Map<MusicServicePlaylistTitle, MusicServicePlaylistURL>();
        if(this.get_user_playlists === undefined) return {"error": [{"error": "get_user_playlist is undefined"}], "map": map};
        const account_playlists = await this.get_user_playlists();
        if("error" in account_playlists) return {"error": [account_playlists as ResponseError], "map": map};
        const service_domain_map: Record<MusicServiceURI, string> = {
            "illusi": "",
            "musi": "",
            "youtube": "https://www.youtube.com/playlist?list=",
            "youtubemusic": "https://music.youtube.com/playlist?list=",
            "spotify": "https://open.spotify.com/",
            "amazonmusic": "https://music.amazon.com",
            "applemusic": "https://music.apple.com/library/playlist/",
            "soundcloud": "https://soundcloud.com/",
            "api": "",
        }
        for(const playlist of account_playlists.playlists){
            let [service, endpoint] = <[MusicServiceURI, string]>playlist.title.uri!.split(':');
            if((<MusicServiceURI[]>["illusi", "musi", "api"]).includes(service)) return {"error": [{"error": "service lacks playlist list"}], "map": map};
            endpoint = remove(endpoint, "m.soundcloud.com/", "soundcloud.com/")
            if(service === "spotify"){
                if(playlist.type === undefined) return {"error": [{"error": "Playlist Type is undefined"}], "map": map};
                const type = playlist.type === "PLAYLIST" ? "playlist" : playlist.type === "ALBUM" ? "album" : "collection";
                map.set(playlist.title.name, `${service_domain_map[service]}${type}/${endpoint}`);
            }
            else
                map.set(playlist.title.name, service_domain_map[service] + endpoint);
        }
        return {"map": map};
    }
    async get_rest_of_playlist(continuation_data: any){
        continuation_data;
    }
    async get_full_playlist(url: string){
        const initial = await this.get_playlist(url);
        if("error" in initial) return initial.error;
        // while()
        initial.tracks = initial.tracks.concat()
        return;
    }
    constructor(s: {
        app_icon: string | number,
        web_view_url?: string,
        pref_cookie_jar?: Prefs.PrefOptions
        link_text: string,
        valid_playlist_url_regex: RegExp,
        required_cookie_credentials: string[],
        cookie_jar_callback?: () => CookieJar
        search?: (query: string) => Promise<MusicSearchResponse>
        explore?: () => Promise<IllusiveExplore>
        create_playlist?: (title: string) => Promise<boolean>
        delete_playlist?: (playlist_uri: string) => Promise<boolean>
        add_tracks_to_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
        delete_tracks_from_playlist?: (tracks: Track[], playlist_uri: string) => Promise<boolean>
        get_user_playlists?: () => Promise<CompactPlaylistsResult>,
        get_playlist: (url: string) => Promise<MusicServicePlaylist>,
        get_playlist_continuation?: (continuation_data: any) => Promise<MusicServicePlaylistContinuation>,
        download_from_id?: (id: string, quality: string) => Promise<{ "url": string } | ResponseError>
        get_track_mix?: (id: string) => Promise<TrackMix>
    }) {
        this.app_icon = s.app_icon
        this.web_view_url = s.web_view_url;
        this.pref_cookie_jar = s.pref_cookie_jar;
        this.valid_playlist_url_regex = s.valid_playlist_url_regex;
        this.required_cookie_credentials = s.required_cookie_credentials;
        this.link_text = s.link_text;
        this.cookie_jar_callback = s.cookie_jar_callback;
        this.search = s.search;
        this.explore = s.explore;
        this.create_playlist = s.create_playlist;
        this.delete_playlist = s.delete_playlist;
        this.add_tracks_to_playlist = s.add_tracks_to_playlist;
        this.delete_tracks_from_playlist = s.delete_tracks_from_playlist;
        this.get_user_playlists = s.get_user_playlists;
        this.get_playlist = s.get_playlist;
        this.get_playlist_continuation = s.get_playlist_continuation
        this.download_from_id = s.download_from_id;
        this.get_track_mix = s.get_track_mix;
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
    get length() { return this.tail - this.head; }
    get is_empty() { return this.length === 0; }
}

export class TimedCache<K, V> {
    lifespan_milliseconds: number
    store: { created_at: Date, key: K, value: V }[]
    constructor(lifespan_seconds: number){
        this.lifespan_milliseconds = lifespan_seconds;
        this.store = [];
    }
    add(key: K, value: V){
        this.clear_expired();
        this.store.push({created_at: new Date(), key: key, value: value});
    }
    get(key: K){
        this.clear_expired();
        return this.store.find(item => item.key === key)?.value;
    }
    update(key: K, value: V){
        this.clear_expired();
        const i = this.store.findIndex(item => item.key === key);
        if(i === -1) this.add(key, value);
        this.store[i].value = value;
    }
    clear_expired(){
        this.store = this.store.filter(item => item.created_at.getTime() + this.lifespan_milliseconds > new Date().getTime())
    }
}