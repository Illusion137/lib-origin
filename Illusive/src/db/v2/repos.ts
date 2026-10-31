import { chunkify, gen_uuid } from '@common/utils/util';
import { db } from '@illusive/db/database';
import type { BackpackRepo, PlaylistsRepo, PlayRange, PlayRow, RecentlyPlayedRepo, Repos, TrackPlaysRepo, TracksRepo } from '@illusive/db/repos';
import {
	playlist_inherited_playlists_table, playlist_inherited_searches_table, playlist_tracks_table, playlists_table, recently_played_table,
	track_plays_table, user_tracks_table,
	type InheritedPlaylistRow, type InheritedSearchRow, type PlaylistRow, type UserTrackInsert, type UserTrackRow
} from '@illusive/db/schema';
import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { InheritedPlaylist, InheritedSearch, Playlist, PlaylistsTracks, SortType, Track } from '@illusive/types';
import { and, asc, desc, eq, gt, inArray, lt, max, sql } from 'drizzle-orm';
import { playlist_track_key } from './keys';
import { Outbox } from './outbox';
import { IDS_PER_QUERY, raw, transaction } from './sqlite';
import { decode_track, encode_track, TRACK_SERVICE_ID_FIELDS, unavailable_service } from './track_codec';
import { read_rows, read_tracks, read_user_tracks, uid_by_service_id, uids_by_illusi_id, write_user_tracks } from './tracks';

const USER_SYNCED_FIELDS = ['title', 'downloaded_at', 'start_at', 'end_at', 'deleted'] as const satisfies readonly (keyof UserTrackRow)[];

function user_changed(before: UserTrackRow | undefined, after: UserTrackInsert): boolean {
	if (before === undefined) return true;
	return USER_SYNCED_FIELDS.some(field => (before[field] ?? null) !== (after[field] ?? null));
}

async function save_tracks(ex: DrizzleDB, tracks: readonly Track[], mode: 'insert' | 'update', sync = true) {
	if (tracks.length === 0) return;
	const now = Date.now();
	const users = await read_user_tracks(ex, tracks.map(track => track.uid));
	const holders = await uids_by_illusi_id(ex, tracks.flatMap(track => (track.illusi_id ? [track.illusi_id] : [])));
	const rows: UserTrackInsert[] = [];
	const changed: string[] = [];
	for (const track of tracks) {
		const before = users.get(track.uid);
		const row = encode_track(track, { now, title_is_catalog: before?.illusi_id == null, previous: before });
		// Another local row already is this server track; the push's id_map merges the two
		const holder = row.illusi_id == null ? undefined : holders.get(row.illusi_id);
		if (holder !== undefined && holder !== track.uid) row.illusi_id = null;
		if (mode === 'update' && before !== undefined) {
			row.deleted = before.deleted;
			row.created_at = before.created_at;
		}
		if (user_changed(before, row)) changed.push(track.uid);
		else row.edited_at = before!.edited_at;
		rows.push(row);
	}
	await write_user_tracks(ex, rows);
	if (sync) await Outbox.enqueue(ex, 'user_track', changed);
}

async function track_by_uid(ex: DrizzleDB, uid: string): Promise<Track | undefined> {
	return (await read_tracks(ex, [uid]))[0];
}

async function in_library(ex: DrizzleDB, uids: readonly string[]): Promise<Set<string>> {
	const users = await read_user_tracks(ex, uids);
	return new Set([...users.values()].filter(user => !user.deleted).map(user => user.uid));
}

const BULK_COLUMNS = ['media_uri', 'thumbnail_uri', 'lyrics_uri', 'synced_lyrics_uri'] as const;

