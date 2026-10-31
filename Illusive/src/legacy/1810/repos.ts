import { reinterpret_cast } from '@common/cast';
import { DrizzleUtils } from '@common/utils/drizzle_utils';
import { force_json_parse, force_json_parse_array } from '@common/utils/parse_util';
import { chunkify, groupby } from '@common/utils/util';
import type { BackpackRepo, PlaylistsRepo, PlayRange, PlayRow, RecentlyPlayedRepo, Repos, TrackPlaysRepo, TracksRepo } from '@illusive/db/repos';
import type { NamedUUID, Playlist, PlaylistsTracks, Track, TrackMetaData } from '@illusive/types';
import { producers_from_names } from '@illusive/parsers/title_parser';
import { TrackAnalysis } from '@illusive/track_analysis';
import { sqlite } from '@native/sqlite/sqlite';
import { and, desc, eq, gt, inArray, lt, sql } from 'drizzle-orm';
import { ChangeTracker } from './change_tracker';
import { db } from './database';
import {
	backpack_table, playlists_table, playlists_tracks_table, recently_played_tracks_table, track_plays_table, tracks_table, type SQLTrack
} from './schema';

function from_columns<T extends object>(row: T): Track {
	const track = { ...row } as Record<string, unknown>;
	const analysis = TrackAnalysis.from_values(track);
	for (const field of TrackAnalysis.FIELDS) delete track[field];
	if (analysis !== undefined) track.analysis = analysis;
	track.prods = producers_from_names(typeof track.prods === 'string' ? track.prods : undefined) ?? [];
	return reinterpret_cast<Track>(track);
}
function to_columns<T extends Partial<Track>>(fields: T) {
	const { analysis, prods, ...rest } = fields;
	return {
		...rest,
		...('analysis' in fields ? TrackAnalysis.to_columns(analysis) : {}),
		...('prods' in fields ? { prods: (prods ?? []).map(prod => prod.name).join(', ') } : {})
	};
}

function row_to_track(row: SQLTrack): Track {
	const { id, ...track } = row;
	id;
	return from_columns(track);
}

interface RawTrackRow extends Omit<SQLTrack, 'artists' | 'tags' | 'album' | 'meta' | 'unreleased' | 'deleted'> {
	artists: string;
	tags: string;
	album: string;
	meta: string;
	unreleased: number;
	deleted: number;
}
function raw_row_to_track(row: RawTrackRow): Track {
	const track = reinterpret_cast<Track & { id?: number; deleted?: boolean }>(from_columns({
		...row,
		artists: force_json_parse_array<NamedUUID[]>(row.artists ?? '[]'),
		tags: force_json_parse_array<string[]>(row.tags ?? '[]'),
		album: force_json_parse<NamedUUID>(row.album ?? '{}'),
		unreleased: row.unreleased !== 0,
		deleted: row.deleted !== 0,
		meta: force_json_parse<TrackMetaData>(row.meta ?? '{}')
	}));
	delete track.id;
	return track;
}

function sanitize(track: Track) {
	return {
		...to_columns(track),
		duration: isNaN(track.duration) || track.duration <= 0 ? 0 : track.duration,
		plays: isNaN(track.service_plays as number) ? 0 : (track.service_plays ?? 0)
	};
}

const insert_chunk_size = 50;

