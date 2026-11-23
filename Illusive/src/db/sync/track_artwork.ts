import { catch_log } from '@common/utils/error_util';
import { chunkify } from '@common/utils/util';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import { Illusi } from '@origin/illusi/illusi';
import type { TrackArtworkResult } from '@origin/illusi/types';
import { outbox_table, user_tracks_table, type OutboxRow } from '@illusive/db/schema';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { Outbox } from '../v2/outbox';
import { IDS_PER_QUERY } from '../v2/sqlite';
import { PlaylistArtwork } from './playlist_artwork';

/**
 * Uploads custom thumbnails of imported tracks, so other devices and users see them too. Only imports: other tracks'
 * artwork comes from their service. The server keeps the newest edit; other devices show it through the snapshot's
 * custom_artwork_url until they set a thumbnail of their own.
 */
export namespace TrackArtwork {
	const BATCH = 20;
	const MAX_ATTEMPTS = 5;

	type Outcome = 'done' | 'retry' | 'stop';

	async function waiting_tracks(ex: DrizzleDB, keys: readonly string[]): Promise<Set<string>> {
		const result = new Set<string>();
		for (const chunk of chunkify([...new Set(keys)], IDS_PER_QUERY)) {
			const rows = await ex.select({ key: outbox_table.key }).from(outbox_table).where(and(eq(outbox_table.kind, 'user_track'), inArray(outbox_table.key, chunk)));
			for (const row of rows) result.add(row.key);
		}
		return result;
	}

	function edited_at_of(entry: OutboxRow): Date {
		const at = (entry.payload as { edited_at?: unknown } | null)?.edited_at;
		return new Date(typeof at === 'number' ? at : entry.created_at);
	}

	async function push_one(ex: DrizzleDB, entry: OutboxRow): Promise<Outcome> {
		const [row] = await ex.select().from(user_tracks_table).where(eq(user_tracks_table.uid, entry.key));
		if (row === undefined || row.deleted || !row.track.imported) return 'done';
		// Not on the server yet; the library push gives it an id
		if (row.illusi_id === null) return 'retry';
		const edited_at = edited_at_of(entry);
		let result: TrackArtworkResult | Illusi.IllusiError;
		if (row.thumbnail_uri === '') {
			result = await Illusi.Tracks.remove_artwork(row.illusi_id, edited_at);
		} else {
			const prepared = await PlaylistArtwork.io.prepare_upload(row.thumbnail_uri);
			// An image that can't be read or converted never will be; it stays local only
			if ('error' in prepared) {
				catch_log(prepared.error);
				return 'done';
			}
			result = await Illusi.Tracks.set_artwork(row.illusi_id, prepared.file, edited_at);
			await PlaylistArtwork.io.discard(prepared.path);
		}
		if (Illusi.is_error(result)) {
			const { status } = result;
			if (status === undefined || status >= 500 || status === 401 || status === 429) return 'stop';
			if (status === 404) return 'retry';
			catch_log(result.error);
		}
		return 'done';
	}

	/** Uploads or removes queued artwork, once the track itself has been pushed */
	export async function push(ex: DrizzleDB): Promise<void> {
		const entries = await Outbox.take(ex, BATCH, ['track_artwork']);
		if (entries.length === 0) return;
		const waiting = await waiting_tracks(ex, entries.map(entry => entry.key));
		const done: OutboxRow[] = [];
		const failed: OutboxRow[] = [];
		for (const entry of entries) {
			if (waiting.has(entry.key)) continue;
			const outcome = await push_one(ex, entry);
			if (outcome === 'stop') break;
			if (outcome === 'done' || entry.attempts + 1 >= MAX_ATTEMPTS) done.push(entry);
			else failed.push(entry);
		}
		await Outbox.ack(ex, done);
		if (failed.length > 0) await Outbox.fail(ex, failed.map(entry => entry.id), 'track not on the server yet');
	}

	/** Queues every imported track's custom thumbnail, once per account, including ones set before artwork synced */
	export async function queue_existing(ex: DrizzleDB) {
		const rows = await ex.select({ uid: user_tracks_table.uid, track: user_tracks_table.track, edited_at: user_tracks_table.edited_at })
			.from(user_tracks_table)
			.where(and(eq(user_tracks_table.deleted, false), ne(user_tracks_table.thumbnail_uri, '')));
		for (const row of rows) {
			if (row.track.imported) await Outbox.enqueue(ex, 'track_artwork', [row.uid], { edited_at: row.edited_at });
		}
	}
}
