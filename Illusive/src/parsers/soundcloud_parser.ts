import type { Playlist, Track, User } from "@origin/soundcloud/types/Search";
import { generate_new_uid } from "@common/utils/util";
import { create_uri } from "@illusive/illusive_utils";
import type { ISOString } from "@illusive/types";
import type * as IllusiveTypes from "@illusive/types";
import { remove_prod } from "@common/utils/clean_util";
import { reinterpret_cast } from "@common/cast";
import type { SnippetedTrack } from "@origin/soundcloud/types/ArtistStories";
import type { SystemPlaylist } from "@origin/soundcloud/types/MixedSelection";
import * as Origin from '@origin/index';
import { generror } from "@common/utils/error_util";

export function sc_highest_artwork(artwork_url: string) {
    return artwork_url?.replace("t200x200", "t500x500")?.replace("large", "t500x500");
}

export function soundcloud_parse_track_snippet(track: SnippetedTrack): IllusiveTypes.Track {
    return {
        uid: generate_new_uid(track.title),
        title: remove_prod(track.title),
        artists: [{name: track.user.username, uri: create_uri("soundcloud", track.user.permalink)}],
        duration: Math.floor(track.duration / 1000),
        soundcloud_id: track.id,
        soundcloud_permalink: track.permalink_url,
        artwork_url: track.artwork_url ? sc_highest_artwork(track.artwork_url) : sc_highest_artwork(track.user.avatar_url)
    }
}

export function soundcloud_parse_track(track: Track): IllusiveTypes.Track {
    return {
        uid: generate_new_uid(track.title),
        title: remove_prod(track.title),
        artists: [{name: track.user.username, uri: create_uri("soundcloud", track.user.permalink)}],
        plays: track.playback_count ?? 0,
        duration: Math.floor(track.duration / 1000),
        soundcloud_id: track.id,
        soundcloud_permalink: track.permalink_url,
        artwork_url: track.artwork_url ? sc_highest_artwork(track.artwork_url) : sc_highest_artwork(track.user.avatar_url)
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
        artwork_url: playlist.artwork_url ? sc_highest_artwork(playlist.artwork_url) 
            : playlist.tracks?.[0]?.kind === "track" 
                ? sc_highest_artwork(reinterpret_cast<Track>(playlist.tracks?.[0])?.artwork_url)
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

export async function soundcloud_get_system_playlist_tracks_callback(tracks: SystemPlaylist['tracks']): Promise<IllusiveTypes.Track[]>{
    const soundcloud_tracks = await Origin.SoundCloud.get_tracks({track_ids: tracks.map(t => String(t.id))});
    if("error" in soundcloud_tracks) {
        console.warn(generror("Failed to get SoundCloud Tracks", "MEDIUM", {tracks}));
        return [];
    }
    return soundcloud_tracks.data.map(soundcloud_parse_track);
}

export function soundcloud_parse_system_playlist(playlist: SystemPlaylist): IllusiveTypes.FullPlaylist{
    return {
        title: playlist.short_title ?? playlist.title ?? "",
        description: playlist.short_description ?? playlist.description ?? "",
        artist: [],
        artwork_url: sc_highest_artwork(playlist.calculated_artwork_url ?? playlist.artwork_url),
        tracks_callback: async() => await soundcloud_get_system_playlist_tracks_callback(playlist.tracks)
    }
}