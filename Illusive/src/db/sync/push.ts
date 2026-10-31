import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type {
	ContributedAlbum, ContributedArtist, ContributedTrack, ContributionGraph, PushChanges, PushResponse, PushTable, ServiceIds
} from '@origin/illusi/types';
import {
	playlist_inherited_playlists_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table, track_plays_table, user_tracks_table,
	type OutboxKind, type OutboxRow, type TrackSnapshot, type UserTrackInsert
} from '@illusive/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { split_playlist_track_key } from '../v2/keys';
import { Outbox } from '../v2/outbox';
import { IDS_PER_QUERY } from '../v2/sqlite';
import { chunkify } from '@common/utils/util';
import { album_ref, artist_ref } from '../v2/track_codec';
import { read_rows } from '../v2/tracks';
import { apply_rows, assign_entity_ids, assign_track_id, type ApplyResult } from './apply';

// Builds a push from the outbox and applies what the server sends back.

/** Entries that failed this many times are dropped so one bad row can't block the outbox */
export const MAX_ATTEMPTS = 5;

const PUSH_KINDS: readonly OutboxKind[] = ['playlist', 'user_track', 'playlist_track', 'inherited_search', 'inherited_playlist', 'track_play', 'recent_search'];
const TABLE_OF: Record<Exclude<OutboxKind, 'unavailable' | 'playlist_artwork' | 'artwork_download'>, PushTable> = {
	user_track: 'user_tracks',
	playlist: 'playlists',
	playlist_track: 'playlist_tracks',
	inherited_search: 'playlist_inherited_searches',
	inherited_playlist: 'playlist_inherited_playlists',
	track_play: 'track_plays',
	recent_search: 'recent_searches'
};
const SERVER_ID_COLUMNS = [
	'youtube_id', 'spotify_id', 'soundcloud_id', 'soundcloud_permalink', 'amazonmusic_id', 'applemusic_id', 'bandlab_id', 'audiomack_id', 'deezer_id',
	'pandora_id', 'tidal_id', 'genius_id', 'isrc'
] as const satisfies readonly (keyof ServiceIds)[];

export interface PushBatch {
	changes: PushChanges;
	/** Outbox entries in each change table, index-aligned with changes[table] (for rejections) */
	sent: Partial<Record<PushTable, OutboxRow[]>>;
	/** Entries with nothing to send (e.g. deleting a track the server never had); acked with the push */
	skipped: OutboxRow[];
}

async function by_keys<T>(keys: readonly string[], query: (chunk: string[]) => Promise<T[]>): Promise<T[]> {
	const result: T[] = [];
	for (const chunk of chunkify([...new Set(keys)], IDS_PER_QUERY)) result.push(...await query(chunk));
	return result;
}

/** The service ids in a snapshot the server accepts */
export function server_service_ids(snapshot: TrackSnapshot): ServiceIds {
	const service_ids: ServiceIds = {};
	for (const column of SERVER_ID_COLUMNS) {
		const value = snapshot.service_ids[column];
		if (value !== null && value !== undefined && value !== '') (service_ids as Record<string, unknown>)[column] = value;
	}
	return service_ids;
}

