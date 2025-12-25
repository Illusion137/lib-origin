import { AppleMusic, SoundCloud, Spotify, YouTubeMusic } from "@origin/index";
import { CookieJar } from "@common/utils/cookie_util";
import type { ResponseError } from "@common/types";
import { urlid } from "@common/utils/util";
import { parse_apple_music_artist_album, parse_apple_music_artist_latest_album, parse_apple_music_artist_similar_artist, parse_apple_music_artist_track, parse_apple_music_artwork } from "@illusive/parsers/apple_music_parser";
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_track_to_song } from "@illusive/parsers/soundcloud_parser";
import { parse_youtube_music_artist_album, parse_youtube_music_artist_similar_artist, parse_youtube_music_artist_track, parse_youtube_music_artist_tracks_track } from "@illusive/parsers/youtube_music_parser";
import { best_thumbnail, create_uri } from "@illusive/illusive_utils";
import { Prefs } from "@illusive/prefs";
import type { ArtistOpts, MusicServiceArtist, NamedUUID } from "@illusive/types";
import { parse_runs } from "@common/utils/parse_util";
import { Constants } from "./constants";
import { GLOBALS } from "./globals";
import { is_empty } from '../../common/utils/util';
import { SQLArtists } from "./sql/sql_artists";
import { reinterpret_cast } from "@common/cast";
import { parse_spotify_artist_album, parse_spotify_artist_appears_on, parse_spotify_artist_track, parse_spotify_similar_artist } from './parsers/spotify_parser';

function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
    return Prefs.get_pref('use_cookies_on_artist') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

function default_artist(error?: ResponseError): MusicServiceArtist{
    return {
        ...(error !== undefined ? {error: error} : {}),
        name: "",
        albums: [],
        singles_eps: [],
        playlists: [],
        latest_release: undefined,
        similar_artists: [],
        tracks: [],
        background_artwork_url: undefined,
        profile_artwork_url: undefined
    };
}

export async function youtube_music_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist>{
    const artist_response = await YouTubeMusic.get_artist({cookie_jar: get_cookie_jar('youtube_music_cookie_jar'), proxy: opts?.proxy}, id);
    if("error" in artist_response) return default_artist(artist_response);

    const artist_info: NamedUUID = {name: parse_runs(artist_response.data.header?.musicImmersiveHeaderRenderer?.title?.runs), uri: create_uri("youtubemusic", artist_response.data.artist_id ?? id)};

    const artist_albums_response_promise = YouTubeMusic.get_only_artist_albums({cookie_jar: get_cookie_jar('youtube_music_cookie_jar')}, artist_response.icfg.ytcfg, artist_response.data.artist_id ?? id);
    const artist_tracks_response_promise = YouTubeMusic.get_only_artist_tracks({cookie_jar: get_cookie_jar('youtube_music_cookie_jar')}, artist_response);

    const [artist_albums_response, artist_tracks_response] = await Promise.all([artist_albums_response_promise, artist_tracks_response_promise]);

    const potential_all_albums_singles = "error" in artist_albums_response ? [] : artist_albums_response.data.map(item => parse_youtube_music_artist_album({musicTwoRowItemRenderer: item}, artist_info, "ALBUM"));
    const potential_all_albums = potential_all_albums_singles.filter(item => item.album_type === "ALBUM");
    const potential_all_single_eps = potential_all_albums_singles.filter(item => item.album_type === "SINGLE" || item.album_type === "EP" || item.album_type === "SINGLE/EP");

    const name = parse_runs(artist_response.data.header?.musicImmersiveHeaderRenderer?.title?.runs);
    const background_thumbnail = best_thumbnail(artist_response.data.header?.musicImmersiveHeaderRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url;

    const similar_artists = artist_response.data.shelfs
    .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).toLowerCase().includes("might also like") || parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs).toLowerCase().includes("similar"))
    ?.contents.map(parse_youtube_music_artist_similar_artist) ?? [];

    if(background_thumbnail) {
        SQLArtists.insert_sql_artists({
            artwork_url: background_thumbnail,
            name: name,
            uri: create_uri('youtubemusic', id)
        }).catch(e => e);
    }
    similar_artists.filter(artist => artist.profile_artwork_url && artist.name.uri).forEach(artist => {
        SQLArtists.insert_sql_artists({
            artwork_url: reinterpret_cast<string>(artist.profile_artwork_url),
            name: artist.name.name,
            uri: artist.name.uri!
        }).catch(e => e);
    })


    return {
        name: name,
        albums: potential_all_albums.length === 0 ? artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs) === "Albums")
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info, "ALBUM")) ?? [] : potential_all_albums,
        singles_eps: potential_all_single_eps.length === 0 ? artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).includes("Single"))
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info, "ALBUM")) ?? [] : potential_all_single_eps,
        playlists: artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).toLowerCase().includes("playlists"))
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info, "PLAYLIST")) ?? [],
        latest_release: !("error" in artist_albums_response) && artist_albums_response.data?.[0] !== undefined ? parse_youtube_music_artist_album({musicTwoRowItemRenderer: artist_albums_response.data?.[0]}, artist_info, "PLAYLIST") : undefined,
        similar_artists: similar_artists,
        tracks: !("error" in artist_tracks_response) ? (artist_tracks_response.data.tracks).map(parse_youtube_music_artist_tracks_track).filter(item => item !== undefined) : (artist_response.data?.top_shelf?.contents?.map(parse_youtube_music_artist_track) ?? []),
        background_artwork_url: background_thumbnail,
        profile_artwork_url: undefined
    };
}

