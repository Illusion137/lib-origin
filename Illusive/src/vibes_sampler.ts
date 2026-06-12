import type { Track } from "./types";
import { is_empty } from '@common/utils/util';
import { predict } from 'react-native-vibenet';
import { SQLfs } from "./sql/sql_fs";
import { generror_catch } from "@common/utils/error_util";
import { SQLTracks } from "./sql/sql_tracks";
import { Constants } from "./constants";
import { AsyncFNQueue } from "@common/types";
import { Prefs } from "./prefs";

export namespace VibesSampler {
    export async function predict_track(track: Track) {
        if(!Prefs.get_pref('enable_vibes_sampler')) return null;
        if (is_empty(track.media_uri)) return null;
        if (track.acousticness !== undefined && track.acousticness !== 0) return null;
        try {
            const prediction_result = await predict(SQLfs.media_directory(track.media_uri!).replace(/^file:\/\//, ''));
            return prediction_result;
        }
        catch (e) {
            return generror_catch(e, "vibes sampler failed", "MEDIUM");
        }
    }

    export const vibes_sampler_queue = new AsyncFNQueue<Track, Awaited<ReturnType<typeof predict_track>>>(
        Constants.vibes_sampler_queue_max_length,
        o => o.uid,
        predict_track,
        () => { return }
    );

    export async function predict_track_save_result(track: Track) {
        const prediction_result = await vibes_sampler_queue.push_into_queue(track);
        if (prediction_result === null || prediction_result === "EXISTS" || ("error" in prediction_result)) return;
        const new_track: Track = {
            ...track,
            ...prediction_result
        }
        await SQLTracks.update_track(track.uid, new_track);
    }
}