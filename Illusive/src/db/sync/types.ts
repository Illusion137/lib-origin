import type { Database } from '../database.types';
import type { SQLTrack, SQLPlaylist, SQLPlaylistTrack, SQLNewRelease } from '../schema';

// ---------------------------------------------------------------------------
// Local table names — superset of syncable tables. Used by ChangeTracker
// call sites so existing sql_X.ts files don't need to change.
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

export type RemoteTableName = keyof Database['public']['Tables'];

// ---------------------------------------------------------------------------
// Typed aliases for local ↔ remote data shapes
// ---------------------------------------------------------------------------
export type LocalTrack         = SQLTrack;
export type LocalPlaylist      = SQLPlaylist;
export type LocalPlaylistTrack = SQLPlaylistTrack;
export type LocalNewRelease    = SQLNewRelease;

export type RemoteTrack            = Database['public']['Tables']['tracks']['Row'];
export type RemoteTrackInsert      = Database['public']['Tables']['tracks']['Insert'];
export type RemoteUTrack           = Database['public']['Tables']['utracks']['Row'];
export type RemoteUTrackInsert     = Database['public']['Tables']['utracks']['Insert'];
export type RemotePlaylist         = Database['public']['Tables']['playlists']['Row'];
export type RemotePlaylistInsert   = Database['public']['Tables']['playlists']['Insert'];
export type RemotePlaylistTrack       = Database['public']['Tables']['playlists_tracks']['Row'];
export type RemotePlaylistTrackInsert = Database['public']['Tables']['playlists_tracks']['Insert'];
export type RemoteNewRelease       = Database['public']['Tables']['new_releases']['Row'];
export type RemoteNewReleaseInsert = Database['public']['Tables']['new_releases']['Insert'];

// ---------------------------------------------------------------------------
// Joined row returned when pulling tracks (tracks JOIN utracks)
// ---------------------------------------------------------------------------
export type RemoteTrackWithUserData = RemoteTrack & Pick<RemoteUTrack, 'plays' | 'meta' | 'deleted'>;
