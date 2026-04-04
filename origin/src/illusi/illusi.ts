import type { PromiseResult } from '@common/types';
import { generror } from '@common/utils/error_util';
import { generate_new_uid } from '@common/utils/util';
import type { Database } from '@illusive/db/database.types';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL ?? '').replace(/\/$/, '');
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY ?? '';

export namespace Illusi {
    export interface Opts { jwt: string }

    export type RemotePlaylist = Pick<Database['public']['Tables']['playlists']['Row'], 'uuid' | 'title' | 'description' | 'created_at' | 'modified_at'>;
    export type RemoteTrack = Omit<Database['public']['Tables']['tracks']['Row'], 'deleted'>;
    export type RemoteNewRelease = Omit<Database['public']['Tables']['new_releases']['Row'], 'id' | 'user_uid' | 'deleted' | 'modified_at'>;
    export type RemoteTrackSuggestion = Pick<RemoteTrack,
        'uid' | 'title' | 'alt_title' | 'artists' | 'album' | 'artwork_url' | 'explicit' | 'duration'
    >;

    //RemoteTrackSuggestion
    function suggestion_track_new_uid(t: RemoteTrackSuggestion): RemoteTrackSuggestion {
        return { ...t, uid: generate_new_uid(t.title) };
    }
    function track_new_uid(t: RemoteTrack): RemoteTrack {
        return { ...t, uid: generate_new_uid(t.title) };
    }

    function supaerror_to_rozerr(error: { error: string }, args?: object) {
        return generror(error.error, "LOW", args);
    }

