import type { CompactPlaylistAlbumType, CompactPlaylistType, ExplicitMode, IllusiveThumbnail, InheritedPlaylist, InheritedSearch, ISOString, LinkedPlaylist, NamedUUID, Track, TrackMetaData } from '@illusive/types';

// ---------------------------------------------------------------------------
// Supabase Database type definitions
// Mirrors the schema in supabase/migrations/20260324000000_init.sql
// ---------------------------------------------------------------------------

export interface Database {
    __InternalSupabase: {
        PostgrestVersion: '13.0.5'
    }
    public: {
        Tables: {

            // ----------------------------------------------------------------
            // tracks — global enrichment pool (shared across all users)
            // ----------------------------------------------------------------
            tracks: {
                Row: {
                    uid: string
                    title: string
                    alt_title: string
                    artists: NamedUUID[]
                    duration: number
                    prods: string
                    genre: string
                    tags: string[]
                    explicit: ExplicitMode
                    unreleased: boolean
                    album: NamedUUID
                    illusi_id: string
                    imported_id: string
                    youtube_id: string
                    youtubemusic_id: string
                    soundcloud_id: number
                    soundcloud_permalink: string
                    spotify_id: string
                    amazonmusic_id: string
                    applemusic_id: string
                    bandlab_id: string
                    artwork_url: string
                    deleted: boolean
                    created_at: string
                    modified_at: string
                }
                Insert: {
                    uid: string
                    title?: string
                    alt_title?: string
                    artists?: NamedUUID[]
                    duration?: number
                    prods?: string
                    genre?: string
                    tags?: string[]
                    explicit?: ExplicitMode
                    unreleased?: boolean
                    album?: NamedUUID
                    illusi_id?: string
                    imported_id?: string
                    youtube_id?: string
                    youtubemusic_id?: string
                    soundcloud_id?: number
                    soundcloud_permalink?: string
                    spotify_id?: string
                    amazonmusic_id?: string
                    applemusic_id?: string
                    bandlab_id?: string
                    artwork_url?: string
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Update: {
                    uid?: string
                    title?: string
                    alt_title?: string
                    artists?: NamedUUID[]
                    duration?: number
                    prods?: string
                    genre?: string
                    tags?: string[]
                    explicit?: ExplicitMode
                    unreleased?: boolean
                    album?: NamedUUID
                    illusi_id?: string
                    imported_id?: string
                    youtube_id?: string
                    youtubemusic_id?: string
                    soundcloud_id?: number
                    soundcloud_permalink?: string
                    spotify_id?: string
                    amazonmusic_id?: string
                    applemusic_id?: string
                    bandlab_id?: string
                    artwork_url?: string
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Relationships: []
            }

            // ----------------------------------------------------------------
            // utracks — per-user track ownership + personal data
            // ----------------------------------------------------------------
            utracks: {
                Row: {
                    id: number
                    user_uid: string
                    track_uid: string
                    plays: number
                    meta: TrackMetaData
                    deleted: boolean
                    created_at: string
                    modified_at: string
                }
                Insert: {
                    id?: number
                    user_uid: string
                    track_uid: string
                    plays?: number
                    meta?: TrackMetaData
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Update: {
                    id?: number
                    user_uid?: string
                    track_uid?: string
                    plays?: number
                    meta?: TrackMetaData
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'utracks_track_uid_fkey'
                        columns: ['track_uid']
                        isOneToOne: false
                        referencedRelation: 'tracks'
                        referencedColumns: ['uid']
                    }
                ]
            }

            // ----------------------------------------------------------------
            // playlists — per-user
            // ----------------------------------------------------------------
            playlists: {
                Row: {
                    id: number
                    uuid: string
                    user_uid: string | null
                    title: string
                    description: string
                    pinned: boolean
                    archived: boolean
                    sort: string
                    public: boolean
                    public_uuid: string
                    inherited_playlists: InheritedPlaylist[]
                    inherited_searchs: InheritedSearch[]
                    linked_playlists: LinkedPlaylist[]
                    deleted: boolean
                    created_at: string
                    modified_at: string
                }
                Insert: {
                    id?: number
                    uuid: string
                    user_uid?: string | null
                    title?: string
                    description?: string
                    pinned?: boolean
                    archived?: boolean
                    sort?: string
                    public?: boolean
                    public_uuid?: string
                    inherited_playlists?: InheritedPlaylist[]
                    inherited_searchs?: InheritedSearch[]
                    linked_playlists?: LinkedPlaylist[]
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Update: {
                    id?: number
                    uuid?: string
                    user_uid?: string | null
                    title?: string
                    description?: string
                    pinned?: boolean
                    archived?: boolean
                    sort?: string
                    public?: boolean
                    public_uuid?: string
                    inherited_playlists?: InheritedPlaylist[]
                    inherited_searchs?: InheritedSearch[]
                    linked_playlists?: LinkedPlaylist[]
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Relationships: []
            }

            // ----------------------------------------------------------------
            // playlists_tracks — per-user junction
            // ----------------------------------------------------------------
            playlists_tracks: {
                Row: {
                    id: number
                    uuid: string
                    track_uid: string
                    deleted: boolean
                    created_at: string
                    modified_at: string
                }
                Insert: {
                    id?: number
                    uuid: string
                    track_uid: string
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Update: {
                    id?: number
                    uuid?: string
                    track_uid?: string
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'playlists_tracks_track_uid_fkey'
                        columns: ['track_uid']
                        isOneToOne: false
                        referencedRelation: 'tracks'
                        referencedColumns: ['uid']
                    }
                ]
            }

            // ----------------------------------------------------------------
            // new_releases — per-user
            // ----------------------------------------------------------------
            new_releases: {
                Row: {
                    id: number
                    user_uid: string | null
                    title: NamedUUID
                    artist: NamedUUID[]
                    artwork_url: string
                    artwork_thumbnails: IllusiveThumbnail[]
                    explicit: ExplicitMode
                    album_type: CompactPlaylistAlbumType
                    type: CompactPlaylistType
                    date: ISOString
                    song_track: Track | null
                    deleted: boolean
                    created_at: string
                    modified_at: string
                }
                Insert: {
                    id?: number
                    user_uid?: string | null
                    title?: NamedUUID
                    artist?: NamedUUID[]
                    artwork_url?: string
                    artwork_thumbnails?: IllusiveThumbnail[]
                    explicit?: ExplicitMode
                    album_type?: CompactPlaylistAlbumType
                    type?: CompactPlaylistType
                    date?: ISOString
                    song_track?: Track | null
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Update: {
                    id?: number
                    user_uid?: string | null
                    title?: NamedUUID
                    artist?: NamedUUID[]
                    artwork_url?: string
                    artwork_thumbnails?: IllusiveThumbnail[]
                    explicit?: ExplicitMode
                    album_type?: CompactPlaylistAlbumType
                    type?: CompactPlaylistType
                    date?: ISOString
                    song_track?: Track | null
                    deleted?: boolean
                    created_at?: string
                    modified_at?: string
                }
                Relationships: []
            }
        }
        Views: Record<never, never>
        Functions: Record<never, never>
        Enums: Record<never, never>
        CompositeTypes: Record<never, never>
    }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
          ? R
          : never
      : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I
        }
          ? I
          : never
      : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U
        }
          ? U
          : never
      : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
