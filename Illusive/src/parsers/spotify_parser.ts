import { reinterpret_cast } from '@common/cast';
import { generate_new_uid } from '@common/utils/util';
import { best_thumbnail, spotify_uri_to_uri } from '@illusive/illusive_utils';
import type { ISOString, CompactPlaylist, Track, NamedUUID, CompactArtist } from '@illusive/types';
import type { Item4 } from '@origin/spotify/types/Album';
import type { SpotifyArtistAlbum, SpotifyArtistApearsOn, SpotifyArtistTrack, SpotifySimliarArtist } from '@origin/spotify/types/Artist';
import type { CollectionItem } from '@origin/spotify/types/Collection';
import type { SpotifyCompactArtist, SpotifySearchAlbum, SpotifySearchTrack } from '@origin/spotify/types/SearchResult';
import type { ContentItem } from '@origin/spotify/types/UserPlaylist';

export function parse_spotify_playlist_track(track: ContentItem): Track {
    return {
        uid: generate_new_uid(track.itemV2.data.name),
        title: track.itemV2.data.name,
        artists: track.itemV2.data.artists.items.map(artist => {
            return {name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)};
        }),
        plays: track.itemV2.data.playcount ? parseInt(track.itemV2.data.playcount) : 0,
        album: {name: track.itemV2.data.albumOfTrack.name, uri: spotify_uri_to_uri(track.itemV2.data.albumOfTrack.uri)},
        duration: Math.floor(track.itemV2.data.trackDuration.totalMilliseconds/1000),
        explicit: track.itemV2.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        spotify_id: track.itemV2.data.uri,
        artwork_url: best_thumbnail(track.itemV2.data.albumOfTrack.coverArt.sources)?.url
    }
}
export function parse_spotify_album_track(track: Item4, album: {name: string, uri: string}, service_thumbnail?: string): Track {
    return {
        uid: generate_new_uid(track.track.name),
        title: track.track.name,
        artists: track.track.artists.items.map(artist => {
            return {name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)};
        }),
        plays: track.track.playcount ? parseInt(track.track.playcount) : 0,
        album: {name: album.name, uri: spotify_uri_to_uri(album.uri)},
        duration: Math.floor(track.track.duration.totalMilliseconds/1000),
        explicit: track.track.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        spotify_id: track.track.uri,
        artwork_url: service_thumbnail
    }
}
export function parse_spotify_collection_track(track: CollectionItem): Track {
    return {
        uid: generate_new_uid(track.track.data.name),
        title: track.track.data.name,
        artists: track.track.data.artists.items.map(artist => {
            return {name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)};
        }),
        album: {name: track.track.data.albumOfTrack.name, uri: spotify_uri_to_uri(track.track.data.albumOfTrack.uri)},
        duration: Math.floor(track.track.data.duration.totalMilliseconds/1000),
        explicit: track.track.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : 'NONE',
        spotify_id: track.track._uri,
        artwork_url: best_thumbnail(track.track.data.albumOfTrack.coverArt.sources)?.url
    }
}
export function parse_spotify_search_track(track: SpotifySearchTrack): Track {
    return {
        uid: generate_new_uid(track.item.data.name),
        title: track.item.data.name,
        artists: track.item.data.artists.items.map(artist => {
            return {name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)};
        }),
        album: {name: track.item.data.albumOfTrack.name, uri: spotify_uri_to_uri(track.item.data.albumOfTrack.uri)},
        duration: Math.floor(track.item.data.duration.totalMilliseconds/1000),
        explicit: track.item.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        artwork_url: best_thumbnail(track.item.data.albumOfTrack.coverArt.sources)?.url,
        spotify_id: track.item.data.uri
    }
}
export function parse_spotify_search_album(album: SpotifySearchAlbum): CompactPlaylist{
    const date = new Date(0);
    date.setFullYear(album.data.date.year);
    return {
        title: {name: album.data.name, uri: spotify_uri_to_uri(album.data.uri)},
        artist: album.data.artists.items.map(artist => ({name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)})),
        artwork_thumbnails: album.data.coverArt.sources,
        album_type: album.data.type === "SINGLE" ? "SINGLE" : album.data.type === "EP" ? "EP" : "ALBUM",
        date: reinterpret_cast<ISOString>(date.toISOString()),
        type: "ALBUM"
    }
}
export function parse_spotify_artist_track(track: SpotifyArtistTrack): Track {
    return {
        uid: generate_new_uid(track.track.name),
        title: track.track.name,
        artists: track.track.artists.items.map(artist => ({name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)})),
        album: {name: track.track.name, uri: spotify_uri_to_uri(track.track.albumOfTrack.uri)},
        duration: Math.floor(track.track.duration.totalMilliseconds / 1000),
        explicit: track.track.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        artwork_url: best_thumbnail(track.track.albumOfTrack.coverArt.sources.map(source => ({...source, height: 0, width: 0})))?.url,
        spotify_id: track.track.uri,
        plays: track.track.playcount ? Number(track.track.playcount) : 0
    }
}
export function parse_spotify_artist_album(album: SpotifyArtistAlbum, artist: NamedUUID): CompactPlaylist{
    const date = new Date(0);
    date.setFullYear(album.date.year);
    return {
        title: {name: album.name, uri: spotify_uri_to_uri(album.uri)},
        artist: [artist],
        artwork_thumbnails: album.coverArt.sources,
        album_type: album.type === "SINGLE" ? "SINGLE" : album.type === "EP" ? "EP" : "ALBUM",
        date: reinterpret_cast<ISOString>(date.toISOString()),
        type: "ALBUM"
    }
}
export function parse_spotify_artist_appears_on(album: SpotifyArtistApearsOn): CompactPlaylist{
    const date = new Date(0);
    date.setFullYear(album.date.year);
    return {
        title: {name: album.name, uri: spotify_uri_to_uri(album.uri)},
        artist: album.artists.items.map(artist => ({name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)})),
        artwork_thumbnails: album.coverArt.sources,
        album_type: album.type === "SINGLE" ? "SINGLE" : album.type === "EP" ? "EP" : "ALBUM",
        date: reinterpret_cast<ISOString>(date.toISOString()),
        type: "ALBUM"
    }
}
export function parse_spotify_similar_artist(artist: SpotifySimliarArtist|SpotifyCompactArtist): CompactArtist{
    return {
        name: {name: artist.profile.name, uri: spotify_uri_to_uri(artist.uri)},
        profile_artwork_url: best_thumbnail(artist.visuals.avatarImage?.sources)?.url,
        is_official_artist_channel: true
    }
}