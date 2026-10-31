import MD5 from 'crypto-js/md5';
import type { NamedUUID, PlaylistsTracks } from '@illusive/types';

function md5(value: string): string {
	return MD5(value).toString();
}

export function deterministic_uuid(seed: string): string {
	const hex = md5(seed);
	const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function named_key(named: NamedUUID): string {
	if (named.uri) return `uri:${named.uri}`;
	if (named.uuid) return `uuid:${named.uuid}`;
	return `name:${named.name.trim().toLowerCase()}`;
}

export function artist_id_for(named: NamedUUID): string {
	return `ar_${md5(named_key(named))}`;
}

export function album_id_for(named: NamedUUID, first_artist?: NamedUUID): string {
	const scope = named.uri || named.uuid || first_artist === undefined ? '' : `|${named_key(first_artist)}`;
	return `al_${md5(named_key(named) + scope)}`;
}

export function play_client_id(legacy_row_id: number, track_uid: string, created_at: number, index: number): string {
	return deterministic_uuid(`play:${legacy_row_id}:${track_uid}:${created_at}:${index}`);
}

export function backfill_play_client_id(track_uid: string, index: number): string {
	return deterministic_uuid(`backfill:${track_uid}:${index}`);
}

export function inherited_local_id(playlist_uuid: string, kind: 'search' | 'playlist', value: string, mode: string): string {
	return `ih_${md5(`${playlist_uuid}:${kind}:${mode}:${value}`)}`;
}

export const playlist_track_key = (uuid: string, track_uid: string) => `${uuid}:${track_uid}`;
export function split_playlist_track_key(key: string): PlaylistsTracks {
	const colon = key.indexOf(':');
	return { uuid: key.slice(0, colon), track_uid: key.slice(colon + 1) };
}