export async function apple_music_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist>{
    //TODO proxy: opts?.proxy
    opts;
    
    const artist_response = await AppleMusic.get_artist(id, {cookie_jar: get_cookie_jar('apple_music_cookie_jar')});
    if("error" in artist_response) return default_artist(artist_response);

    const artist_info: NamedUUID = {name: artist_response.data.pageMetrics.pageFields.pageDetails.content, uri: create_uri("applemusic", urlid(artist_response.data.canonicalURL))};
    const latest_release_and_top_songs = artist_response.data.sections.find(section => section.id.includes("latest-release-and-top-songs"));
    const full_albums = artist_response.data.sections.find(section => section.id.includes("full-albums"));
    const singles = artist_response.data.sections.find(section => section.id.includes("singles"));
    const appears_on = artist_response.data.sections.find(section => section.id.includes("appears-on-albums"));
    const similar_artists = artist_response.data.sections.find(section => section.id.includes("similar-artists"));

    const artwork = parse_apple_music_artwork(artist_response.data.sections[0].items[0].artwork?.dictionary.url, artist_response.data.sections[0].items[0].artwork?.dictionary.width);

    if(artwork){
        SQLArtists.insert_sql_artists({
            artwork_url: artwork,
            name: artist_info.name,
            uri: create_uri('applemusic', id)
        }).catch(e => e);
    }

    const parsed_similar_artists = similar_artists?.items.map(parse_apple_music_artist_similar_artist) ?? [];

    parsed_similar_artists.filter(artist => artist.profile_artwork_url && artist.name.uri).forEach(artist => {
        SQLArtists.insert_sql_artists({
            artwork_url: reinterpret_cast<string>(artist.profile_artwork_url),
            name: artist.name.name,
            uri: artist.name.uri!
        }).catch(e => e);
    })

    return {
        name: artist_info.name,
        albums: full_albums?.items.map(item => parse_apple_music_artist_album(item, artist_info, "ALBUM")) ?? [],
        singles_eps: singles?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
        appears_on: appears_on?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
        playlists: [],
        latest_release: parse_apple_music_artist_latest_album(latest_release_and_top_songs?.pinnedLeadingItem?.item, artist_info),
        similar_artists: parsed_similar_artists,
        tracks: latest_release_and_top_songs?.items.map(item => parse_apple_music_artist_track(item, artist_info)) ?? [],
        background_artwork_url: undefined,
        profile_artwork_url: artwork
    };
}

