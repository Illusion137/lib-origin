import * as Origin from '../../origin/src/index'
import * as SCSearch from '../../origin/src/soundcloud/types/Search';
import { Album } from '../../origin/src/spotify/types/Album';
import { Collection } from '../../origin/src/spotify/types/Collection';
import { UserPlaylist } from '../../origin/src/spotify/types/UserPlaylist';
import { ResponseError } from '../../origin/src/utils/types';
import { get_main_key, is_empty, make_topic, parse_runs, urlid } from '../../origin/src/utils/util';
import { parse_playlist_continuation_contents } from '../../origin/src/youtube/parser';
import * as YT_CONTINUATION from "../../origin/src/youtube/types/Continuation";
import * as YT_YTCFG from '../../origin/src/youtube/types/YTCFG';
import * as YTMUSIC_CONTINUATION from "../../origin/src/youtube_music/types/Continuation";
import { YouTubeMusicPlaylistTrack } from '../../origin/src/youtube_music/types/PlaylistResults_0';
import { PlaylistResults_1 } from '../../origin/src/youtube_music/types/PlaylistResults_1';
import { PlaylistResults_3 } from '../../origin/src/youtube_music/types/PlaylistResults_3';
import * as YTMUSIC_YTCFG from '../../origin/src/youtube_music/types/YTCFG';
import * as YTMUSIC_CONTINUATION_RENDERER from "../../origin/src/youtube/types/PlaylistResults_0";
import { clean_album_title, parse_apple_music_album_track, parse_apple_music_artwork, parse_apple_music_playlist_track, parse_apple_music_user_playlist_track } from './gen/apple_music_parser';
import { musi_parse_track } from './gen/musi_parser';
import { soundcloud_parse_track } from './gen/soundcloud_parser';
import { parse_youtube_music_album_track, parse_youtube_music_playlist_track } from './gen/youtube_music_parser';
import { youtube_parse_playlist_header, youtube_parse_videos } from './gen/youtube_parser';
import { best_thumbnail, create_uri, date_from, spotify_uri_to_uri, youtube_music_split_artists } from './illusive_utilts';
import { Prefs } from './prefs';
import { parse_amazon_music_playlist_track, parse_spotify_album_track, parse_spotify_collection_track, parse_spotify_playlist_track } from './track_parser';
import { ISOString, MusicServicePlaylist, MusicServicePlaylistContinuation, Runs, NamedUUID } from './types';
import { Constants } from './constants';

function default_playlist(error?: ResponseError): MusicServicePlaylist {
    return {...(error !== undefined ? {error: [error]} : {}), title: "", tracks: [], continuation: null}
}

export async function musi_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await Origin.Musi.get_playlist(url);
    if("error" in playlist_response) return default_playlist(playlist_response);
    return {
        title: playlist_response.success.data.title,
        tracks: playlist_response.success.data.data.map(musi_parse_track),
        continuation: null
    };
}

