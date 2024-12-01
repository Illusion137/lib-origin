import { SearchAlbum, SearchArtist, SearchPlaylist, SearchSong } from "../../../origin/src/apple_music/types/Search";
import { AppleTrack } from "../../../origin/src/apple_music/types/TrackListSection";
import { AppleUserPlaylistTrack } from "../../../origin/src/apple_music/types/UserPlaylist";
import { generate_new_uid, make_topic, urlid } from "../../../origin/src/utils/util";
import { create_uri } from "../illusive_utilts";
import { CompactArtist, CompactPlaylist, ISOString, Track } from "../types";

export function parse_apple_music_playlist_track(track: AppleTrack): Track {
    return {
        uid: generate_new_uid(track.title),
        title: track.title,
        artists: track.subtitleLinks.map(link => {
            return {name: make_topic(link.title), uri: create_uri("applemusic", link.segue.destination.contentDescriptor.identifiers.storeAdamID)};
        }),
        album: track.tertiaryLinks?.[0] !== undefined ? {name: track.tertiaryLinks[0].title, uri: create_uri("applemusic", track.tertiaryLinks[0].segue.destination.contentDescriptor.identifiers.storeAdamID)} : undefined,
        duration: Math.floor(track.duration / 1000),
        explicit: track.showExplicitBadge ? "EXPLICIT" : "NONE",
        applemusic_id: track.id
    }
}
export function parse_apple_music_artwork(url: string, size: number = 200): string|undefined {
    return url?.replace("{w}x{h}bb.{f}", `${size}x${size}bb.webp`);
}
export function parse_apple_music_user_playlist_track(track: AppleUserPlaylistTrack): Track {
    return {
        uid: generate_new_uid(track.attributes.name),
        title: track.attributes.name,
        artists: [{name: make_topic(track.attributes.artistName), uri: null}],
        album: {name: track.attributes.albumName, uri: null},
        duration: Math.floor(track.attributes.durationInMillis / 1000),
        explicit: track.attributes.contentRating !== undefined && track.attributes.contentRating === "explicit" ? "EXPLICIT": "NONE",
        artwork_url: parse_apple_music_artwork(track.attributes.artwork.url),
        applemusic_id: track.id
    };
}

export function parse_apple_music_search_track(track: SearchSong): Track {
    return {
        uid: generate_new_uid(track.attributes.name),
        title: track.attributes.name,
        artists: [{name: make_topic(track.attributes.artistName), uri: null}],
        album: {name: track.attributes.albumName, uri: null},
        duration: Math.floor(track.attributes.durationInMillis / 1000),
        explicit: track.attributes.contentRating !== undefined && track.attributes.contentRating === "explicit" ? "EXPLICIT": "NONE",
        artwork_url: parse_apple_music_artwork(track.attributes.artwork.url),
        applemusic_id: track.id
    };
}
export function parse_apple_music_search_playlist(playlist: SearchPlaylist): CompactPlaylist {
    return {
        title: {name: playlist.attributes.name, uri: create_uri("applemusic", urlid("music.apple.com", playlist.attributes.url))},
        artist: [{name: playlist.attributes.curatorName, uri: create_uri("applemusic", playlist.attributes.playParams.id)}],
        artwork_url: parse_apple_music_artwork(playlist.attributes.artwork.url),
        date: new Date(playlist.attributes.lastModifiedDate).toISOString() as ISOString,
        explicit: "NONE"
    }
}
export function parse_apple_music_search_album(album: SearchAlbum): CompactPlaylist {
    return {
        title: {name: album.attributes.name, uri: create_uri("applemusic", urlid("music.apple.com", album.attributes.url))},
        artist: [{name: album.attributes.artistName, uri: create_uri("applemusic", urlid("music.apple.com", album.attributes.artistUrl))}],
        artwork_url: parse_apple_music_artwork(album.attributes.artwork.url),
        date: new Date(album.attributes.releaseDate).toISOString() as ISOString,
        explicit: album.attributes.contentRating !== undefined && album.attributes.contentRating === "explicit" ? "EXPLICIT": "NONE"
    }
}
export function parse_apple_music_search_artist(artist: SearchArtist): CompactArtist {
    return {
        name: {name: artist.attributes.name, uri: create_uri("applemusic", urlid("music.apple.com", artist.attributes.url))},
        is_official_artist_channel: true,
        profile_artwork_url: parse_apple_music_artwork(artist.attributes.artwork.url)
    }
}