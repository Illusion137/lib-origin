import type { AlbumItem } from "@origin/apple_music/types/Album";
import type { ArtistSectionItem, PinnedLeadingItemItem } from "@origin/apple_music/types/GetArtist";
import type { SearchAlbum, SearchArtist, SearchPlaylist, SearchSong } from "@origin/apple_music/types/Search";
import type { AppleTrack } from "@origin/apple_music/types/TrackListSection";
import type { AppleUserPlaylistTrack } from "@origin/apple_music/types/UserPlaylist";
import { generate_new_uid, is_empty, safe_date_iso, urlid } from "@common/utils/util";
import { create_uri } from '@illusive/illusive_utils';
import type { CompactArtist, CompactPlaylist, ISOString, NamedUUID, Track } from "@illusive/types";
import { remove } from "@common/utils/clean_util";

export function parse_apple_music_artwork(url: string|undefined, size = 200): string|undefined {
    return url?.replace("{w}x{h}bb.{f}", `${size}x${size}bb.webp`)
    .replace("{w}x{h}{c}.{f}", `${size}x${size}.webp`);
}
export function clean_album_title(title: string){
    return remove(title, " - Album", " - Single", " - EP", "Album", "Single", "EP");
}
export function clean_album_title_seo(title: string){
    return title.split(' - ')[0];
}

export function parse_apple_music_playlist_track(track: AppleTrack): Track {
    return {
        uid: generate_new_uid(track.title),
        title: track.title,
        artists: track.subtitleLinks.map(link => {
            return {name: link.title, uri: create_uri("applemusic", link.segue.destination.contentDescriptor.url)};
        }),
        album: track.tertiaryLinks?.[0] !== undefined ? {name: clean_album_title(track.tertiaryLinks[0].title), uri: create_uri("applemusic", track.tertiaryLinks[0].segue.destination.contentDescriptor.url)} : undefined,
        duration: Math.floor(track.duration / 1000),
        prods: track.composer,
        explicit: track.showExplicitBadge ? "EXPLICIT" : "NONE",
        artwork_url: parse_apple_music_artwork(track.artwork.dictionary.url),
        applemusic_id: track.id
    }
}

export function parse_apple_music_user_playlist_track(track: AppleUserPlaylistTrack): Track {
    return {
        uid: generate_new_uid(track.attributes.name),
        title: track.attributes.name,
        artists: [{name: track.attributes.artistName, uri: null}],
        album: {name: clean_album_title(track.attributes.albumName), uri: null},
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
        artists: [{name: track.attributes.artistName, uri: null}],
        album: {name: clean_album_title(track.attributes.albumName), uri: null},
        duration: Math.floor(track.attributes.durationInMillis / 1000),
        prods: track.attributes?.composerName,
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

export function parse_apple_music_album_track(track: AlbumItem, album: NamedUUID, artist: NamedUUID, artwork_url: string): Track{
    return {
        uid: generate_new_uid(track.title ?? ""),
        title: track.title ?? "",
        artists: [artist],
        album: album,
        duration: Math.floor((track?.duration ?? NaN) / 1000),
        prods: track.composer,
        explicit: track.showExplicitBadge ? "EXPLICIT" : "NONE",
        artwork_url: artwork_url,
        applemusic_id: track.id
    }
}

export function parse_apple_music_artist_track(track: ArtistSectionItem, artist: NamedUUID): Track{
    return {
        uid: generate_new_uid(track.title!),
        title: track.title!,
        artists: [artist],
        album: track.tertiaryLinks?.[0] !== undefined ? {name: clean_album_title(track.tertiaryLinks[0].title), uri: create_uri("applemusic", track.tertiaryLinks[0].segue.destination.contentDescriptor.url)} : undefined,
        duration: track.duration === undefined ? NaN : Math.floor(track.duration / 1000),
        prods: track.composer,
        explicit: track.showExplicitBadge ? "EXPLICIT" : "NONE",
        artwork_url: parse_apple_music_artwork(track.artwork!.dictionary.url),
        applemusic_id: track.id
    }
}

export function parse_apple_music_artist_album(album: ArtistSectionItem, artist: NamedUUID, force_album_type?: CompactPlaylist['album_type']): CompactPlaylist{
    const title = album.titleLinks?.[0].title ?? "";
    const date = new Date(0);
    const year_str = album.subtitleLinks?.[0].title ?? "1980";
    const year = Math.max(parseInt(year_str), 1980);
    if(!isNaN(year))
        date.setFullYear(year);
    return {
        title: {name: clean_album_title(title), uri: album.contentDescriptor?.url === undefined ? null : create_uri("applemusic", urlid(album.contentDescriptor.url))},
        artist: [artist],
        album_type: force_album_type ?? title.includes("Single") ? "SINGLE" : title.includes("EP") ? "EP" : undefined,
        artwork_url: parse_apple_music_artwork(album.artwork?.dictionary.url),
        explicit: album.showExplicitBadge ? "EXPLICIT" : "NONE",
        type: "ALBUM",
        date: safe_date_iso(date) as ISOString
    }
}
export function parse_apple_music_artist_latest_album(album?: PinnedLeadingItemItem, artist?: NamedUUID, force_album_type?: CompactPlaylist['album_type']): CompactPlaylist|undefined{
    if(is_empty(album)) return undefined;
    if(artist === undefined) return undefined;
    const title = album!.title ?? '';
    const date = new Date(album!.headline ?? 0);
    return {
        title: {name: clean_album_title(title), uri: album!.contentDescriptor?.url === undefined ? null : create_uri("applemusic", urlid(album!.contentDescriptor.url))},
        artist: [artist],
        album_type: force_album_type ?? title.includes("Single") ? "SINGLE" : title.includes("EP") ? "EP" : undefined,
        artwork_url: parse_apple_music_artwork(album!.artwork?.dictionary.url),
        explicit: album!.showExplicitBadge ? "EXPLICIT" : "NONE",
        type: "ALBUM",
        date: safe_date_iso(date) as ISOString
    }
}
export function parse_apple_music_artist_similar_artist(artist: ArtistSectionItem): CompactArtist{
    return {
        name: {name: artist.title ?? "", uri: artist.contentDescriptor?.url === undefined ? null : create_uri("applemusic", urlid(artist.contentDescriptor.url))},
        profile_artwork_url: parse_apple_music_artwork(artist.artwork?.dictionary.url),
        is_official_artist_channel: true
    }
}