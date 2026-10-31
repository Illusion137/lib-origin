import type { DrizzleDB, SQLiteRow } from '@native/sqlite/sqlite.base';
import {
	migration_state_table, playlist_inherited_playlists_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table,
	recently_played_table, track_plays_table, user_tracks_table, type UserTrackInsert
} from '@illusive/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { backfill_play_client_id, inherited_local_id, play_client_id } from '../v2/keys';
import { Outbox } from '../v2/outbox';
import { raw, ROWS_PER_STATEMENT, transaction } from '../v2/sqlite';
import { chunkify } from '@common/utils/util';
import { encode_track, unavailable_service } from '../v2/track_codec';
import { read_user_tracks, write_user_tracks } from '../v2/tracks';
import {
	install_change_log, LEGACY_TABLE_ORDER, parse_play_row, parse_playlist_row, parse_playlist_track_row, parse_track_row, read_log, recorded_plays,
	read_rows_after, read_rows_by_key, remove_change_log, table_exists, trim_log, type LegacyTable, type LegacyTrackRow
} from './legacy_1810';

// Copies the 1810 database into v2 while the app keeps using 1810:
export type MigrationPhase = 'NONE' | 'COPYING' | 'DONE';

export interface MigrationReport {
	tracks: number;
	backpack: number;
	playlists: number;
	playlists_tracks: number;
	track_plays: number;
	recently_played_tracks: number;
}

export interface MigrationOptions {
	/** Rows per copied chunk */
	chunk_size?: number;
	/** Called between chunks so the UI stays responsive */
	pause?: () => Promise<void>;
}

const STATE_PHASE = 'phase';
const cursor_key = (table: LegacyTable) => `cursor:${table}`;
const count_key = (table: LegacyTable) => `count:${table}`;

export async function migration_phase(v2: DrizzleDB): Promise<MigrationPhase> {
	const [row] = await v2.select().from(migration_state_table).where(eq(migration_state_table.key, STATE_PHASE));
	return (row?.value ?? 'NONE') as MigrationPhase;
}

/** For installs with nothing to migrate */
export async function mark_migration_done(v2: DrizzleDB) {
	await v2.insert(migration_state_table).values({ key: STATE_PHASE, value: 'DONE' })
		.onConflictDoUpdate({ target: migration_state_table.key, set: { value: 'DONE' } });
}

export class LegacyMigration {
	private readonly legacy;
	private readonly chunk_size: number;
	private readonly pause: () => Promise<void>;
	private tables: LegacyTable[] | null = null;

	constructor(legacy: DrizzleDB, private readonly v2: DrizzleDB, opts: MigrationOptions = {}) {
		this.legacy = raw(legacy);
		this.chunk_size = opts.chunk_size ?? 400;
		this.pause = opts.pause ?? (async () => new Promise(resolve => setTimeout(resolve, 0)));
	}

	private async get_state<T>(key: string, fallback: T): Promise<T> {
		const [row] = await this.v2.select().from(migration_state_table).where(eq(migration_state_table.key, key));
		return (row?.value ?? fallback) as T;
	}

	private async set_state(ex: DrizzleDB, key: string, value: unknown) {
		await ex.insert(migration_state_table).values({ key, value }).onConflictDoUpdate({ target: migration_state_table.key, set: { value } });
	}

	async phase(): Promise<MigrationPhase> {
		return this.get_state<MigrationPhase>(STATE_PHASE, 'NONE');
	}

	async report(): Promise<MigrationReport> {
		const entries = await Promise.all(LEGACY_TABLE_ORDER.map(async table => [table, await this.get_state<number>(count_key(table), 0)] as const));
		return Object.fromEntries(entries) as unknown as MigrationReport;
	}

	private async existing_tables(): Promise<LegacyTable[]> {
		if (this.tables === null) {
			const exists = await Promise.all(LEGACY_TABLE_ORDER.map(async table => table_exists(this.legacy, table)));
			this.tables = LEGACY_TABLE_ORDER.filter((_, i) => exists[i]);
		}
		return this.tables;
	}

	/** Installs the change log (idempotent) and marks the copy as started */
	async prepare() {
		await install_change_log(this.legacy);
		if (await this.phase() === 'NONE') await transaction(this.v2, async tx => this.set_state(tx, STATE_PHASE, 'COPYING'));
	}

	/** Copies the next chunk of the first unfinished table. False once every table is copied. */
	async copy_step(): Promise<boolean> {
		for (const table of await this.existing_tables()) {
			const cursor = await this.get_state<number | 'done'>(cursor_key(table), 0);
			if (cursor === 'done') continue;
			const rows = await read_rows_after(this.legacy, table, cursor, this.chunk_size);
			const copied = await this.get_state<number>(count_key(table), 0);
			await transaction(this.v2, async (tx) => {
				if (rows.length > 0) await this.apply_rows(tx, table, rows);
				await this.set_state(tx, cursor_key(table), rows.length < this.chunk_size ? 'done' : Number(rows[rows.length - 1].id));
				await this.set_state(tx, count_key(table), copied + rows.length);
			});
			return true;
		}
		return false;
	}

