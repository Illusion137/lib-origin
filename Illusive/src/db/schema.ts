import type { InheritanceMode, SortType as ApiSortType } from '@origin/illusi/types';
import type { TrackAnalysisData, TrackMetaData, TrackProducer } from '@illusive/types';
import { index, int, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Columns marked local are never synced.

const timestamps = {
	created_at: int().notNull().$defaultFn(() => Date.now()),
	modified_at: int().notNull().$defaultFn(() => Date.now())
};

/** User-owned rows: edited_at is the client edit time used for last-write-wins */
const user_owned = {
	deleted: int({ mode: 'boolean' }).notNull().default(false),
	edited_at: int().notNull().$defaultFn(() => Date.now()),
	...timestamps
};

/** Catalog data a user track carries along. The catalog itself lives on the server; this is the user's copy. */
export interface SnapshotNamed {
	name: string;
	uri?: string | null;
	uuid?: string;
	illusi_id?: string;
}
export interface SnapshotThumbnail { url: string; width: number | null; height: number | null }
export interface TrackSnapshot {
	title: string;
	/** In credit order */
	artists: SnapshotNamed[];
	album: SnapshotNamed | null;
	duration_ms: number | null;
	/** null: unknown, false: clean, true: explicit */
	explicit: boolean | null;
	imported: boolean;
	/** Server service id columns */
	service_ids: Record<string, string | number>;
	thumbnails: SnapshotThumbnail[];
	analysis: TrackAnalysisData | null;
	// Illusive-only
	alt_title: string;
	prods: TrackProducer[];
	unreleased: boolean;
	/** Service view count (Track.plays) */
	views: number;
	imported_id: string;
	/** TrackMetaData fields with no column of their own */
	meta_extra: Partial<TrackMetaData>;
}

/**
 * Every track the user has: the library (deleted = false), plus tracks only their playlists or plays point at
 * (deleted = true). `track` is a snapshot of the catalog data, written from server rows, or by Illusive for tracks
 * the server doesn't know yet. `uid` is the local key; tracks first seen through the server use their illusi_id.
 */
export const user_tracks_table = sqliteTable('user_tracks', {
	uid: text().primaryKey(),
	illusi_id: text(),
	track: text({ mode: 'json' }).notNull().$type<TrackSnapshot>(),
	/** The user's own title for the track */
	title: text(),
	downloaded_at: int(),
	start_at: int(),
	end_at: int(),
	/** Unavailable on its original service; reported to the server */
	backpacked: int({ mode: 'boolean' }).notNull().default(false),
	backpacked_at: int(),
	// Local
	media_uri: text().notNull().default(''),
	thumbnail_uri: text().notNull().default(''),
	lyrics_uri: text().notNull().default(''),
	synced_lyrics_uri: text().notNull().default(''),
	/** Caches of track_plays */
	plays: int().notNull().default(0),
	last_played_at: int(),
	...user_owned
}, table => [uniqueIndex('user_tracks_illusi_id_idx').on(table.illusi_id), index('user_tracks_deleted_idx').on(table.deleted)]);
export type UserTrackRow = typeof user_tracks_table.$inferSelect;
export type UserTrackInsert = typeof user_tracks_table.$inferInsert;

/** Device cache of artist profile pictures, keyed by the uri tracks reference artists by */
export const artist_artwork_table = sqliteTable('artist_artwork', {
	uri: text().primaryKey(),
	name: text().notNull(),
	artwork_url: text().notNull(),
	...timestamps
});

export const playlists_table = sqliteTable('playlists', {
	uuid: text().primaryKey(),
	title: text().notNull().default(''),
	description: text(),
	pinned: int({ mode: 'boolean' }).notNull().default(false),
	archived: int({ mode: 'boolean' }).notNull().default(false),
	public: int({ mode: 'boolean' }).notNull().default(false),
	sort_mode: text().notNull().$type<ApiSortType>().default('OLDEST'),
	/** The server artwork thumbnail_uri mirrors; null until a local change is uploaded or a server one downloaded */
	artwork_id: text(),
	/** Last-write-wins clock for the artwork (ms), separate from edited_at */
	artwork_edited_at: int(),
	// Local
	thumbnail_uri: text().notNull().default(''),
	artwork_path: text(),
	date: text().notNull().$defaultFn(() => new Date().toISOString()),
	...user_owned
});
export type PlaylistRow = typeof playlists_table.$inferSelect;

export const playlist_tracks_table = sqliteTable('playlist_tracks', {
	playlist_uuid: text().notNull(),
	track_uid: text().notNull(),
	/** Local: insertion order */
	position: int().notNull().default(0),
	...user_owned
}, table => [
	primaryKey({ columns: [table.playlist_uuid, table.track_uid] }),
	index('playlist_tracks_track_uid_idx').on(table.track_uid),
	index('playlist_tracks_order_idx').on(table.playlist_uuid, table.position)
]);
export type PlaylistTrackRow = typeof playlist_tracks_table.$inferSelect;

/** local_id is the push temp_id; id is the server's once assigned */
export const playlist_inherited_searches_table = sqliteTable('playlist_inherited_searches', {
	local_id: text().primaryKey(),
	id: int(),
	playlist_uuid: text().notNull(),
	query: text(),
	mode: text().$type<InheritanceMode>(),
	position: int().notNull().default(0),
	...user_owned
}, table => [uniqueIndex('playlist_inherited_searches_id_idx').on(table.id), index('playlist_inherited_searches_playlist_idx').on(table.playlist_uuid)]);
export type InheritedSearchRow = typeof playlist_inherited_searches_table.$inferSelect;

export const playlist_inherited_playlists_table = sqliteTable('playlist_inherited_playlists', {
	local_id: text().primaryKey(),
	id: int(),
	playlist_uuid: text().notNull(),
	ref_uuid: text().notNull(),
	mode: text().$type<InheritanceMode>(),
	position: int().notNull().default(0),
	...user_owned
}, table => [uniqueIndex('playlist_inherited_playlists_id_idx').on(table.id), index('playlist_inherited_playlists_playlist_idx').on(table.playlist_uuid)]);
export type InheritedPlaylistRow = typeof playlist_inherited_playlists_table.$inferSelect;

/** Append-only; client_id dedupes pushes */
export const track_plays_table = sqliteTable('track_plays', {
	client_id: text().primaryKey(),
	track_uid: text().notNull(),
	created_at: int().notNull().$defaultFn(() => Date.now())
}, table => [index('track_plays_track_uid_created_at_idx').on(table.track_uid, table.created_at), index('track_plays_created_at_idx').on(table.created_at)]);

/** Local only. Keeps a snapshot because played tracks aren't always in the library. */
export const recently_played_table = sqliteTable('recently_played', {
	uid: text().primaryKey(),
	track: text({ mode: 'json' }).notNull().$type<Record<string, unknown>>(),
	played_at: int().notNull().$defaultFn(() => Date.now())
}, table => [index('recently_played_played_at_idx').on(table.played_at)]);

export const OUTBOX_KINDS = [
	'user_track', 'playlist', 'playlist_track', 'inherited_search', 'inherited_playlist', 'track_play', 'recent_search', 'unavailable',
	'playlist_artwork', 'artwork_download'
] as const;
export type OutboxKind = typeof OUTBOX_KINDS[number];

/**
 * Rows waiting to be pushed, one per (kind, key). A push reads each row's current state; version guards against
 * dropping an entry that was touched again while its push was in flight.
 */
export const outbox_table = sqliteTable('outbox', {
	id: int().primaryKey({ autoIncrement: true }),
	kind: text().notNull().$type<OutboxKind>(),
	key: text().notNull(),
	payload: text({ mode: 'json' }).$type<Record<string, unknown>>(),
	version: int().notNull().default(1),
	attempts: int().notNull().default(0),
	last_error: text(),
	created_at: int().notNull().$defaultFn(() => Date.now())
}, table => [uniqueIndex('outbox_kind_key_idx').on(table.kind, table.key)]);
export type OutboxRow = typeof outbox_table.$inferSelect;

/**
 * Requests to the Illusi API that couldn't be sent (offline, or the server was unreachable), resent in order on
 * startup and when the network comes back. `op` names a RequestQueue operation and `args` are its arguments.
 */
export const request_queue_table = sqliteTable('request_queue', {
	id: int().primaryKey({ autoIncrement: true }),
	op: text().notNull(),
	args: text({ mode: 'json' }).notNull().$type<unknown[]>(),
	/** Dropped unsent after this (ms); requests answering an action expire with its token */
	expires_at: int(),
	attempts: int().notNull().default(0),
	last_error: text(),
	created_at: int().notNull().$defaultFn(() => Date.now())
});
export type RequestQueueRow = typeof request_queue_table.$inferSelect;

export const sync_state_table = sqliteTable('sync_state', {
	key: text().primaryKey(),
	value: text({ mode: 'json' }).$type<unknown>()
});

/** Progress of the 1810 -> v2 migration, written in the same transaction as each copied chunk */
export const migration_state_table = sqliteTable('migration_state', {
	key: text().primaryKey(),
	value: text({ mode: 'json' }).$type<unknown>()
});
