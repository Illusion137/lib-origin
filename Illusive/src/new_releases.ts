import * as Origin from '@origin/index';
import { parse_youtube_music_albums } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from "@illusive/prefs";
import type { ISOString, CompactPlaylist } from "@illusive/types";
import { supabase } from '@illusive/db/supabase';
import { sc_highest_artwork, soundcloud_parse_track } from './parsers/soundcloud_parser';
import { reinterpret_cast } from '@common/cast';
import { create_uri } from './illusive_utils';

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({cookie_jar: cookie_jar});
    if("error" in new_releases_albums_response) return [];
    return parse_youtube_music_albums(new_releases_albums_response.data, "ALBUM");
}

export async function soundcloud_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const feed = await Origin.SoundCloud.feed({cookie_jar, feed_types: ["TrackPost", "TrackRepost", "PlaylistPost"], promoted_playlist: false, limit: 30});
    if("error" in feed) return [];

    const new_releases: CompactPlaylist[] = [];
    for(const item of feed.data.collection) {
        if(!("type" in item)) continue;
        if(item.type === "track" || item.type === "track-repost") {
            new_releases.push(
                {
                    title: {name: item.track.title, uri: null},
                    artist: [{name: item.user.username, uri: create_uri("soundcloud", item.user.permalink)}],
                    artwork_thumbnails: [],
                    artwork_url: item.track.artwork_url ? sc_highest_artwork(item.track.artwork_url) : sc_highest_artwork(item.user.avatar_url),
                    date: reinterpret_cast<ISOString>(item.created_at),
                    explicit: "NONE",
                    album_type: "SONG",
                    song_track: soundcloud_parse_track(item.track),
                }
            );
        }
        if(item.type === "playlist") {
            new_releases.push(
                {
                    title: {name: item.playlist.title, uri: create_uri("soundcloud", item.playlist.permalink_url)},
                    artist: [{name: item.user.username, uri: create_uri("soundcloud", item.user.permalink)}],
                    artwork_thumbnails: [],
                    artwork_url: item.playlist.artwork_url ? sc_highest_artwork(item.playlist.artwork_url) : sc_highest_artwork(item.user.avatar_url),
                    date: reinterpret_cast<ISOString>(item.created_at),
                    explicit: "NONE",
                    album_type: item.playlist.set_type === "ep" ? "EP" : item.playlist.set_type === "album" ? "ALBUM" : "PLAYLIST"
                }
            );
        }
    }
    return new_releases;
}

export async function illusi_get_new_releases(): Promise<CompactPlaylist[]> {
    const { data: { session } } = await supabase().auth.getSession();
    if (!session) return [];
    const result = await Origin.Illusi.get_new_releases({ jwt: session.access_token });
    if ('error' in result) return [];
    return result;
}