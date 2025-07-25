import * as Origin from '@origin/index';
import { parse_youtube_music_albums } from '@illusive/parsers/youtube_music_parser';
import { Prefs } from "@illusive/prefs";
import type { CompactPlaylist } from "@illusive/types";

export async function youtube_music_get_new_releases(): Promise<CompactPlaylist[]> {
    const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
    const new_releases_albums_response = await Origin.YouTubeMusic.new_releases_albums({cookie_jar: cookie_jar});
    if("error" in new_releases_albums_response) return [];
    return parse_youtube_music_albums(new_releases_albums_response.data, "ALBUM");
}