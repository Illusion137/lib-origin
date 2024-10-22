import * as Origin from '../../origin/src/index'
import { Playlist, User, Track, ClientSearchOf, SearchOf } from '../../origin/src/soundcloud/types/Search';
import { is_empty, make_topic } from '../../origin/src/utils/util';
import { best_thumbnail, spotify_uri_to_uri } from './illusive_utilts';
import { parse_amazon_music_search_track, parse_spotify_search_track } from './track_parser';
import { MusicSearchResponse } from './types';
import { ResponseError } from '../../origin/src/utils/types';
import { Prefs } from './prefs';
import { CookieJar } from '../../origin/src/utils/cookie_util';
import * as YT_YTCFG from '../../origin/src/youtube/types/YTCFG';
import * as YT_CONTINUATION from "../../origin/src/youtube/types/Continuation";
// import * as YTMUSIC_YTCFG from '../../origin/src/youtube_music/types/YTCFG';
// import * as YTMUSIC_CONTINUATION from "../../origin/src/youtube_music/types/Continuation";
import { parse_search_continuation_contents } from '../../origin/src/youtube/parser';
import { youtube_parse_channels, youtube_parse_playlists, youtube_parse_videos } from './gen/youtube_parser';
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_user } from './gen/soundcloud_parser';

function default_search(error?: ResponseError): MusicSearchResponse{
    return {
        ...(error !== undefined ? {"error": [error]} : {}),
        "tracks": [],
        "playlists": [],
        "albums": [],
        "artists": [],
        "continuation": null,
    }
}
function get_cookie_jar(pref_opt: Prefs.PrefOptions){
    return Prefs.get_pref('use_cookies_on_search') ? <CookieJar>Prefs.get_pref(pref_opt) : new CookieJar([]);
}

export async function spotify_search(query: string, limit?: number): Promise<MusicSearchResponse>{
    const cookie_jar = get_cookie_jar('spotify_cookie_jar');
    const search_response = await Origin.Spotify.search(query, {cookie_jar: cookie_jar, limit: limit});
    if("error" in search_response) return default_search(search_response);
    return {
        "tracks": search_response.data.searchV2.tracksV2.items.map(parse_spotify_search_track),
        "playlists": search_response.data.searchV2.playlists.items.map(playlist => {
            if(playlist.data.__typename === "NotFound") return null;
            return {
                "title": {"name": playlist.data.name, "uri": spotify_uri_to_uri(playlist.data.uri)},
                "artist": [{"name": make_topic(playlist.data.ownerV2.data.name), "uri": spotify_uri_to_uri(playlist.data.ownerV2.data.uri)}],
                "artwork_thumbnails": playlist.data.images.items[0].sources
            }
        }).filter(item => item !== null),
        "albums": search_response.data.searchV2.albumsV2.items.map(album => {
            return {
                "title": {"name": album.data.name, "uri": spotify_uri_to_uri(album.data.uri)},
                "artist": [{"name": make_topic(album.data.artists.items[0].profile.name), "uri": spotify_uri_to_uri(album.data.artists.items[0].uri)}],
                "artwork_thumbnails": album.data.coverArt.sources,
                "year": album.data.date.year
            }
        }),
        "artists": search_response.data.searchV2.artists.items.map(artist => {
            return {
                "name": {"name": make_topic(artist.data.profile.name), "uri": spotify_uri_to_uri(artist.data.uri)},
                "profile_artwork_url": best_thumbnail(artist.data.visuals.avatarImage?.sources!)?.url,
                "is_official_artist_channel": true
            }
        }),
        "continuation": null
    }
}

export async function amazon_music_search(query: string, _?: number): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('amazon_music_cookie_jar');
    const search_response = await Origin.AmazonMusic.search(query, {cookie_jar: cookie_jar});
    if("error" in search_response) return default_search(search_response);
    return {
        "tracks": search_response.map(track => { return parse_amazon_music_search_track(track) }),
        "playlists": [],
        "albums": [],
        "artists": [],
        "continuation": null
    }
}
type YouTubeSearchContinuation = {"ytcfg": YT_YTCFG.YTCFG, "continuation": YT_CONTINUATION.Continuation};
function youtube_parse_search(search_response: Awaited<ReturnType<typeof Origin.YouTube.search>>){
    if("error" in search_response) return default_search(search_response);
    return {
        "tracks": youtube_parse_videos(search_response.data.videos),
        "playlists": youtube_parse_playlists(search_response.data.playlists),
        "artists": youtube_parse_channels(search_response.data.artists),
        "albums": [],
        "continuation": is_empty(search_response.data.continuation) ? null : {ytcfg: search_response.icfg.ytcfg, continuation: search_response.data.continuation} as YouTubeSearchContinuation
    }
}
export async function youtube_search(query: string, _?: number): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_cookie_jar');
    const search_response = await Origin.YouTube.search({cookie_jar: cookie_jar}, query);
    return youtube_parse_search(search_response);
}
export async function youtube_search_continuation(opts: YouTubeSearchContinuation): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar("youtube_cookie_jar");
    const search_response = await Origin.YouTube.get_continuation({"cookie_jar": cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in search_response) return default_search(search_response);
    const parsed_search = parse_search_continuation_contents(search_response);
    return youtube_parse_search(<Awaited<ReturnType<typeof Origin.YouTube.search>>><unknown>({data: parsed_search, icfg: {ytcfg: opts.ytcfg}}))
}

export async function youtube_music_search(query: string, _?: number): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_music_cookie_jar');
    const search_response = await Origin.YouTubeMusic.search({cookie_jar: cookie_jar}, query);
    if("error" in search_response) return default_search(search_response);
    return default_search();
}

type SoundcloudSearchContinuation = {"next_href": string|null, "client_id": string, "depth": number};
export function soundcloud_parse_search(search_response: ClientSearchOf<Playlist|Track|User>): MusicSearchResponse{
    const playlists_and_albums = search_response.data.collection.filter(item => item.kind === "playlist") as Playlist[];
    const playlists = playlists_and_albums.filter(item => item.is_album === false);
    const albums = playlists_and_albums.filter(item => item.is_album === true);
    const users = search_response.data.collection.filter(item => item.kind === "user") as User[];
    const tracks = search_response.data.collection.filter(item => item.kind === "track") as Track[];
    return {
        "tracks": tracks.map(soundcloud_parse_track),
        "playlists": playlists.map(soundcloud_parse_playlist),
        "albums": albums.map(soundcloud_parse_playlist),
        "artists": users.map(soundcloud_parse_user),
        "continuation": {"next_href": search_response.data.next_href, "client_id": search_response.client_id, "depth": 1} as SoundcloudSearchContinuation
    }
}
export async function soundcloud_search(query: string, limit?: number): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = await Origin.SoundCloud.search("EVERYTHING", {"query": query, "cookie_jar": cookie_jar, "limit": limit});
    if("error" in search_response) return default_search(search_response);
    return soundcloud_parse_search(search_response);
}
export async function soundcloud_search_continuation(opts: SoundcloudSearchContinuation): Promise<MusicSearchResponse>{
    if(opts.next_href === null) return default_search();
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = <SearchOf<Track|Playlist|User>>await Origin.SoundCloud.continuation(opts.next_href, {cookie_jar: cookie_jar, client_id: opts.client_id}, 1);
    return soundcloud_parse_search({data: search_response, client_id: opts.client_id});
}