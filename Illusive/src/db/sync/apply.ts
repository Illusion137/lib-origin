import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { Redirect, SyncRows } from '@origin/illusi/types';
import {
	outbox_table, playlist_inherited_playlists_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table, recently_played_table,
	sync_state_table, track_plays_table, user_tracks_table, type OutboxKind, type SnapshotNamed, type TrackSnapshot, type UserTrackRow
} from '@illusive/db/schema';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { IDS_PER_QUERY } from '../v2/sqlite';
import { chunkify } from '@common/utils/util';
import { playlist_track_key } from '../v2/keys';
import { TrackAnalysis } from '@illusive/track_analysis';
import type { TrackProducer } from '@illusive/types';
import { album_ref, artist_ref, empty_snapshot, itunes_explicit } from '../v2/track_codec';
import { read_user_tracks, uids_by_illusi_id } from '../v2/tracks';
import { PlaylistArtwork } from './playlist_artwork';

const time = (iso: string | null | undefined): number | null => (iso === null || iso === undefined ? null : new Date(iso).getTime());

async function pending(ex: DrizzleDB, kind: OutboxKind, keys: readonly string[]): Promise<Set<string>> {
	const result = new Set<string>();
	for (const chunk of chunkify([...new Set(keys)], IDS_PER_QUERY)) {
		const rows = await ex.select({ key: outbox_table.key }).from(outbox_table).where(and(eq(outbox_table.kind, kind), inArray(outbox_table.key, chunk)));
		for (const row of rows) result.add(row.key);
	}
	return result;
}

/** Local edits not pushed yet win over older server rows (row-level last-write-wins, like the server) */
function local_wins(local_edited_at: number | undefined, server_edited_at: number | null, is_pending: boolean): boolean {
	return is_pending && local_edited_at !== undefined && (server_edited_at === null || local_edited_at > server_edited_at);
}

const ids_sql = (ids: readonly string[]) => sql.join(ids.map(id => sql`${id}`), sql`, `);

/** uids of the tracks whose snapshot credits one of these artists, or is on one of these albums */
async function uids_with(ex: DrizzleDB, kind: 'artists' | 'albums', illusi_ids: readonly string[]): Promise<string[]> {
	const result = new Set<string>();
	for (const chunk of chunkify([...new Set(illusi_ids)], IDS_PER_QUERY)) {
		const rows = kind === 'artists'
			? await ex.all<{ uid: string }>(sql`SELECT DISTINCT ${user_tracks_table.uid} AS uid FROM ${user_tracks_table}, json_each(${user_tracks_table.track}, '$.artists') AS je
				WHERE json_extract(je.value, '$.illusi_id') IN (${ids_sql(chunk)})`)
			: await ex.all<{ uid: string }>(sql`SELECT ${user_tracks_table.uid} AS uid FROM ${user_tracks_table}
				WHERE json_extract(${user_tracks_table.track}, '$.album.illusi_id') IN (${ids_sql(chunk)})`);
		for (const row of rows) result.add(row.uid);
	}
	return [...result];
}

/** How other snapshots name these artists or albums */
async function known_entries(ex: DrizzleDB, kind: 'artists' | 'albums', illusi_ids: readonly string[]): Promise<Map<string, SnapshotNamed>> {
	const result = new Map<string, SnapshotNamed>();
	for (const chunk of chunkify([...new Set(illusi_ids)], IDS_PER_QUERY)) {
		const rows = kind === 'artists'
			? await ex.all<{ entry: string }>(sql`SELECT je.value AS entry FROM ${user_tracks_table}, json_each(${user_tracks_table.track}, '$.artists') AS je
				WHERE json_extract(je.value, '$.illusi_id') IN (${ids_sql(chunk)}) AND json_extract(je.value, '$.name') != ''`)
			: await ex.all<{ entry: string }>(sql`SELECT json_extract(${user_tracks_table.track}, '$.album') AS entry FROM ${user_tracks_table}
				WHERE json_extract(${user_tracks_table.track}, '$.album.illusi_id') IN (${ids_sql(chunk)}) AND json_extract(${user_tracks_table.track}, '$.album.name') != ''`);
		for (const row of rows) {
			const entry = JSON.parse(row.entry) as SnapshotNamed;
			if (entry.illusi_id !== undefined && !result.has(entry.illusi_id)) result.set(entry.illusi_id, entry);
		}
	}
	return result;
}

