import { Discord } from "../../origin/src/discord/discord";
import { ResponseError } from "../../origin/src/utils/types";
import { generate_new_uid } from "../../origin/src/utils/util";
import { artist_string } from "./illusive_utilts";
import { SmallTrackRaw, Track } from "./types";

export async function play_track_discord_send(webhook_url: string, track: Track, on_error: (e: ResponseError) => void){
    try {
        const payload: SmallTrackRaw = [track.title, artist_string(track), track.duration, track.youtube_id, track.soundcloud_permalink];
        await Discord.send_message_webhook(webhook_url, `!illusno ${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`);
    }
    catch(e) {
        on_error({error: e as Error});
    }
}
export function play_track_discord_recieve(payload: string): Track{
    const track: SmallTrackRaw = JSON.parse(decodeURIComponent(escape(atob(payload))));
    return {
        uid: generate_new_uid(track[0]),
        title: track[0],
        artists: [{name: track[1], uri: null}],
        duration: track[2],
        youtube_id: track[3],
        soundcloud_permalink: track[4],
    }
}