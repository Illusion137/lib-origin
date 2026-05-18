/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { CompactPlaylistAlbumType, CompactPlaylistType, ExplicitMode, ISOString } from "@illusive/types";

export type Json = any;

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      new_releases: {
        Row: {
          album_type: CompactPlaylistAlbumType
          artist: Json
          artwork_thumbnails: Json
          artwork_url: string
          created_at: string
          date: ISOString
          deleted: boolean
          explicit: ExplicitMode
          id: number
          modified_at: string
          song_track: Json | null
          title: Json
          type: CompactPlaylistType
          user_uid: string | null
        }
        Insert: {
          album_type?: string
          artist?: Json
          artwork_thumbnails?: Json
          artwork_url?: string
          created_at?: string
          date?: string
          deleted?: boolean
          explicit?: string
          id?: number
          modified_at?: string
          song_track?: Json | null
          title?: Json
          type?: string
          user_uid?: string | null
        }
        Update: {
          album_type?: string
          artist?: Json
          artwork_thumbnails?: Json
          artwork_url?: string
          created_at?: string
          date?: string
          deleted?: boolean
          explicit?: string
          id?: number
          modified_at?: string
          song_track?: Json | null
          title?: Json
          type?: string
          user_uid?: string | null
        }
        Relationships: []
      }
      playlists: {
        Row: {
          archived: boolean
          created_at: string
          deleted: boolean
          description: string
          id: number
          inherited_playlists: Json
          inherited_searchs: Json
          linked_playlists: Json
          modified_at: string
          pinned: boolean
          public: boolean
          public_uuid: string
          sort: string
          title: string
          user_uid: string | null
          uuid: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          deleted?: boolean
          description?: string
          id?: number
          inherited_playlists?: Json
          inherited_searchs?: Json
          linked_playlists?: Json
          modified_at?: string
          pinned?: boolean
          public?: boolean
          public_uuid?: string
          sort?: string
          title?: string
          user_uid?: string | null
          uuid: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          deleted?: boolean
          description?: string
          id?: number
          inherited_playlists?: Json
          inherited_searchs?: Json
          linked_playlists?: Json
          modified_at?: string
          pinned?: boolean
          public?: boolean
          public_uuid?: string
          sort?: string
          title?: string
          user_uid?: string | null
          uuid?: string
        }
        Relationships: []
      }
      playlists_tracks: {
        Row: {
          created_at: string
          deleted: boolean
          id: number
          modified_at: string
          track_uid: string
          uuid: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          track_uid: string
          uuid: string
        }
        Update: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          track_uid?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_tracks_track_uid_fkey"
            columns: ["track_uid"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["uid"]
          },
        ]
      }
      tracks: {
        Row: {
          acousticness: number
          album: Json
          alt_title: string
          amazonmusic_id: string
          applemusic_id: string
          artists: Json
          artwork_url: string
          audiomack_id: string
          bandlab_id: string
          created_at: string
          danceability: number
          deezer_id: string
          deleted: boolean
          duration: number
          energy: number
          explicit: ExplicitMode
          genre: string
          illusi_id: string
          imported_id: string
          instrumentalness: number
          liveness: number
          modified_at: string
          pandora_id: string
          prods: string
          soundcloud_id: number
          soundcloud_permalink: string
          speechiness: number
          spotify_id: string
          tags: Json
          tidal_id: string
          title: string
          uid: string
          unreleased: boolean
          valence: number
          youtube_id: string
          youtubemusic_id: string
        }
        Insert: {
          acousticness?: number
          album?: Json
          alt_title?: string
          amazonmusic_id?: string
          applemusic_id?: string
          artists?: Json
          artwork_url?: string
          audiomack_id?: string
          bandlab_id?: string
          created_at?: string
          danceability?: number
          deezer_id?: string
          deleted?: boolean
          duration?: number
          energy?: number
          explicit?: string
          genre?: string
          illusi_id?: string
          imported_id?: string
          instrumentalness?: number
          liveness?: number
          modified_at?: string
          pandora_id?: string
          prods?: string
          soundcloud_id?: number
          soundcloud_permalink?: string
          speechiness?: number
          spotify_id?: string
          tags?: Json
          tidal_id?: string
          title?: string
          uid: string
          unreleased?: boolean
          valence?: number
          youtube_id?: string
          youtubemusic_id?: string
        }
        Update: {
          acousticness?: number
          album?: Json
          alt_title?: string
          amazonmusic_id?: string
          applemusic_id?: string
          artists?: Json
          artwork_url?: string
          audiomack_id?: string
          bandlab_id?: string
          created_at?: string
          danceability?: number
          deezer_id?: string
          deleted?: boolean
          duration?: number
          energy?: number
          explicit?: string
          genre?: string
          illusi_id?: string
          imported_id?: string
          instrumentalness?: number
          liveness?: number
          modified_at?: string
          pandora_id?: string
          prods?: string
          soundcloud_id?: number
          soundcloud_permalink?: string
          speechiness?: number
          spotify_id?: string
          tags?: Json
          tidal_id?: string
          title?: string
          uid?: string
          unreleased?: boolean
          valence?: number
          youtube_id?: string
          youtubemusic_id?: string
        }
        Relationships: []
      }
      utracks: {
        Row: {
          created_at: string
          deleted: boolean
          id: number
          meta: Json
          modified_at: string
          plays: number
          track_uid: string
          user_uid: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          id?: number
          meta?: Json
          modified_at?: string
          plays?: number
          track_uid: string
          user_uid: string
        }
        Update: {
          created_at?: string
          deleted?: boolean
          id?: number
          meta?: Json
          modified_at?: string
          plays?: number
          track_uid?: string
          user_uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "utracks_track_uid_fkey"
            columns: ["track_uid"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["uid"]
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      resolve_or_insert_tracks: {
        Args: { tracks_json: Json }
        Returns: {
          canonical_uid: string
          local_uid: string
        }[]
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
