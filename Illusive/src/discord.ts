import { Discord } from '@origin/discord/discord';
import type { ResponseError } from '@common/types';
import { generate_new_uid, is_empty } from '@common/utils/util';
import { artist_string } from '@illusive/illusive_utils';
import { Illusive } from '@illusive/illusive';
import type { DownloadableMusicServiceTrackField, IllusiveURI, ISOString, SmallTrackIds, SmallTrackRaw, Track } from '@illusive/types';
import { compress_object, decompress_object } from '@common/utils/compress_util';
import { reinterpret_cast } from '@common/cast';

const LEGACY_DOWNLOADABLE_FIELDS: DownloadableMusicServiceTrackField[] = ['youtube_id', 'soundcloud_permalink', 'bandlab_id', 'audiomack_id'];

function downloadable_fields(): DownloadableMusicServiceTrackField[] {
	const fields: DownloadableMusicServiceTrackField[] = [];
	for (const [, service] of Illusive.music_service) {
		if (service.downloadable !== undefined) fields.push(service.downloadable.id_field);
	}
	return fields;
}

export function encode_track(track: Track) {
	const downloadable_ids: SmallTrackIds = {};
	for (const field of downloadable_fields()) {
		const id = track[field];
		if (!is_empty(id)) downloadable_ids[field] = id;
	}
	const payload: SmallTrackRaw = [track.title, artist_string(track), track.duration, downloadable_ids];
	const enddur = track.meta?.enddur;
	if (enddur !== undefined && Number.isFinite(enddur)) payload.push(enddur);
	return compress_object(payload);
}

export function decode_track(encoded_track: string): Track | ResponseError {
	const decompressed = decompress_object<SmallTrackRaw>(encoded_track);
	if ('error' in decompressed) return decompressed;
	const [title, artist, duration, downloadable_ids, enddur] = decompressed;
	const track: Track = {
		uid: generate_new_uid(title),
		title: title,
		artists: [{ name: artist, uri: null }],
		duration: duration ?? 0
	};
	const ids: SmallTrackIds = Array.isArray(downloadable_ids)
		? Object.fromEntries(LEGACY_DOWNLOADABLE_FIELDS.map((field, i) => [field, downloadable_ids[i]]))
		: downloadable_ids ?? {};
	for (const field of downloadable_fields()) {
		const id = ids[field];
		if (!is_empty(id)) track[field] = id;
	}
	if (typeof enddur === 'number' && Number.isFinite(enddur)) {
		const epoch = new Date(0).toISOString() as ISOString;
		track.meta = { plays: 0, added_date: epoch, last_played_date: epoch, enddur };
	}
	return track;
}

export async function play_track_discord_send(webhook_url: string, track: Track, on_error: (e: ResponseError) => void) {
	try {
		await Discord.send_message_webhook(webhook_url, `!illusno ${encode_track(track)}`);
	} catch (e) {
		on_error({ error: e as Error });
	}
}
export function play_track_discord_recieve(payload: string): Track | ResponseError {
	return decode_track(payload);
}

export function encode_playlist(playlist_uri: IllusiveURI) {
	const payload: string = playlist_uri;
	return btoa(encodeURI(encodeURIComponent(JSON.stringify(payload))));
}

export function decode_playlist(encoded_playlist: string): IllusiveURI {
	const decoded_playlist_uri_string = decodeURIComponent(decodeURI(atob(encoded_playlist)));
	const playlist_uri: IllusiveURI = reinterpret_cast<IllusiveURI>(decoded_playlist_uri_string);
	return playlist_uri;
}

export type DiscordPlaylistMode = 'order' | 'shuffle';
export async function play_playlist_discord_send(webhook_url: string, playlist_uri: IllusiveURI, mode: DiscordPlaylistMode, on_error: (e: ResponseError) => void) {
	try {
		await Discord.send_message_webhook(webhook_url, `!illusplus ${encode_playlist(playlist_uri)} ${mode}`);
	} catch (e) {
		on_error({ error: e as Error });
	}
}
export function play_playliist_discord_recieve(payload: string): IllusiveURI {
	return decode_playlist(payload);
}