interface YouTubePlaylistContinuation {"ytcfg": YT_YTCFG.YTCFG, "continuation": YT_CONTINUATION.Continuation}
export async function youtube_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const playlist_response = await Origin.YouTube.get_playlist({cookie_jar}, url);
    if("error" in playlist_response) return default_playlist(playlist_response);
    if(playlist_response.data.playlist_data === undefined) return default_playlist({error: new Error("playlist_data is undefined")});
    return {
        ...youtube_parse_playlist_header(playlist_response.data.playlist_data),
        tracks: youtube_parse_videos(playlist_response.data.tracks),
        continuation: playlist_response.data.continuation === null ? null : {ytcfg: playlist_response.icfg.ytcfg, continuation: playlist_response.data.continuation} as YouTubePlaylistContinuation
    }
}
export async function youtube_get_playlist_continuation(opts: YouTubePlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const playlist_response = await Origin.YouTube.get_continuation({cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in playlist_response) return {tracks: [], continuation: null, error: [playlist_response]};
    const parsed_playlist = parse_playlist_continuation_contents(playlist_response);
    return {tracks: youtube_parse_videos(parsed_playlist.tracks), continuation: {ytcfg: opts.ytcfg, continuation: parsed_playlist.continuation} as YouTubePlaylistContinuation}
}

interface YouTubeMusicPlaylistContinuation {"url": string, "ytcfg": YTMUSIC_YTCFG.YTCFG, "continuation": YTMUSIC_CONTINUATION.Continuation|YTMUSIC_CONTINUATION_RENDERER.ContinuationItemRenderer, "type": "ALBUM" | "PLAYLIST", "artist"?: Runs, "album"?: Runs}

export async function youtube_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("youtube_music_cookie_jar"); 
    const playlist_response = await Origin.YouTubeMusic.get_playlist({cookie_jar}, url);
    if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
    if(url.includes("OLAK5uy_")) { // Album
        return {
            title: parse_runs(playlist_response.data.playlist_data.title.runs),
            creator: youtube_music_split_artists(playlist_response.data.playlist_data.straplineTextOne.runs as Runs),
            artwork_url: playlist_response.data.playlist_data.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
            date: date_from({year: parseInt(playlist_response.data.playlist_data.subtitle.runs[2].text)}).toISOString() as ISOString,
            tracks: playlist_response.data.tracks.map(track => parse_youtube_music_album_track(track, playlist_response.data.playlist_data.straplineTextOne.runs, playlist_response.data.playlist_data.title.runs as Runs, Origin.YouTubeMusic.playlist_urlid(url))),
            continuation: playlist_response.data.continuation === null ? null : {url: url, ytcfg: playlist_response.icfg.ytcfg, continuation: playlist_response.data.continuation, type: "ALBUM", artist: playlist_response.data.playlist_data.straplineTextOne.runs, album: playlist_response.data.playlist_data.title.runs} as YouTubeMusicPlaylistContinuation
        };
    }
    try {
        return { // Playlist
            title: parse_runs(playlist_response.data.playlist_data.title.runs),
            creator: youtube_music_split_artists(playlist_response.data.playlist_data?.subtitle?.runs as Runs),
            artwork_url: playlist_response.data.playlist_data.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
            date: date_from({year: parseInt(playlist_response.data.playlist_data.subtitle.runs[2].text)}).toISOString() as ISOString,
            tracks: playlist_response.data.tracks.filter(item => item !== undefined).map(parse_youtube_music_playlist_track).filter(item => item !== undefined),
            continuation: playlist_response.data.continuation === null ? null : {url: url, ytcfg: playlist_response.icfg.ytcfg, continuation: playlist_response.data.continuation, type: "PLAYLIST"} as YouTubeMusicPlaylistContinuation
        };
    }
    catch(e) {
        return {
            title: parse_runs(playlist_response.data.playlist_data.title.runs),
            creator: youtube_music_split_artists(playlist_response.data.playlist_data.straplineTextOne.runs as Runs),
            artwork_url: playlist_response.data.playlist_data.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails[0].url,
            date: date_from({year: parseInt(playlist_response.data.playlist_data.subtitle.runs[2].text)}).toISOString() as ISOString,
            tracks: playlist_response.data.tracks.map(track => parse_youtube_music_album_track(track, playlist_response.data.playlist_data.straplineTextOne.runs, playlist_response.data.playlist_data.title.runs as Runs, Origin.YouTubeMusic.playlist_urlid(url))),
            continuation: playlist_response.data.continuation === null ? null : {url: url, ytcfg: playlist_response.icfg.ytcfg, continuation: playlist_response.data.continuation, type: "ALBUM", artist: playlist_response.data.playlist_data.straplineTextOne.runs, album: playlist_response.data.playlist_data.title.runs} as YouTubeMusicPlaylistContinuation
        };
    }
}
export async function youtube_music_get_playlist_continuation(opts: YouTubeMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    const cookie_jar = Prefs.get_pref("youtube_music_cookie_jar");
    const playlist_response = await Origin.YouTubeMusic.get_continuation({cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in playlist_response) return {tracks: [], continuation: null, error: [playlist_response]};
    const parsed_playlist = playlist_response as unknown as PlaylistResults_1|PlaylistResults_3;
    if("continuationContents" in parsed_playlist){
        if(parsed_playlist?.continuationContents?.musicPlaylistShelfContinuation === undefined) return {tracks: [], continuation: null};
        return {
            tracks: parsed_playlist.continuationContents.musicPlaylistShelfContinuation.contents.filter(item => item !== undefined).map(track => 
                opts.type === "PLAYLIST" ? parse_youtube_music_playlist_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack) :
                    parse_youtube_music_album_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack, opts.artist as Runs, opts.album as Runs, Origin.YouTubeMusic.playlist_urlid(opts.url))
            ).filter(item => item !== undefined),
            continuation: {
                ytcfg: opts.ytcfg, 
                continuation: parsed_playlist.continuationContents?.musicPlaylistShelfContinuation?.continuations === undefined ? null :
                    parsed_playlist.continuationContents?.musicPlaylistShelfContinuation.continuations,
                type: opts.type,
                artist: opts.artist,
                album: opts.album
            } as YouTubeMusicPlaylistContinuation
        };
    }
    else {
        if(parsed_playlist?.onResponseReceivedActions?.[0] === undefined) return {tracks: [], continuation: null};
        const contents = parsed_playlist.onResponseReceivedActions[0]?.appendContinuationItemsAction?.continuationItems;
        if(contents === undefined) return {tracks: [], continuation: null};
        const next_continuation = contents.find(item => "continuationItemRenderer" in item);
        return {
            tracks: contents.filter(item => item !== undefined).map(track => 
                opts.type === "PLAYLIST" ? parse_youtube_music_playlist_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack) :
                    parse_youtube_music_album_track(track.musicResponsiveListItemRenderer as unknown as YouTubeMusicPlaylistTrack, opts.artist as Runs, opts.album as Runs, Origin.YouTubeMusic.playlist_urlid(opts.url))
            ).filter(item => item !== undefined),
            continuation: next_continuation === undefined ? null : {
                ytcfg: opts.ytcfg, 
                continuation: next_continuation.continuationItemRenderer === undefined ? null :
                    next_continuation.continuationItemRenderer,
                type: opts.type,
                artist: opts.artist,
                album: opts.album
            } as YouTubeMusicPlaylistContinuation
        };
    }
}

