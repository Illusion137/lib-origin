import { gen_uuid, generate_new_uid } from '@common/utils/util';
import type { CompactPlaylistAlbumType, CompactPlaylistType, ExplicitMode, IllusiveThumbnail, InheritedPlaylist, InheritedSearch, ISOString, LinkedPlaylist, NamedUUID, SortType, Track, TrackMetaData } from "@illusive/types";
import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const tracks_config = {
    id: int().primaryKey({ autoIncrement: true }),
    uid: text().unique().notNull().$defaultFn(() => generate_new_uid("")),
    title: text().notNull().default(""),
    alt_title: text().notNull().default(""),
    artists: text({mode: 'json'}).notNull().$type<NamedUUID[]>().default([]),
    duration: int().notNull().default(0),
    prods: text().notNull().default(""),
    genre: text().notNull().default(""),
    tags: text({mode: 'json'}).notNull().$type<string[]>().default([]),
    explicit: text().notNull().$type<ExplicitMode>().default("NONE"),
    unreleased: int({ mode: 'boolean' }).notNull().default(false),
    album: text({mode: 'json'}).notNull().$type<NamedUUID>().default({name: "", uri: null}),
    plays: int().notNull().default(0),
    imported_id: text().notNull().default(""),
    illusi_id: text().notNull().$defaultFn(gen_uuid),
    youtube_id: text().notNull().default(""),
    youtubemusic_id: text().notNull().default(""),
    soundcloud_id: int().notNull().default(0),
    soundcloud_permalink: text().notNull().default(""),
    spotify_id: text().notNull().default(""),
    amazonmusic_id: text().notNull().default(""),
    applemusic_id: text().notNull().default(""),
    artwork_url: text().notNull().default(""),
    thumbnail_uri: text().notNull().default(""),
    media_uri: text().notNull().default(""),
    lyrics_uri: text().notNull().default(""),
    meta: text({mode: 'json'}).notNull().$type<TrackMetaData>().default({
        added_date: new Date().toISOString() as ISOString,
        last_played_date: new Date().toISOString() as ISOString,
        plays: 0,
    }),
} as const satisfies ReturnType<Parameters<typeof sqliteTable>[1]>;

const playlists_config = {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text().unique().notNull().$defaultFn(gen_uuid),
    title: text().notNull().default(""),
    description: text().notNull().default(""),
    pinned: int({mode: 'boolean'}).notNull().default(false),
    archived: int({mode: 'boolean'}).notNull().default(false),
    thumbnail_uri: text().notNull().default(""),
    sort: text().notNull().$type<SortType>().default("OLDEST"),
    public: text().notNull().$type<boolean>().default(false),
    public_uuid: text().notNull().$defaultFn(gen_uuid),
    inherited_playlists: text({mode: 'json'}).notNull().$type<InheritedPlaylist[]>().default([]),
    inherited_searchs: text({mode: 'json'}).notNull().$type<InheritedSearch[]>().default([]),
    linked_playlists: text({mode: 'json'}).notNull().$type<LinkedPlaylist[]>().default([]),
    date: text().notNull().$defaultFn(() => new Date().toISOString()),
} as const satisfies ReturnType<Parameters<typeof sqliteTable>[1]>;

const playlists_tracks_config = {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text().notNull(),
    track_uid: text().notNull()
} as const satisfies ReturnType<Parameters<typeof sqliteTable>[1]>;

const new_releases_config = {
    id: int().primaryKey({ autoIncrement: true }),
    title: text({mode: 'json'}).unique().notNull().$type<NamedUUID>().default({name: '', uri: null}),
    artist: text({mode: 'json'}).notNull().$type<NamedUUID[]>().default([]),
    artwork_url: text().notNull().default(""),
    artwork_thumbnails: text({mode: 'json'}).notNull().$type<IllusiveThumbnail[]>().default([]),
    explicit: text().notNull().$type<ExplicitMode>().default("NONE"),
    album_type: text().notNull().$type<CompactPlaylistAlbumType>().default("SINGLE"),
    type: text().notNull().$type<CompactPlaylistType>().default("ALBUM"),
    date: text().notNull().$type<ISOString>().default(new Date(0).toISOString() as ISOString),
    song_track: text({mode: 'json'}).$type<Track>(),
    Timestamp: int().notNull().$defaultFn(() => new Date().getTime())
} as const satisfies ReturnType<Parameters<typeof sqliteTable>[1]>;

const artists_config = {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    uri: text().unique().notNull(),
    artwork_url: text().notNull()
} as const satisfies ReturnType<Parameters<typeof sqliteTable>[1]>;

export const tracks_table                   = sqliteTable("tracks", tracks_config, (table) => ([index("uuid_idx").on(table.uid)]));
export const tracks_deleted_table           = sqliteTable("tracks_deleted", tracks_config);
export const recently_played_tracks_table   = sqliteTable("recently_played_tracks", tracks_config, (table) => ([index("uuid_idx").on(table.uid)]));
export const backpack_table                 = sqliteTable("backpack", tracks_config, (table) => ([index("uuid_idx").on(table.uid)]));
export const backpack_deleted_table         = sqliteTable("backpack_deleted", tracks_config);
export const playlists_table                = sqliteTable("playlists", playlists_config, (table) => ([index("uuid_idx").on(table.uuid)]));
export const playlists_deleted_table        = sqliteTable("playlists_deleted", playlists_config);
export const playlists_tracks_table         = sqliteTable("playlists_tracks", playlists_tracks_config);
export const playlists_tracks_deleted_table = sqliteTable("playlists_tracks_deleted", playlists_tracks_config);
export const new_releases_table             = sqliteTable("new_releases", new_releases_config);
export const artists_table                  = sqliteTable("artists", artists_config);