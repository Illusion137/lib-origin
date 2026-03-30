import * as Origin from '@origin/index';
import { parse_youtube_music_albums } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from "@illusive/prefs";
import type { ISOString, CompactPlaylist } from "@illusive/types";
import { supabase } from '@illusive/db/supabase';
import { sc_highest_artwork, soundcloud_parse_track_snippet } from './parsers/soundcloud_parser';
import { reinterpret_cast } from '@common/cast';

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({cookie_jar: cookie_jar});
    if("error" in new_releases_albums_response) return [];
    return parse_youtube_music_albums(new_releases_albums_response.data, "ALBUM");
}

export async function soundcloud_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
    const artists_who_newly_released = await Origin.SoundCloud.artists_shortcuts({cookie_jar});
    if("error" in artists_who_newly_released) return [];
    const new_releases: CompactPlaylist[] = [];
    for(const artist of artists_who_newly_released.data.collection){
        if(artist.has_read) continue;
        const stories_response = await Origin.SoundCloud.artists_shortcuts_stories({cookie_jar, artist_urn: artist.user_urn});
        if("error" in stories_response) continue;
        new_releases.push(
            ...stories_response.data.stories.map<CompactPlaylist>(story => ({
                title: {name: story.snippeted_track.title, uri: null},
                artist: [],
                artwork_thumbnails: [],
                artwork_url: story.snippeted_track.artwork_url ? sc_highest_artwork(story.snippeted_track.artwork_url) : sc_highest_artwork(artist.user.avatar_url),
                date: reinterpret_cast<ISOString>(story.created_at),
                explicit: "NONE",
                album_type: "SONG",
                song_track: soundcloud_parse_track_snippet(story.snippeted_track),
            })
        ))
        await Origin.SoundCloud.artists_shortcuts_stories_read({cookie_jar, artist_urns: [artist.user_urn]});
    }
    return new_releases;
}

export async function illusi_get_new_releases(): Promise<CompactPlaylist[]> {
    const { data: { session } } = await supabase().auth.getSession();
    if (!session) return [];

    const result = await Origin.Illusi.get_new_releases({ jwt: session.access_token });
    if ('error' in result) return [];

    return result.map(r => ({
        title:              r.title,
        artist:             r.artist,
        artwork_url:        r.artwork_url,
        artwork_thumbnails: r.artwork_thumbnails,
        explicit:           r.explicit,
        album_type:         r.album_type,
        type:               r.type,
        date:               r.date,
        song_track:         r.song_track as CompactPlaylist['song_track'],
    }));
}