/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      playlists: {
        Row: {
          archived: boolean
          created_at: string
          deleted: boolean
          description: string
          id: number
          inherited_playlists: Json
          inherited_searchs: Json
          modified_at: string
          pinned: boolean
          public: boolean
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
          modified_at?: string
          pinned?: boolean
          public?: boolean
          sort?: string
          title?: string
          user_uid?: string | null
          uuid?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          deleted?: boolean
          description?: string
          id?: number
          inherited_playlists?: Json
          inherited_searchs?: Json
          modified_at?: string
          pinned?: boolean
          public?: boolean
          sort?: string
          title?: string
          user_uid?: string | null
          uuid?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          artist: Json
          created_at: string
          date: string
          explicit: boolean
          id: number
          modified_at: string
          title: Json
          track_uuid: string | null
          type: string
        }
        Insert: {
          artist?: Json
          created_at?: string
          date?: string
          explicit?: boolean
          id?: number
          modified_at?: string
          title?: Json
          track_uuid?: string | null
          type?: string
        }
        Update: {
          artist?: Json
          created_at?: string
          date?: string
          explicit?: boolean
          id?: number
          modified_at?: string
          title?: Json
          track_uuid?: string | null
          type?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          album: Json
          artists: Json
          artwork_url: string
          created_at: string
          duration: number
          explicit: boolean
          modified_at: string
          plays: number
          prods: Json
          service_uris: Json
          tags: Json
          title: string
          uuid: string
        }
        Insert: {
          album?: Json
          artists?: Json
          artwork_url?: string
          created_at?: string
          duration?: number
          explicit?: boolean
          modified_at?: string
          plays?: number
          prods?: Json
          service_uris?: Json
          tags?: Json
          title?: string
          uuid?: string
        }
        Update: {
          album?: Json
          artists?: Json
          artwork_url?: string
          created_at?: string
          duration?: number
          explicit?: boolean
          modified_at?: string
          plays?: number
          prods?: Json
          service_uris?: Json
          tags?: Json
          title?: string
          uuid?: string
        }
        Relationships: []
      }
      uptracks: {
        Row: {
          created_at: string
          deleted: boolean
          id: number
          modified_at: string
          playlist_uuid: string
          track_uuid: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          playlist_uuid: string
          track_uuid: string
        }
        Update: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          playlist_uuid?: string
          track_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "uptracks_track_uuid_fkey"
            columns: ["track_uuid"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["uuid"]
          },
        ]
      }
      utracks: {
        Row: {
          created_at: string
          deleted: boolean
          id: number
          modified_at: string
          track_uuid: string
          user_uid: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          track_uuid: string
          user_uid?: string
        }
        Update: {
          created_at?: string
          deleted?: boolean
          id?: number
          modified_at?: string
          track_uuid?: string
          user_uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "utracks_track_uuid_fkey"
            columns: ["track_uuid"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["uuid"]
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
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