/** Snapshots loaded once, changed in memory, and written back together */
class Snapshots {
	private readonly rows = new Map<string, TrackSnapshot>();
	private readonly dirty = new Set<string>();
	constructor(private readonly ex: DrizzleDB) {}

	async load(uids: readonly string[]) {
		const missing = uids.filter(uid => !this.rows.has(uid));
		for (const [uid, row] of await read_user_tracks(this.ex, missing)) this.rows.set(uid, row.track);
	}

	get(uid: string): TrackSnapshot | undefined {
		return this.rows.get(uid);
	}

	set(uid: string, snapshot: TrackSnapshot) {
		this.rows.set(uid, snapshot);
		this.dirty.add(uid);
	}

	/** An entry for an artist or album, named as this batch's snapshots name it */
	find(kind: 'artists' | 'albums', illusi_id: string): SnapshotNamed | undefined {
		for (const snapshot of this.rows.values()) {
			const entry = kind === 'artists' ? snapshot.artists.find(a => a.illusi_id === illusi_id) : snapshot.album?.illusi_id === illusi_id ? snapshot.album : undefined;
			if (entry !== undefined && entry.name !== '') return entry;
		}
		return undefined;
	}

	async flush(now: number) {
		for (const uid of this.dirty) await this.ex.update(user_tracks_table).set({ track: this.rows.get(uid)!, modified_at: now }).where(eq(user_tracks_table.uid, uid));
		this.dirty.clear();
	}
}

function is_empty(value: unknown): boolean {
	if (value === null || value === undefined || value === '' || value === 0 || value === false) return true;
	if (Array.isArray(value)) return value.length === 0;
	return typeof value === 'object' && Object.keys(value).length === 0;
}

/** `to`'s snapshot, with whatever it lacks taken from `from` */
function fill_snapshot(to: TrackSnapshot, from: TrackSnapshot): TrackSnapshot {
	const result = { ...to } as Record<string, unknown>;
	for (const [key, value] of Object.entries(from)) if (is_empty(result[key]) && !is_empty(value)) result[key] = value;
	const merged = result as unknown as TrackSnapshot;
	merged.service_ids = { ...from.service_ids, ...to.service_ids };
	merged.thumbnails = [...to.thumbnails, ...from.thumbnails.filter(t => !to.thumbnails.some(u => u.url === t.url))];
	return merged;
}

/**
 * Two local tracks turned out to be the same server track: everything pointing at `from` moves to `to`, keeping
 * whichever copy has local files.
 */
