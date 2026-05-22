import type { Track } from "./types";
import { is_empty } from '@common/utils/util';
import { predict } from 'react-native-vibenet';
import { SQLfs } from "./sql/sql_fs";
import { generror_catch } from "@common/utils/error_util";
import { SQLTracks } from "./sql/sql_tracks";

export namespace VibesSampler {
    export async function predict_track(track: Track) {
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
    export async function predict_track_save_result(track: Track) {
        const prediction_result = await predict_track(track);
        if (prediction_result === null || ("error" in prediction_result)) return;
        const new_track: Track = {
            ...track,
            ...prediction_result
        }
        await SQLTracks.update_track(track.uid, new_track);
    }
}