	/** Re-copies up to `limit` logged changes. Returns how many log entries it consumed. */
	async catch_up_step(limit = 500): Promise<number> {
		const entries = await read_log(this.legacy, limit);
		if (entries.length === 0) return 0;
		const keys = new Map<LegacyTable, Set<string>>();
		for (const entry of entries) {
			if (!keys.has(entry.tbl)) keys.set(entry.tbl, new Set());
			keys.get(entry.tbl)!.add(entry.key);
		}
		const tables = await this.existing_tables();
		await transaction(this.v2, async (tx) => {
			for (const table of tables) {
				const changed = keys.get(table);
				if (changed !== undefined) await this.recopy(tx, table, [...changed]);
			}
		});
		await trim_log(this.legacy, entries[entries.length - 1].id);
		return entries.length;
	}

	/**
	 * Runs (or resumes) the whole migration. swap is called with writes paused once v2 holds everything; it should
	 * flip the app to v2. Stops early (resumable) when should_stop returns true.
	 */
	async run(opts: { pause_writes: () => Promise<() => void>; swap: () => Promise<void>; should_stop?: () => boolean }): Promise<MigrationPhase> {
		if (await this.phase() === 'DONE') return 'DONE';
		await this.prepare();
		const stopped = () => opts.should_stop?.() ?? false;
		while (await this.copy_step()) {
			if (stopped()) return 'COPYING';
			await this.pause();
		}
		while (await this.catch_up_step() > 0) {
			if (stopped()) return 'COPYING';
			await this.pause();
		}
		const reopen = await opts.pause_writes();
		try {
			while (await this.catch_up_step() > 0);
			await transaction(this.v2, async tx => this.set_state(tx, STATE_PHASE, 'DONE'));
			await opts.swap();
		} finally {
			reopen();
		}
		await remove_change_log(this.legacy).catch(() => undefined);
		return 'DONE';
	}

	private async apply_rows(ex: DrizzleDB, table: LegacyTable, rows: SQLiteRow[]) {
		switch (table) {
			case 'tracks': return this.copy_tracks(ex, rows.map(parse_track_row));
			case 'backpack': return this.copy_backpack(ex, rows.map(parse_track_row));
			case 'playlists': return this.copy_playlists(ex, rows);
			case 'playlists_tracks': return this.copy_playlist_tracks(ex, rows);
			case 'track_plays': return this.copy_plays(ex, rows);
			case 'recently_played_tracks': return this.copy_recently_played(ex, rows.map(parse_track_row));
		}
	}

	private async recopy(ex: DrizzleDB, table: LegacyTable, keys: string[]) {
		for (const chunk of chunkify(keys, 400)) {
			const rows = await read_rows_by_key(this.legacy, table, chunk);
			switch (table) {
				case 'tracks': {
					const parsed = rows.map(parse_track_row);
					await this.copy_tracks(ex, parsed);
					const found = new Set(parsed.map(row => row.track.uid));
					await this.set_library_deleted(ex, chunk.filter(uid => !found.has(uid)));
					break;
				}
				case 'backpack': {
					const parsed = rows.map(parse_track_row).filter(row => !row.deleted);
					await this.copy_backpack(ex, parsed);
					const found = new Set(parsed.map(row => row.track.uid));
					await this.unbackpack(ex, chunk.filter(uid => !found.has(uid)));
					break;
				}
				case 'playlists': {
					await this.copy_playlists(ex, rows);
					const found = new Set(rows.map(row => row.uuid as string));
					const gone = chunk.filter(uuid => !found.has(uuid));
					for (const part of chunkify(gone, 400)) await ex.update(playlists_table).set({ deleted: true }).where(inArray(playlists_table.uuid, part));
					break;
				}
				case 'playlists_tracks': {
					// Start each pair over: its surviving 1810 row decides the result
					for (const key of chunk) {
						const colon = key.indexOf(':');
						await ex.delete(playlist_tracks_table).where(and(eq(playlist_tracks_table.playlist_uuid, key.slice(0, colon)), eq(playlist_tracks_table.track_uid, key.slice(colon + 1))));
					}
					await this.copy_playlist_tracks(ex, rows);
					break;
				}
				case 'track_plays': {
					await this.copy_plays(ex, rows);
					break;
				}
				case 'recently_played_tracks': {
					const parsed = rows.map(parse_track_row);
					await this.copy_recently_played(ex, parsed);
					const found = new Set(parsed.map(row => row.track.uid));
					const gone = chunk.filter(uid => !found.has(uid));
					for (const part of chunkify(gone, 400)) await ex.delete(recently_played_table).where(inArray(recently_played_table.uid, part));
					break;
				}
			}
		}
	}