async function merge_tracks(ex: DrizzleDB, from: string, to: string) {
	if (from === to) return;
	const rows = await read_user_tracks(ex, [from, to]);
	const a = rows.get(from);
	const b = rows.get(to);
	if (a === undefined || b === undefined) return;
	const set: Partial<UserTrackRow> = {
		track: fill_snapshot(b.track, a.track),
		backpacked: a.backpacked || b.backpacked,
		backpacked_at: b.backpacked_at ?? a.backpacked_at,
		plays: Math.max(a.plays, b.plays),
		last_played_at: Math.max(a.last_played_at ?? 0, b.last_played_at ?? 0) || null,
		created_at: Math.min(a.created_at, b.created_at)
	};
	for (const column of ['media_uri', 'thumbnail_uri', 'lyrics_uri', 'synced_lyrics_uri'] as const) if (b[column] === '' && a[column] !== '') set[column] = a[column];
	// The library copy's own settings win over a row that's only here for a playlist or play
	if (b.deleted && !a.deleted) Object.assign(set, { title: a.title, downloaded_at: a.downloaded_at, start_at: a.start_at, end_at: a.end_at, deleted: false, edited_at: a.edited_at });
	await ex.update(user_tracks_table).set(set).where(eq(user_tracks_table.uid, to));

	const moved = await ex.select().from(playlist_tracks_table).where(eq(playlist_tracks_table.track_uid, from));
	for (const row of moved) {
		const [existing] = await ex.select().from(playlist_tracks_table).where(and(eq(playlist_tracks_table.playlist_uuid, row.playlist_uuid), eq(playlist_tracks_table.track_uid, to)));
		if (existing === undefined) await ex.update(playlist_tracks_table).set({ track_uid: to }).where(and(eq(playlist_tracks_table.playlist_uuid, row.playlist_uuid), eq(playlist_tracks_table.track_uid, from)));
		else {
			if (existing.deleted && !row.deleted) await ex.update(playlist_tracks_table).set({ deleted: false, position: Math.min(existing.position, row.position) }).where(and(eq(playlist_tracks_table.playlist_uuid, row.playlist_uuid), eq(playlist_tracks_table.track_uid, to)));
			await ex.delete(playlist_tracks_table).where(and(eq(playlist_tracks_table.playlist_uuid, row.playlist_uuid), eq(playlist_tracks_table.track_uid, from)));
		}
	}
	await ex.update(track_plays_table).set({ track_uid: to }).where(eq(track_plays_table.track_uid, from));
	await ex.delete(recently_played_table).where(eq(recently_played_table.uid, from));
	// Queued changes follow the track, or they'd be dropped as rows that no longer exist
	const rekeys: [OutboxKind, string, string][] = [['user_track', from, to], ['unavailable', from, to]];
	for (const row of moved) rekeys.push(['playlist_track', playlist_track_key(row.playlist_uuid, from), playlist_track_key(row.playlist_uuid, to)]);
	for (const [kind, old_key, new_key] of rekeys) {
		const [queued] = await ex.select({ id: outbox_table.id }).from(outbox_table).where(and(eq(outbox_table.kind, kind), eq(outbox_table.key, new_key)));
		if (queued === undefined) await ex.update(outbox_table).set({ key: new_key }).where(and(eq(outbox_table.kind, kind), eq(outbox_table.key, old_key)));
		else await ex.delete(outbox_table).where(and(eq(outbox_table.kind, kind), eq(outbox_table.key, old_key)));
	}
	await ex.delete(user_tracks_table).where(eq(user_tracks_table.uid, from));
}

/**
 * Gives a local track its illusi_id. If another local row already has it (both turned out to be the same server
 * track), the two merge.
 */
export async function assign_track_id(ex: DrizzleDB, uid: string, illusi_id: string) {
	const holder = (await uids_by_illusi_id(ex, [illusi_id])).get(illusi_id);
	if (holder !== undefined && holder !== uid) await merge_tracks(ex, uid, holder);
	else await ex.update(user_tracks_table).set({ illusi_id }).where(eq(user_tracks_table.uid, uid));
}

/** Gives snapshot artists and albums the illusi_ids the server assigned to their contribution refs */
export async function assign_entity_ids(ex: DrizzleDB, id_map: ReadonlyMap<string, string>) {
	if (id_map.size === 0) return;
	const rows = await ex.all<{ uid: string }>(sql`SELECT ${user_tracks_table.uid} AS uid FROM ${user_tracks_table}
		WHERE (json_extract(${user_tracks_table.track}, '$.album') IS NOT NULL AND json_extract(${user_tracks_table.track}, '$.album.illusi_id') IS NULL)
		OR EXISTS (SELECT 1 FROM json_each(${user_tracks_table.track}, '$.artists') AS je WHERE json_extract(je.value, '$.illusi_id') IS NULL)`);
	const snapshots = new Snapshots(ex);
	await snapshots.load(rows.map(row => row.uid));
	for (const { uid } of rows) {
		const snapshot = snapshots.get(uid)!;
		let changed = false;
		const resolve = (entry: SnapshotNamed, ref: string): SnapshotNamed => {
			const illusi_id = entry.illusi_id === undefined ? id_map.get(ref) : undefined;
			if (illusi_id === undefined) return entry;
			changed = true;
			return { ...entry, illusi_id };
		};
		const album = snapshot.album === null ? null : resolve(snapshot.album, album_ref(snapshot.album, snapshot.artists[0]));
		const artists = snapshot.artists.map(artist => resolve(artist, artist_ref(artist)));
		if (changed) snapshots.set(uid, { ...snapshot, artists, album });
	}
	await snapshots.flush(Date.now());
}

