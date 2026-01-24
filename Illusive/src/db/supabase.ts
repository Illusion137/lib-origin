/* eslint-disable @typescript-eslint/restrict-template-expressions */
import 'dotenv/config';
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { MMKV } from 'react-native-mmkv';
import type { Database, TablesInsert, TablesUpdate } from './database.types';
import * as Network from 'expo-network';
import { db } from './database';
import { tracks_table, playlists_table, playlists_tracks_table, tracks_deleted_table, playlists_deleted_table, playlists_tracks_deleted_table } from './schema';
import type { SQLTrack, SQLPlaylist, SQLPlaylistTrack } from './schema';
import { and, gt, gte, eq } from 'drizzle-orm';

const storage = new MMKV({ id: 'supabase-storage' })

const mmkv_storage_config = {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key) ?? null,
    removeItem: (key) => storage.delete(key),
} satisfies SupportedStorage;

export const supabase = createClient<Database>(process.env.SUPABASE_PROJECT_URL ?? '', process.env.SUPABASE_PUBLIC_KEY ?? '', {
    auth: {
        storage: mmkv_storage_config,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

const LAST_SYNCED_AT_KEY = 'last_synced_at';

function getLastSyncedAt(): number {
    const lastSyncedAt = storage.getString(LAST_SYNCED_AT_KEY);
    return lastSyncedAt ? parseInt(lastSyncedAt, 10) : 0;
}

function setLastSyncedAt(timestamp: number): void {
    storage.set(LAST_SYNCED_AT_KEY, timestamp.toString());
}

async function hasInternetConnection(): Promise<boolean> {
    const networkState = await Network.getNetworkStateAsync();
    return !!(networkState.isConnected && networkState.isInternetReachable);
}

export namespace SosuSync {

    async function push_changes(last_synced_at: number) {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return; // not logged in

        // --- PUSH TRACKS ---
        const local_modified_tracks = await db.select().from(tracks_table).where(gt(tracks_table.modified_at, last_synced_at));
        if (local_modified_tracks.length > 0) {
            const supabase_tracks = local_modified_tracks.map(localTrackToSupabaseTrack);
            await supabase.from('tracks').upsert(supabase_tracks);
            const utracks_to_upsert = local_modified_tracks.map(track => ({ user_uid: user.id, track_uuid: track.illusi_id, modified_at: new Date().toISOString(), deleted: false }));
            await supabase.from('utracks').upsert(utracks_to_upsert, { onConflict: 'user_uid,track_uuid' });
        }
        const local_deleted_tracks = await db.select().from(tracks_deleted_table).where(gt(tracks_deleted_table.modified_at, last_synced_at));
        if(local_deleted_tracks.length > 0) {
            const utracks_to_delete = local_deleted_tracks.map(track => ({ user_uid: user.id, track_uuid: track.illusi_id, modified_at: new Date().toISOString(), deleted: true }));
            await supabase.from('utracks').upsert(utracks_to_delete, { onConflict: 'user_uid,track_uuid' });
        }
        
        // --- PUSH PLAYLISTS ---
        const local_modified_playlists = await db.select().from(playlists_table).where(gt(playlists_table.modified_at, last_synced_at));
        if (local_modified_playlists.length > 0) {
            const supabase_playlists = local_modified_playlists.map(p => localPlaylistToSupabasePlaylist(p, user.id));
            await supabase.from('playlists').upsert(supabase_playlists);
        }
        const local_deleted_playlists = await db.select().from(playlists_deleted_table).where(gt(playlists_deleted_table.modified_at, last_synced_at));
        if (local_deleted_playlists.length > 0) {
            const updates = local_deleted_playlists.map(p => ({ uuid: p.uuid, deleted: true, modified_at: new Date(p.modified_at).toISOString() }));
            await supabase.from('playlists').upsert(updates);
        }

        // --- PUSH PLAYLIST_TRACKS ---
        const local_added_playlist_tracks = await db.select().from(playlists_tracks_table).where(gt(playlists_tracks_table.created_at, last_synced_at));
        if(local_added_playlist_tracks.length > 0) {
            const uptracks_to_add = local_added_playlist_tracks.map(pt => ({ playlist_uuid: pt.uuid, track_uuid: pt.track_uid, deleted: false, modified_at: new Date(pt.created_at).toISOString() }));
            await supabase.from('uptracks').upsert(uptracks_to_add);
        }
        const local_deleted_playlist_tracks = await db.select().from(playlists_tracks_deleted_table).where(gt(playlists_tracks_deleted_table.created_at, last_synced_at));
        if(local_deleted_playlist_tracks.length > 0) {
            const uptracks_to_delete = local_deleted_playlist_tracks.map(pt => ({ playlist_uuid: pt.uuid, track_uuid: pt.track_uid, deleted: true, modified_at: new Date(pt.created_at).toISOString() }));
            await supabase.from('uptracks').upsert(uptracks_to_delete);
        }
    }

    async function pull_changes(last_synced_at: number) {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const iso_last_synced_at = new Date(last_synced_at).toISOString();
        
        // --- PULL TRACKS ---
        const { data: remote_utracks, error: utracks_error } = await supabase.from('utracks').select(`deleted, modified_at, tracks (*)`).gt('modified_at', iso_last_synced_at).eq('user_uid', user.id);
        if (utracks_error) console.error('Error pulling tracks', utracks_error);
        else if (remote_utracks) {
            for (const remote_utrack of remote_utracks) {
                const remote_track = remote_utrack.tracks;
                if (!remote_track || typeof remote_track !== 'object') continue;
                const local_track = await db.select().from(tracks_table).where(eq(tracks_table.illusi_id, remote_track.uuid)).get();
                if (remote_utrack.deleted) {
                    if (local_track) await db.delete(tracks_table).where(eq(tracks_table.id, local_track.id));
                } else {
                    const transformed_track = supabaseTrackToLocalTrack(remote_track);
                    if (local_track) {
                        if (new Date(remote_track.modified_at).getTime() > local_track.modified_at) {
                            await db.update(tracks_table).set(transformed_track).where(eq(tracks_table.id, local_track.id));
                        }
                    } else await db.insert(tracks_table).values(transformed_track);
                }
            }
        }
        
        // --- PULL PLAYLISTS ---
        const { data: remote_playlists, error: playlists_error } = await supabase.from('playlists').select('*').gt('modified_at', iso_last_synced_at).eq('user_uid', user.id);
        if (playlists_error) console.error('Error pulling playlists', playlists_error);
        else if (remote_playlists) {
            for (const remote_playlist of remote_playlists) {
                const local_playlist = await db.select().from(playlists_table).where(eq(playlists_table.uuid, remote_playlist.uuid)).get();
                if (remote_playlist.deleted) {
                    if (local_playlist) await db.delete(playlists_table).where(eq(playlists_table.id, local_playlist.id));
                } else {
                    const transformed_playlist = supabasePlaylistToLocalPlaylist(remote_playlist);
                    if (local_playlist) {
                        if (new Date(remote_playlist.modified_at).getTime() > local_playlist.modified_at) {
                            await db.update(playlists_table).set(transformed_playlist).where(eq(playlists_table.id, local_playlist.id));
                        }
                    } else await db.insert(playlists_table).values(transformed_playlist);
                }
            }
        }

        // --- PULL PLAYLIST_TRACKS ---
        const { data: remote_uptracks, error: uptracks_error_pull } = await supabase.from('uptracks').select('*').gt('modified_at', iso_last_synced_at);
        if(uptracks_error_pull) console.error('Error pulling playlist tracks', uptracks_error_pull);
        else if (remote_uptracks) {
            for(const remote_uptrack of remote_uptracks) {
                const local_playlist_track = await db.select().from(playlists_tracks_table).where(and(eq(playlists_tracks_table.uuid, remote_uptrack.playlist_uuid), eq(playlists_tracks_table.track_uid, remote_uptrack.track_uuid))).get();
                if(remote_uptrack.deleted) {
                    if(local_playlist_track) await db.delete(playlists_tracks_table).where(eq(playlists_tracks_table.id, local_playlist_track.id));
                } else {
                    if(!local_playlist_track) await db.insert(playlists_tracks_table).values({ uuid: remote_uptrack.playlist_uuid, track_uid: remote_uptrack.track_uuid, created_at: new Date(remote_uptrack.created_at).getTime() });
                }
            }
        }
    }

    export async function sync() {
        if (!(await hasInternetConnection())) {
            console.log("No internet connection, skipping sync.");
            return;
        }
        const last_synced_at = getLastSyncedAt();
        const now = Date.now();
        console.log(`Starting sync since ${new Date(last_synced_at)}`);
        await push_changes(last_synced_at);
        await pull_changes(last_synced_at);
        setLastSyncedAt(now);
        console.log(`Sync finished. New sync timestamp: ${new Date(now)}`);
    }

    // --- TRANSFORMERS ---

    function supabaseTrackToLocalTrack(supabase_track: Record<string, any>): Partial<SQLTrack> {
        const service_uris = supabase_track.service_uris ?? {};
        return {
            title: supabase_track.title, illusi_id: supabase_track.uuid, artists: supabase_track.artists, album: supabase_track.album, duration: supabase_track.duration,
            prods: supabase_track.prods, tags: supabase_track.tags, explicit: supabase_track.explicit ? 'EXPLICIT' : 'NONE', artwork_url: supabase_track.artwork_url,
            youtube_id: service_uris.youtube, spotify_id: service_uris.spotify, soundcloud_id: service_uris.soundcloud,
            created_at: new Date(supabase_track.created_at).getTime(), modified_at: new Date(supabase_track.modified_at).getTime(),
        };
    }

    function localTrackToSupabaseTrack(local_track: SQLTrack): TablesInsert<'tracks'> {
        const service_uris: Record<string, string | number> = {};
        if (local_track.youtube_id) service_uris.youtube = local_track.youtube_id;
        if (local_track.spotify_id) service_uris.spotify = local_track.spotify_id;
        if (local_track.soundcloud_id) service_uris.soundcloud = local_track.soundcloud_id;
        return {
            uuid: local_track.illusi_id, title: local_track.title, artists: local_track.artists, album: local_track.album, duration: local_track.duration,
            prods: local_track.prods, tags: local_track.tags, explicit: local_track.explicit === 'EXPLICIT', artwork_url: local_track.artwork_url,
            service_uris: service_uris, created_at: new Date(local_track.created_at).toISOString(), modified_at: new Date(local_track.modified_at).toISOString(),
        };
    }

    function supabasePlaylistToLocalPlaylist(remote: TablesUpdate<'playlists'>): Partial<SQLPlaylist> {
        return {
            uuid: remote.uuid, title: remote.title, description: remote.description, pinned: remote.pinned, archived: remote.archived,
            public: remote.public, created_at: new Date(remote.created_at as string).getTime(), modified_at: new Date(remote.modified_at as string).getTime(),
        };
    }

    function localPlaylistToSupabasePlaylist(local: SQLPlaylist, user_id: string): TablesInsert<'playlists'> {
        return {
            uuid: local.uuid, title: local.title, description: local.description, pinned: local.pinned, archived: local.archived, public: local.public,
            user_uid: user_id, created_at: new Date(local.created_at).toISOString(), modified_at: new Date(local.modified_at).toISOString(),
        }
    }
}
