import { sum } from "./illusive_utils";
import type { KeepDeleteTrack } from "./types";

export namespace KeepDelete {
    function keep_delete_track_weight(track: KeepDeleteTrack, sum_plays: number): number{
        const plays = track.meta?.plays ?? 0;
        const percentage_of_plays = plays / sum_plays;
        if(percentage_of_plays >= 1) return -Infinity;
        return 0;
    }
    export function ordered_keep_delete_tracks(all_tracks: KeepDeleteTrack[]): KeepDeleteTrack[]{
        const sum_plays = sum(all_tracks.map(track => track.meta?.plays ?? 0));
        return all_tracks.sort((a, b) => keep_delete_track_weight(b, sum_plays) - keep_delete_track_weight(a, sum_plays))
    }
}