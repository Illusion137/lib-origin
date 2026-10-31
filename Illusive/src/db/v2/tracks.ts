import type { DrizzleDB } from '@native/sqlite/sqlite.base';
import type { Track } from '@illusive/types';
import { user_tracks_table, type UserTrackInsert, type UserTrackRow } from '@illusive/db/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { excluded, IDS_PER_QUERY, ROWS_PER_STATEMENT } from './sqlite';
import { chunkify } from '@common/utils/util';
import type { TRACK_SERVICE_ID_FIELDS } from './track_codec';
import { decode_track } from './track_codec';

const WRITTEN_COLUMNS = [
	'illusi_id', 'track', 'title', 'downloaded_at', 'start_at', 'end_at', 'media_uri', 'thumbnail_uri', 'lyrics_uri', 'synced_lyrics_uri',
	'plays', 'last_played_at', 'deleted', 'edited_at', 'created_at', 'modified_at'
] as const;

export async function write_user_tracks(ex: DrizzleDB, rows: readonly UserTrackInsert[]) {
	for (const chunk of chunkify(rows, ROWS_PER_STATEMENT)) {
		await ex.insert(user_tracks_table).values(chunk).onConflictDoUpdate({ target: user_tracks_table.uid, set: excluded(WRITTEN_COLUMNS) });
	}
}

async function in_chunks<T>(ids: readonly string[], query: (chunk: string[]) => Promise<T[]>): Promise<T[]> {
	const result: T[] = [];
	for (const chunk of chunkify(ids, IDS_PER_QUERY)) result.push(...await query(chunk));
	return result;
}

export async function read_rows(ex: DrizzleDB, uids: readonly string[] | 'library'): Promise<UserTrackRow[]> {
	if (uids === 'library') {
		return ex.select().from(user_tracks_table).where(eq(user_tracks_table.deleted, false)).orderBy(asc(user_tracks_table.created_at), asc(user_tracks_table.uid));
	}
	const rows = await read_user_tracks(ex, uids);
	return uids.map(uid => rows.get(uid)).filter(row => row !== undefined);
}

export async function read_tracks(ex: DrizzleDB, uids: readonly string[] | 'library'): Promise<Track[]> {
	return (await read_rows(ex, uids)).map(decode_track);
}

export async function read_user_tracks(ex: DrizzleDB, uids: readonly string[]): Promise<Map<string, UserTrackRow>> {
	const rows = await in_chunks([...new Set(uids)], async chunk => ex.select().from(user_tracks_table).where(inArray(user_tracks_table.uid, chunk)));
	return new Map(rows.map(row => [row.uid, row]));
}

export async function uids_by_illusi_id(ex: DrizzleDB, illusi_ids: readonly string[]): Promise<Map<string, string>> {
	const rows = await in_chunks([...new Set(illusi_ids)], async chunk => ex.select({ uid: user_tracks_table.uid, illusi_id: user_tracks_table.illusi_id })
		.from(user_tracks_table).where(inArray(user_tracks_table.illusi_id, chunk)));
	const result = new Map<string, string>();
	for (const row of rows) if (row.illusi_id !== null) result.set(row.illusi_id, row.uid);
	return result;
}

export async function uid_by_service_id(ex: DrizzleDB, column: typeof TRACK_SERVICE_ID_FIELDS[number], value: string | number): Promise<string | undefined> {
	const [row] = await ex.select({ uid: user_tracks_table.uid }).from(user_tracks_table)
		.where(and(eq(user_tracks_table.deleted, false), sql`json_extract(${user_tracks_table.track}, ${`$.service_ids.${column}`}) = ${value}`))
		.limit(1);
	return row?.uid;
}
