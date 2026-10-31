import type { RawSQLiteConnection, SQLiteRow } from '@native/sqlite/sqlite.base';
import type { InheritedPlaylist, InheritedSearch, NamedUUID, SortType, Track, TrackMetaData } from '@illusive/types';
import { TrackAnalysis } from '@illusive/track_analysis';
import { producers_from_names } from '@illusive/parsers/title_parser';

export const LOG_TABLE = '__v2_migration_log';

export const LEGACY_TABLES = {
	tracks: { key: 'uid' },
	backpack: { key: 'uid' },
	playlists: { key: 'uuid' },
	playlists_tracks: { key: 'uuid || \':\' || track_uid' },
	track_plays: { key: 'CAST(id AS TEXT)' },
	recently_played_tracks: { key: 'uid' }
} as const;
export type LegacyTable = keyof typeof LEGACY_TABLES;
export const LEGACY_TABLE_ORDER: readonly LegacyTable[] = ['tracks', 'backpack', 'playlists', 'playlists_tracks', 'track_plays', 'recently_played_tracks'];

/**
 * Triggers persist in the database file, so changes are logged even across restarts until the migration drops
 * them. Installed before the first row is copied, so nothing written during the copy is missed.
 */
export async function install_change_log(legacy: RawSQLiteConnection) {
	await legacy.execute_statement(`CREATE TABLE IF NOT EXISTS ${LOG_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, tbl TEXT NOT NULL, key TEXT NOT NULL)`);
	for (const table of LEGACY_TABLE_ORDER) {
		const key = LEGACY_TABLES[table].key;
		const as = (row: 'NEW' | 'OLD') => key.replace(/\b(uid|uuid|track_uid|id)\b/g, `${row}.$1`);
		await legacy.execute_statement(`CREATE TRIGGER IF NOT EXISTS __v2_${table}_ins AFTER INSERT ON ${table} BEGIN INSERT INTO ${LOG_TABLE} (tbl, key) VALUES ('${table}', ${as('NEW')}); END`);
		await legacy.execute_statement(`CREATE TRIGGER IF NOT EXISTS __v2_${table}_upd AFTER UPDATE ON ${table} BEGIN INSERT INTO ${LOG_TABLE} (tbl, key) VALUES ('${table}', ${as('NEW')}); INSERT INTO ${LOG_TABLE} (tbl, key) SELECT '${table}', ${as('OLD')} WHERE ${as('OLD')} IS NOT ${as('NEW')}; END`);
		await legacy.execute_statement(`CREATE TRIGGER IF NOT EXISTS __v2_${table}_del AFTER DELETE ON ${table} BEGIN INSERT INTO ${LOG_TABLE} (tbl, key) VALUES ('${table}', ${as('OLD')}); END`);
	}
}

export async function remove_change_log(legacy: RawSQLiteConnection) {
	for (const table of LEGACY_TABLE_ORDER) {
		for (const suffix of ['ins', 'upd', 'del']) await legacy.execute_statement(`DROP TRIGGER IF EXISTS __v2_${table}_${suffix}`);
	}
	await legacy.execute_statement(`DROP TABLE IF EXISTS ${LOG_TABLE}`);
}

export interface LogEntry { id: number; tbl: LegacyTable; key: string }

export async function read_log(legacy: RawSQLiteConnection, limit: number): Promise<LogEntry[]> {
	return await legacy.execute_async(`SELECT id, tbl, key FROM ${LOG_TABLE} ORDER BY id LIMIT ?`, [limit]) as LogEntry[];
}
export async function trim_log(legacy: RawSQLiteConnection, through_id: number) {
	await legacy.execute_statement(`DELETE FROM ${LOG_TABLE} WHERE id <= ?`, [through_id]);
}

export async function read_rows_after(legacy: RawSQLiteConnection, table: LegacyTable, after_id: number, limit: number): Promise<SQLiteRow[]> {
	return legacy.execute_async(`SELECT * FROM ${table} WHERE id > ? ORDER BY id LIMIT ?`, [after_id, limit]);
}

export async function read_rows_by_key(legacy: RawSQLiteConnection, table: LegacyTable, keys: readonly string[]): Promise<SQLiteRow[]> {
	if (keys.length === 0) return [];
	const placeholders = keys.map(() => '?').join(', ');
	return legacy.execute_async(`SELECT * FROM ${table} WHERE ${LEGACY_TABLES[table].key} IN (${placeholders}) ORDER BY id`, [...keys]);
}

export async function recorded_plays(legacy: RawSQLiteConnection, track_uids: readonly string[]): Promise<Map<string, number>> {
	if (track_uids.length === 0) return new Map();
	const placeholders = track_uids.map(() => '?').join(', ');
	const rows = await legacy.execute_async(
		`SELECT track_uid, SUM(MAX(count, 1)) AS plays FROM track_plays WHERE deleted = 0 AND track_uid IN (${placeholders}) GROUP BY track_uid`,
		[...track_uids]
	);
	return new Map(rows.map(row => [row.track_uid as string, Number(row.plays) || 0]));
}

