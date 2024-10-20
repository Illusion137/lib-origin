import * as Origin from '../../../origin/src/index';
import { generate_new_uid } from '../../../origin/src/utils/util';
import { Track } from '../types';

export function musi_parse_track(track: Origin.Musi.MusiTrack): Track {
    return {
        "uid": generate_new_uid(track.video_name),
        "title": track.video_name,
        "artists": [{"name": track.video_creator, "uri": null}],
        "duration": track.video_duration,
        "youtube_id": track.video_id
    }
}