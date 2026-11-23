import { chunkify } from '@common/utils/util';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { Illusi } from '@origin/illusi/illusi';
import type { ServiceIds } from '@origin/illusi/types';
import { user_tracks_table, type SnapshotNamed, type TrackSnapshot } from '@illusive/db/schema';
import { eq } from 'drizzle-orm';
import { artist_service_ids } from './illusi_entities';

export namespace ArtistLinks {
	const BATCH = 200;

	export type Sent = Record<string, string>;

	export function collect(rows: readonly { track: TrackSnapshot; artists_override: SnapshotNamed[] | null }[]): Map<string, ServiceIds> {
		const links = new Map<string, ServiceIds>();
		for (const row of rows) {
			for (const artist of [...row.track.artists, ...row.artists_override ?? []]) {
				if (artist.illusi_id === undefined) continue;
				const ids = artist_service_ids(artist);
				if (ids === undefined) continue;
				links.set(artist.illusi_id, { ...ids, ...links.get(artist.illusi_id) });
			}
		}
		return links;
	}

	const signature = (ids: ServiceIds) => JSON.stringify(Object.entries(ids).sort(([a], [b]) => a.localeCompare(b)));

	export async function push(ex: DrizzleDB, sent: Sent): Promise<Sent> {
		const rows = await ex.select({ track: user_tracks_table.track, artists_override: user_tracks_table.artists_override })
			.from(user_tracks_table).where(eq(user_tracks_table.deleted, false));
		const pending = [...collect(rows)].filter(([artist_id, ids]) => sent[artist_id] !== signature(ids));
		const next = { ...sent };
		for (const batch of chunkify(pending, BATCH)) {
			const result = await Illusi.Artists.set_service_ids(batch.map(([artist_id, service_ids]) => ({ artist_id, service_ids })));
			if (Illusi.is_error(result)) break;
			for (const [artist_id, ids] of batch) next[artist_id] = signature(ids);
		}
		return next;
	}
}