const tracks: TracksRepo = {
	async load_library() {
		const raw_rows = await sqlite().wrap_client(db.$client).execute_async(`SELECT * FROM tracks WHERE deleted = 0 ORDER BY json_extract(meta, '$.added_date') ASC, id ASC`);
		return raw_rows.map(row => raw_row_to_track(reinterpret_cast<RawTrackRow>(row)));
	},
	async all() {
		return (await db.select().from(tracks_table).where(eq(tracks_table.deleted, false))).map(row_to_track);
	},
	async by_uid(uid) {
		const row = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(tracks_table.uid, uid))).get();
		return row === undefined ? undefined : row_to_track(row);
	},
	async by_uids(uids) {
		const rows = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), inArray(tracks_table.uid, [...uids])));
		const by_uid = new Map(rows.map(row => [row.uid, row_to_track(row)]));
		return uids.map(uid => by_uid.get(uid)).filter(track => track !== undefined);
	},
	async by_service_id(key, value) {
		const column = tracks_table[reinterpret_cast<keyof typeof tracks_table & 'youtube_id'>(key)];
		const row = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(column, reinterpret_cast<string>(value)))).get();
		return row === undefined ? undefined : row_to_track(row);
	},
	async exists(uid) {
		return await db.$count(tracks_table, and(eq(tracks_table.deleted, false), eq(tracks_table.uid, uid))) !== 0;
	},
	async insert(new_tracks) {
		if (new_tracks.length === 0) return;
		await db.transaction(async (tx) => {
			for (const chunk of chunkify(new_tracks, insert_chunk_size))
				await tx.insert(tracks_table).values(chunk.map(sanitize));
		});
		await ChangeTracker.log_changes('tracks', 'insert', new_tracks.map(track => track.uid));
	},
	async update(uid, track) {
		await db.update(tracks_table).set({ ...sanitize(track), sync_error: null }).where(eq(tracks_table.uid, uid));
		await ChangeTracker.log_change('tracks', 'update', uid, track);
	},
	async patch(uid, fields, sync = true) {
		const columns = to_columns(fields);
		await db.update(tracks_table).set(sync ? { ...columns, sync_error: null } : columns).where(eq(tracks_table.uid, uid));
		if (sync) await ChangeTracker.log_change('tracks', 'update', uid, fields);
	},
	async patch_all(fields, affected_uids, sync = true) {
		await db.update(tracks_table).set(to_columns(fields));
		if (sync) await ChangeTracker.log_changes('tracks', 'update', [...affected_uids]);
	},
	async remove(uid) {
		await db.update(tracks_table).set({ deleted: true }).where(eq(tracks_table.uid, uid));
		await ChangeTracker.log_change('tracks', 'delete', uid, { uid });
	},
	async restore(uid) {
		await db.update(tracks_table).set({ deleted: false }).where(eq(tracks_table.uid, uid));
		await ChangeTracker.log_change('tracks', 'update', uid, { uid });
		const row = await db.select().from(tracks_table).where(eq(tracks_table.uid, uid)).get();
		return row === undefined ? undefined : row_to_track(row);
	},
	async clear() {
		const to_delete = await db.select({ uid: tracks_table.uid }).from(tracks_table);
		for (const track of to_delete) await ChangeTracker.log_change('tracks', 'delete', track.uid, { uid: track.uid });
		await db.delete(tracks_table);
	}
};

const playlist_tracks_chunk_size = 400;

