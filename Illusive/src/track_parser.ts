import { AmazonSearchTrack } from '../../origin/src/amazon_music/types/SearchResult';
import { AmazonTrack } from '../../origin/src/amazon_music/types/ShowHomeCreateAndBindMethod';
import * as Origin from '../../origin/src/index'
import { Item4 } from '../../origin/src/spotify/types/Album';
import { CollectionItem } from '../../origin/src/spotify/types/Collection';
import { SpotifySearchTrack } from '../../origin/src/spotify/types/SearchResult';
import { ContentItem } from '../../origin/src/spotify/types/UserPlaylist';
import { extract_string_from_pattern, generate_new_uid, is_empty, make_topic, parse_time } from '../../origin/src/utils/util'
import { best_thumbnail, create_uri, spotify_uri_to_uri } from './illusive_utilts';
import { Track } from './types';

export function parse_spotify_playlist_track(track: ContentItem): Track {
    return {
        uid: generate_new_uid(track.itemV2.data.name),
        title: track.itemV2.data.name,
        artists: track.itemV2.data.artists.items.map(artist => {
            return {name: make_topic(artist.profile.name), uri: spotify_uri_to_uri(artist.uri)};
        }),
        plays: parseInt(track.itemV2.data.playcount),
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
            return {name: make_topic(artist.profile.name), uri: spotify_uri_to_uri(artist.uri)};
        }),
        plays: parseInt(track.track.playcount),
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
            return {name: make_topic(artist.profile.name), uri: spotify_uri_to_uri(artist.uri)};
        }),
        album: {name: track.item.data.albumOfTrack.name, uri: spotify_uri_to_uri(track.item.data.albumOfTrack.uri)},
        duration: Math.floor(track.item.data.duration.totalMilliseconds/1000),
        explicit: track.item.data.contentRating.label === "EXPLICIT" ? "EXPLICIT" : "NONE",
        artwork_url: best_thumbnail(track.item.data.albumOfTrack.coverArt.sources)?.url,
        spotify_id: track.item.data.uri
    }
}

export function parse_amazon_music_playlist_track(track: AmazonTrack): Track {
    const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    return {
        uid: generate_new_uid(track.primaryText),
        title: track.primaryText,
        artists: [{name: make_topic(track.secondaryText1), uri: create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)\/.+/) as string)}],
        duration: parse_time(track.secondaryText3),
        album: {name: extract_string_from_pattern(track.secondaryText2, album_regex) as string, uri: create_uri("amazonmusic", extract_string_from_pattern(track.secondaryText1Link.deeplink, /\/.+?\/(.+)/) as string)},
        explicit: track.secondaryText2.includes("[Explicit]") ? "EXPLICIT" : "NONE",
        amazonmusic_id: Origin.AmazonMusic.get_track_id(track)
    }
}
export function parse_amazon_music_search_track(track: AmazonSearchTrack): Track {
    // const album_regex = /([a-zA-Z?><{}|!@#$%^&*]+\s?[a-zA-Z?><{}|!@#$%^&*])+/;
    const title = typeof track.primaryText === "object" ? track.primaryText.text : track.primaryText;
    return {
        uid: generate_new_uid(title),
        title: title,
        artists: [{name: is_empty(track.secondaryText) ? "" : make_topic(track.secondaryText!), uri: track.secondaryLink?.deeplink === undefined ? null : create_uri("amazonmusic", extract_string_from_pattern(track.secondaryLink?.deeplink ?? "", /\/.+?\/(.+)\/.+/) as string)}],
        duration: NaN,
        explicit: track.tags.includes("E") ? "EXPLICIT" : "NONE",
        amazonmusic_id: Origin.AmazonMusic.get_track_id(track)
    }
}