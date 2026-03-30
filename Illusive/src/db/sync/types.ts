import type { Database } from '../database.types';
import type { SQLTrack, SQLPlaylist, SQLPlaylistTrack, SQLNewRelease } from '../schema';

// ---------------------------------------------------------------------------
// Local table names
// ---------------------------------------------------------------------------
export type LocalTableName =
    | 'tracks'
    | 'playlists'
    | 'playlists_tracks'
    | 'artists'
    | 'new_releases'
    | 'backpack'
    | 'recently_played_tracks'
    | 'track_plays';

// ---------------------------------------------------------------------------
// Remote table names derived from the Database type
// ---------------------------------------------------------------------------
export type RemoteTableName = keyof Database['public']['Tables'];

// ---------------------------------------------------------------------------
// Mapping: local table → remote table (null = local-only, not synced)
// Note: tracks also writes to utracks as a dual-write special case — this is
// handled in SyncEngine.push_track_changes(), not via the map.
// ---------------------------------------------------------------------------
export const LOCAL_TO_REMOTE_TABLE_MAP: Record<LocalTableName, RemoteTableName | null> = {
    tracks:                 'tracks',
    playlists:              'playlists',
    playlists_tracks:       'playlists_tracks',
    new_releases:           'new_releases',
    artists:                null,
    backpack:               null,
    recently_played_tracks: null,
    track_plays:            null,
};

// ---------------------------------------------------------------------------
// Change types
// ---------------------------------------------------------------------------
export type ChangeOp = 'insert' | 'update' | 'delete';

export interface Change {
    table:      LocalTableName;
    record_id:  string;
    operation:  ChangeOp;
    data:       unknown;
    change_id:  number;
}

export interface CompressedChange {
    table:      LocalTableName;
    record_id:  string;
    operation:  ChangeOp;
    data:       unknown;
    change_ids: number[];
}

// ---------------------------------------------------------------------------
// Typed aliases for local ↔ remote data shapes
// ---------------------------------------------------------------------------
export type LocalTrack        = SQLTrack;
export type LocalPlaylist     = SQLPlaylist;
export type LocalPlaylistTrack = SQLPlaylistTrack;
export type LocalNewRelease   = SQLNewRelease;

export type RemoteTrack           = Database['public']['Tables']['tracks']['Row'];
export type RemoteTrackInsert     = Database['public']['Tables']['tracks']['Insert'];
export type RemoteUTrack          = Database['public']['Tables']['utracks']['Row'];
export type RemoteUTrackInsert    = Database['public']['Tables']['utracks']['Insert'];
export type RemotePlaylist        = Database['public']['Tables']['playlists']['Row'];
export type RemotePlaylistInsert  = Database['public']['Tables']['playlists']['Insert'];
export type RemotePlaylistTrack        = Database['public']['Tables']['playlists_tracks']['Row'];
export type RemotePlaylistTrackInsert  = Database['public']['Tables']['playlists_tracks']['Insert'];
export type RemoteNewRelease       = Database['public']['Tables']['new_releases']['Row'];
export type RemoteNewReleaseInsert = Database['public']['Tables']['new_releases']['Insert'];

// ---------------------------------------------------------------------------
// Joined row returned when pulling tracks (tracks JOIN utracks)
// ---------------------------------------------------------------------------
export type RemoteTrackWithUserData = RemoteTrack & Pick<RemoteUTrack, 'plays' | 'meta' | 'deleted'>;
