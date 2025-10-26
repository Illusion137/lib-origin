import type { Playlist, Track, User } from "@origin/soundcloud/types/Search";
import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { ISOString } from "@illusive/types";
import type * as IllusiveTypes from "@illusive/types";
import { remove_prod } from "@common/utils/clean_util";
import { reinterpret_cast } from "@common/cast";

function highest_artwork(artwork_url: string) {
    return artwork_url?.replace("t200x200", "t500x500")?.replace("large", "t500x500");
}

export function soundcloud_parse_track(track: Track): IllusiveTypes.Track {
    return {
        uid: generate_new_uid(track.title),
        title: remove_prod(track.title),
        artists: [{name: track.user.username, uri: create_uri("soundcloud", track.user.permalink)}],
        plays: track.playback_count,
        duration: Math.floor(track.duration / 1000),
        soundcloud_id: track.id,
        soundcloud_permalink: track.permalink_url,
        artwork_url: track.artwork_url ? highest_artwork(track.artwork_url) : highest_artwork(track.user.avatar_url)
    }
}
export function soundcloud_parse_user(user: User) {
    return {
        name: {name: user.username, uri: create_uri("soundcloud", user.permalink_url)},
        profile_artwork_url: user.avatar_url,
        is_official_artist_channel: user.verified
    }
}
export function soundcloud_parse_playlist(playlist: Playlist) {
    return {
        title: {name: playlist.title, uri: create_uri("soundcloud", playlist.permalink_url)},
        artist: Array.isArray(playlist.user) ? playlist.user.map(user => { 
            return {
                name: user.username,
                uri: create_uri("soundcloud", user.permalink_url)
            } 
        }) : [{name: playlist.user.username, uri: create_uri("soundcloud", playlist.user.permalink)}],
        date: playlist.created_at as ISOString,
        artwork_url: playlist.artwork_url ? highest_artwork(playlist.artwork_url) 
            : playlist.tracks?.[0]?.kind === "track" 
                ? highest_artwork(reinterpret_cast<Track>(playlist.tracks?.[0])?.artwork_url)
            : undefined
    }
}

export function soundcloud_parse_track_to_song(track: IllusiveTypes.Track, raw: Track): IllusiveTypes.CompactPlaylist{
    return {
        title: {name: track.title, uri: track.soundcloud_permalink ? create_uri("soundcloud", track.soundcloud_permalink) : null},
        artist: track.artists,
        artwork_url: raw.artwork_url,
        explicit: 'NONE',
        type: "ALBUM",
        date: new Date(raw.release_date).toISOString() as ISOString,
        album_type: "SONG",
        song_track: track
    }
}