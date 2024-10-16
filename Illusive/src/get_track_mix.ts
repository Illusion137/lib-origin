import * as Origin from '../../origin/src/index';
import { Prefs } from './prefs';
import { parse_soundcloud_track, parse_youtube_mix_track } from './track_parser';
import { Track } from './types';

export async function get_soundcloud_track_mix(track_id: string): Promise<{"tracks": Track[], "error"?: string}>{
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const mix_response = await Origin.SoundCloud.get_mix({"cookie_jar": cookie_jar, "track_id": track_id});
    if("error" in mix_response) return {"tracks": [], "error": mix_response.error};
    return {
        "tracks": mix_response.collection.map(parse_soundcloud_track)
    }
}

export async function get_youtube_track_mix(video_id: string): Promise<{"tracks": Track[], "error"?: string}>{
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const mix_response = await Origin.YouTube.get_youtube_mix({"cookie_jar": cookie_jar}, video_id);
    if("error" in mix_response && typeof mix_response.error === "string") return {"tracks": [], "error": mix_response.error};
    return {
        "tracks": mix_response.data.tracks.map(parse_youtube_mix_track)
    }
}