/** A contribution of tracks the server doesn't know yet, keyed by their local uid as the temp ref */
export function track_graph(rows: readonly Pick<UserTrackInsert, 'uid' | 'title' | 'track'>[]): ContributionGraph {
	const artists = new Map<string, ContributedArtist>();
	const albums = new Map<string, ContributedAlbum>();
	const tracks: ContributedTrack[] = [];
	const tracks_artists: { track_ref: string; artist_ref: string }[] = [];
	const album_tracks: { album_ref: string; track_ref: string; track_number?: number | null }[] = [];
	for (const row of rows) {
		const snapshot = row.track;
		const artist_refs = snapshot.artists.map((artist) => {
			const ref = artist_ref(artist);
			if (artist.illusi_id === undefined && !artists.has(ref)) artists.set(ref, { ref, name: artist.name });
			return ref;
		});
		let ref_of_album: string | null = null;
		if (snapshot.album) {
			ref_of_album = album_ref(snapshot.album, snapshot.artists[0]);
			if (snapshot.album.illusi_id === undefined && !albums.has(ref_of_album)) {
				albums.set(ref_of_album, { ref: ref_of_album, name: snapshot.album.name, artist_ref: artist_refs[0] ?? null });
			}
		}
		const service_ids = server_service_ids(snapshot);
		tracks.push({
			ref: row.uid,
			title: snapshot.title.trim() === '' ? (row.title ?? 'Untitled') : snapshot.title,
			album_ref: ref_of_album,
			duration_ms: snapshot.duration_ms,
			explicit: snapshot.explicit,
			imported: snapshot.imported,
			service_ids,
			thumbnails: snapshot.thumbnails.slice(0, 32)
		});
		for (const ref of new Set(artist_refs)) tracks_artists.push({ track_ref: row.uid, artist_ref: ref });
		if (ref_of_album !== null) album_tracks.push({ album_ref: ref_of_album, track_ref: row.uid });
	}
	return { artists: [...artists.values()], albums: [...albums.values()], tracks, relations: { tracks_artists, album_tracks } };
}

async function entity_graph(ex: DrizzleDB, uids: readonly string[]): Promise<ContributionGraph> {
	return track_graph(await read_rows(ex, uids));
}

/**
 * The next push, or null when the outbox has nothing to push. At most max_entities unknown tracks go in one push;
 * rows waiting on others stay queued for the next one.
 */