const tracks: TracksRepo = {
	async load_library() {
		// Unavailable tracks live in the backpack unless this device still has the file
		const rows = await read_rows(db, 'library');
		return rows.filter(row => !row.backpacked || row.media_uri !== '').map(decode_track);
	},
	async all() {
		return read_tracks(db, 'library');
	},
	async by_uid(uid) {
		return (await tracks.by_uids([uid]))[0];
	},
	async by_uids(uids) {
		const members = await in_library(db, uids);
		return read_tracks(db, uids.filter(uid => members.has(uid)));
	},
	async by_service_id(key, value) {
		let uid: string | undefined;
		if ((TRACK_SERVICE_ID_FIELDS as readonly string[]).includes(key)) {
			uid = await uid_by_service_id(db, key as typeof TRACK_SERVICE_ID_FIELDS[number], value);
		} else if (key === 'illusi_id') {
			const [row] = await db.select({ uid: user_tracks_table.uid }).from(user_tracks_table)
				.where(and(eq(user_tracks_table.deleted, false), eq(user_tracks_table.illusi_id, String(value)))).limit(1);
			uid = row?.uid;
		} else if (key === 'imported_id') {
			const [row] = await db.select({ uid: user_tracks_table.uid }).from(user_tracks_table)
				.where(and(eq(user_tracks_table.deleted, false), sql`json_extract(${user_tracks_table.track}, '$.imported_id') = ${String(value)}`)).limit(1);
			uid = row?.uid;
		}
		return uid === undefined ? undefined : tracks.by_uid(uid);
	},
	async exists(uid) {
		return (await in_library(db, [uid])).has(uid);
	},
	async insert(new_tracks) {
		await transaction(db, async tx => save_tracks(tx, new_tracks, 'insert'));
	},
	async update(_uid, track) {
		await transaction(db, async tx => save_tracks(tx, [track], 'update'));
	},
	async patch(uid, fields, sync = true) {
		await transaction(db, async (tx) => {
			const current = await track_by_uid(tx, uid);
			if (current === undefined) return;
			await save_tracks(tx, [{ ...current, ...fields, uid }], 'update', sync);
		});
	},
	async patch_all(fields, affected_uids, sync = true) {
		const bulk = Object.fromEntries(BULK_COLUMNS.filter(column => column in fields).map(column => [column, fields[column] ?? '']));
		const rest = Object.keys(fields).filter(key => !(BULK_COLUMNS as readonly string[]).includes(key));
		await transaction(db, async (tx) => {
			if (Object.keys(bulk).length > 0) await tx.update(user_tracks_table).set({ ...bulk, modified_at: Date.now() });
			if (bulk.media_uri === '') {
				const now = Date.now();
				for (const chunk of chunkify(affected_uids, IDS_PER_QUERY)) {
					await tx.update(user_tracks_table).set({ downloaded_at: null, edited_at: now, modified_at: now })
						.where(and(inArray(user_tracks_table.uid, chunk), sql`${user_tracks_table.downloaded_at} is not null`));
				}
				if (sync) await Outbox.enqueue(tx, 'user_track', affected_uids);
			}
			if (rest.length === 0) return;
			const current = await read_tracks(tx, affected_uids);
			await save_tracks(tx, current.map(track => ({ ...track, ...fields, uid: track.uid })), 'update', sync);
		});
	},
	async remove(uid) {
		const now = Date.now();
		await transaction(db, async (tx) => {
			await tx.update(user_tracks_table).set({ deleted: true, edited_at: now, modified_at: now }).where(eq(user_tracks_table.uid, uid));
			await Outbox.enqueue(tx, 'user_track', [uid]);
		});
	},
	async restore(uid) {
		const now = Date.now();
		return transaction(db, async (tx) => {
			await tx.update(user_tracks_table).set({ deleted: false, edited_at: now, modified_at: now }).where(eq(user_tracks_table.uid, uid));
			await Outbox.enqueue(tx, 'user_track', [uid]);
			return track_by_uid(tx, uid);
		});
	},
	async clear() {
		const now = Date.now();
		await transaction(db, async (tx) => {
			const rows = await tx.select({ uid: user_tracks_table.uid }).from(user_tracks_table).where(eq(user_tracks_table.deleted, false));
			await tx.update(user_tracks_table).set({ deleted: true, edited_at: now, modified_at: now }).where(eq(user_tracks_table.deleted, false));
			await Outbox.enqueue(tx, 'user_track', rows.map(row => row.uid));
		});
	}
};

function playlist_from_rows(row: PlaylistRow, searches: readonly InheritedSearchRow[], inherited: readonly InheritedPlaylistRow[]): Playlist {
	return {
		uuid: row.uuid,
		title: row.title,
		description: row.description ?? '',
		pinned: row.pinned,
		archived: row.archived,
		thumbnail_uri: row.thumbnail_uri,
		artwork_path: row.artwork_path,
		sort: row.sort_mode as SortType,
		public: row.public,
		public_uuid: row.uuid,
		inherited_playlists: inherited.map(i => ({ uuid: i.ref_uuid, mode: i.mode ?? 'INCLUDE' })),
		inherited_searchs: searches.map(s => ({ query: s.query ?? '', mode: s.mode ?? 'INCLUDE' })),
		linked_playlists: [],
		date: row.date
	};
}

