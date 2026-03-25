import * as Origin from '@origin/index'
import type { ClientSearchOf, Playlist, Track, User } from '@origin/soundcloud/types/Search';
import { CookieJar } from '@common/utils/cookie_util';
import type { ResponseError } from '@common/types';
import { is_empty } from '@common/utils/util';
import { supabase } from '@illusive/db/supabase';
import type { ISOString, TrackMetaData } from '@illusive/types';
import { parse_search_continuation_contents } from '@origin/youtube/parser';
import type * as YT_CONTINUATION from "@origin/youtube/types/Continuation";
import type * as YT_YTCFG from '@origin/youtube/types/YTCFG';
import { parse_apple_music_search_album, parse_apple_music_search_artist, parse_apple_music_search_playlist, parse_apple_music_search_track } from '@illusive/parsers/apple_music_parser';
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_user } from '@illusive/parsers/soundcloud_parser';
import { determine_music_responsive_list_item_renderer, parse_youtube_music_search_artist, parse_youtube_music_search_playlist, parse_youtube_music_search_top_result, parse_youtube_music_search_top_result_contents_track } from '@illusive/parsers/youtube_music_parser';
import { youtube_parse_channels, youtube_parse_playlists, youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { youtube_music_get_playlist } from '@illusive/get_playlist';
import { spotify_uri_to_uri } from '@illusive/illusive_utils';
import { Prefs } from '@illusive/prefs';
import { parse_amazon_music_search_track } from '@illusive/track_parser';
import type { CompactArtist, CompactPlaylist, MusicSearchResponse, SearchOpts } from '@illusive/types';
import type * as IllusiveTypes from '@illusive/types';
import { parse_spotify_search_album, parse_spotify_search_track, parse_spotify_similar_artist } from './parsers/spotify_parser';

function default_search(error?: ResponseError): MusicSearchResponse {
    return {
        ...(error !== undefined ? {error: error} : {}),
        tracks: [],
        playlists: [],
        albums: [],
        artists: [],
        continuation: null,
    }
}
function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
    return Prefs.get_pref('use_cookies_on_search') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

export async function spotify_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('spotify_cookie_jar');
    const search_response = await Origin.Spotify.search({cookie_jar, var: {searchTerm: query, limit: opts?.limit}, proxy: opts?.proxy});
    if("error" in search_response) return default_search(search_response);
    return {
        tracks: search_response.data.searchV2.tracksV2.items.map(parse_spotify_search_track),
        playlists: search_response.data.searchV2.playlists.items.map(playlist => {
            if(playlist.data.__typename === "NotFound") return null;
            return {
                title: {name: playlist.data.name, uri: spotify_uri_to_uri(playlist.data.uri)},
                artist: [{name: playlist.data.ownerV2.data.name, uri: spotify_uri_to_uri(playlist.data.ownerV2.data.uri)}],
                artwork_thumbnails: playlist.data.images.items[0].sources.map(source => ({...source, height: source.height ?? 0, width: source.width ?? 0}))
            }
        }).filter(item => item !== null),
        albums: search_response.data.searchV2.albumsV2.items.map(parse_spotify_search_album),
        artists: search_response.data.searchV2.artists.items.map(item => parse_spotify_similar_artist(item.data)),
        continuation: null
    }
}

export async function amazon_music_search(query: string, _?: SearchOpts): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('amazon_music_cookie_jar');
    const search_response = await Origin.AmazonMusic.search_tracks(query, {cookie_jar});
    if("error" in search_response) return default_search(search_response);
    return {
        tracks: search_response.map(track => parse_amazon_music_search_track(track)),
        playlists: [],
        albums: [],
        artists: [],
        continuation: null
    }
}
interface YouTubeSearchContinuation {"ytcfg": YT_YTCFG.YTCFG, "continuation": YT_CONTINUATION.Continuation}
function youtube_parse_search(search_response: Awaited<ReturnType<typeof Origin.YouTube.search>>) {
    if("error" in search_response) return default_search(search_response);
    return {
        tracks: youtube_parse_videos(search_response.data.videos),
        playlists: youtube_parse_playlists(search_response.data.playlists),
        artists: youtube_parse_channels(search_response.data.artists),
        albums: [],
        continuation: is_empty(search_response.data.continuation) ? null : {ytcfg: search_response.icfg.ytcfg, continuation: search_response.data.continuation} as YouTubeSearchContinuation
    }
}
export async function youtube_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_cookie_jar');
    const search_response = await Origin.YouTube.search({cookie_jar, proxy: opts?.proxy}, query);
    return youtube_parse_search(search_response);
}
export async function youtube_search_continuation(opts: YouTubeSearchContinuation): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar("youtube_cookie_jar");
    const search_response = await Origin.YouTube.get_continuation({cookie_jar}, opts.ytcfg, opts.continuation);
    if("error" in search_response) return default_search(search_response);
    const parsed_search = parse_search_continuation_contents(search_response);
    return youtube_parse_search(({data: parsed_search, icfg: {ytcfg: opts.ytcfg}}) as unknown as Awaited<ReturnType<typeof Origin.YouTube.search>>)
}