	/** Re-copied tracks keep what their row already learned */
	private async encode(ex: DrizzleDB, rows: readonly LegacyTrackRow[], deleted: (row: LegacyTrackRow) => boolean): Promise<UserTrackInsert[]> {
		const previous = await read_user_tracks(ex, rows.map(row => row.track.uid));
		return rows.map((row) => {
			const encoded = encode_track(row.track, { now: row.modified_at || Date.now(), title_is_catalog: true, previous: previous.get(row.track.uid) });
			encoded.deleted = deleted(row);
			encoded.edited_at = row.modified_at || encoded.edited_at;
			return encoded;
		});
	}

	private async legacy_backpack_uids(uids: readonly string[]): Promise<Set<string>> {
		if (!(await this.existing_tables()).includes('backpack')) return new Set();
		const rows = await read_rows_by_key(this.legacy, 'backpack', uids);
		return new Set(rows.filter(row => !row.deleted).map(row => row.uid as string));
	}

	private async copy_tracks(ex: DrizzleDB, rows: LegacyTrackRow[]) {
		if (rows.length === 0) return;
		// A backpacked 1810 track is soft-deleted from tracks; it stays in the v2 library, flagged instead
		const backpacked = await this.legacy_backpack_uids(rows.filter(row => row.deleted).map(row => row.track.uid));
		await write_user_tracks(ex, await this.encode(ex, rows, row => row.deleted && !backpacked.has(row.track.uid)));
		await this.backfill_plays(ex, rows);
	}

	/**
	 * meta.plays also counts plays from before track_plays existed. Those become plays at the track's creation, so
	 * the plays the server counts add up to the local total.
	 */
	private async backfill_plays(ex: DrizzleDB, rows: LegacyTrackRow[]) {
		const has_plays_table = (await this.existing_tables()).includes('track_plays');
		const recorded = new Map<string, number>();
		if (has_plays_table) {
			for (const part of chunkify(rows.map(row => row.track.uid), 400)) {
				for (const [uid, plays] of await recorded_plays(this.legacy, part)) recorded.set(uid, plays);
			}
		}
		const plays: { client_id: string; track_uid: string; created_at: number }[] = [];
		const stale: string[] = [];
		for (const row of rows) {
			const uid = row.track.uid;
			const total = Math.max(0, Math.floor(Number(row.track.meta?.plays) || 0));
			const missing = Math.max(0, total - (recorded.get(uid) ?? 0));
			const created_at = row.created_at || new Date(row.track.meta?.added_date ?? 0).getTime() || 0;
			for (let i = 0; i < missing; i++) plays.push({ client_id: backfill_play_client_id(uid, i), track_uid: uid, created_at });
			// A re-copy after plays were recorded during the migration needs fewer backfilled plays
			for (let i = missing; i < total; i++) stale.push(backfill_play_client_id(uid, i));
		}
		for (const part of chunkify(plays, ROWS_PER_STATEMENT * 5)) await ex.insert(track_plays_table).values(part).onConflictDoNothing();
		for (const part of chunkify(stale, 400)) await ex.delete(track_plays_table).where(inArray(track_plays_table.client_id, part));
	}

	private async copy_backpack(ex: DrizzleDB, rows: LegacyTrackRow[]) {
		const live = rows.filter(row => !row.deleted);
		if (live.length === 0) return;
		await write_user_tracks(ex, await this.encode(ex, live, () => false));
		for (const row of live) {
			await ex.update(user_tracks_table).set({ backpacked: true, backpacked_at: sql`coalesce(${user_tracks_table.backpacked_at}, ${row.modified_at || Date.now()})` })
				.where(eq(user_tracks_table.uid, row.track.uid));
			const service = unavailable_service(row.track);
			if (service !== null) await Outbox.enqueue(ex, 'unavailable', [row.track.uid], { service });
		}
	}

	/** Backpack row gone: the track was replaced (back in the library) or thrown away */
	private async unbackpack(ex: DrizzleDB, uids: string[]) {
		if (uids.length === 0) return;
		const live = new Set((await read_rows_by_key(this.legacy, 'tracks', uids)).filter(row => !row.deleted).map(row => row.uid as string));
		for (const uid of uids) {
			await ex.update(user_tracks_table).set({ backpacked: false, backpacked_at: null, deleted: !live.has(uid) }).where(eq(user_tracks_table.uid, uid));
		}
	}

