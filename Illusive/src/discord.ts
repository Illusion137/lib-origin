import { Discord } from "@origin/discord/discord";
import type { ResponseError } from "@common/types";
import { generate_new_uid } from "@common/utils/util";
import { artist_string } from "@illusive/illusive_utils";
import type { SmallTrackRaw, Track } from "@illusive/types";
import { force_json_parse_array } from "@common/utils/parse_util";

export function encode_track(track: Track){
    const payload: SmallTrackRaw = [track.title, artist_string(track), track.duration, track.youtube_id, track.soundcloud_permalink];
    return btoa(encodeURI(encodeURIComponent(JSON.stringify(payload))));
}

export function decode_track(encoded_track: string): Track {
    const decoded_track_string = decodeURIComponent(decodeURI(atob(encoded_track)));
    const track: SmallTrackRaw = force_json_parse_array(decoded_track_string);
    return {
        uid: generate_new_uid(track[0]),
        title: track[0],
        artists: [{name: track[1], uri: null}],
        duration: track[2] ?? 0,
        youtube_id: track[3],
        soundcloud_permalink: track[4],
    }
}

export async function play_track_discord_send(webhook_url: string, track: Track, on_error: (e: ResponseError) => void){
    try {
        await Discord.send_message_webhook(webhook_url, `!illusno ${encode_track(track)}`);
    }
    catch(e) {
        on_error({error: e as Error});
    }
}
export function play_track_discord_recieve(payload: string): Track{
    return decode_track(payload);
}