/** Points snapshot entries for an artist or album at its new id */
async function redirect_entries(ex: DrizzleDB, old_id: string, new_id: string) {
	const snapshots = new Snapshots(ex);
	const uids = [...await uids_with(ex, 'artists', [old_id]), ...await uids_with(ex, 'albums', [old_id])];
	await snapshots.load(uids);
	for (const uid of new Set(uids)) {
		const snapshot = snapshots.get(uid)!;
		const swap = (entry: SnapshotNamed): SnapshotNamed => (entry.illusi_id === old_id ? { ...entry, illusi_id: new_id } : entry);
		const seen = new Set<string>();
		const artists = snapshot.artists.map(swap).filter(artist => artist.illusi_id === undefined || (!seen.has(artist.illusi_id) && !!seen.add(artist.illusi_id)));
		snapshots.set(uid, { ...snapshot, artists, album: snapshot.album === null ? null : swap(snapshot.album) });
	}
	await snapshots.flush(Date.now());
}

export async function apply_redirects(ex: DrizzleDB, redirects: readonly Redirect[]) {
	for (const { old_id, new_id } of redirects) {
		const uid = (await uids_by_illusi_id(ex, [old_id])).get(old_id);
		if (uid !== undefined) await assign_track_id(ex, uid, new_id);
		await redirect_entries(ex, old_id, new_id);
	}
}

/**
 * Local uid for each server track, creating a bare row (keyed by the illusi_id) if there is none. Bare rows aren't
 * in the library; they hold the snapshot a playlist or play needs.
 */
async function ensure_rows(ex: DrizzleDB, illusi_ids: readonly string[]): Promise<Map<string, string>> {
	const uids = await uids_by_illusi_id(ex, illusi_ids);
	const now = Date.now();
	for (const illusi_id of new Set(illusi_ids)) {
		if (uids.has(illusi_id)) continue;
		// Plays can arrive before their track; a new row starts with the ones already here
		const plays = sql<number>`(SELECT count(*) FROM ${track_plays_table} WHERE ${track_plays_table.track_uid} = ${illusi_id})`;
		const last_played_at = sql<number | null>`(SELECT max(${track_plays_table.created_at}) FROM ${track_plays_table} WHERE ${track_plays_table.track_uid} = ${illusi_id})`;
		await ex.insert(user_tracks_table)
			.values({ uid: illusi_id, illusi_id, track: empty_snapshot(), deleted: true, edited_at: 0, plays, last_played_at, created_at: now, modified_at: now })
			.onConflictDoNothing();
		uids.set(illusi_id, illusi_id);
	}
	return uids;
}

export interface ApplyResult {
	/** Library, playlist or play rows changed, so the in-memory library should reload */
	library_changed: boolean;
	username?: string;
}

