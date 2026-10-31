import { days_of, weeks_of } from '@common/utils/util';
import { FutsalShuffle } from './futsal_shuffle';
import { track_time_ms, track_unplayed_since_ms } from './illusive_utils';
import type { Track } from './types';

export namespace KeepDelete {
	const GRACE_PERIOD_DAYS = 30;
	const MIN_STALE_WEEKS = 4;
	const KEEP_ENGAGEMENT = 4;

	export function track_weeks_since_last_played(track: Track, now_ms = Date.now()): number {
		const unplayed_since_ms = track_unplayed_since_ms(track);
		if (unplayed_since_ms === 0) return 0;
		return Math.max(weeks_of({ milliseconds: now_ms - unplayed_since_ms }), 0);
	}
	export function track_value(track: Track, sum_plays: number, track_count: number) {
		if (sum_plays <= 0) return 0;
		return ((track.meta?.plays ?? 0) / sum_plays) * track_count;
	}

	function median(nums: number[]) {
		if (nums.length === 0) return 0;
		const sorted = nums.slice().sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
	}

	function delete_weight(track: Track, median_plays: number, now_ms: number): number {
		const added_ms = track_time_ms(track.meta?.added_date);
		if (added_ms > 0 && days_of({ milliseconds: now_ms - added_ms }) < GRACE_PERIOD_DAYS) return 0;
		const stale_weeks = track_weeks_since_last_played(track, now_ms);
		if (stale_weeks < MIN_STALE_WEEKS) return 0;
		const engagement = (track.meta?.plays ?? 0) / Math.max(median_plays, 1);
		if (engagement >= KEEP_ENGAGEMENT) return 0;
		return stale_weeks / (1 + engagement);
	}

	export function ordered_keep_delete_tracks(all_tracks: Track[]): Track[] {
		const now_ms = Date.now();
		const median_plays = median(all_tracks.map(track => track.meta?.plays ?? 0));
		const weighted_tracks = all_tracks
			.map(track => ({ value: track, weight: delete_weight(track, median_plays, now_ms) }))
			.filter(track => track.weight > 0);
		return FutsalShuffle.shuffle_weighted(weighted_tracks);
	}
}
