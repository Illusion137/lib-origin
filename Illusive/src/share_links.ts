import type { ResponseError } from '@common/types';
import { reinterpret_cast } from '@common/cast';
import { generror } from '@common/utils/error_util';
import { is_empty } from '@common/utils/util';
import { Constants } from '@illusive/constants';
import { decode_track, encode_track } from '@illusive/discord';
import { create_uri } from '@illusive/illusive_utils';
import type { IllusiveURI, Track } from '@illusive/types';

export namespace ShareLinks {
	const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const ALBUM_ID = /^album\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	const SERVICE_URI = /^[a-z]+:.+/i;
	const OPEN_SOURCE_FIELDS = ['youtube_id', 'soundcloud_permalink', 'bandlab_id', 'audiomack_id'] as const;

	export type Incoming = { type: 'track'; track: Track } | { type: 'illusi_track'; illusi_id: string } | { type: 'playlist'; uri: IllusiveURI };

	function link(path: string): string {
		return `${Constants.illusi_url_base}/${path}`;
	}

	function has_open_source(track: Track): boolean {
		return OPEN_SOURCE_FIELDS.some(field => !is_empty(track[field]));
	}

	export function can_share_track(track: Track): boolean {
		return has_open_source(track) || !is_empty(track.illusi_id) || is_empty(track.imported_id);
	}

	export function track(track: Track): string | null {
		if (!can_share_track(track)) return null;
		if (!has_open_source(track) && !is_empty(track.illusi_id)) return link(`track/${track.illusi_id}`);
		return link(`track/${encode_track(track)}`);
	}

	export function playlist(uuid: string): string {
		return link(`playlist/${uuid}`);
	}

	/** A link to a playlist or album opened by its uri: an Illusi one by its id, any other by the uri itself */
	export function uri(uri: string): string {
		return link(`playlist/${uri.startsWith('illusi:') ? uri.slice('illusi:'.length) : encodeURIComponent(uri)}`);
	}

	/** The track on the service it came from */
	export function source(track: Track): string | null {
		if (!is_empty(track.youtube_id)) return `https://www.youtube.com/watch?v=${track.youtube_id}`;
		if (!is_empty(track.soundcloud_permalink)) {
			const permalink = track.soundcloud_permalink!;
			return /^https?:\/\//i.test(permalink) ? permalink : `https://soundcloud.com/${permalink.replace(/^\/+/, '')}`;
		}
		if (!is_empty(track.spotify_id)) return `https://open.spotify.com/track/${track.spotify_id!.split(':').at(-1)}`;
		if (!is_empty(track.applemusic_id)) return `https://music.apple.com/us/song/${track.applemusic_id}`;
		if (!is_empty(track.deezer_id)) return `https://www.deezer.com/track/${track.deezer_id}`;
		if (!is_empty(track.tidal_id)) return `https://tidal.com/browse/track/${track.tidal_id}`;
		return null;
	}

	function decoded(text: string): string {
		try {
			return decodeURIComponent(text);
		} catch {
			return text;
		}
	}

	/** What the path of an illusi:// link (`track/...` or `playlist/...`) opens */
	export function parse(path: string): Incoming | ResponseError {
		const [kind, ...rest] = path.replace(/^\/+/, '').split('/');
		// Track payloads from before links were URL safe can hold slashes
		const value = decoded(rest.join('/')).trim();
		if (value === '') return generror('Empty Illusi link', 'LOW', { path });
		if (kind === 'track') {
			if (UUID.test(value)) return { type: 'illusi_track', illusi_id: value.toLowerCase() };
			const track = decode_track(value);
			return 'error' in track ? track : { type: 'track', track };
		}
		if (kind === 'playlist') {
			if (UUID.test(value) || ALBUM_ID.test(value)) return { type: 'playlist', uri: create_uri('illusi', value) };
			if (SERVICE_URI.test(value)) return { type: 'playlist', uri: reinterpret_cast<IllusiveURI>(value) };
		}
		return generror('Unknown Illusi link', 'LOW', { path });
	}
}
