import { days_of, is_empty, milliseconds_of, seconds_of, weeks_of } from '@common/utils/util';
import { Prefs } from './prefs';
import type { Track } from './types';
import { GLOBALS } from './globals';
import { SQLTrackPlays } from './sql/sql_track_plays';
import { track_time_ms, track_unplayed_since_ms } from './illusive_utils';

export namespace FutsalShuffle {
	type BiasKey = keyof typeof Prefs.default_track_shuffle_bias;
	type Bias = typeof Prefs.default_track_shuffle_bias;
	type RawBiasFactors = Record<BiasKey, number>;
	export type BiasInfluence = RawBiasFactors;

	const BIAS_STRENGTH = 3;
	const CACHE_TTL_MS = milliseconds_of({ minutes: 10 });
	const too_long_duration = seconds_of({ minutes: 4 });
	const too_short_duration = seconds_of({ minutes: 1 });

	export const icache = {
		cache_built: false,
		built_at_ms: 0,
		built_from: [] as Track[],
		built_from_length: 0,
		built_bias: '',
		plays_from_albums: new Map<string, number>(),
		plays_from_artist: new Map<string, number>(),
		plays_in_past_month: new Map<string, number>(),

		track_uid_to_log_weight: new Map<string, number>()
	};

	const bias_keys = () => Object.keys(Prefs.default_track_shuffle_bias) as BiasKey[];

	function increment(map: Map<string, number>, key: string, amount: number) {
		map.set(key, (map.get(key) ?? 0) + amount);
	}

	function get_raw_bias_factors(track: Track, now_ms: number): RawBiasFactors {
		const has_duration = !is_empty(track.duration);
		const added_ms = track_time_ms(track.meta?.added_date);
		const unplayed_since_ms = track_unplayed_since_ms(track);
		const flag = (value: boolean) => value ? 1 : 0;
		const analysis = (value?: number) => is_empty(value) ? 0.5 : value!;
		return {
			total_plays: Math.log1p(track.meta?.plays ?? 0),
			too_long_duration: has_duration ? Math.log1p(Math.max(track.duration - too_long_duration, 0)) : 0,
			too_short_duration: has_duration ? Math.log1p(Math.max(too_short_duration - track.duration, 0)) : 0,
			last_played: unplayed_since_ms > 0 ? Math.log1p(Math.max(days_of({ milliseconds: now_ms - unplayed_since_ms }), 0)) : 0,
			recent_add_date: added_ms > 0 ? 1 / (1 + Math.max(weeks_of({ milliseconds: now_ms - added_ms }), 0)) : 0,
			is_downloaded: flag(!is_empty(track.media_uri)),
			has_thumbnail_dl: flag(!is_empty(track.thumbnail_uri)),
			has_lyrics_dl: flag(!is_empty(track.lyrics_uri)),
			has_synced_lyrics_dl: flag(!is_empty(track.lyrics_uri) && (track.sync_status ?? 'NONE') !== 'NONE'),
			plays_from_artist: Math.log1p(icache.plays_from_artist.get(track.artists?.[0]?.uri ?? '') ?? 0),
			plays_from_album: Math.log1p(icache.plays_from_albums.get(track.album?.uri ?? '') ?? 0),
			plays_in_past_month: Math.log1p(icache.plays_in_past_month.get(track.uid) ?? 0),
			explicit: flag(track.explicit === 'EXPLICIT'),
			no_explicit: flag(track.explicit !== 'EXPLICIT'),
			acousticness: analysis(track.analysis?.acousticness),
			danceability: analysis(track.analysis?.danceability),
			energy: analysis(track.analysis?.energy),
			instrumentalness: analysis(track.analysis?.instrumentalness),
			liveness: analysis(track.analysis?.liveness),
			speechiness: analysis(track.analysis?.speechiness),
			valence: analysis(track.analysis?.valence)
		};
	}

	function normalized_factors(tracks: Track[], now_ms: number): Map<string, BiasInfluence> {
		const keys = bias_keys();
		const raw = new Map<string, RawBiasFactors>();
		for (const track of tracks) raw.set(track.uid, get_raw_bias_factors(track, now_ms));

		const mins = {} as RawBiasFactors;
		const maxs = {} as RawBiasFactors;
		for (const key of keys) {
			mins[key] = Infinity;
			maxs[key] = -Infinity;
		}
		for (const factors of raw.values()) {
			for (const key of keys) {
				mins[key] = Math.min(mins[key], factors[key]);
				maxs[key] = Math.max(maxs[key], factors[key]);
			}
		}

		const normalized = new Map<string, BiasInfluence>();
		for (const [uid, factors] of raw) {
			const influence = {} as BiasInfluence;
			for (const key of keys) influence[key] = maxs[key] === mins[key] ? 0 : (factors[key] - mins[key]) / (maxs[key] - mins[key]);
			normalized.set(uid, influence);
		}
		return normalized;
	}

