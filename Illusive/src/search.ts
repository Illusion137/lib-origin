import * as Origin from '../../origin/src/index'
import { Playlist, User, Track, ClientSearchOf, SearchOf } from '../../origin/src/soundcloud/types/Search';
import { generate_new_uid, is_empty, make_topic, parse_runs, parse_time, urlid } from '../../origin/src/utils/util';
import { best_thumbnail, create_uri, spotify_uri_to_uri } from './illusive_utilts';
import { parse_amazon_music_search_track, parse_soundcloud_track, parse_spotify_search_track } from './track_parser';
import { MusicSearchResponse } from './types';
import { ResponseError } from '../../origin/src/utils/types';
import { Prefs } from './prefs';
import { CookieJar } from '../../origin/src/utils/cookie_util';
import * as YT_YTCFG from '../../origin/src/youtube/types/YTCFG';
import * as YT_CONTINUATION from "../../origin/src/youtube/types/Continuation";
// import * as YTMUSIC_YTCFG from '../../origin/src/youtube_music/types/YTCFG';
// import * as YTMUSIC_CONTINUATION from "../../origin/src/youtube_music/types/Continuation";
import { parse_search_continuation_contents } from '../../origin/src/youtube/parser';

function default_search(error?: ResponseError): MusicSearchResponse{
    return {
        "tracks": [],
        "playlists": [],
        "albums": [],
        "artists": [],
        "error": error !== undefined ? [error] : undefined,
        "continuation": null
    }
}
function get_cookie_jar(pref_opt: Prefs.PrefOptions){
    return Prefs.get_pref('use_cookies_on_search') ? <CookieJar>Prefs.get_pref(pref_opt) : new CookieJar([]);
}

export async function spotify_search(query: string): Promise<MusicSearchResponse>{
    const cookie_jar = get_cookie_jar('spotify_cookie_jar');
    const search_response = await Origin.Spotify.search(query, {cookie_jar: cookie_jar});
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

export async function amazon_music_search(query: string): Promise<MusicSearchResponse> {
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
    return {
        "tracks": search_response.data.videos.map(track => {
            if("title" in track!){
                return {
                    "uid": generate_new_uid(parse_runs(track.title.runs)),
                    "title": parse_runs(track.title.runs),
                    "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                    "duration": parse_time(track.lengthText.simpleText),
                    "youtube_id": track.videoId,
                }
            } else return {
                "uid": generate_new_uid(parse_runs(track?.headline.runs)),
                "title": parse_runs(track?.headline.runs),
                "artists": [{"name": parse_runs(track?.shortBylineText.runs), "uri": create_uri("youtube", track!.shortBylineText!.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl)}],
                "duration": parse_time(parse_runs(track.lengthText.runs)),
                "youtube_id": track.videoId,
            };
        }),
        "playlists": search_response.data.playlists.map(playlist => {
            if("simpleText" in playlist.title){
                return {
                    "title": {"name": playlist.title.simpleText, "uri": create_uri("youtube", playlist.playlistId)},
                    "artist": [{"name": playlist.longBylineText.runs[0].text, "uri": null}],
                    "artwork_url": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
                }
            }
            else {
                return {
                    "title": {"name": "runs" in playlist.title ? parse_runs(playlist.title.runs) : playlist.title, "uri": create_uri("youtube", playlist.playlistId)},
                    "artist": [{"name": parse_runs(playlist.shortBylineText.runs), "uri": create_uri("youtube", playlist.shortBylineText.runs[0].navigationEndpoint?.browseEndpoint.canonicalBaseUrl ?? "")}],
                    "artwork_url": best_thumbnail(playlist.thumbnail.thumbnails)?.url,
                }
            }
        }),
        "albums": [],
        "artists": search_response.data.artists.map(artist => {
            if("simpleText" in artist.title){
                return {
                    "name": {"name": artist.title.simpleText, "uri": create_uri("youtube", artist.channelId)},
                    "profile_artwork_url": artist.thumbnail.thumbnails[0].url,
                    "is_official_artist_channel": true
                }
            }
            else return {
                "name": {"name": parse_runs(artist.title.runs), "uri": create_uri("youtube", artist.channelId)},
                "profile_artwork_url": artist.thumbnail.thumbnails[0].url,
                "is_official_artist_channel": true
            }
        }),
        "continuation": is_empty(search_response.data.continuation) ? null : {ytcfg: search_response.icfg.ytcfg, continuation: search_response.data.continuation} as YouTubeSearchContinuation
    }
}
export async function youtube_search(query: string): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_cookie_jar');
    const search_response = await Origin.YouTube.search({cookie_jar: cookie_jar}, query);
    if("error" in search_response) return default_search(search_response as ResponseError);
    return youtube_parse_search(search_response);
}
export async function youtube_search_continuation(opts: YouTubeSearchContinuation): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar("youtube_cookie_jar");
    const search_response = await Origin.YouTube.get_continuation({"cookie_jar": cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in search_response) return default_search(<ResponseError>search_response);
    const parsed_search = parse_search_continuation_contents(search_response);
    return youtube_parse_search(<Awaited<ReturnType<typeof Origin.YouTube.search>>><unknown>({data: parsed_search, icfg: {ytcfg: opts.ytcfg}}))
}