export async function build_push(ex: DrizzleDB, opts: { max_rows?: number; max_entities?: number } = {}): Promise<PushBatch | null> {
	const entries = await Outbox.take(ex, opts.max_rows ?? 2000, PUSH_KINDS);
	if (entries.length === 0) return null;
	const max_entities = opts.max_entities ?? 250;
	const of_kind = (kind: OutboxKind) => entries.filter(entry => entry.kind === kind);

	const user_rows = new Map((await by_keys(of_kind('user_track').map(e => e.key), async chunk => ex.select().from(user_tracks_table).where(inArray(user_tracks_table.uid, chunk)))).map(r => [r.uid, r]));
	const playlist_rows = new Map((await by_keys(of_kind('playlist').map(e => e.key), async chunk => ex.select().from(playlists_table).where(inArray(playlists_table.uuid, chunk)))).map(r => [r.uuid, r]));
	const playlist_track_rows = new Map<string, typeof playlist_tracks_table.$inferSelect>();
	for (const entry of of_kind('playlist_track')) {
		const { uuid, track_uid } = split_playlist_track_key(entry.key);
		const [row] = await ex.select().from(playlist_tracks_table).where(and(eq(playlist_tracks_table.playlist_uuid, uuid), eq(playlist_tracks_table.track_uid, track_uid)));
		if (row !== undefined) playlist_track_rows.set(entry.key, row);
	}
	const search_rows = new Map((await by_keys(of_kind('inherited_search').map(e => e.key), async chunk => ex.select().from(playlist_inherited_searches_table).where(inArray(playlist_inherited_searches_table.local_id, chunk)))).map(r => [r.local_id, r]));
	const inherited_rows = new Map((await by_keys(of_kind('inherited_playlist').map(e => e.key), async chunk => ex.select().from(playlist_inherited_playlists_table).where(inArray(playlist_inherited_playlists_table.local_id, chunk)))).map(r => [r.local_id, r]));
	const play_rows = new Map((await by_keys(of_kind('track_play').map(e => e.key), async chunk => ex.select().from(track_plays_table).where(inArray(track_plays_table.client_id, chunk)))).map(r => [r.client_id, r]));

	const referenced = [
		...of_kind('user_track').map(e => e.key),
		...[...playlist_track_rows.values()].map(r => r.track_uid),
		...[...play_rows.values()].map(r => r.track_uid)
	];
	const track_ids = new Map((await by_keys(referenced, async chunk => ex.select({ uid: user_tracks_table.uid, illusi_id: user_tracks_table.illusi_id }).from(user_tracks_table).where(inArray(user_tracks_table.uid, chunk)))).map(r => [r.uid, r.illusi_id]));

	const entity_uids = new Set<string>();
	/** The ref to send for a track, or undefined if it can't go in this push */
	const ref_for = (uid: string, needs_entity: boolean): string | null | undefined => {
		if (!track_ids.has(uid)) return null;
		const illusi_id = track_ids.get(uid);
		if (illusi_id !== null && illusi_id !== undefined) return illusi_id;
		if (!needs_entity) return null;
		if (!entity_uids.has(uid) && entity_uids.size >= max_entities) return undefined;
		entity_uids.add(uid);
		return uid;
	};

	const changes: Required<Omit<PushChanges, 'entities' | 'profile'>> = {
		user_tracks: [], playlists: [], playlist_tracks: [], playlist_inherited_searches: [], playlist_inherited_playlists: [], linked_playlists: [], track_plays: [], recent_searches: []
	};
	const sent: PushBatch['sent'] = {};
	const skipped: OutboxRow[] = [];
	const add = <T extends keyof typeof changes>(table: T, entry: OutboxRow, row: (typeof changes)[T][number]) => {
		(changes[table] as unknown[]).push(row);
		const list: OutboxRow[] = sent[table as PushTable] ?? [];
		list.push(entry);
		sent[table as PushTable] = list;
	};

	for (const entry of entries) {
		switch (entry.kind) {
			case 'playlist': {
				const row = playlist_rows.get(entry.key);
				if (row === undefined) {
					skipped.push(entry);
					break;
				}
				add('playlists', entry, {
					id: row.uuid, title: row.title.trim() === '' ? 'Untitled' : row.title, description: row.description, pinned: row.pinned, archived: row.archived,
					public: row.public, sort_mode: row.sort_mode, deleted: row.deleted, edited_at: row.edited_at
				});
				break;
			}
			case 'user_track': {
				const row = user_rows.get(entry.key);
				const ref = row === undefined ? null : ref_for(entry.key, !row.deleted);
				if (ref === undefined) break;
				if (row === undefined || ref === null) {
					skipped.push(entry);
					break;
				}
				add('user_tracks', entry, {
					track_id: ref, title: row.title, start_at: row.start_at, end_at: row.end_at, deleted: row.deleted, edited_at: row.edited_at,
					// Only a device with the file says it's downloaded; others leave the stored value alone
					...(row.downloaded_at === null ? {} : { downloaded_at: row.downloaded_at })
				});
				break;
			}
			case 'playlist_track': {
				const row = playlist_track_rows.get(entry.key);
				const ref = row === undefined ? null : ref_for(row.track_uid, !row.deleted);
				if (ref === undefined) break;
				if (row === undefined || ref === null) {
					skipped.push(entry);
					break;
				}
				add('playlist_tracks', entry, { playlist_id: row.playlist_uuid, track_id: ref, deleted: row.deleted, edited_at: row.edited_at });
				break;
			}
			case 'inherited_search': {
				const row = search_rows.get(entry.key);
				if (row === undefined || (row.id === null && row.deleted)) {
					skipped.push(entry);
					break;
				}
				add('playlist_inherited_searches', entry, {
					...(row.id === null ? { temp_id: row.local_id } : { id: row.id }), playlist_id: row.playlist_uuid, query: row.query, mode: row.mode, deleted: row.deleted, edited_at: row.edited_at
				});
				break;
			}
			case 'inherited_playlist': {
				const row = inherited_rows.get(entry.key);
				if (row === undefined || (row.id === null && row.deleted)) {
					skipped.push(entry);
					break;
				}
				add('playlist_inherited_playlists', entry, {
					...(row.id === null ? { temp_id: row.local_id } : { id: row.id }), playlist_id: row.playlist_uuid, ref_id: row.ref_uuid, mode: row.mode, deleted: row.deleted, edited_at: row.edited_at
				});
				break;
			}
			case 'track_play': {
				const row = play_rows.get(entry.key);
				const ref = row === undefined ? null : ref_for(row.track_uid, true);
				if (ref === undefined) break;
				if (row === undefined || ref === null) {
					skipped.push(entry);
					break;
				}
				add('track_plays', entry, { client_id: row.client_id, track_id: ref, created_at: row.created_at });
				break;
			}
			case 'recent_search': {
				const text = entry.payload?.text;
				const created_at = entry.payload?.created_at;
				if (typeof text !== 'string' || typeof created_at !== 'number') {
					skipped.push(entry);
					break;
				}
				add('recent_searches', entry, { client_id: entry.key, text, created_at });
				break;
			}
			case 'unavailable':
			case 'playlist_artwork':
			case 'artwork_download':
				break;
		}
	}

	const result: PushChanges = {};
	for (const [table, rows] of Object.entries(changes) as [keyof typeof changes, unknown[]][]) if (rows.length > 0) (result as Record<string, unknown>)[table] = rows;
	if (entity_uids.size > 0) result.entities = await entity_graph(ex, [...entity_uids]);
	if (Object.keys(result).length === 0 && skipped.length === 0) return null;
	return { changes: result, sent, skipped };
}