async function load_playlists(ex: DrizzleDB, uuids?: readonly string[]): Promise<Playlist[]> {
	const rows = await ex.select().from(playlists_table)
		.where(and(eq(playlists_table.deleted, false), uuids === undefined ? undefined : inArray(playlists_table.uuid, [...uuids])))
		.orderBy(asc(playlists_table.created_at));
	if (rows.length === 0) return [];
	const ids = rows.map(row => row.uuid);
	const [searches, inherited] = await Promise.all([
		ex.select().from(playlist_inherited_searches_table)
			.where(and(eq(playlist_inherited_searches_table.deleted, false), inArray(playlist_inherited_searches_table.playlist_uuid, ids)))
			.orderBy(asc(playlist_inherited_searches_table.position)),
		ex.select().from(playlist_inherited_playlists_table)
			.where(and(eq(playlist_inherited_playlists_table.deleted, false), inArray(playlist_inherited_playlists_table.playlist_uuid, ids)))
			.orderBy(asc(playlist_inherited_playlists_table.position))
	]);
	return rows.map(row => playlist_from_rows(row, searches.filter(s => s.playlist_uuid === row.uuid), inherited.filter(i => i.playlist_uuid === row.uuid)));
}

async function replace_inherited<W, R extends { local_id: string; deleted: boolean; position: number }>(
	ex: DrizzleDB,
	opts: {
		existing: R[];
		wanted: readonly W[];
		same: (row: R, want: W) => boolean;
		insert: (want: W, position: number, now: number) => Promise<string>;
		set: (local_id: string, values: { deleted?: boolean; position?: number; edited_at?: number; modified_at: number }) => Promise<void>;
		kind: 'inherited_search' | 'inherited_playlist';
	}
) {
	const now = Date.now();
	const unused = opts.existing.filter(row => !row.deleted);
	const changed: string[] = [];
	for (const [position, want] of opts.wanted.entries()) {
		const index = unused.findIndex(row => opts.same(row, want));
		if (index === -1) {
			changed.push(await opts.insert(want, position, now));
			continue;
		}
		const [row] = unused.splice(index, 1);
		// Order is local only, so moving a row isn't a change to sync
		if (row.position !== position) await opts.set(row.local_id, { position, modified_at: now });
	}
	for (const row of unused) {
		await opts.set(row.local_id, { deleted: true, edited_at: now, modified_at: now });
		changed.push(row.local_id);
	}
	await Outbox.enqueue(ex, opts.kind, changed);
}

const PLAYLIST_SYNCED: Partial<Record<keyof Playlist, keyof PlaylistRow>> = {
	title: 'title', description: 'description', pinned: 'pinned', archived: 'archived', public: 'public', sort: 'sort_mode'
};
const PLAYLIST_LOCAL: Partial<Record<keyof Playlist, keyof PlaylistRow>> = {
	thumbnail_uri: 'thumbnail_uri', artwork_path: 'artwork_path', date: 'date'
};

async function next_positions(ex: DrizzleDB, uuids: readonly string[]): Promise<Map<string, number>> {
	const rows = await ex.select({ uuid: playlist_tracks_table.playlist_uuid, position: max(playlist_tracks_table.position) })
		.from(playlist_tracks_table).where(inArray(playlist_tracks_table.playlist_uuid, [...uuids])).groupBy(playlist_tracks_table.playlist_uuid);
	return new Map(rows.map(row => [row.uuid, (row.position ?? 0) + 1]));
}

async function set_playlist_tracks_deleted(ex: DrizzleDB, rows: readonly PlaylistsTracks[]) {
	const now = Date.now();
	const keys: string[] = [];
	for (const row of rows) {
		const updated = await ex.update(playlist_tracks_table).set({ deleted: true, edited_at: now, modified_at: now })
			.where(and(eq(playlist_tracks_table.playlist_uuid, row.uuid), eq(playlist_tracks_table.track_uid, row.track_uid), eq(playlist_tracks_table.deleted, false)))
			.returning({ uuid: playlist_tracks_table.playlist_uuid });
		if (updated.length > 0) keys.push(playlist_track_key(row.uuid, row.track_uid));
	}
	await Outbox.enqueue(ex, 'playlist_track', keys);
}