interface SpotifyPlaylistContinuation {"client": Origin.Spotify.Client, "id": string, "current": number, "total": number, "limit": number, "type": "ALBUM" | "PLAYLIST" | "COLLECTION"}

export async function spotify_get_playlist(url: string): Promise<MusicServicePlaylist> {
    let playlist_response: UserPlaylist|Album|Collection|ResponseError;
    const cookie_jar = Prefs.get_pref("spotify_cookie_jar");
    const playlist_limit: number = Constants.spotify_playlist_limit;
    const client = await Origin.Spotify.get_client(url, cookie_jar);
    if("error" in client) return {title: "", tracks: [], continuation: null, error: [client]};
    const playlist_id = urlid(url, "open.spotify.com/", "playlist/", "album/", "collection/");
    const playlist_type = urlid(url, "open.spotify.com/", /\/.+/);
    switch(playlist_type) {
        case "playlist":   playlist_response = await Origin.Spotify.get_playlist(playlist_id, {cookie_jar, client, limit: playlist_limit}); break;
        case "album":      playlist_response = await Origin.Spotify.get_album(playlist_id, {cookie_jar, client, limit: playlist_limit}); break;
        case "tracks":
        case "collection": playlist_response = await Origin.Spotify.get_collection({cookie_jar, client, limit: playlist_limit}); break;
        default: return {title: "", tracks: [], continuation: null};
    }
    if(playlist_response === undefined) return {title: "", tracks: [], continuation: null, error: [{error: new Error("playlist_response is undefined")}]};
    if((typeof playlist_response === "object" && "error" in playlist_response)) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
    if("playlistV2" in playlist_response.data) {
        return {
            title: playlist_response.data.playlistV2.name,
            creator: [{name: playlist_response.data.playlistV2.ownerV2.data.name, uri: spotify_uri_to_uri(playlist_response.data.playlistV2.ownerV2.data.uri)}],
            description: playlist_response.data.playlistV2.description,
            tracks: playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
            continuation: playlist_limit >= playlist_response.data.playlistV2.content.totalCount ? null : 
                {client, id: playlist_id, current: playlist_limit, total: playlist_response.data.playlistV2.content.totalCount, limit: playlist_limit, type: "PLAYLIST" } as SpotifyPlaylistContinuation
        }
    } else if("albumUnion" in playlist_response.data) {
        const album_union = playlist_response.data.albumUnion;
        const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
        return {
            title: album_union.name,
            creator: playlist_response.data.albumUnion.artists.items.map(artist => {
                return {name: make_topic(artist.profile.name), uri: spotify_uri_to_uri(artist.uri)}
            }),
            artwork_url: playlist_response.data.albumUnion.coverArt.sources[0].url,
            date: playlist_response.data.albumUnion.date.isoString as ISOString,
            tracks: playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, {name: album_union.name, uri: album_union.uri}, artwork?.url)),
            continuation: playlist_limit >= playlist_response.data.albumUnion.tracks.totalCount ? null : 
                {client, id: playlist_id, current: playlist_limit, total: playlist_response.data.albumUnion.tracks.totalCount, limit: playlist_limit, type: "ALBUM" } as SpotifyPlaylistContinuation
        }
    } else {
        return {
            title: "spotify-lib",
            tracks: playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
            continuation: playlist_limit >= playlist_response.data.me.library.tracks.totalCount ? null : 
                {client, id: playlist_id, current: playlist_limit, total: playlist_response.data.me.library.tracks.totalCount, limit: playlist_limit, type: "COLLECTION" } as SpotifyPlaylistContinuation
        }
    }
}
export async function spotify_get_playlist_continuation(opts: SpotifyPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    let playlist_response;
    const cookie_jar = Prefs.get_pref("spotify_cookie_jar");
    switch(opts.type) {
        case "PLAYLIST":   playlist_response = await Origin.Spotify.get_playlist(opts.id, {cookie_jar, client: opts.client, limit: opts.limit, offset: opts.current}); break;
        case "ALBUM":      playlist_response = await Origin.Spotify.get_album(opts.id, {cookie_jar, client: opts.client, limit: opts.limit, offset: opts.current}); break;
        case "COLLECTION": playlist_response = await Origin.Spotify.get_collection({cookie_jar, client: opts.client, limit: opts.limit, offset: opts.current}); break;
        default: return {tracks: [], continuation: null};
    }
    if(playlist_response === undefined || "error" in playlist_response) return {tracks: [], continuation: null, error: [playlist_response]};
    if("playlistV2" in playlist_response.data) {
        return {
            tracks: playlist_response.data.playlistV2.content.items.map(parse_spotify_playlist_track),
            continuation: opts.current + opts.limit >= playlist_response.data.playlistV2.content.totalCount ? null : 
                {client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.playlistV2.content.totalCount, limit: opts.limit, type: "PLAYLIST" } as SpotifyPlaylistContinuation
        }
    } else if("albumUnion" in playlist_response.data) {
        const album_union = playlist_response.data.albumUnion;
        const artwork = best_thumbnail(playlist_response.data.albumUnion.coverArt.sources);
        return {
            tracks: playlist_response.data.albumUnion.tracks.items.map(track => parse_spotify_album_track(track, album_union, artwork?.url)),
            continuation: opts.current + opts.limit >= playlist_response.data.albumUnion.tracks.totalCount ? null : 
                {client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.albumUnion.tracks.totalCount, limit: opts.limit, type: "ALBUM" } as SpotifyPlaylistContinuation
        }
    } else {
        return {
            tracks: playlist_response.data.me.library.tracks.items.map(parse_spotify_collection_track),
            continuation: opts.current + opts.limit >= playlist_response.data.me.library.tracks.totalCount ? null : 
                {client: opts.client, id: opts.id, current: opts.current + opts.limit, total: playlist_response.data.me.library.tracks.totalCount, limit: opts.limit, type: "COLLECTION" } as SpotifyPlaylistContinuation
        }
    }
}

