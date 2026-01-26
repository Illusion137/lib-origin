import type * as Origin from '@origin/index';
import type { MusiTrackV2 } from '@origin/musi/types/Explore';
import { generate_new_uid } from '@common/utils/util';
import type { Track } from '@illusive/types';

export function musi_parse_track(track: Origin.Musi.MusiTrack): Track {
    return {
        uid: generate_new_uid(track.video_name),
        title: track.video_name,
        artists: [{name: track.video_creator, uri: null}],
        duration: track.video_duration,
        youtube_id: track.video_id
    }
}
export function musi_parse_track_v2(track: MusiTrackV2): Track {
    return {
        uid: generate_new_uid(track.title),
        title: track.title,
        artists: [{name: track.user, uri: null}],
        duration: track.duration,
        youtube_id: track.id
    }
}

export function musi_parse_explore(explore: Origin.Musi.MusiExplore) {
    return {
        modules: explore.success.modules,
        top_tracks: explore.success.top_tracks.map(musi_parse_track_v2)
    }
}