	function get_log_weight(influence: BiasInfluence, bias: Bias): number {
		let log_weight = 0;
		for (const key of bias_keys()) log_weight += (bias[key] ?? 0) * influence[key];
		return BIAS_STRENGTH * log_weight;
	}

	export function build_cache() {
		const tracks = GLOBALS.global_var.sql_tracks;
		const now_ms = Date.now();
		const bias = Prefs.get_pref('track_shuffle_bias');

		icache.plays_from_albums.clear();
		icache.plays_from_artist.clear();
		icache.plays_in_past_month.clear();
		icache.track_uid_to_log_weight.clear();

		for (const track of tracks) {
			const plays = track.meta?.plays ?? 0;
			if (track.album?.uri) increment(icache.plays_from_albums, track.album.uri, plays);
			if (track.artists?.[0]?.uri) increment(icache.plays_from_artist, track.artists[0].uri, plays);
		}

		const grouped_plays = SQLTrackPlays.count_all_track_plays_sync({ date_start: new Date(now_ms - milliseconds_of({ months: 1 })) });
		for (const [track_uid, count_array] of Object.entries(grouped_plays)) {
			icache.plays_in_past_month.set(track_uid, count_array.length);
		}

		for (const [uid, influence] of normalized_factors(tracks, now_ms)) {
			icache.track_uid_to_log_weight.set(uid, get_log_weight(influence, bias));
		}

		icache.cache_built = true;
		icache.built_at_ms = now_ms;
		icache.built_from = tracks;
		icache.built_from_length = tracks.length;
		icache.built_bias = JSON.stringify(bias);
	}

	export function invalidate() {
		icache.cache_built = false;
	}

	function is_stale() {
		const tracks = GLOBALS.global_var.sql_tracks;
		return !icache.cache_built
			|| icache.built_from !== tracks
			|| icache.built_from_length !== tracks.length
			|| Date.now() - icache.built_at_ms > CACHE_TTL_MS
			|| icache.built_bias !== JSON.stringify(Prefs.get_pref('track_shuffle_bias'));
	}

	function ensure_cache() {
		if (is_stale()) build_cache();
	}

	export function get_bias_visualizer_data(tracks: Track[]) {
		ensure_cache();
		const influences = [...normalized_factors(tracks, Date.now()).values()];
		const bias = Prefs.get_pref('track_shuffle_bias');
		const keys = bias_keys();
		const data = new Array<number>(keys.length).fill(0);
		for (const influence of influences) {
			for (let i = 0; i < keys.length; i++) {
				data[i] += influence[keys[i]] * Math.abs(bias[keys[i]] ?? 0);
			}
		}
		const max = Math.max(...data);
		for (let i = 0; i < keys.length; i++) {
			if (isNaN(data[i])) data[i] = 0;
			data[i] = max > 0 ? data[i] / max : 0;
			if ((bias[keys[i]] ?? 0) < 0) data[i] *= -1;
		}
		return data;
	}

	function shuffle_log_weighted<T>(data: { log_weight: number; value: T }[]): T[] {
		const n = data.length;
		const keys = new Float64Array(n);
		for (let i = 0; i < n; i++) {
			keys[i] = data[i].log_weight - Math.log(-Math.log(Math.random()));
		}

		const idx = new Uint32Array(n);
		for (let i = 0; i < n; i++) idx[i] = i;
		idx.sort((a, b) => keys[b] - keys[a]);

		const out = new Array<T>(n);
		for (let i = 0; i < n; i++) {
			out[i] = data[idx[i]].value;
		}
		return out;
	}

	export function shuffle_weighted<T>(data: { weight: number; value: T }[]): T[] {
		return shuffle_log_weighted(data.map(item => ({ log_weight: Math.log(item.weight), value: item.value })));
	}

	function get_log_weighted_tracks(tracks: Track[]) {
		ensure_cache();
		return tracks.map(track => ({ value: track, log_weight: icache.track_uid_to_log_weight.get(track.uid) ?? 0 }));
	}
	export function get_weighted_tracks_descending(tracks: Track[]) {
		return get_log_weighted_tracks(tracks).sort((a, b) => b.log_weight - a.log_weight).map(track => track.value);
	}
	export function get_weighted_tracks_ascending(tracks: Track[]) {
		return get_log_weighted_tracks(tracks).sort((a, b) => a.log_weight - b.log_weight).map(track => track.value);
	}

	export function futsal_shuffle(tracks: Track[]) {
		return shuffle_log_weighted(get_log_weighted_tracks(tracks));
	}
}