const playlists: PlaylistsRepo = {
	async count() {
		return db.$count(playlists_table, eq(playlists_table.deleted, false));
	},
	async has_track(uuid, track_uid) {
		return await db.$count(playlist_tracks_table, and(
			eq(playlist_tracks_table.deleted, false), eq(playlist_tracks_table.playlist_uuid, uuid), eq(playlist_tracks_table.track_uid, track_uid)
		)) !== 0;
	},
	async containing_track(track_uid) {
		const rows = await db.select({ uuid: playlist_tracks_table.playlist_uuid }).from(playlist_tracks_table)
			.where(and(eq(playlist_tracks_table.deleted, false), eq(playlist_tracks_table.track_uid, track_uid)));
		return new Set(rows.map(row => row.uuid));
	},
	async track_uid_set(uuid) {
		return new Set(await playlists.ordered_track_uids(uuid));
	},
	async raw_tracks() {
		return db.select({ uuid: playlist_tracks_table.playlist_uuid, track_uid: playlist_tracks_table.track_uid }).from(playlist_tracks_table)
			.where(eq(playlist_tracks_table.deleted, false));
	},
	async ordered_track_uids(uuid) {
		const rows = await raw(db).execute_async(
			'SELECT track_uid FROM playlist_tracks WHERE playlist_uuid = ? AND deleted = 0 ORDER BY position, created_at', [uuid]
		);
		return rows.map(row => row.track_uid as string);
	},
	async all() {
		return load_playlists(db);
	},
	async get(uuid) {
		return (await load_playlists(db, [uuid]))[0];
	},
	async titles() {
		return db.select({ title: playlists_table.title }).from(playlists_table);
	},
	async add_tracks(rows) {
		if (rows.length === 0) return;
		await transaction(db, async (tx) => {
			const now = Date.now();
			const positions = await next_positions(tx, [...new Set(rows.map(row => row.uuid))]);
			const keys: string[] = [];
			for (const row of rows) {
				const [existing] = await tx.select({ deleted: playlist_tracks_table.deleted }).from(playlist_tracks_table)
					.where(and(eq(playlist_tracks_table.playlist_uuid, row.uuid), eq(playlist_tracks_table.track_uid, row.track_uid)));
				if (existing !== undefined && !existing.deleted) continue;
				// Time-based, so adds from other devices (ordered by their created_at) interleave by add time
				const position = Math.max(positions.get(row.uuid) ?? 1, now);
				positions.set(row.uuid, position + 1);
				// A revived row moves to the end, as a fresh add would
				await tx.insert(playlist_tracks_table)
					.values({ playlist_uuid: row.uuid, track_uid: row.track_uid, position, deleted: false, edited_at: now, created_at: now, modified_at: now })
					.onConflictDoUpdate({
						target: [playlist_tracks_table.playlist_uuid, playlist_tracks_table.track_uid],
						set: { deleted: false, position, edited_at: now, modified_at: now }
					});
				keys.push(playlist_track_key(row.uuid, row.track_uid));
			}
			await Outbox.enqueue(tx, 'playlist_track', keys);
		});
	},
	async remove_tracks(rows) {
		await transaction(db, async tx => set_playlist_tracks_deleted(tx, rows));
	},
	async remove_track_everywhere(track_uid) {
		await transaction(db, async (tx) => {
			const rows = await tx.select({ uuid: playlist_tracks_table.playlist_uuid }).from(playlist_tracks_table)
				.where(and(eq(playlist_tracks_table.deleted, false), eq(playlist_tracks_table.track_uid, track_uid)));
			await set_playlist_tracks_deleted(tx, rows.map(row => ({ uuid: row.uuid, track_uid })));
		});
	},
	async create(uuid, title) {
		await transaction(db, async (tx) => {
			const now = Date.now();
			await tx.insert(playlists_table).values({ uuid, title, edited_at: now, created_at: now, modified_at: now })
				.onConflictDoUpdate({ target: playlists_table.uuid, set: { title, deleted: false, edited_at: now, modified_at: now } });
			await Outbox.enqueue(tx, 'playlist', [uuid]);
		});
	},
	async update(uuid, fields) {
		await transaction(db, async (tx) => {
			const [current] = await tx.select().from(playlists_table).where(eq(playlists_table.uuid, uuid));
			if (current === undefined) return;
			const now = Date.now();
			const values: Partial<PlaylistRow> = {};
			let synced = false;
			for (const [field, column] of Object.entries(PLAYLIST_SYNCED) as [keyof Playlist, keyof PlaylistRow][]) {
				if (!(field in fields) || fields[field] === undefined) continue;
				const value = field === 'description' ? (fields.description || null) : fields[field];
				if (current[column] === value) continue;
				(values as Record<string, unknown>)[column] = value;
				synced = true;
			}
			for (const [field, column] of Object.entries(PLAYLIST_LOCAL) as [keyof Playlist, keyof PlaylistRow][]) {
				if (field in fields && fields[field] !== undefined) (values as Record<string, unknown>)[column] = fields[field];
			}
			// New custom artwork (or none) is uploaded on its own clock; the old server copy no longer matches
			const artwork_changed = fields.thumbnail_uri !== undefined && fields.thumbnail_uri !== current.thumbnail_uri;
			if (artwork_changed) {
				values.artwork_id = null;
				values.artwork_edited_at = now;
			}
			if (synced) values.edited_at = now;
			if (Object.keys(values).length > 0) await tx.update(playlists_table).set({ ...values, modified_at: now }).where(eq(playlists_table.uuid, uuid));
			if (synced) await Outbox.enqueue(tx, 'playlist', [uuid]);
			if (artwork_changed) await Outbox.enqueue(tx, 'playlist_artwork', [uuid]);

			if (fields.inherited_playlists !== undefined) {
				const table = playlist_inherited_playlists_table;
				await replace_inherited<InheritedPlaylist, InheritedPlaylistRow>(tx, {
					existing: await tx.select().from(table).where(eq(table.playlist_uuid, uuid)),
					wanted: fields.inherited_playlists,
					same: (row, want) => row.ref_uuid === want.uuid && row.mode === want.mode,
					insert: async (want, position, at) => {
						const local_id = gen_uuid();
						await tx.insert(table).values({ local_id, playlist_uuid: uuid, ref_uuid: want.uuid, mode: want.mode, position, edited_at: at, created_at: at, modified_at: at });
						return local_id;
					},
					set: async (local_id, set) => {
						await tx.update(table).set(set).where(eq(table.local_id, local_id));
					},
					kind: 'inherited_playlist'
				});
			}
			if (fields.inherited_searchs !== undefined) {
				const table = playlist_inherited_searches_table;
				await replace_inherited<InheritedSearch, InheritedSearchRow>(tx, {
					existing: await tx.select().from(table).where(eq(table.playlist_uuid, uuid)),
					wanted: fields.inherited_searchs,
					same: (row, want) => row.query === want.query && row.mode === want.mode,
					insert: async (want, position, at) => {
						const local_id = gen_uuid();
						await tx.insert(table).values({ local_id, playlist_uuid: uuid, query: want.query, mode: want.mode, position, edited_at: at, created_at: at, modified_at: at });
						return local_id;
					},
					set: async (local_id, set) => {
						await tx.update(table).set(set).where(eq(table.local_id, local_id));
					},
					kind: 'inherited_search'
				});
			}
		});
	},
	async remove(uuid) {
		await transaction(db, async (tx) => {
			const rows = await tx.select({ track_uid: playlist_tracks_table.track_uid }).from(playlist_tracks_table)
				.where(and(eq(playlist_tracks_table.playlist_uuid, uuid), eq(playlist_tracks_table.deleted, false)));
			await set_playlist_tracks_deleted(tx, rows.map(row => ({ uuid, track_uid: row.track_uid })));
			const now = Date.now();
			await tx.update(playlists_table).set({ deleted: true, edited_at: now, modified_at: now }).where(eq(playlists_table.uuid, uuid));
			await Outbox.enqueue(tx, 'playlist', [uuid]);
		});
	}
};