/** Records server ids, applies the authoritative rows, and clears or retries the pushed outbox entries */
export async function apply_push_result(ex: DrizzleDB, batch: PushBatch, response: PushResponse): Promise<ApplyResult> {
	const entity_ids = new Map<string, string>();
	for (const [ref, illusi_id] of Object.entries(response.id_map)) {
		if (ref.startsWith('ar_') || ref.startsWith('al_')) entity_ids.set(ref, illusi_id);
		else await assign_track_id(ex, ref, illusi_id);
	}
	await assign_entity_ids(ex, entity_ids);
	for (const [table, id_map] of [
		[playlist_inherited_searches_table, response.inherited_id_map.playlist_inherited_searches],
		[playlist_inherited_playlists_table, response.inherited_id_map.playlist_inherited_playlists]
	] as const) {
		for (const [local_id, id] of Object.entries(id_map)) {
			const [taken] = await ex.select({ local_id: table.local_id }).from(table).where(eq(table.id, id));
			// Another device's copy of the same row got here first; keep that one
			if (taken !== undefined && taken.local_id !== local_id) await ex.delete(table).where(eq(table.local_id, local_id));
			else await ex.update(table).set({ id }).where(eq(table.local_id, local_id));
		}
	}
	const applied = await apply_rows(ex, response.rows);

	const rejected = new Set<OutboxRow>();
	for (const rejection of response.rejected) {
		if (rejection.table === 'profile') continue;
		const entry = batch.sent[rejection.table]?.[rejection.index];
		if (entry !== undefined) rejected.add(entry);
	}
	const done: OutboxRow[] = [...batch.skipped];
	const retry: OutboxRow[] = [];
	for (const entries of Object.values(batch.sent)) {
		for (const entry of entries ?? []) {
			if (!rejected.has(entry)) done.push(entry);
			else if (entry.attempts + 1 >= MAX_ATTEMPTS) done.push(entry);
			else retry.push(entry);
		}
	}
	await Outbox.ack(ex, done);
	if (retry.length > 0) await Outbox.fail(ex, retry.map(entry => entry.id), response.rejected.map(r => r.reason).join('; '));
	return applied;
}

/** A push the server refused outright (4xx): count an attempt against every entry, dropping hopeless ones */
export async function fail_push(ex: DrizzleDB, batch: PushBatch, error: string) {
	const entries = Object.values(batch.sent).flatMap(entries => entries ?? []);
	await Outbox.ack(ex, [...batch.skipped, ...entries.filter(entry => entry.attempts + 1 >= MAX_ATTEMPTS)]);
	await Outbox.fail(ex, entries.filter(entry => entry.attempts + 1 < MAX_ATTEMPTS).map(entry => entry.id), error);
}

export { TABLE_OF };