export async function amazon_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("amazon_music_cookie_jar");
    const playlist_response = await Origin.AmazonMusic.get_playlist(url, {cookie_jar});
    if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
    return {
        title: playlist_response.title,
        tracks: playlist_response.tracks.map(track => parse_amazon_music_playlist_track(track)),
        continuation: null
    };
}

interface SoundcloudPlaylistContinuation {"next_href": string|null, "client_id": string, "depth": number}
export async function soundcloud_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const playlist_limit: number = Constants.soundcloud_playlist_limit;

    const hydration = await Origin.SoundCloud.get_hydration("https://www.soundcloud.com", {cookie_jar});
    if("error" in hydration) return {title: "", tracks: [], continuation: null, error: [hydration]};
    const client_id = await Origin.SoundCloud.get_client_id(hydration.scripts_urls, cookie_jar);
    if(typeof client_id === "object") return {title: "", tracks: [], continuation: null, error: [client_id]};

    if(url.includes("you/likes")) {
        const playlist_response = await Origin.SoundCloud.liked_music({cookie_jar})
        if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
        return {
            title: "Liked Music",
            creator: [{name: "You", uri: null}],
            tracks: playlist_response.data.collection.map(({track}) => track).map(soundcloud_parse_track),
            continuation: {next_href: playlist_response.data.next_href, client_id, depth: 1} as SoundcloudPlaylistContinuation
        };
    } else if(url.includes("/sets/")) {
        const playlist_response = await Origin.SoundCloud.get_playlist({cookie_jar, playlist_path: url})
        if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
        return {
            title: playlist_response.hydration.data.title,
            creator: [{name: playlist_response.hydration.data.user.username, uri: create_uri("soundcloud", playlist_response.hydration.data.user.permalink)}],
            description: playlist_response.hydration.data.description,
            artwork_url: playlist_response.hydration.data.artwork_url,
            date: playlist_response.hydration.data.created_at as ISOString,
            tracks: playlist_response.tracks.map(soundcloud_parse_track),
            continuation: null
        };
    }
    const artist_response = await Origin.SoundCloud.get_artist("TRACKS", {cookie_jar, client_id, artist_id: url, limit: playlist_limit});
    if("error" in artist_response) return {title: "", tracks: [], continuation: null, error: [artist_response]};
    return {
        title: artist_response.user.data.username,
        creator: [{name: artist_response.user.data.username, uri: create_uri("soundcloud", artist_response.user.data.permalink)}],
        description: artist_response.user.data.description,
        artwork_url: artist_response.user.data.avatar_url,
        date: artist_response.user.data.created_at as ISOString ,
        tracks: artist_response.artist_data.collection.map(soundcloud_parse_track),
        continuation: {next_href: artist_response.artist_data.next_href, client_id, depth: 1} as SoundcloudPlaylistContinuation
    };
}
export async function soundcloud_get_playlist_continuation(opts: SoundcloudPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    if(opts.next_href === null) return {tracks:[], continuation: null};
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const artist_response = await Origin.SoundCloud.continuation(opts.next_href, {...opts, cookie_jar}, opts.depth) as unknown as SCSearch.SearchOf<SCSearch.Track>|SCSearch.SearchOf<SCSearch.LikedTrack>;
    return {
        tracks: artist_response.collection.length > 0 && "kind" in artist_response.collection[0] && artist_response.collection[0].kind === "like" ? 
            artist_response.collection.map((track) => (track as SCSearch.LikedTrack).track).map(soundcloud_parse_track) : 
                (artist_response as SCSearch.SearchOf<SCSearch.Track>).collection.map(soundcloud_parse_track),
        continuation: {next_href: artist_response.next_href, client_id: opts.client_id, depth: 1} as SoundcloudPlaylistContinuation
    };
}