function play_where(range: PlayRange, track_uid?: string) {
	return and(
		track_uid === undefined ? undefined : eq(track_plays_table.track_uid, track_uid),
		gt(track_plays_table.created_at, range.start),
		lt(track_plays_table.created_at, range.end)
	);
}

const track_plays: TrackPlaysRepo = {
	async insert(track_uid) {
		await transaction(db, async (tx) => {
			const client_id = gen_uuid();
			await tx.insert(track_plays_table).values({ client_id, track_uid, created_at: Date.now() });
			await Outbox.enqueue(tx, 'track_play', [client_id]);
		});
	},
	async between(range, track_uid) {
		return db.select({ track_uid: track_plays_table.track_uid, created_at: track_plays_table.created_at }).from(track_plays_table).where(play_where(range, track_uid));
	},
	between_sync(range, track_uid): PlayRow[] {
		const params: unknown[] = [range.start, range.end];
		if (track_uid !== undefined) params.push(track_uid);
		return raw(db).execute_sync(
			`SELECT track_uid, created_at FROM track_plays WHERE created_at > ? AND created_at < ?${track_uid === undefined ? '' : ' AND track_uid = ?'}`,
			params
		) as PlayRow[];
	}
};

/** What recently_played keeps of a track: no derived playback state */
function snapshot(track: Track): Record<string, unknown> {
	const { playback, downloading_data, id, ...rest } = track;
	playback; downloading_data; id;
	return rest;
}