export async function youtube_music_search(query: string): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_music_cookie_jar');
    const search_response = await Origin.YouTubeMusic.search({cookie_jar: cookie_jar}, query);
    if("error" in search_response) return default_search(search_response as ResponseError);
    return {
        "tracks": [],
        "playlists": [],
        "albums": [],
        "artists": [],
        "continuation": null
    }
}

type SoundcloudSearchContinuation = {"next_href": string|null, "client_id": string, "depth": number};
export function soundcloud_parse_search(search_response: ClientSearchOf<Playlist|Track|User>): MusicSearchResponse{
    const playlists_and_albums = search_response.data.collection.filter(item => item.kind === "playlist") as Playlist[];
    const playlists = playlists_and_albums.filter(item => item.is_album === false);
    const albums = playlists_and_albums.filter(item => item.is_album === true);
    const users = search_response.data.collection.filter(item => item.kind === "user") as User[];
    const tracks = search_response.data.collection.filter(item => item.kind === "track") as Track[];

    return {
        "tracks": tracks.map(track => parse_soundcloud_track(track)),
        "playlists": playlists.map(playlist => {
            return {
                "title": {"name": playlist.title, "uri": create_uri("soundcloud", urlid(playlist.permalink_url))},
                "artist": Array.isArray(playlist.user) ? playlist.user.map(user => { 
                    return {
                        "name": make_topic(user.username),
                        "uri": create_uri("soundcloud", String(user.id))
                    } 
                }) : [{"name": make_topic(playlist.user.username), "uri": create_uri("soundcloud", playlist.user.permalink)}],
                "year": new Date(playlist.created_at).getFullYear(),
                "artwork_url": playlist.artwork_url
            }
        }),
        "albums": albums.map(album => {
            return {
                "title": {"name": album.title, "uri": create_uri("soundcloud", urlid(album.permalink_url))},
                "artist": Array.isArray(album.user) ? album.user.map(user => { 
                    return {
                        "name": make_topic(user.username),
                        "uri": create_uri("soundcloud", Array.isArray(album.user) ? album.user[0].permalink_url : album.user.permalink_url)
                    } 
                }) : [{"name": make_topic(album.user.username), "uri": create_uri("soundcloud", urlid(album.user.permalink_url))}],
                "year": new Date(album.created_at).getFullYear(),
                "artwork_url": album.artwork_url === null ? Array.isArray(album.user) ? album.user[0].avatar_url : album.user.avatar_url : album.artwork_url
            }
        }),
        "artists": users.map(artist => {
            return {
                "name": {"name": make_topic(artist.username), "uri": create_uri("soundcloud", urlid(artist.permalink_url))},
                "profile_artwork_url": artist.avatar_url,
                "is_official_artist_channel": true
            }
        }),
        "continuation": {"next_href": search_response.data.next_href, "client_id": search_response.client_id, "depth": 1} as SoundcloudSearchContinuation
    }
}
export async function soundcloud_search(query: string): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = await Origin.SoundCloud.search("EVERYTHING", {"query": query, "cookie_jar": cookie_jar});
    if("error" in search_response) return default_search(search_response);
    return soundcloud_parse_search(search_response);
}
export async function soundcloud_search_continuation(opts: SoundcloudSearchContinuation): Promise<MusicSearchResponse>{
    if(opts.next_href === null) return default_search();
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = <SearchOf<Track|Playlist|User>>await Origin.SoundCloud.continuation(opts.next_href, {cookie_jar: cookie_jar, client_id: opts.client_id}, 1);
    return soundcloud_parse_search({data: search_response, client_id: opts.client_id});
}