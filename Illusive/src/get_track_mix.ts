import * as Origin from '@origin/index';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import { youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { Prefs } from '@illusive/prefs';
import type { Track } from '@illusive/types';

export async function get_soundcloud_track_mix(track_id: string): Promise<{"tracks": Track[], "error"?: Error}> {
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const mix_response = await Origin.SoundCloud.get_mix({cookie_jar: cookie_jar, track_id: track_id});
    if("error" in mix_response) return {tracks: [], error: mix_response.error};
    return {
        tracks: mix_response.data.collection.map(soundcloud_parse_track)
    }
}

export async function get_youtube_track_mix(video_id: string): Promise<{"tracks": Track[], "error"?: Error}> {
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const mix_response = await Origin.YouTube.get_youtube_mix({cookie_jar: cookie_jar}, video_id);
    if("error" in mix_response) return {tracks: [], error: mix_response.error};
    return {
        tracks: youtube_parse_videos(mix_response.data.videos)
    }
}