export async function soundcloud_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
    const artist_id = await SoundCloud.permalink_to_artist_id({artist_permalink: id, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: {proxy: opts?.proxy}});
    if("error" in artist_id) return default_artist(artist_id);

    const [artist_tracks_response, artist_albums_response, artist_playlists_response] = await Promise.all([
        SoundCloud.get_artist("TRACKS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 40, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: {proxy: opts?.proxy}, client_id: artist_id.client_id}),
        SoundCloud.get_artist("ALBUMS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: {proxy: opts?.proxy}, client_id: artist_id.client_id}),
        SoundCloud.get_artist("PLAYLISTS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), fetch_opts: {proxy: opts?.proxy}, client_id: artist_id.client_id}),
    ])

    if("error" in artist_tracks_response) return default_artist(artist_tracks_response);
    if("error" in artist_albums_response) return default_artist(artist_albums_response);
    if("error" in artist_playlists_response) return default_artist(artist_playlists_response);

    const tracks = artist_tracks_response.artist_data.collection.map(item => soundcloud_parse_track(item));

    if(artist_id.hydration.data.avatar_url){
        SQLArtists.insert_sql_artists({
            artwork_url: artist_id.hydration.data.avatar_url,
            name: artist_id.hydration.data.username,
            uri: create_uri('soundcloud', id)
        }).catch(e => e);
    }

    return {
        name: artist_id.hydration.data.username,
        albums: artist_albums_response?.artist_data?.collection?.map(soundcloud_parse_playlist) ?? [],
        playlists: artist_playlists_response?.artist_data?.collection?.map(soundcloud_parse_playlist) ?? [],
        latest_release: tracks.length <= 0 ? undefined : soundcloud_parse_track_to_song(tracks[0], artist_tracks_response.artist_data.collection[0]),
        tracks: tracks ?? [],
        singles_eps: [],
        similar_artists: [],
        background_artwork_url: undefined,
        profile_artwork_url: artist_id.hydration.data.avatar_url
    };
}

export async function spotify_get_artist(id: string): Promise<MusicServiceArtist>{
    const artist = await Spotify.get_artist({cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), var: {uri: id, includePrerelease: false}});
    if("error" in artist) return default_artist(artist);
    const union_artist = artist.data.artistUnion;
    const artist_uri: NamedUUID = {name: union_artist.profile.name, uri: create_uri("spotify", id)};
    // TODO 
    const popular_release_albums = union_artist?.discography?.popularReleasesAlbums?.items?.map(item =>  parse_spotify_artist_album(item, artist_uri)) ?? [];
    return {
        name: union_artist.profile.name,
        albums: union_artist.discography.albums.items?.[0]?.releases?.items?.map(item => parse_spotify_artist_album(item, artist_uri)) ?? [],
        playlists: [],
        latest_release: union_artist?.discography?.latest ? parse_spotify_artist_album(union_artist.discography.latest, artist_uri) : undefined,
        tracks: union_artist.discography?.topTracks?.items.map(parse_spotify_artist_track) ?? [],
        singles_eps: union_artist.discography.singles.items?.map(item => item.releases.items)?.flat()?.map(item => parse_spotify_artist_album(item, artist_uri)) ?? [],
        appears_on: union_artist.relatedContent.appearsOn.items?.map(item => item.releases.items)?.flat()?.map(parse_spotify_artist_appears_on),
        similar_artists: union_artist.relatedContent.relatedArtists.items.map(parse_spotify_similar_artist),
        background_artwork_url: best_thumbnail(union_artist.visuals?.avatarImage?.sources)?.url,
        profile_artwork_url: best_thumbnail(union_artist.visuals?.headerImage?.sources)?.url
    };
}

export async function illusi_get_artist(id: string): Promise<MusicServiceArtist>{
    if(id === Constants.import_uri_id){
        return {
            name: Constants.import_uri_id,
            tracks: GLOBALS.global_var.sql_tracks.filter(track => !is_empty(track.imported_id)).slice().reverse(),
            albums: [],
            singles_eps: [],
            playlists: [],
            similar_artists: [],
            profile_artwork_url: Constants.sudo_profile_picture_index
        }
    }
    if(id === Constants.local_illusi_uri_id){
        return {
            name: Constants.local_illusi_uri_id,
            tracks: [],
            albums: [],
            singles_eps: [],
            playlists: [],
            similar_artists: [],
            profile_artwork_url: Constants.sudo_profile_picture_index
        }
    }
    return default_artist();
}