const recently_played: RecentlyPlayedRepo = {
	async insert(track) {
		const now = Date.now();
		await db.insert(recently_played_table).values({ uid: track.uid, track: snapshot(track), played_at: now })
			.onConflictDoUpdate({ target: recently_played_table.uid, set: { track: snapshot(track), played_at: now } });
	},
	async remove(track_uid) {
		await db.delete(recently_played_table).where(eq(recently_played_table.uid, track_uid));
	},
	async clear() {
		await db.delete(recently_played_table);
	},
	async list(limit) {
		const query = db.select({ track: recently_played_table.track }).from(recently_played_table).orderBy(desc(recently_played_table.played_at));
		const rows = limit ? await query.limit(limit) : await query;
		return rows.map(row => row.track as unknown as Track);
	},
	async trim(keep) {
		await raw(db).execute_statement(
			'DELETE FROM recently_played WHERE uid NOT IN (SELECT uid FROM recently_played ORDER BY played_at DESC LIMIT ?)', [keep]
		);
	}
};

const backpack: BackpackRepo = {
	async list() {
		const rows = await db.select().from(user_tracks_table)
			.where(and(eq(user_tracks_table.deleted, false), eq(user_tracks_table.backpacked, true)))
			.orderBy(asc(user_tracks_table.backpacked_at));
		return rows.map(decode_track);
	},
	async add(track_uid) {
		return transaction(db, async (tx) => {
			const track = await track_by_uid(tx, track_uid);
			if (track === undefined) return false;
			const now = Date.now();
			await tx.update(user_tracks_table).set({ backpacked: true, backpacked_at: sql`coalesce(${user_tracks_table.backpacked_at}, ${now})`, modified_at: now })
				.where(eq(user_tracks_table.uid, track_uid));
			const service = unavailable_service(track);
			if (service !== null) await Outbox.enqueue(tx, 'unavailable', [track_uid], { service });
			return true;
		});
	},
	async remove(track_uid) {
		await db.update(user_tracks_table).set({ backpacked: false, backpacked_at: null, modified_at: Date.now() }).where(eq(user_tracks_table.uid, track_uid));
	},
	async empty() {
		await transaction(db, async (tx) => {
			const rows = await tx.select({ uid: user_tracks_table.uid }).from(user_tracks_table)
				.where(and(eq(user_tracks_table.deleted, false), eq(user_tracks_table.backpacked, true), eq(user_tracks_table.media_uri, '')));
			const now = Date.now();
			const uids = rows.map(row => row.uid);
			for (const chunk of chunkify(uids, IDS_PER_QUERY)) {
				await tx.update(user_tracks_table).set({ deleted: true, edited_at: now, modified_at: now }).where(inArray(user_tracks_table.uid, chunk));
			}
			await Outbox.enqueue(tx, 'user_track', uids);
		});
	}
};

export const v2_repos: Repos = { tracks, playlists, track_plays, recently_played, backpack };