async function apply_catalog(ex: DrizzleDB, rows: Partial<SyncRows>, now: number): Promise<boolean> {
	const snapshots = new Snapshots(ex);
	const page_artists = new Map((rows.artists ?? []).map(artist => [artist.id, artist.name]));
	const page_albums = new Map((rows.albums ?? []).map(album => [album.id, album.name]));
	let changed = false;

	const track_ids = [
		...(rows.tracks ?? []).map(t => t.id), ...(rows.tracks_artists ?? []).map(r => r.track_id)
	];
	const keys = await ensure_rows(ex, track_ids);
	await snapshots.load([...keys.values()]);
	const lookups = {
		artists: await known_entries(ex, 'artists', (rows.tracks_artists ?? []).map(r => r.artist_id)),
		albums: await known_entries(ex, 'albums', (rows.tracks ?? []).flatMap(t => (t.album_id === null ? [] : [t.album_id])))
	};
	const entry_for = (kind: 'artists' | 'albums', illusi_id: string, existing: SnapshotNamed | undefined): SnapshotNamed => {
		const known = existing ?? snapshots.find(kind, illusi_id) ?? lookups[kind].get(illusi_id);
		const name = (kind === 'artists' ? page_artists : page_albums).get(illusi_id) ?? known?.name ?? '';
		return { ...known, name, illusi_id };
	};

	for (const track of rows.tracks ?? []) {
		const uid = keys.get(track.id)!;
		const snapshot = snapshots.get(uid) ?? empty_snapshot();
		let album: SnapshotNamed | null = null;
		if (track.album_id !== null) {
			// An album this device named without an id is the one the server matched it to
			const existing = snapshot.album !== null && (snapshot.album.illusi_id === track.album_id || snapshot.album.illusi_id === undefined) ? snapshot.album : undefined;
			album = entry_for('albums', track.album_id, existing);
		}
		snapshots.set(uid, { ...snapshot, title: track.title, album, duration_ms: track.duration_ms, explicit: track.explicit, imported: track.imported });
		await ex.update(user_tracks_table).set({ backpacked: track.backpacked, backpacked_at: time(track.backpacked_at), modified_at: now }).where(eq(user_tracks_table.uid, uid));
		changed = true;
	}

	if (rows.tracks_artists?.length) {
		const by_track = new Map<string, string[]>();
		for (const row of [...rows.tracks_artists].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
			const uid = keys.get(row.track_id)!;
			const ids = by_track.get(uid) ?? [];
			if (!ids.includes(row.artist_id)) ids.push(row.artist_id);
			by_track.set(uid, ids);
		}
		// Pages carry each track's full credit list
		for (const [uid, artist_ids] of by_track) {
			const snapshot = snapshots.get(uid)!;
			const artists = artist_ids.map(id => entry_for('artists', id, snapshot.artists.find(a => a.illusi_id === id)));
			snapshots.set(uid, { ...snapshot, artists });
		}
	}

	// The rest only fills in tracks this device already holds
	const known_ids = [
		...(rows.service_ids ?? []).map(r => r.illusi_id), ...(rows.thumbnails ?? []).flatMap(r => (r.id === null ? [] : [r.id])), ...(rows.sample_data ?? []).map(r => r.id),
		...(rows.itunes ?? []).flatMap(r => (r.entity_type === 'track' ? [r.id] : [])), ...(rows.tracks_producers ?? []).map(r => r.track_id)
	];
	const known = await uids_by_illusi_id(ex, known_ids);
	await snapshots.load([...known.values()]);
	for (const row of rows.service_ids ?? []) {
		const uid = known.get(row.illusi_id);
		if (uid === undefined) continue;
		const { illusi_id, created_at, modified_at, ...ids } = row;
		illusi_id; created_at; modified_at;
		// A null server column keeps the local value: the server may have rejected or not yet received it
		const set = Object.fromEntries(Object.entries(ids).filter(([, value]) => value !== null)) as Record<string, string | number>;
		const snapshot = snapshots.get(uid)!;
		snapshots.set(uid, { ...snapshot, service_ids: { ...snapshot.service_ids, ...set } });
		changed = true;
	}
	for (const row of rows.thumbnails ?? []) {
		const uid = row.id === null ? undefined : known.get(row.id);
		if (uid === undefined) continue;
		const snapshot = snapshots.get(uid)!;
		const thumbnail = { url: row.url, width: row.width, height: row.height };
		snapshots.set(uid, { ...snapshot, thumbnails: [...snapshot.thumbnails.filter(t => t.url !== row.url), thumbnail] });
	}
	for (const row of rows.sample_data ?? []) {
		const uid = known.get(row.id);
		if (uid === undefined) continue;
		const snapshot = snapshots.get(uid)!;
		const analysis = TrackAnalysis.from_values(row);
		if (analysis !== undefined) snapshots.set(uid, { ...snapshot, analysis: { ...snapshot.analysis, ...analysis } });
	}
	// Bundles carry each track's full producer list
	const producers = new Map<string, TrackProducer[]>();
	for (const row of rows.tracks_producers ?? []) {
		const uid = known.get(row.track_id);
		if (uid === undefined || !row.name) continue;
		producers.set(uid, [...(producers.get(uid) ?? []), { name: row.name, producer_id: row.producer_id }]);
	}
	for (const [uid, prods] of producers) snapshots.set(uid, { ...snapshots.get(uid)!, prods });
	// iTunes fills what the catalog row and the track's own service left out
	for (const row of rows.itunes ?? []) {
		const uid = row.entity_type === 'track' ? known.get(row.id) : undefined;
		if (uid === undefined) continue;
		const snapshot = snapshots.get(uid)!;
		const artwork = row.artwork_url !== null && snapshot.thumbnails.length === 0 ? [{ url: row.artwork_url, width: null, height: null }] : snapshot.thumbnails;
		snapshots.set(uid, {
			...snapshot,
			analysis: snapshot.analysis?.genre || !row.primary_genre_name ? snapshot.analysis : { ...snapshot.analysis, genre: row.primary_genre_name },
			explicit: snapshot.explicit ?? itunes_explicit(row.explicitness),
			thumbnails: artwork
		});
	}
	await snapshots.flush(now);

	// Artist and album rows can come pages after the tracks that credit them
	for (const [kind, names] of [['artists', page_artists], ['albums', page_albums]] as const) {
		const ids = [...names.keys()];
		if (ids.length === 0) continue;
		const uids = await uids_with(ex, kind, ids);
		await snapshots.load(uids);
		for (const uid of uids) {
			const snapshot = snapshots.get(uid)!;
			const rename = (entry: SnapshotNamed): SnapshotNamed => {
				const name = entry.illusi_id === undefined ? undefined : names.get(entry.illusi_id);
				return name === undefined || name === '' || name === entry.name ? entry : { ...entry, name };
			};
			const artists = kind === 'artists' ? snapshot.artists.map(rename) : snapshot.artists;
			const album = kind === 'albums' && snapshot.album !== null ? rename(snapshot.album) : snapshot.album;
			if (artists.some((a, i) => a !== snapshot.artists[i]) || album !== snapshot.album) {
				snapshots.set(uid, { ...snapshot, artists, album });
				changed = true;
			}
		}
	}
	await snapshots.flush(now);
	return changed;
}