const playlists: PlaylistsRepo = {
	async count() {
		return await db.$count(playlists_table, eq(playlists_table.deleted, false)) ?? 0;
	},
	async has_track(uuid, track_uid) {
		return await db.$count(playlists_tracks_table, and(
			eq(playlists_tracks_table.deleted, false),
			eq(playlists_tracks_table.uuid, uuid),
			eq(playlists_tracks_table.track_uid, track_uid)
		)) !== 0;
	},
	async containing_track(track_uid) {
		const rows = await db.select({ uuid: playlists_tracks_table.uuid }).from(playlists_tracks_table)
			.where(and(eq(playlists_tracks_table.deleted, false), eq(playlists_tracks_table.track_uid, track_uid)));
		return new Set<string>(rows.map(row => row.uuid));
	},
	async track_uid_set(uuid) {
		const rows = await db.select({ track_uid: playlists_tracks_table.track_uid }).from(playlists_tracks_table)
			.where(and(eq(playlists_tracks_table.deleted, false), eq(playlists_tracks_table.uuid, uuid)));
		return new Set<string>(rows.map(row => row.track_uid));
	},
	async raw_tracks() {
		return db.select({ uuid: playlists_tracks_table.uuid, track_uid: playlists_tracks_table.track_uid }).from(playlists_tracks_table)
			.where(eq(playlists_tracks_table.deleted, false));
	},
	async ordered_track_uids(uuid) {
		const rows = await sqlite().wrap_client(db.$client).execute_async('SELECT track_uid FROM playlists_tracks WHERE uuid = ? AND deleted = 0 ORDER BY id', [uuid]);
		return rows.map(row => reinterpret_cast<{ track_uid: string }>(row).track_uid);
	},
	async all() {
		return reinterpret_cast<Playlist[]>(await db.select().from(playlists_table).where(eq(playlists_table.deleted, false)));
	},
	async get(uuid) {
		return reinterpret_cast<Playlist | undefined>(await db.select().from(playlists_table).where(eq(playlists_table.uuid, uuid)).get());
	},
	async titles() {
		return db.select({ title: playlists_table.title }).from(playlists_table);
	},
	async add_tracks(many_playlist_tracks) {
		if (many_playlist_tracks.length === 0) return;
		const to_insert: PlaylistsTracks[] = [];
		const to_revive: { id: number; uuid: string; track_uid: string }[] = [];
		const grouped = groupby([...many_playlist_tracks], playlist_track => playlist_track.uuid);
		for (const [uuid, group] of Object.entries(grouped)) {
			const existing_by_track_uid = new Map<string, { id: number; deleted: boolean }>();
			for (const chunk of chunkify(group, playlist_tracks_chunk_size)) {
				const existing_rows = await db
					.select({ id: playlists_tracks_table.id, track_uid: playlists_tracks_table.track_uid, deleted: playlists_tracks_table.deleted })
					.from(playlists_tracks_table)
					.where(and(eq(playlists_tracks_table.uuid, uuid), inArray(playlists_tracks_table.track_uid, chunk.map(playlist_track => playlist_track.track_uid))));
				for (const row of existing_rows) {
					const prev = existing_by_track_uid.get(row.track_uid);
					if (prev === undefined || (prev.deleted && !row.deleted)) existing_by_track_uid.set(row.track_uid, { id: row.id, deleted: row.deleted });
				}
			}
			for (const playlist_track of group) {
				const existing = existing_by_track_uid.get(playlist_track.track_uid);
				if (existing === undefined) to_insert.push(playlist_track);
				else if (existing.deleted) to_revive.push({ id: existing.id, uuid, track_uid: playlist_track.track_uid });
			}
		}
		if (to_insert.length === 0 && to_revive.length === 0) return;
		await db.transaction(async (tx) => {
			if (to_revive.length > 0) {
				const max_row = await tx.select({ max_id: sql<number>`MAX(${playlists_tracks_table.id})` }).from(playlists_tracks_table).get();
				let next_id = (max_row?.max_id ?? 0) + 1;
				for (const revive of to_revive) {
					await tx.update(playlists_tracks_table).set({ deleted: false, id: next_id }).where(eq(playlists_tracks_table.id, revive.id));
					next_id += 1;
				}
			}
			for (const chunk of chunkify(to_insert, playlist_tracks_chunk_size)) {
				await tx.insert(playlists_tracks_table).values(chunk);
			}
		});
		await ChangeTracker.log_changes('playlists_tracks', 'insert', [
			...to_revive.map(revive => `${revive.uuid}:${revive.track_uid}`),
			...to_insert.map(playlist_track => `${playlist_track.uuid}:${playlist_track.track_uid}`)
		]);
	},
	async remove_tracks(many_playlist_tracks) {
		if (many_playlist_tracks.length === 0) return;
		const grouped = groupby([...many_playlist_tracks], playlist_track => playlist_track.uuid);
		await db.transaction(async (tx) => {
			for (const [uuid, group] of Object.entries(grouped)) {
				for (const chunk of chunkify(group, playlist_tracks_chunk_size)) {
					await tx.update(playlists_tracks_table).set({ deleted: true }).where(and(
						eq(playlists_tracks_table.uuid, uuid),
						inArray(playlists_tracks_table.track_uid, chunk.map(playlist_track => playlist_track.track_uid))
					));
				}
			}
		});
		await ChangeTracker.log_changes('playlists_tracks', 'delete', many_playlist_tracks.map(playlist_track => `${playlist_track.uuid}:${playlist_track.track_uid}`));
	},
	async remove_track_everywhere(track_uid) {
		const rows = await db.select({ uuid: playlists_tracks_table.uuid }).from(playlists_tracks_table)
			.where(and(eq(playlists_tracks_table.deleted, false), eq(playlists_tracks_table.track_uid, track_uid)));
		await db.update(playlists_tracks_table).set({ deleted: true }).where(eq(playlists_tracks_table.track_uid, track_uid));
		await ChangeTracker.log_changes('playlists_tracks', 'delete', rows.map(row => `${row.uuid}:${track_uid}`));
	},
	async create(uuid, title) {
		const new_playlist = { uuid, title };
		await db.insert(playlists_table).values(new_playlist);
		await ChangeTracker.log_change('playlists', 'insert', uuid, new_playlist);
	},
	async update(uuid, fields) {
		await db.update(playlists_table).set(reinterpret_cast<Partial<typeof playlists_table.$inferInsert>>(fields)).where(eq(playlists_table.uuid, uuid));
		await ChangeTracker.log_change('playlists', 'update', uuid, fields);
	},
	async remove(uuid) {
		const rows = await db.select({ track_uid: playlists_tracks_table.track_uid }).from(playlists_tracks_table).where(eq(playlists_tracks_table.uuid, uuid));
		await playlists.remove_tracks(rows.map(row => ({ track_uid: row.track_uid, uuid })));
		await db.update(playlists_table).set({ deleted: true }).where(eq(playlists_table.uuid, uuid));
		await ChangeTracker.log_change('playlists', 'delete', uuid, { uuid });
	}
};

