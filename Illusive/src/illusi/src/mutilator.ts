import { Track } from '../../types';
import * as SQLTracks from './sql/sql_tracks';

export namespace Mutilator {
    export async function trim(track: Track, trimdur: {begdur?: number, enddur?: number}) {
        await SQLTracks.update_track_meta_data(track.uid, {...track.meta!, ...trimdur});
    }
    export async function split(track: Track, split_points: number[]) {
        track;
        split_points;
    }
    // export async function merge(tracks: Track[]){}
    // export async function extend(){}
    // export async function normalize(){}
    // export async function loudness_normalize(){}
}