export async function youtube_music_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('youtube_music_cookie_jar');
    const search_response = await Origin.YouTubeMusic.search({cookie_jar, proxy: opts?.proxy}, query);
    if("error" in search_response) return default_search(search_response);
    const top_result = await parse_youtube_music_search_top_result(search_response.data.contents.find(item => item.musicCardShelfRenderer !== undefined)?.musicCardShelfRenderer, youtube_music_get_playlist);
    const results = search_response.data.contents.find(item => item.musicShelfRenderer !== undefined)?.musicShelfRenderer!.contents.map(item => item.musicResponsiveListItemRenderer);
    
    const tracks: IllusiveTypes.Track[] = [];
    const playlists: CompactPlaylist[] = [];
    const albums: CompactPlaylist[] = [];
    const artists: CompactArtist[] = [];
    
    switch(top_result?.top_result.type){
        case "TRACK": 
            tracks.push(top_result.top_result);
            break;
        case "ALBUM": 
            albums.push(top_result.top_result);
            break;
        case "ARTIST": 
            artists.push(top_result.top_result);
            break;
        case undefined:
        default: break;
    }

    if((top_result?.side_contents.length ?? 0) > 0){
        tracks.push(...top_result!.side_contents);
    }
    // console.log(tracks);
    // console.log(playlists);
    // console.log(albums);
    // console.log(artists);
    if(results){
        for(const content of results){
            const type = determine_music_responsive_list_item_renderer(content);
            switch(type){
                case "Song":
                case "Video":
                    tracks.push(parse_youtube_music_search_top_result_contents_track(content));
                    break;
                case "EP":
                case "Single":
                case "Album":
                case "Playlist":
                    playlists.push(parse_youtube_music_search_playlist(content));
                    break;
                case "Profile":
                    artists.push(parse_youtube_music_search_artist(content, false));
                    break;
                case "Artist":
                    artists.push(parse_youtube_music_search_artist(content, true));
                    break;
                default: break;
            }
        }
    }
    return {
        tracks,
        playlists,
        albums,
        artists,
        continuation: null
    };
}

interface SoundcloudSearchContinuation {"next_href": string|null, "client_id": string, "depth": number}
export function soundcloud_parse_search(search_response: ClientSearchOf<Playlist|Track|User>): MusicSearchResponse {
    const playlists_and_albums = search_response.data.collection.filter(item => item.kind === "playlist");
    const playlists = playlists_and_albums.filter(item => !item.is_album);
    const albums = playlists_and_albums.filter(item => item.is_album);
    const users = search_response.data.collection.filter(item => item.kind === "user");
    const tracks = search_response.data.collection.filter(item => item.kind === "track");
    return {
        tracks: tracks.map(soundcloud_parse_track),
        playlists: playlists.map(soundcloud_parse_playlist),
        albums: albums.map(soundcloud_parse_playlist),
        artists: users.map(soundcloud_parse_user),
        continuation: {next_href: search_response.data.next_href, client_id: search_response.client_id, depth: 1} as SoundcloudSearchContinuation
    }
}
export async function soundcloud_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = await Origin.SoundCloud.search("EVERYTHING", {query, cookie_jar, limit: opts?.limit});
    if("error" in search_response) return default_search(search_response);
    return soundcloud_parse_search(search_response);
}
export async function soundcloud_search_continuation(opts: SoundcloudSearchContinuation): Promise<MusicSearchResponse> {
    if(opts.next_href === null) return default_search();
    const cookie_jar = get_cookie_jar('soundcloud_cookie_jar');
    const search_response = await Origin.SoundCloud.continuation<Playlist|Track|User>(opts.next_href, {cookie_jar, client_id: opts.client_id}, 1);
    return soundcloud_parse_search({data: search_response, client_id: opts.client_id});
}

export async function illusi_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return default_search();

    const result = await Origin.Illusi.search_tracks(query, opts?.limit ?? 50, { jwt: session.access_token });
    if ('error' in result) return default_search();

    const default_meta: TrackMetaData = {
        added_date:       new Date().toISOString() as ISOString,
        last_played_date: new Date().toISOString() as ISOString,
        plays:            0,
    };

    return {
        tracks: result.map(t => ({
            uid:                  t.uid,
            title:                t.title,
            alt_title:            t.alt_title,
            artists:              t.artists,
            duration:             t.duration,
            prods:                t.prods,
            genre:                t.genre,
            tags:                 t.tags,
            explicit:             t.explicit,
            unreleased:           t.unreleased,
            album:                t.album,
            illusi_id:            t.illusi_id,
            imported_id:          t.imported_id,
            youtube_id:           t.youtube_id,
            youtubemusic_id:      t.youtubemusic_id,
            soundcloud_id:        t.soundcloud_id,
            soundcloud_permalink: t.soundcloud_permalink,
            spotify_id:           t.spotify_id,
            amazonmusic_id:       t.amazonmusic_id,
            applemusic_id:        t.applemusic_id,
            bandlab_id:           t.bandlab_id,
            artwork_url:          t.artwork_url,
            plays:                0,
            meta:                 default_meta,
        })),
        playlists:  [],
        albums:     [],
        artists:    [],
        continuation: null,
    };
}

export async function apple_music_search(query: string, opts?: SearchOpts): Promise<MusicSearchResponse>{
    const cookie_jar = get_cookie_jar('apple_music_cookie_jar');
    // TODO proxy: opts?.proxy
    opts;
    const search_response = await Origin.AppleMusic.search(query, {cookie_jar});
    if("error" in search_response) return default_search(search_response);

    const tracks = is_empty(search_response.data.resources.songs) ? [] : Object.values(search_response.data.resources.songs);
    const playlists = is_empty(search_response.data.resources.playlists) ? [] : Object.values(search_response.data.resources.playlists);
    const albums = is_empty(search_response.data.resources.albums) ? [] : Object.values(search_response.data.resources.albums);
    const artists = is_empty(search_response.data.resources.artists) ? [] : Object.values(search_response.data.resources.artists);

    return {
        tracks: tracks.map(parse_apple_music_search_track),
        playlists: playlists.map(parse_apple_music_search_playlist),
        albums: albums.map(parse_apple_music_search_album),
        artists: artists.map(parse_apple_music_search_artist),
        continuation: null
    }
}