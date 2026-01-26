
import type { Database } from "../database.types";
import type { SQLTrack, SQLPlaylist, SQLPlaylistTrack, SQLNewRelease } from '../schema';

// Define local table names as a string literal union
export type LocalTableName = 'tracks' | 'playlists' | 'playlists_tracks' | 'artists' | 'new_releases' | 'backpack' | 'recently_played_tracks' | 'track_plays';

// Remote table names from Supabase schema
export type RemoteTableName = keyof Database['public']['Tables'];

// A mapping from local table names to their corresponding remote names
export const LOCAL_TO_REMOTE_TABLE_MAP: Record<LocalTableName, RemoteTableName | null> = {
    tracks: 'tracks',
    playlists: 'playlists',
    playlists_tracks: 'uptracks',
    new_releases: 'releases',
    artists: null, // No direct mapping for artists
    backpack: null,
    recently_played_tracks: null,
    track_plays: null
};

// A mapping from local table names to their Drizzle schema object
// This is not used in this file but good for reference in other files.
// import { tracks_table, playlists_table, playlists_tracks_table, artists_table, new_releases_table } from '../schema';
// export const LOCAL_TABLE_SCHEMA_MAP = {
//     'tracks': tracks_table,
//     'playlists': playlists_table,
//     'playlists_tracks': playlists_tracks_table,
//     'artists': artists_table,
//     'new_releases': new_releases_table
// };

export type ChangeOp = 'insert' | 'update' | 'delete';

export interface Change {
    table: LocalTableName;
    record_id: string;
    operation: ChangeOp;
    data: any;
    change_id: number;
}

export interface CompressedChange {
    table: LocalTableName;
    record_id: string;
    operation: ChangeOp;
    data: any; // The compressed/merged data
    change_ids: number[];
}

// More specific types for data transformations
export type LocalTrack = SQLTrack;
export type RemoteTrack = Database['public']['Tables']['tracks']['Row'];

export type LocalPlaylist = SQLPlaylist;
export type RemotePlaylist = Database['public']['Tables']['playlists']['Row'];

export type LocalPlaylistTrack = SQLPlaylistTrack;
export type RemotePlaylistTrack = Database['public']['Tables']['uptracks']['Row'];

export type LocalNewRelease = SQLNewRelease;
export type RemoteNewRelease = Database['public']['Tables']['releases']['Row'];
