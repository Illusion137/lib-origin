import { catch_log } from '@common/utils/error_util';
import type { CompactArtist, CompactPlaylist, Continuation, Track } from './types';

export interface Continued<T> { items: T[]; continuation?: Continuation<T> }

export const track_key = (track: Track) => track.youtube_id ?? track.uid;
export const compact_playlist_key = (playlist: CompactPlaylist) => playlist.title.uri ?? playlist.title.name;
export const compact_artist_key = (artist: CompactArtist) => artist.name.uri ?? artist.name.name;

export function merge_unique<T>(existing: T[], incoming: T[], key: (item: T) => string): T[] {
	const seen = new Set(existing.map(key));
	return existing.concat(incoming.filter((item) => {
		const item_key = key(item);
		if (seen.has(item_key)) return false;
		seen.add(item_key);
		return true;
	}));
}

export async function continue_once<T>(items: T[], continuation: Continuation<T> | undefined, key: (item: T) => string): Promise<Continued<T>> {
	if (continuation === undefined) return { items };
	try {
		const page = await continuation();
		return { items: merge_unique(items, page.items, key), continuation: page.next };
	} catch (error) {
		catch_log(error);
		return { items };
	}
}

export async function continue_all<T>(items: T[], continuation: Continuation<T> | undefined, key: (item: T) => string): Promise<T[]> {
	let result: Continued<T> = { items, continuation };
	while (result.continuation !== undefined) result = await continue_once(result.items, result.continuation, key);
	return result.items;
}
