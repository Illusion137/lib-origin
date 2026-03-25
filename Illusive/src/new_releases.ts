import * as Origin from '@origin/index';
import { parse_youtube_music_albums } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from "@illusive/prefs";
import type { CompactPlaylist } from "@illusive/types";
import { supabase } from '@illusive/db/supabase';

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({cookie_jar: cookie_jar});
    if("error" in new_releases_albums_response) return [];
    return parse_youtube_music_albums(new_releases_albums_response.data, "ALBUM");
}

export async function soundcloud_get_new_releases(): Promise<CompactPlaylist[]> {
    return [];
}

export async function illusi_get_new_releases(): Promise<CompactPlaylist[]> {
    const { data: { session } } = await supabase.auth.getSession();
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