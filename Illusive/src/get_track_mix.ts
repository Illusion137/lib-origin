import * as Origin from '@origin/index';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import { youtube_parse_videos } from '@illusive/parsers/youtube_parser';
import { Prefs } from '@illusive/prefs';
import type { TrackMix } from '@illusive/types';
import { ytm_track } from './parsers/youtube_music_parser';

export async function get_soundcloud_track_mix(track_id: string): Promise<TrackMix> {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const mix_response = await Origin.SoundCloud.get_mix({ cookie_jar: cookie_jar, track_id: track_id });
	if ('error' in mix_response) return { tracks: [], error: mix_response.error };
	return {
		tracks: mix_response.data.collection.map(soundcloud_parse_track)
	};
}

export async function get_youtube_music_track_mix(video_id: string): Promise<TrackMix> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const watch_next = await Origin.YouTubeMusic.get_watch_next({ cookie_jar }, video_id);
	if ('error' in watch_next) return { tracks: [], error: watch_next.error };
	return { tracks: watch_next.data.map(ytm_track) };
}

export async function get_youtube_track_mix(video_id: string): Promise<TrackMix> {
	const yt_music_mix = await get_youtube_music_track_mix(video_id);
	if (!('error' in yt_music_mix) && yt_music_mix.tracks.length > 0) return yt_music_mix;
	const cookie_jar = Prefs.get_pref('youtube_cookie_jar');
	const mix_response = await Origin.YouTube.get_youtube_mix({ cookie_jar: cookie_jar }, video_id);
	if ('error' in mix_response) return { tracks: [], error: mix_response.error };
	return {
		tracks: youtube_parse_videos(mix_response.data)
	};
}