    function rest_headers(opts: Opts, extra?: Record<string, string>) {
        return {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${opts.jwt}`,
            'Content-Type': 'application/json',
            ...extra,
        };
    }

    async function rest<T>(path: string, opts: Opts, init?: RequestInit): Promise<T | { error: string }> {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
                ...init,
                headers: { ...rest_headers(opts), ...(init?.headers as Record<string, string> ?? {}) },
            });
            if (!res.ok) return { error: `${res.status} ${res.statusText}` };
            const text = await res.text();
            return text ? JSON.parse(text) as T : {} as T;
        } catch (e) {
            return { error: String(e) };
        }
    }

    export type RemotePlaylistWithTracks = RemotePlaylist & {
        tracks: RemoteTrack[];
    };

    export const PLAYLIST_LIMIT = 100;
    export async function get_playlist(
        uuid: string,
        opts: Opts,
    ): PromiseResult<RemotePlaylistWithTracks> {
        const [playlist_result, tracks_result] = await Promise.all([
            rest<RemotePlaylist[]>(
                `playlists?select=uuid,title,description,created_at,modified_at&uuid=eq.${encodeURIComponent(uuid)}&deleted=eq.false&limit=1`,
                opts,
            ),
            rest<{ track_uid: string }[]>(
                `playlists_tracks?select=track_uid,tracks!inner(imported_id)&uuid=eq.${encodeURIComponent(uuid)}&deleted=eq.false&order=created_at.asc&limit=${PLAYLIST_LIMIT}&offset=0&tracks.imported_id=eq.`,
                opts,
            ),
        ]);

        if ('error' in playlist_result) return supaerror_to_rozerr(playlist_result, { uuid, opts });
        if ('error' in tracks_result) return supaerror_to_rozerr(tracks_result, { uuid, opts });

        const playlist = playlist_result[0];
        if (!playlist) return generror("Playlist not found", "LOW", { uuid, opts });

        if (tracks_result.length === 0) return { ...playlist, tracks: [] };

        const uid_list = tracks_result.map(r => `"${r.track_uid}"`).join(',');
        const tracks = await rest<RemoteTrack[]>(
            `tracks?select=*&uid=in.(${uid_list})&deleted=eq.false`,
            opts,
        );

        if ('error' in tracks) return supaerror_to_rozerr(tracks, { uuid, opts });
        return { ...playlist, tracks: tracks.map(track_new_uid) };
    }

    export async function get_playlist_continuation(
        uuid: string,
        offset: number,
        opts: Opts,
    ): PromiseResult<RemoteTrack[]> {
        const tracks_result = await rest<{ track_uid: string }[]>(
            `playlists_tracks?select=track_uid,tracks!inner(imported_id)&uuid=eq.${encodeURIComponent(uuid)}&deleted=eq.false&order=created_at.asc&limit=${PLAYLIST_LIMIT}&tracks.imported_id=eq.&offset=${offset}`,
            opts,
        );

        if ('error' in tracks_result) return supaerror_to_rozerr(tracks_result, { uuid, offset, opts });
        if (tracks_result.length === 0) return [];

        const uid_list = tracks_result.map(r => `"${r.track_uid}"`).join(',');
        const tracks = await rest<RemoteTrack[]>(
            `tracks?select=*&uid=in.(${uid_list})&deleted=eq.false`,
            opts,
        );
        if ("error" in tracks) return supaerror_to_rozerr(tracks, { uuid, offset, opts })
        return tracks.map(track_new_uid);
    }

    export const SUGGESTION_LIMIT = 20;

    export async function get_search_suggestions(
        query: string,
        opts: Opts,
    ): PromiseResult<RemoteTrackSuggestion[]> {
        const q = encodeURIComponent(`%${query}%`);

        const result = await rest<RemoteTrackSuggestion[]>(
            `tracks?select=uid,title,alt_title,artists,album,artwork_url,explicit,duration` +
            `&or=(title.ilike.${q},alt_title.ilike.${q},artists.cs.${q},album->>name.ilike.${q})` +
            `&deleted=eq.false` +
            `&limit=${SUGGESTION_LIMIT}`,
            opts,
        );

        if ('error' in result) return supaerror_to_rozerr(result, { query, opts });
        return result.map(suggestion_track_new_uid);
    }

    export async function get_playlists(
        opts: Opts,
    ): PromiseResult<RemotePlaylist[]> {
        const playlist_result = await
            rest<RemotePlaylist[]>(
                `playlists?select=uuid,title,description,created_at,modified_at&deleted=eq.false&public=eq.true&limit=20`,
                opts,
            );

        if ('error' in playlist_result) return supaerror_to_rozerr(playlist_result, { opts });

        return playlist_result;
    }

    // export async function get_playlists(opts: Opts): Promise<RemotePlaylist[] | { error: string }> {
    //     return rest<RemotePlaylist[]>(
    //         'playlists?select=uuid,title,description,created_at,modified_at&deleted=eq.false&order=created_at.desc',
    //         opts,
    //     );
    // }

    export async function create_playlist(title: string, uuid: string, opts: Opts): Promise<{ uuid: string } | { error: string }> {
        const result = await rest<RemotePlaylist[]>(
            'playlists',
            opts,
            {
                method: 'POST',
                headers: { 'Prefer': 'return=representation' },
                body: JSON.stringify({ uuid, title }),
            },
        );
        if ('error' in result) return result;
        return { uuid };
    }

    export async function delete_playlist(uuid: string, opts: Opts): Promise<boolean> {
        const result = await rest<object>(
            `playlists?uuid=eq.${encodeURIComponent(uuid)}`,
            opts,
            { method: 'PATCH', body: JSON.stringify({ deleted: true }) },
        );
        return !('error' in result);
    }

    // -------------------------------------------------------------------------
    // Playlist tracks
    // -------------------------------------------------------------------------

    export async function add_tracks_to_playlist(
        rows: { uuid: string; track_uid: string }[],
        opts: Opts,
    ): Promise<boolean> {
        const result = await rest<object>(
            'playlists_tracks',
            opts,
            {
                method: 'POST',
                headers: { 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify(rows),
            },
        );
        return !('error' in result);
    }

    export async function delete_tracks_from_playlist(
        uuid: string,
        track_uids: string[],
        opts: Opts,
    ): Promise<boolean> {
        const uid_list = track_uids.map(u => `"${u}"`).join(',');
        const result = await rest<object>(
            `playlists_tracks?uuid=eq.${encodeURIComponent(uuid)}&track_uid=in.(${uid_list})`,
            opts,
            { method: 'PATCH', body: JSON.stringify({ deleted: true }) },
        );
        return !('error' in result);
    }

    export async function search_tracks(query: string, limit: number, opts: Opts): Promise<RemoteTrack[] | { error: string }> {
        const q = encodeURIComponent(`%${query}%`);
        return rest<RemoteTrack[]>(
            `tracks?select=*&or=(title.ilike.${q},alt_title.ilike.${q})&deleted=eq.false&limit=${limit}`,
            opts,
        );
    }

    export async function get_new_releases(opts: Opts): Promise<RemoteNewRelease[] | { error: string }> {
        return rest<RemoteNewRelease[]>(
            'new_releases?select=*&deleted=eq.false&order=created_at.desc&limit=50',
            opts,
        );
    }
}
