import * as Origin from '@origin/index';
import { Prefs } from '@illusive/prefs';
import { ytm_track } from '@illusive/parsers/youtube_music_parser';
import { soundcloud_parse_track } from '@illusive/parsers/soundcloud_parser';
import type { MusicServiceRelated } from '@illusive/types';

export async function youtube_music_get_related(video_id: string): Promise<MusicServiceRelated> {
	const cookie_jar = Prefs.get_pref('youtube_music_cookie_jar');
	const watch_next = await Origin.YouTubeMusic.get_watch_next({ cookie_jar }, video_id);
	if ('error' in watch_next) return { tracks: [], error: watch_next };
	return { tracks: watch_next.data.map(ytm_track) };
}

export async function soundcloud_get_related(track_id: string): Promise<MusicServiceRelated> {
	const cookie_jar = Prefs.get_pref('soundcloud_cookie_jar');
	const opts = { cookie_jar };
	const station = await Origin.SoundCloud.station_from_track({ ...opts, track_id: Number(track_id) });
	if ('error' in station) return { tracks: [], error: station };
	const track_ids = station.tracks.map(t => String(t.id));
	if (track_ids.length === 0) return { tracks: [] };
	const tracks_response = await Origin.SoundCloud.get_tracks({ ...opts, track_ids });
	if ('error' in tracks_response) return { tracks: [] };
	return { tracks: tracks_response.data.map(soundcloud_parse_track) };
}
