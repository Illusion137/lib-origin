import { milliseconds_of } from "@common/utils/util";
import { FutsalShuffle } from "./futsal_shuffle";
import { sum } from "./illusive_utils";
import type { Track } from "./types";

export namespace KeepDelete {
    const base_time = 1665298800000; // new Date("October 9, 2022").getTime();
    export function track_days_since_last_played(track: Track): number{
        const time_since_last_played = Date.now() - Math.max(new Date(track.meta?.last_played_date ?? 0).getTime(), base_time);
        const days_since_last_played = time_since_last_played / milliseconds_of({days: 1});
        return days_since_last_played;
    }
    export function track_weeks_since_last_played(track: Track): number{
        const time_since_last_played = Date.now() - Math.max(new Date(track.meta?.last_played_date ?? 0).getTime(), base_time);
        const weeks_since_last_played = time_since_last_played / milliseconds_of({weeks: 1});
        return weeks_since_last_played;
    }
    export function track_percentage_of_plays(track: Track, sum_plays: number){
        const plays = track.meta?.plays ?? 0;
        const percentage_of_plays = plays / sum_plays;
        return percentage_of_plays;
    }
    export function track_value(track: Track, sum_plays: number, track_count: number){
        return track_percentage_of_plays(track, sum_plays) * track_count;
    }

    function keep_delete_track_weight(track: Track, sum_plays: number, track_count: number): number{
        const good_value = 24;
        const plays = track.meta?.plays ?? 0;
        const value = track_value(track, sum_plays, track_count);

        if(track_percentage_of_plays(track, sum_plays) >= 0.085) return -Infinity;
        if(value > good_value) return -Infinity;
        return track_weeks_since_last_played(track) - plays - good_value;
    }
    export function ordered_keep_delete_tracks(all_tracks: Track[]): Track[]{
        const sum_plays = sum(all_tracks.map(track => track.meta?.plays ?? 0));
        const weighted_tracks = all_tracks.map(track => ({value: track, weight: keep_delete_track_weight(track, sum_plays, all_tracks.length)}))
            .filter(track => track.weight !== -Infinity);
        return FutsalShuffle.shuffle_weighted(weighted_tracks);
    }
}