	private async set_library_deleted(ex: DrizzleDB, uids: string[]) {
		for (const part of chunkify(uids, 400)) await ex.update(user_tracks_table).set({ deleted: true }).where(inArray(user_tracks_table.uid, part));
	}

	private async copy_playlists(ex: DrizzleDB, raw_rows: SQLiteRow[]) {
		const rows = raw_rows.map(parse_playlist_row);
		if (rows.length === 0) return;
		for (const part of chunkify(rows, ROWS_PER_STATEMENT)) {
			await ex.insert(playlists_table).values(part.map(row => ({
				uuid: row.uuid,
				title: row.title,
				description: row.description === '' ? null : row.description,
				pinned: row.pinned,
				archived: row.archived,
				public: row.public,
				sort_mode: row.sort,
				thumbnail_uri: row.thumbnail_uri,
				artwork_path: row.artwork_path,
				date: row.date,
				deleted: row.deleted,
				edited_at: row.modified_at,
				created_at: row.created_at,
				modified_at: row.modified_at
			}))).onConflictDoUpdate({
				target: playlists_table.uuid,
				set: Object.fromEntries(['title', 'description', 'pinned', 'archived', 'public', 'sort_mode', 'thumbnail_uri', 'artwork_path', 'date', 'deleted', 'edited_at', 'modified_at']
					.map(column => [column, sql.raw(`excluded.${column}`)]))
			});
		}
		const uuids = rows.map(row => row.uuid);
		await ex.delete(playlist_inherited_playlists_table).where(inArray(playlist_inherited_playlists_table.playlist_uuid, uuids));
		await ex.delete(playlist_inherited_searches_table).where(inArray(playlist_inherited_searches_table.playlist_uuid, uuids));
		for (const row of rows) {
			const stamp = { edited_at: row.modified_at, created_at: row.created_at, modified_at: row.modified_at };
			const inherited = row.inherited_playlists.filter(i => typeof i?.uuid === 'string');
			if (inherited.length > 0) {
				await ex.insert(playlist_inherited_playlists_table).values(inherited.map((i, position) => ({
					local_id: inherited_local_id(row.uuid, 'playlist', `${position}:${i.uuid}`, i.mode), playlist_uuid: row.uuid, ref_uuid: i.uuid, mode: i.mode, position, ...stamp
				})));
			}
			const searches = row.inherited_searchs.filter(i => typeof i?.query === 'string');
			if (searches.length > 0) {
				await ex.insert(playlist_inherited_searches_table).values(searches.map((i, position) => ({
					local_id: inherited_local_id(row.uuid, 'search', `${position}:${i.query}`, i.mode), playlist_uuid: row.uuid, query: i.query, mode: i.mode, position, ...stamp
				})));
			}
		}
	}

	/** 1810 can hold several rows per pair; a live row beats a deleted one, then the newest wins */
	private async copy_playlist_tracks(ex: DrizzleDB, raw_rows: SQLiteRow[]) {
		for (const row of raw_rows.map(parse_playlist_track_row)) {
			await ex.insert(playlist_tracks_table).values({
				playlist_uuid: row.uuid,
				track_uid: row.track_uid,
				position: row.id,
				deleted: row.deleted,
				edited_at: row.modified_at,
				created_at: row.created_at,
				modified_at: row.modified_at
			}).onConflictDoUpdate({
				target: [playlist_tracks_table.playlist_uuid, playlist_tracks_table.track_uid],
				set: { position: row.id, deleted: row.deleted, edited_at: row.modified_at, modified_at: row.modified_at },
				setWhere: sql`excluded.deleted <= ${playlist_tracks_table.deleted}`
			});
		}
	}

	/** A row with count N stands for N plays; each gets a client_id derived from the row, so re-copies dedupe */
	private async copy_plays(ex: DrizzleDB, raw_rows: SQLiteRow[]) {
		const plays: { client_id: string; track_uid: string; created_at: number }[] = [];
		for (const row of raw_rows.map(parse_play_row)) {
			if (row.deleted) continue;
			const count = Math.max(row.count, 1);
			for (let i = 0; i < count; i++) plays.push({ client_id: play_client_id(row.id, row.track_uid, row.created_at, i), track_uid: row.track_uid, created_at: row.created_at });
		}
		for (const part of chunkify(plays, ROWS_PER_STATEMENT * 5)) await ex.insert(track_plays_table).values(part).onConflictDoNothing();
	}

	private async copy_recently_played(ex: DrizzleDB, rows: LegacyTrackRow[]) {
		for (const row of rows) {
			const track = row.track as unknown as Record<string, unknown>;
			await ex.insert(recently_played_table).values({ uid: row.track.uid, track, played_at: row.created_at })
				.onConflictDoUpdate({ target: recently_played_table.uid, set: { track, played_at: row.created_at } });
		}
	}
}
