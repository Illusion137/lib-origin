import * as Origin from '@origin/index';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import { youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { Prefs } from '@illusive/prefs';
import type { TrackMix } from '@illusive/types';
import { get_ytm_ctx, parse_youtube_music_queue_track, watch_next_payload } from './parsers/youtube_music_parser';

export async function get_soundcloud_track_mix(track_id: string): Promise<TrackMix> {
    const cookie_jar = Prefs.get_pref("soundcloud_cookie_jar");
    const mix_response = await Origin.SoundCloud.get_mix({cookie_jar: cookie_jar, track_id: track_id});
    if("error" in mix_response) return {tracks: [], error: mix_response.error};
    return {
        tracks: mix_response.data.collection.map(soundcloud_parse_track)
    }
}

export async function get_youtube_music_track_mix(video_id: string): Promise<TrackMix> {
    const ctx = await get_ytm_ctx();
    if ("error" in ctx) return { tracks: [], error: ctx.error };
    const watch_next = await Origin.YouTubeMusic.get_watch_next(ctx.opts, ctx.ytcfg, watch_next_payload(video_id));
    if ("error" in watch_next) return { tracks: [], error: watch_next.error };
    return { tracks: watch_next.queue.map(parse_youtube_music_queue_track) };
}

export async function get_youtube_track_mix(video_id: string): Promise<TrackMix> {
    const yt_music_mix = await get_youtube_music_track_mix(video_id);
    if(!("error" in yt_music_mix)) return yt_music_mix;
    const cookie_jar = Prefs.get_pref("youtube_cookie_jar");
    const mix_response = await Origin.YouTube.get_youtube_mix({cookie_jar: cookie_jar}, video_id);
    if("error" in mix_response) return {tracks: [], error: mix_response.error};
    return {
        tracks: youtube_parse_videos(mix_response.data.videos)
    }
}