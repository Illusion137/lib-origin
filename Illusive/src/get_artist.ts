import { AppleMusic, SoundCloud, YouTubeMusic } from "../../origin/src";
import { CookieJar } from "../../origin/src/utils/cookie_util";
import { ResponseError } from "../../origin/src/utils/types";
import { make_topic, parse_runs, urlid } from "../../origin/src/utils/util";
import { parse_apple_music_artist_album, parse_apple_music_artist_latest_album, parse_apple_music_artist_similar_artist, parse_apple_music_artist_track, parse_apple_music_artwork } from "./gen/apple_music_parser";
import { soundcloud_parse_playlist, soundcloud_parse_track, soundcloud_parse_track_to_song } from "./gen/soundcloud_parser";
import { parse_youtube_music_artist_album, parse_youtube_music_artist_similar_artist, parse_youtube_music_artist_track, parse_youtube_music_artist_tracks_track } from "./gen/youtube_music_parser";
import { best_thumbnail, create_uri } from "./illusive_utilts";
import { Prefs } from "./prefs";
import { ArtistOpts, MusicServiceArtist, NamedUUID } from "./types";

function get_cookie_jar(pref_opt: Prefs.PrefOptions) {
    return Prefs.get_pref('use_cookies_on_artist') ? Prefs.get_pref(pref_opt) as CookieJar : new CookieJar([]);
}

function default_artist(error?: ResponseError): MusicServiceArtist{
    return {
        ...(error !== undefined ? {error: [error]} : {}),
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

    const potential_all_albums_singles = "error" in artist_albums_response ? [] : artist_albums_response.data.map(item => parse_youtube_music_artist_album({musicTwoRowItemRenderer: item}, artist_info));
    const potential_all_albums = potential_all_albums_singles.filter(item => item.album_type === "ALBUM");
    const potential_all_single_eps = potential_all_albums_singles.filter(item => item.album_type === "SINGLE" || item.album_type === "EP" || item.album_type === "SINGLE/EP");

    return {
        name: parse_runs(artist_response.data.header?.musicImmersiveHeaderRenderer?.title?.runs),
        albums: potential_all_albums.length === 0 ? artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs) === "Albums")
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info)) ?? [] : potential_all_albums,
        singles_eps: potential_all_single_eps.length === 0 ? artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).includes("Single"))
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info)) ?? [] : potential_all_single_eps,
        playlists: artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).toLowerCase().includes("playlists"))
            ?.contents.map(item => parse_youtube_music_artist_album(item, artist_info)) ?? [],
        latest_release: !("error" in artist_albums_response) && artist_albums_response.data?.[0] !== undefined ? parse_youtube_music_artist_album({musicTwoRowItemRenderer: artist_albums_response.data?.[0]}, artist_info) : undefined,
        similar_artists: artist_response.data.shelfs
            .find(shelf => parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer?.title?.runs).toLowerCase().includes("might also like") || parse_runs(shelf.header.musicCarouselShelfBasicHeaderRenderer.title.runs).toLowerCase().includes("similar"))
            ?.contents.map(parse_youtube_music_artist_similar_artist) ?? [],
        tracks: !("error" in artist_tracks_response) ? (artist_tracks_response.data.tracks).map(parse_youtube_music_artist_tracks_track).filter(item => item !== undefined) : (artist_response.data?.top_shelf?.contents?.map(parse_youtube_music_artist_track) ?? []),
        background_artwork_url: best_thumbnail(artist_response.data.header?.musicImmersiveHeaderRenderer.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails)?.url,
        profile_artwork_url: undefined
    };
}

export async function apple_music_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist>{
    const artist_response = await AppleMusic.get_artist(id, {cookie_jar: get_cookie_jar('apple_music_cookie_jar'), proxy: opts?.proxy});
    if("error" in artist_response) return default_artist(artist_response);

    const artist_info: NamedUUID = {name: artist_response.data.pageMetrics.pageFields.pageDetails.content, uri: create_uri("applemusic", urlid(artist_response.data.canonicalURL))};
    const latest_release_and_top_songs = artist_response.data.sections.find(section => section.id.includes("latest-release-and-top-songs"));
    const full_albums = artist_response.data.sections.find(section => section.id.includes("full-albums"));
    const singles = artist_response.data.sections.find(section => section.id.includes("singles"));
    const appears_on = artist_response.data.sections.find(section => section.id.includes("appears-on-albums"));
    const similar_artists = artist_response.data.sections.find(section => section.id.includes("similar-artists"));

    return {
        name: artist_info.name,
        albums: full_albums?.items.map(item => parse_apple_music_artist_album(item, artist_info, "ALBUM")) ?? [],
        singles_eps: singles?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
        appears_on: appears_on?.items.map(item => parse_apple_music_artist_album(item, artist_info)) ?? [],
        playlists: [],
        latest_release: parse_apple_music_artist_latest_album(latest_release_and_top_songs?.pinnedLeadingItem?.item, artist_info),
        similar_artists: similar_artists?.items.map(parse_apple_music_artist_similar_artist) ?? [],
        tracks: latest_release_and_top_songs?.items.map(item => parse_apple_music_artist_track(item, artist_info)) ?? [],
        background_artwork_url: undefined,
        profile_artwork_url: parse_apple_music_artwork(artist_response.data.sections[0].items[0].artwork?.dictionary.url, artist_response.data.sections[0].items[0].artwork?.dictionary.width)
    };
}

export async function soundcloud_get_artist(id: string, opts?: ArtistOpts): Promise<MusicServiceArtist> {
    const artist_id = await SoundCloud.permalink_to_artist_id({artist_permalink: id, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), proxy: opts?.proxy});
    if("error" in artist_id) return default_artist(artist_id);

    const [artist_tracks_response, artist_albums_response, artist_playlists_response] = await Promise.all([
        SoundCloud.get_artist("TRACKS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 40, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), proxy: opts?.proxy, client_id: artist_id.client_id}),
        SoundCloud.get_artist("ALBUMS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), proxy: opts?.proxy, client_id: artist_id.client_id}),
        SoundCloud.get_artist("PLAYLISTS", {artist_id: artist_id.id, user_hyrdration: artist_id.hydration, limit: 8, cookie_jar: get_cookie_jar('soundcloud_cookie_jar'), proxy: opts?.proxy, client_id: artist_id.client_id}),
    ])

    if("error" in artist_tracks_response) return default_artist(artist_tracks_response);
    if("error" in artist_albums_response) return default_artist(artist_albums_response);
    if("error" in artist_playlists_response) return default_artist(artist_playlists_response);

    const tracks = artist_tracks_response.artist_data.collection.map(item => soundcloud_parse_track(item));
    return {
        name: make_topic(artist_id.hydration.data.username),
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