interface AppleMusicPlaylistContinuation {"playlist_id": string, "offset": number, "total": number, "authorization": string}
export async function apple_music_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const cookie_jar = Prefs.get_pref("apple_music_cookie_jar");
    if(url.includes("/album")){
        const playlist_response = await Origin.AppleMusic.get_album(url, {});
        if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
        const playlist_header = playlist_response.data.sections.find(item => item.id.includes('album-detail-header'))?.items[0];
        const title = clean_album_title(playlist_header?.title ?? "");
        const album_data: NamedUUID = {name: title, uri: create_uri("applemusic", playlist_response.data.canonicalURL)};
        const artist_data: NamedUUID = {name: playlist_header?.subtitleLinks?.[0].title ?? "", uri: playlist_header?.subtitleLinks?.[0].segue?.destination.contentDescriptor.url === undefined ? null :create_uri("applemusic", playlist_header?.subtitleLinks?.[0].segue?.destination.contentDescriptor.url)};
        const artwork_url = parse_apple_music_artwork(playlist_header?.artwork?.dictionary.url);
        return {
            title: title,
            creator: [artist_data],
            artwork_url: artwork_url,
            tracks: playlist_response.data.sections.find(item => item.id.includes("track-list - "))?.items.map(item => parse_apple_music_album_track(item, album_data, artist_data, artwork_url ?? '')) ?? [], 
            continuation: null
        };
    }
    else {
        const playlist_response = await Origin.AppleMusic.get_playlist(url, {cookie_jar});
        if("error" in playlist_response) return {title: "", tracks: [], continuation: null, error: [playlist_response]};
        if("resources" in playlist_response.data) { // User Playlist
            const playlist_data_main_key = get_main_key(playlist_response.data.resources.playlists);
            const playlist_data = playlist_response.data.resources.playlists[playlist_data_main_key];
            const playlist_songs = playlist_response.data.resources['library-songs'] ?? playlist_response.data.resources['songs'];
            const playlist_id = Origin.AppleMusic.playlist_urlid(url);
            const song_keys = Object.keys(playlist_songs);
    
            const __playlists__ = playlist_response.data.resources["library-playlists"] ?? playlist_response.data.resources["playlists"];
            const playlist_meta_main_key = get_main_key(__playlists__);
    
            const total_songs = __playlists__[playlist_meta_main_key].relationships?.tracks?.meta?.total ?? song_keys.length;
            return {
                title: playlist_data.attributes.name,
                creator: [{name: playlist_data.attributes.curatorName, uri: null}],
                artwork_url: parse_apple_music_artwork(playlist_data.attributes?.artwork?.url),
                description: playlist_data.attributes?.description?.standard,
                date: playlist_data.attributes.lastModifiedDate as ISOString,
                tracks: song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])), 
                continuation: 0 + song_keys.length >= total_songs ? null : {playlist_id, offset: 0 + song_keys.length, total: total_songs, authorization: playlist_response.authorization} as AppleMusicPlaylistContinuation
            };
        } else {
            return {
                title: playlist_response?.data?.sections[0].items[0].title,
                creator: playlist_response?.data?.sections?.[0]?.items?.[0]?.subtitleLinks.map(link => {
                    return {name: link.title, uri: is_empty(link?.segue?.destination?.contentDescriptor?.identifiers?.storeAdamID) ? null : create_uri("applemusic", link?.segue?.destination?.contentDescriptor?.identifiers?.storeAdamID)}
                }) ?? [],
                artwork_url: playlist_response.data.sections[0].items[0].artwork.dictionary.url,
                tracks: playlist_response.data.sections[1].items.map(track => parse_apple_music_playlist_track(track)), 
                continuation: null
            };
        }
    }
}
export async function apple_music_get_playlist_continuation(opts: AppleMusicPlaylistContinuation): Promise<MusicServicePlaylistContinuation> {
    const cookie_jar = Prefs.get_pref("apple_music_cookie_jar");
    if(opts === undefined || opts.offset >= opts.total) return { tracks:[], continuation: null };
    const playlist_response = await Origin.AppleMusic.get_playlist_continuation(opts.playlist_id, opts.offset, opts.authorization, {cookie_jar});
    if("error" in playlist_response) return { tracks:[], continuation: null, error: [playlist_response] };
    const playlist_songs = playlist_response.resources['library-songs'] ?? playlist_response.resources['songs'];
    const song_keys = Object.keys(playlist_songs);
    return {
        tracks: song_keys.map(key => parse_apple_music_user_playlist_track(playlist_songs[key])),
        continuation: {playlist_id: opts.playlist_id, offset: opts.offset + song_keys.length, total: opts.total, authorization: opts.authorization} as AppleMusicPlaylistContinuation
    }
}

export async function illusi_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await fetch(url);
    if(!playlist_response.ok) return {title: "", tracks: [], continuation: null};
    return await playlist_response.json().catch((result) => { return result instanceof Error ? {error: result} : result});
}

export async function api_get_playlist(url: string): Promise<MusicServicePlaylist> {
    const playlist_response = await fetch(url);
    if(!playlist_response.ok) return {title: "", tracks: [], continuation: null};
    return await playlist_response.json().catch((result) => { return result instanceof Error ? {error: result} : result});
}