export async function apply_rows(ex: DrizzleDB, rows: Partial<SyncRows>): Promise<ApplyResult> {
	const now = Date.now();
	let library_changed = false;
	if (rows.redirects?.length) {
		await apply_redirects(ex, rows.redirects);
		library_changed = true;
	}
	if (rows.user) await ex.insert(sync_state_table).values({ key: 'user', value: rows.user }).onConflictDoUpdate({ target: sync_state_table.key, set: { value: rows.user } });
	if (await apply_catalog(ex, rows, now)) library_changed = true;

	if (rows.user_tracks?.length) {
		const keys = await ensure_rows(ex, rows.user_tracks.map(r => r.track_id));
		const uids = rows.user_tracks.map(r => keys.get(r.track_id)!);
		const waiting = await pending(ex, 'user_track', uids);
		const locals = new Map([...await read_user_tracks(ex, uids)].map(([uid, row]) => [uid, row.edited_at]));
		for (const row of rows.user_tracks) {
			const uid = keys.get(row.track_id)!;
			const edited_at = time(row.edited_at) ?? time(row.modified_at)!;
			if (local_wins(locals.get(uid), edited_at, waiting.has(uid))) continue;
			await ex.update(user_tracks_table).set({
				title: row.title, downloaded_at: time(row.downloaded_at), start_at: row.start_at, end_at: row.end_at, deleted: row.deleted, edited_at,
				created_at: time(row.created_at)!, modified_at: now
			}).where(eq(user_tracks_table.uid, uid));
		}
		library_changed = true;
	}
	if (rows.playlists?.length) {
		const waiting = await pending(ex, 'playlist', rows.playlists.map(p => p.id));
		for (const row of rows.playlists) {
			const [local] = await ex.select({ edited_at: playlists_table.edited_at }).from(playlists_table).where(eq(playlists_table.uuid, row.id));
			const edited_at = time(row.edited_at) ?? time(row.modified_at)!;
			if (local_wins(local?.edited_at, edited_at, waiting.has(row.id))) continue;
			const values = {
				title: row.title, description: row.description, pinned: row.pinned, archived: row.archived, public: row.public, sort_mode: row.sort_mode, deleted: row.deleted, edited_at
			};
			await ex.insert(playlists_table).values({ uuid: row.id, ...values, created_at: time(row.created_at)!, modified_at: now })
				.onConflictDoUpdate({ target: playlists_table.uuid, set: { ...values, modified_at: now } });
		}
		await PlaylistArtwork.apply_server(ex, rows.playlists);
		library_changed = true;
	}
	if (rows.playlist_tracks?.length) {
		const keys = await ensure_rows(ex, rows.playlist_tracks.map(r => r.track_id));
		const waiting = await pending(ex, 'playlist_track', rows.playlist_tracks.map(r => playlist_track_key(r.playlist_id, keys.get(r.track_id)!)));
		for (const row of rows.playlist_tracks) {
			const uid = keys.get(row.track_id)!;
			const [local] = await ex.select({ edited_at: playlist_tracks_table.edited_at }).from(playlist_tracks_table)
				.where(and(eq(playlist_tracks_table.playlist_uuid, row.playlist_id), eq(playlist_tracks_table.track_uid, uid)));
			const edited_at = time(row.edited_at) ?? time(row.modified_at)!;
			if (local_wins(local?.edited_at, edited_at, waiting.has(playlist_track_key(row.playlist_id, uid)))) continue;
			await ex.insert(playlist_tracks_table)
				.values({ playlist_uuid: row.playlist_id, track_uid: uid, position: time(row.created_at)!, deleted: row.deleted, edited_at, created_at: time(row.created_at)!, modified_at: now })
				.onConflictDoUpdate({ target: [playlist_tracks_table.playlist_uuid, playlist_tracks_table.track_uid], set: { deleted: row.deleted, edited_at, modified_at: now } });
		}
		library_changed = true;
	}
	for (const [rows_of, table, kind] of [
		[rows.playlist_inherited_searches, playlist_inherited_searches_table, 'inherited_search'],
		[rows.playlist_inherited_playlists, playlist_inherited_playlists_table, 'inherited_playlist']
	] as const) {
		if (!rows_of?.length) continue;
		for (const row of rows_of) {
			const edited_at = time(row.edited_at) ?? time(row.modified_at)!;
			const value = 'ref_id' in row ? { ref_uuid: row.ref_id } : { query: row.query };
			let [local] = await ex.select().from(table).where(eq(table.id, row.id));
			if (local === undefined) {
				// A row this device created and pushed before learning its server id
				const match = 'ref_id' in row
					? eq(playlist_inherited_playlists_table.ref_uuid, row.ref_id)
					: row.query === null ? isNull(playlist_inherited_searches_table.query) : eq(playlist_inherited_searches_table.query, row.query);
				[local] = await ex.select().from(table).where(and(eq(table.playlist_uuid, row.playlist_id), isNull(table.id), match as never, row.mode === null ? isNull(table.mode) : eq(table.mode, row.mode)));
			}
			if (local !== undefined && local_wins(local.edited_at, edited_at, (await pending(ex, kind, [local.local_id])).has(local.local_id))) continue;
			const values = { id: row.id, playlist_uuid: row.playlist_id, ...value, mode: row.mode, deleted: row.deleted, edited_at, modified_at: now };
			if (local === undefined) await ex.insert(table).values({ local_id: `s_${row.id}`, ...values, position: row.id, created_at: time(row.created_at)! } as never);
			else await ex.update(table).set(values as never).where(eq(table.local_id, local.local_id));
		}
		library_changed = true;
	}
	if (rows.track_plays?.length) {
		const keys = await ensure_rows(ex, rows.track_plays.map(r => r.track_id));
		for (const row of rows.track_plays) {
			const uid = keys.get(row.track_id)!;
			const created_at = time(row.created_at)!;
			const inserted = await ex.insert(track_plays_table).values({ client_id: row.client_id ?? `server:${row.id}`, track_uid: uid, created_at })
				.onConflictDoNothing().returning({ client_id: track_plays_table.client_id });
			// Plays from other devices count toward the local play count; this device's own come back as duplicates
			if (inserted.length === 0) continue;
			await ex.update(user_tracks_table).set({ plays: sql`${user_tracks_table.plays} + 1`, last_played_at: sql`max(coalesce(${user_tracks_table.last_played_at}, 0), ${created_at})` })
				.where(eq(user_tracks_table.uid, uid));
		}
		library_changed = true;
	}
	return { library_changed, username: rows.user?.username };
}
