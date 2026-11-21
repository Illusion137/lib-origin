import { Store } from '@illusive/db/store';
import type { PlayRange } from '@illusive/db/repos';
import type { Track } from '@illusive/types';
import { groupby } from '@common/utils/util';

export namespace SQLTrackPlays {
	interface DateRange {
		date_start?: Date;
		date_end?: Date;
	}
	const FAR_DATE = 1e14;
	function play_range(date_range: DateRange): PlayRange {
		return { start: date_range.date_start?.getTime() ?? 0, end: date_range.date_end?.getTime() ?? FAR_DATE };
	}
	export async function insert_track_play(track_uid: Track['uid']) {
		await Store.write(async repos => repos.track_plays.insert(track_uid));
	}
	export async function count_all_track_plays(date_range: DateRange) {
		return groupby(await Store.get().track_plays.between(play_range(date_range)), t => t.track_uid);
	}
	export function count_all_track_plays_sync(date_range: DateRange) {
		return groupby(Store.get().track_plays.between_sync(play_range(date_range)), t => t.track_uid);
	}
	export function all_track_plays_sync(date_range: DateRange) {
		return Store.get().track_plays.between_sync(play_range(date_range));
	}
	export async function count_track_plays(track_uid: Track['uid'], date_range: DateRange) {
		return (await Store.get().track_plays.between(play_range(date_range), track_uid)).length;
	}
	export function count_track_plays_sync(track_uid: Track['uid'], date_range: DateRange) {
		return Store.get().track_plays.between_sync(play_range(date_range), track_uid).length;
	}
	export function get_track_plays_dates_sync(track_uid: Track['uid'], date_range: DateRange) {
		return Store.get().track_plays.between_sync(play_range(date_range), track_uid).map(({ created_at }) => ({ created_at }));
	}
}
