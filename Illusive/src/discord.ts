import { Discord } from "@origin/discord/discord";
import type { ResponseError } from "@common/types";
import { generate_new_uid, is_empty } from "@common/utils/util";
import { artist_string } from "@illusive/illusive_utils";
import { Illusive } from "@illusive/illusive";
import type { DownloadableMusicService, IllusiveURI, SmallTrackRaw, Track } from "@illusive/types";
import { force_json_parse_array } from "@common/utils/parse_util";
import { compress_string_to_base64, decompress_base64_to_string } from "@common/utils/compress_util";
import { reinterpret_cast } from "@common/cast";

function downloadable_fields(): DownloadableMusicService['id_field'][] {
    const fields: DownloadableMusicService['id_field'][] = [];
    for (const [, service] of Illusive.music_service) {
        if (service.downloadable !== undefined) fields.push(service.downloadable.id_field);
    }
    return fields;
}

export function encode_track(track: Track){
    const downloadable_ids = downloadable_fields().map((field) => track[field] ?? "");
    const payload: SmallTrackRaw = [track.title, artist_string(track), track.duration, downloadable_ids];
    return compress_string_to_base64(JSON.stringify(payload));
}

export function decode_track(encoded_track: string): Track {
    const decoded_track_string = decompress_base64_to_string(encoded_track);
    const [title, artists, duration, downloadable_ids]: SmallTrackRaw = force_json_parse_array(decoded_track_string);
    const track: Track = {
        uid: generate_new_uid(title),
        title: title,
        artists: [{name: artists, uri: null}],
        duration: duration ?? 0,
    };
    downloadable_fields().forEach((field, i) => {
        const id = downloadable_ids[i];
        if (!is_empty(id)) track[field] = id;
    });
    return track;
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