const FAR_DATE = 1e14;
function play_query(range: PlayRange, track_uid?: string) {
	return db.select({ track_uid: track_plays_table.track_uid, created_at: track_plays_table.created_at })
		.from(track_plays_table)
		.where(and(
			eq(track_plays_table.deleted, false),
			track_uid === undefined ? undefined : eq(track_plays_table.track_uid, track_uid),
			gt(track_plays_table.created_at, range.start),
			lt(track_plays_table.created_at, Math.min(range.end, FAR_DATE))
		));
}

const track_plays: TrackPlaysRepo = {
	async insert(track_uid) {
		await db.insert(track_plays_table).values({ track_uid });
	},
	async between(range, track_uid) {
		return play_query(range, track_uid);
	},
	between_sync(range, track_uid): PlayRow[] {
		const dz = new DrizzleUtils(sqlite().wrap_client(db.$client));
		return dz.get_all_sync_dz(play_query(range, track_uid));
	}
};

const recently_played: RecentlyPlayedRepo = {
	async insert(t) {
		const { id, ...track } = t as Track & { id?: number };
		id;
		await db.delete(recently_played_tracks_table).where(eq(recently_played_tracks_table.uid, track.uid));
		await db.insert(recently_played_tracks_table).values(sanitize(track));
		db.$client.flushPendingReactiveQueries?.();
	},
	async remove(track_uid) {
		await db.delete(recently_played_tracks_table).where(eq(recently_played_tracks_table.uid, track_uid));
	},
	async clear() {
		await db.delete(recently_played_tracks_table);
	},
	async list(limit) {
		const query = db.select().from(recently_played_tracks_table).orderBy(desc(recently_played_tracks_table.id));
		return (limit ? await query.limit(limit) : await query).map(row_to_track);
	},
	async trim(max) {
		await sqlite().wrap_client(db.$client).execute_statement(
			'DELETE FROM recently_played_tracks WHERE id NOT IN (SELECT id FROM recently_played_tracks ORDER BY id DESC LIMIT ?)',
			[max]
		);
	}
};

const backpack: BackpackRepo = {
	async list() {
		return (await db.select().from(backpack_table).where(eq(backpack_table.deleted, false))).map(row_to_track);
	},
	async add(track_uid) {
		const row = await db.select().from(tracks_table).where(and(eq(tracks_table.deleted, false), eq(tracks_table.uid, track_uid))).get();
		if (row === undefined) return false;
		await tracks.remove(track_uid);
		const { id, ...track } = row;
		id;
		await db.insert(backpack_table).values(track);
		await ChangeTracker.log_change('backpack', 'insert', track_uid, track);
		return true;
	},
	async remove(track_uid) {
		await db.delete(backpack_table).where(eq(backpack_table.uid, track_uid));
		await ChangeTracker.log_change('backpack', 'delete', track_uid, { uid: track_uid });
	},
	async empty() {
		const rows = await db.select({ uid: backpack_table.uid }).from(backpack_table);
		for (const row of rows) await ChangeTracker.log_change('backpack', 'delete', row.uid, { uid: row.uid });
		await db.delete(backpack_table);
	}
};

export const legacy_repos: Repos = { tracks, playlists, track_plays, recently_played, backpack };
