import { Discord } from "@origin/discord/discord";
import type { ResponseError } from "@common/types";
import { generate_new_uid } from "@common/utils/util";
import { artist_string } from "@illusive/illusive_utils";
import type { IllusiveURI, SmallTrackRaw, Track } from "@illusive/types";
import { force_json_parse_array } from "@common/utils/parse_util";
import { reinterpret_cast } from "@common/cast";

// TODO make typesafe way to include ALL Downloadable IDs
export function encode_track(track: Track){
    const payload: SmallTrackRaw = [track.title, artist_string(track), track.duration, track.youtube_id, track.soundcloud_permalink, track.bandlab_id, track.audiomack_id];
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
        bandlab_id: track[5],
        audiomack_id: track[6]
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

export function encode_playlist(playlist_uri: IllusiveURI){
    const payload: string = playlist_uri;
    return btoa(encodeURI(encodeURIComponent(JSON.stringify(payload))));
}

export function decode_playlist(encoded_playlist: string): IllusiveURI {
    const decoded_playlist_uri_string = decodeURIComponent(decodeURI(atob(encoded_playlist)));
    const playlist_uri: IllusiveURI = reinterpret_cast<IllusiveURI>(decoded_playlist_uri_string);
    return playlist_uri;
}

export type DiscordPlaylistMode = "order"|"shuffle";
export async function play_playlist_discord_send(webhook_url: string, playlist_uri: IllusiveURI, mode: DiscordPlaylistMode, on_error: (e: ResponseError) => void){
    try {
        await Discord.send_message_webhook(webhook_url, `!illusplus ${encode_playlist(playlist_uri)} ${mode}`);
    }
    catch(e) {
        on_error({error: e as Error});
    }
}
export function play_playliist_discord_recieve(payload: string): IllusiveURI{
    return decode_playlist(payload);
}