export async function table_exists(legacy: RawSQLiteConnection, table: string): Promise<boolean> {
	const rows = await legacy.execute_async('SELECT name FROM sqlite_master WHERE type = \'table\' AND name = ?', [table]);
	return rows.length > 0;
}

function json<T>(value: unknown, fallback: T): T {
	if (typeof value !== 'string') return (value ?? fallback) as T;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}
const bool = (value: unknown) => value === 1 || value === true || value === '1';

export interface LegacyTrackRow { id: number; track: Track; deleted: boolean; created_at: number; modified_at: number }

/** A tracks/backpack/recently_played_tracks row as the Track it stored */
export function parse_track_row(row: SQLiteRow): LegacyTrackRow {
	const track: Track = {
		uid: row.uid,
		title: row.title ?? '',
		alt_title: row.alt_title ?? '',
		artists: json<NamedUUID[]>(row.artists, []),
		duration: Number(row.duration) || 0,
		prods: producers_from_names(row.prods ?? undefined) ?? [],
		explicit: row.explicit ?? 'NONE',
		unreleased: bool(row.unreleased),
		album: json<NamedUUID>(row.album, { name: '', uri: null }),
		imported_id: row.imported_id ?? '',
		illusi_id: '',
		youtube_id: row.youtube_id ?? '',
		soundcloud_id: Number(row.soundcloud_id) || 0,
		soundcloud_permalink: row.soundcloud_permalink ?? '',
		spotify_id: row.spotify_id ?? '',
		amazonmusic_id: row.amazonmusic_id ?? '',
		applemusic_id: row.applemusic_id ?? '',
		bandlab_id: row.bandlab_id ?? '',
		audiomack_id: row.audiomack_id ?? '',
		deezer_id: row.deezer_id ?? '',
		pandora_id: row.pandora_id ?? '',
		tidal_id: row.tidal_id ?? '',
		artwork_url: row.artwork_url ?? '',
		thumbnail_uri: row.thumbnail_uri ?? '',
		media_uri: row.media_uri ?? '',
		lyrics_uri: row.lyrics_uri ?? '',
		synced_lyrics_uri: row.synced_lyrics_uri ?? '',
		meta: json<TrackMetaData>(row.meta, { plays: 0, added_date: new Date(Number(row.created_at) || 0).toISOString(), last_played_date: new Date(0).toISOString() } as TrackMetaData)
	};
	const analysis = TrackAnalysis.from_values(row);
	if (analysis !== undefined) track.analysis = analysis;
	return { id: Number(row.id), track, deleted: bool(row.deleted), created_at: Number(row.created_at) || 0, modified_at: Number(row.modified_at) || 0 };
}

export interface LegacyPlaylistRow {
	id: number;
	uuid: string;
	title: string;
	description: string;
	pinned: boolean;
	archived: boolean;
	thumbnail_uri: string;
	artwork_path: string | null;
	sort: SortType;
	public: boolean;
	inherited_playlists: InheritedPlaylist[];
	inherited_searchs: InheritedSearch[];
	date: string;
	deleted: boolean;
	created_at: number;
	modified_at: number;
}
export function parse_playlist_row(row: SQLiteRow): LegacyPlaylistRow {
	return {
		id: Number(row.id),
		uuid: row.uuid,
		title: row.title ?? '',
		description: row.description ?? '',
		pinned: bool(row.pinned),
		archived: bool(row.archived),
		thumbnail_uri: row.thumbnail_uri ?? '',
		artwork_path: row.artwork_path ?? null,
		sort: row.sort ?? 'OLDEST',
		public: bool(row.public),
		inherited_playlists: json<InheritedPlaylist[]>(row.inherited_playlists, []),
		inherited_searchs: json<InheritedSearch[]>(row.inherited_searchs, []),
		date: row.date ?? new Date().toISOString(),
		deleted: bool(row.deleted),
		created_at: Number(row.created_at) || 0,
		modified_at: Number(row.modified_at) || 0
	};
}

export interface LegacyPlaylistTrackRow { id: number; uuid: string; track_uid: string; deleted: boolean; created_at: number; modified_at: number }
export function parse_playlist_track_row(row: SQLiteRow): LegacyPlaylistTrackRow {
	return { id: Number(row.id), uuid: row.uuid, track_uid: row.track_uid, deleted: bool(row.deleted), created_at: Number(row.created_at) || 0, modified_at: Number(row.modified_at) || 0 };
}

export interface LegacyPlayRow { id: number; track_uid: string; count: number; deleted: boolean; created_at: number }
export function parse_play_row(row: SQLiteRow): LegacyPlayRow {
	return { id: Number(row.id), track_uid: row.track_uid, count: Number(row.count) || 0, deleted: bool(row.deleted), created_at: Number(row.created_at) || 0 };
}
