import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import {
    change_log_table,
    new_releases_table,
    playlists_table,
    playlists_tracks_table,
    sync_metadata_table,
    tracks_table,
} from '../schema';
import { and, eq } from 'drizzle-orm';
import type {
    CompressedChange,
    LocalNewRelease,
    LocalPlaylist,
    LocalPlaylistTrack,
    LocalTableName,
    LocalTrack,
    RemoteNewReleaseInsert,
    RemotePlaylistInsert,
    RemotePlaylistTrackInsert,
    RemoteTrackInsert,
    RemoteTrackWithUserData,
    RemoteUTrackInsert,
} from './types';
import { LOCAL_TO_REMOTE_TABLE_MAP } from './types';
import { Prefs } from '@illusive/prefs';
import type { Database } from '../database.types';
import { catch_log } from '@common/utils/error_util';
import { GLOBALS } from '@illusive/globals';
import { SQLGlobal } from '../../sql/sql_global';

type SyncableLocalTableName = 'tracks' | 'playlists' | 'playlists_tracks' | 'new_releases';
const SYNCABLE_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks', 'new_releases'];
const BATCH_SIZE = 50;
const PULL_PAGE_SIZE = 1000;

function safe_to_iso(value: unknown): string {
    if (value == null) return new Date().toISOString();
    const d = new Date(value as number | string);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function safe_to_epoch(value: unknown): number {
    if (value == null) return Date.now();
    const d = new Date(value as number | string);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

async function get_authed_user_uid(supabase: SupabaseClient<Database>): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

export class SyncEngine {
    private is_syncing = false;
    private sync_interval?: ReturnType<typeof setInterval>;
    private debounce_timeout?: ReturnType<typeof setTimeout>;
    private readonly supabase: SupabaseClient<Database>;
    private readonly network_monitor: NetworkMonitor;

    constructor(supabase: SupabaseClient<Database>, networkMonitor: NetworkMonitor) {
        this.supabase = supabase;
        this.network_monitor = networkMonitor;
    }

    schedule_sync(delay_ms = 3000) {
        if (this.debounce_timeout) clearTimeout(this.debounce_timeout);
        this.debounce_timeout = setTimeout(() => {
            this.sync().catch(catch_log);
        }, delay_ms);
    }

    async initialize() {
        ChangeTracker.set_on_change(() => this.schedule_sync());
        await this.initial_sync().catch(catch_log);

        this.network_monitor.on_network_change(async (isGoodTime) => {
            if (isGoodTime && !this.is_syncing) {
                await this.sync().catch(catch_log);
            }
        });

        this.sync_interval = setInterval(async () => {
            const isGoodTime = await this.network_monitor.is_good_time_to_sync();
            if (isGoodTime && !this.is_syncing) {
                await this.sync().catch(catch_log);
            }
        }, 5 * 60 * 1000);
    }

    async sync() {
        if (this.is_syncing) return;
        try {
            this.is_syncing = true;
            await this.push_changes();
            await this.pull_changes();
            await Prefs.save_pref('last_synced', new Date());
        } finally {
            this.is_syncing = false;
        }
    }

    // -------------------------------------------------------------------------
    // INITIAL SYNC
    // For users with large existing libraries that have never synced.
    // Uses the resolve_or_insert_tracks RPC to atomically handle service ID
    // collisions and UID canonicalization.
    // -------------------------------------------------------------------------
    private async initial_sync() {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;

        // No-op if this user already has remote data
        const { data: existing } = await this.supabase
            .from('utracks')
            .select('id')
            .eq('user_uid', user_uid)
            .limit(1);

        if (existing && existing.length > 0) return;

        await this.initial_sync_tracks(user_uid);
        await this.initial_sync_playlists(user_uid);
        await this.initial_sync_playlists_tracks();
        await this.initial_sync_new_releases(user_uid);
    }

    private async initial_sync_tracks(user_uid: string) {
        const all = await db.select().from(tracks_table);

        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const batch = all.slice(i, i + BATCH_SIZE);

            // Use RPC to atomically resolve service ID collisions
            const tracks_json = batch.map(t => this.track_to_global_insert(t));
            const { data: mappings, error: rpc_err } = await this.supabase
                .rpc('resolve_or_insert_tracks', { tracks_json: JSON.stringify(tracks_json) });

            if (rpc_err) throw rpc_err;

            // Remap any UIDs that were resolved to a canonical UID
            if (mappings) {
                for (const mapping of mappings) {
                    if (mapping.local_uid !== mapping.canonical_uid) {
                        await this.remap_local_uid(mapping.local_uid, mapping.canonical_uid);
                    }
                }
            }

            // Re-read the batch after potential UID remaps to get canonical UIDs
            const remapped_batch = await Promise.all(
                batch.map(async t => {
                    const remapped = mappings?.find(m => m.local_uid === t.uid);
                    const uid = remapped?.canonical_uid ?? t.uid;
                    const current = await db.select().from(tracks_table)
                        .where(eq(tracks_table.uid, uid)).get();
                    return current ?? { ...t, uid };
                })
            );

            // Upsert utracks with canonical UIDs
            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    remapped_batch.map(t => this.track_to_utrack_insert(t, user_uid)),
                    { onConflict: 'user_uid,track_uid' }
                );
            if (ue) throw ue;
        }
    }

    private async initial_sync_playlists(user_uid: string) {
        const all = await db.select().from(playlists_table);
        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const batch = all.slice(i, i + BATCH_SIZE);
            const { error } = await this.supabase.from('playlists')
                .upsert(batch.map(p => this.playlist_to_insert(p, user_uid)), { onConflict: 'uuid' });
            if (error) throw error;
        }
    }

    private async initial_sync_playlists_tracks() {
        const all = await db.select().from(playlists_tracks_table);
        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const batch = all.slice(i, i + BATCH_SIZE);
            const { error } = await this.supabase.from('playlists_tracks')
                .upsert(batch.map(pt => this.playlist_track_to_insert(pt)), { onConflict: 'uuid,track_uid' });
            if (error) throw error;
        }
    }

    private async initial_sync_new_releases(user_uid: string) {
        const all = await db.select().from(new_releases_table);
        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const batch = all.slice(i, i + BATCH_SIZE);
            const { error } = await this.supabase.from('new_releases')
                .upsert(batch.map(r => this.new_release_to_insert(r, user_uid)), { onConflict: 'id' });
            if (error) throw error;
        }
    }

    // -------------------------------------------------------------------------
    // PUSH — process pending change_log entries
    // -------------------------------------------------------------------------
    private async push_changes() {
        let has_more = true;

        while (has_more) {
            const changes = await ChangeTracker.get_pending_changes(BATCH_SIZE);
            if (changes.length === 0) { has_more = false; break; }

            const by_table = changes.reduce<Record<string, CompressedChange[]>>((acc, c) => {
                (acc[c.table] ??= []).push(c);
                return acc;
            }, {});

            const synced_ids: number[] = [];
            for (const [table_name, table_changes] of Object.entries(by_table)) {
                const remote_table = LOCAL_TO_REMOTE_TABLE_MAP[table_name as LocalTableName];
                if (remote_table === null) {
                    synced_ids.push(...table_changes.map(c => c.change_ids).flat());
                    continue;
                }
                const succeeded = await this.push_table_changes(table_name as SyncableLocalTableName, table_changes);
                synced_ids.push(...succeeded);
            }

            await ChangeTracker.mark_as_synced(synced_ids);
            has_more = changes.length === BATCH_SIZE;
        }
    }

    private async push_table_changes(table_name: SyncableLocalTableName, changes: CompressedChange[]): Promise<number[]> {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return [];

        const succeeded: number[] = [];
        for (const change of changes) {
            try {
                switch (table_name) {
                    case 'tracks':           await this.push_track_change(change, user_uid); break;
                    case 'playlists':        await this.push_playlist_change(change, user_uid); break;
                    case 'playlists_tracks': await this.push_playlist_track_change(change); break;
                    case 'new_releases':     await this.push_new_release_change(change, user_uid); break;
                }
                succeeded.push(...change.change_ids);
            } catch (err) {
                console.warn(`[SyncEngine] push ${table_name}/${change.record_id} failed:`, err);
            }
        }
        return succeeded;
    }

    // -------------------------------------------------------------------------
    // Track push — dual-write to `tracks` (global) + `utracks` (per-user)
    // Global tracks are NEVER deleted — only utracks can be soft-deleted.
    // -------------------------------------------------------------------------
    private async push_track_change(change: CompressedChange, user_uid: string) {
        if (change.operation === 'delete') {
            // Only mark the user's utrack as deleted — global tracks pool is permanent
            const local_track = await db.select().from(tracks_table)
                .where(eq(tracks_table.uid, change.record_id)).get();

            const uid = local_track
                ? (await this.resolve_canonical_uid(local_track)) || change.record_id
                : change.record_id;

            await this.supabase.from('utracks')
                .update({ deleted: true })
                .eq('user_uid', user_uid)
                .eq('track_uid', uid);
            return;
        }

        // Always read the full local track so we have all service IDs for resolution
        const full_track = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, change.record_id)).get();
        if (!full_track) return; // Track no longer exists locally, skip

        // Merge any changed fields from compressed change on top of the full local track
        const track: LocalTrack = change.operation === 'update'
            ? { ...full_track, ...(change.data as Partial<LocalTrack>) }
            : full_track;

        // Dedup: if another track in the global pool shares a service ID,
        // adopt its uid as the canonical one and update local references.
        const canonical_uid = await this.resolve_canonical_uid(track);
        if (canonical_uid !== track.uid) {
            await this.remap_local_uid(track.uid, canonical_uid);
            track.uid = canonical_uid;
        }

        // Always upsert — guarantees the row exists remotely regardless of prior state
        await this.supabase.from('tracks')
            .upsert(this.track_to_global_insert(track), { onConflict: 'uid' });
        await this.supabase.from('utracks')
            .upsert(this.track_to_utrack_insert(track, user_uid), { onConflict: 'user_uid,track_uid' });
    }

    // Check if an existing global track shares any service ID with the given local track.
    // Returns the remote canonical uid, or the local uid if no collision is found.
    private async resolve_canonical_uid(track: LocalTrack): Promise<string> {
        const filter_parts: string[] = [];

        if (track.youtube_id)           filter_parts.push(`youtube_id.eq.${track.youtube_id}`);
        if (track.youtubemusic_id)      filter_parts.push(`youtubemusic_id.eq.${track.youtubemusic_id}`);
        if (track.soundcloud_id)        filter_parts.push(`soundcloud_id.eq.${track.soundcloud_id}`);
        if (track.soundcloud_permalink) filter_parts.push(`soundcloud_permalink.eq.${track.soundcloud_permalink}`);
        if (track.spotify_id)           filter_parts.push(`spotify_id.eq.${track.spotify_id}`);
        if (track.amazonmusic_id)       filter_parts.push(`amazonmusic_id.eq.${track.amazonmusic_id}`);
        if (track.applemusic_id)        filter_parts.push(`applemusic_id.eq.${track.applemusic_id}`);
        if (track.bandlab_id)           filter_parts.push(`bandlab_id.eq.${track.bandlab_id}`);
        if (track.illusi_id)            filter_parts.push(`illusi_id.eq.${track.illusi_id}`);
        if (track.imported_id)          filter_parts.push(`imported_id.eq.${track.imported_id}`);

        if (filter_parts.length === 0) return track.uid;

        const { data } = await this.supabase
            .from('tracks')
            .select('uid')
            .or(filter_parts.join(','))
            .neq('uid', track.uid)
            .limit(1);

        return data?.[0]?.uid ?? track.uid;
    }

    // -------------------------------------------------------------------------
    // Remap a local track UID to a canonical UID across all tables + in-memory
    // -------------------------------------------------------------------------
    private async remap_local_uid(old_uid: string, new_uid: string) {
        // 1. Check if a track with new_uid already exists locally (collision)
        const existing_new = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, new_uid)).get();

        if (existing_new) {
            // Merge the old track's data into the existing one, then delete the old
            const old_track = await db.select().from(tracks_table)
                .where(eq(tracks_table.uid, old_uid)).get();
            if (old_track) {
                const merged = this.accumulate_merge_tracks(existing_new, old_track);
                await db.update(tracks_table).set(merged)
                    .where(eq(tracks_table.uid, new_uid));
                await db.delete(tracks_table).where(eq(tracks_table.uid, old_uid));
            }
        } else {
            // Simple rename
            await db.update(tracks_table)
                .set({ uid: new_uid })
                .where(eq(tracks_table.uid, old_uid));
        }

        // 2. Update playlists_tracks references
        await db.update(playlists_tracks_table)
            .set({ track_uid: new_uid })
            .where(eq(playlists_tracks_table.track_uid, old_uid));

        // 3. Update pending change_log entries
        await db.update(change_log_table)
            .set({ record_id: new_uid })
            .where(and(
                eq(change_log_table.record_id, old_uid),
                eq(change_log_table.table_name, 'tracks')
            ));

        // 4. Update in-memory globals
        const idx = GLOBALS.global_var.sql_tracks.findIndex(t => t.uid === old_uid);
        if (idx !== -1) {
            GLOBALS.global_var.sql_tracks[idx] = {
                ...GLOBALS.global_var.sql_tracks[idx],
                uid: new_uid,
            };
            SQLGlobal.update_global_track_item(new_uid, GLOBALS.global_var.sql_tracks[idx]);
        }
    }

    // -------------------------------------------------------------------------
    // Playlist push
    // -------------------------------------------------------------------------
    private async push_playlist_change(change: CompressedChange, user_uid: string) {
        if (change.operation === 'delete') {
            await this.supabase.from('playlists')
                .update({ deleted: true })
                .eq('uuid', change.record_id);
            return;
        }

        const full_playlist = await db.select().from(playlists_table)
            .where(eq(playlists_table.uuid, change.record_id)).get();
        if (!full_playlist) return;

        const playlist: LocalPlaylist = change.operation === 'update'
            ? { ...full_playlist, ...(change.data as Partial<LocalPlaylist>) }
            : full_playlist;

        const row = this.playlist_to_insert(playlist, user_uid);
        await this.supabase.from('playlists').upsert(row, { onConflict: 'uuid' });
    }

    // -------------------------------------------------------------------------
    // Playlist-track push
    // -------------------------------------------------------------------------
    private async push_playlist_track_change(change: CompressedChange) {
        if (change.operation === 'delete') {
            const colon_idx = change.record_id.indexOf(':');
            const playlist_uuid = change.record_id.substring(0, colon_idx);
            const track_uid = change.record_id.substring(colon_idx + 1);
            await this.supabase.from('playlists_tracks')
                .update({ deleted: true })
                .eq('uuid', playlist_uuid)
                .eq('track_uid', track_uid);
            return;
        }

        const full_pt = await db.select().from(playlists_tracks_table)
            .where(and(
                eq(playlists_tracks_table.uuid, (change.data as Partial<LocalPlaylistTrack>).uuid ?? ''),
                eq(playlists_tracks_table.track_uid, (change.data as Partial<LocalPlaylistTrack>).track_uid ?? '')
            )).get();

        const pt = full_pt ?? change.data as LocalPlaylistTrack;
        await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(pt), { onConflict: 'uuid,track_uid' });
    }

    // -------------------------------------------------------------------------
    // New release push
    // -------------------------------------------------------------------------
    private async push_new_release_change(change: CompressedChange, user_uid: string) {
        if (change.operation === 'delete') {
            await this.supabase.from('new_releases')
                .update({ deleted: true })
                .eq('id', Number(change.record_id));
            return;
        }

        const full_release = await db.select().from(new_releases_table)
            .where(eq(new_releases_table.id, Number(change.record_id))).get();
        if (!full_release) return;

        const release: LocalNewRelease = change.operation === 'update'
            ? { ...full_release, ...(change.data as Partial<LocalNewRelease>) }
            : full_release;

        const row = this.new_release_to_insert(release, user_uid);
        await this.supabase.from('new_releases').upsert(row, { onConflict: 'id' });
    }

    // -------------------------------------------------------------------------
    // PULL — fetch remote changes and apply to local DB
    // -------------------------------------------------------------------------
    private async pull_changes() {
        for (const table_name of SYNCABLE_TABLES) {
            await this.pull_table_changes(table_name).catch(catch_log);
        }
    }

    private async pull_table_changes(table_name: SyncableLocalTableName) {
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        const last_sync_iso = new Date(metadata?.last_sync_at ?? 0).toISOString();

        switch (table_name) {
            case 'tracks':           await this.pull_tracks(last_sync_iso); break;
            case 'playlists':        await this.pull_playlists(last_sync_iso); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso); break;
            case 'new_releases':     await this.pull_new_releases(last_sync_iso); break;
        }

        const now = Date.now();
        await db
            .insert(sync_metadata_table)
            .values({ table_name, last_sync_at: now, last_modified_at: now })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: { last_sync_at: now, last_modified_at: now },
            });
    }

    private async pull_tracks(last_sync_iso: string) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;

        // Fetch utracks with embedded track data, paginated
        let cursor = last_sync_iso;
        let has_more = true;
        while (has_more) {
            const { data: utrack_rows, error: u_err } = await this.supabase
                .from('utracks')
                .select('*, tracks(*)')
                .eq('user_uid', user_uid)
                .gte('modified_at', cursor)
                .order('modified_at', { ascending: true })
                .limit(PULL_PAGE_SIZE);

            if (u_err) throw u_err;
            if (!utrack_rows || utrack_rows.length === 0) break;

            for (const row of utrack_rows) {
                const track_data = row.tracks as Database['public']['Tables']['tracks']['Row'] | null;
                if (!track_data) continue;

                const merged: RemoteTrackWithUserData = {
                    ...track_data,
                    plays:   row.plays,
                    meta:    row.meta,
                    deleted: row.deleted,
                };
                await this.apply_track(merged);
            }

            has_more = utrack_rows.length === PULL_PAGE_SIZE;
            if (has_more) cursor = utrack_rows[utrack_rows.length - 1].modified_at;
        }

        // Also pull tracks enriched by other users since last sync
        const owned_uids = await this.get_owned_track_uids(user_uid);
        if (owned_uids.length > 0) {
            cursor = last_sync_iso;
            has_more = true;
            while (has_more) {
                const { data: enriched, error: t_err } = await this.supabase
                    .from('tracks')
                    .select('*')
                    .gte('modified_at', cursor)
                    .in('uid', owned_uids)
                    .order('modified_at', { ascending: true })
                    .limit(PULL_PAGE_SIZE);

                if (t_err) throw t_err;
                if (!enriched || enriched.length === 0) break;

                for (const track_row of enriched) {
                    const local = await db.select().from(tracks_table)
                        .where(eq(tracks_table.uid, track_row.uid)).get();
                    if (!local) continue;

                    // Accumulate enrichment from other users — local wins ties
                    const merged_fields = this.accumulate_merge_local(local, track_row);
                    await db.update(tracks_table).set(merged_fields)
                        .where(eq(tracks_table.uid, track_row.uid));

                    // Update in-memory
                    const updated = { ...local, ...merged_fields };
                    SQLGlobal.update_global_track_item(track_row.uid, updated as LocalTrack);
                }

                has_more = enriched.length === PULL_PAGE_SIZE;
                if (has_more) cursor = enriched[enriched.length - 1].modified_at;
            }
        }
    }

    private async get_owned_track_uids(user_uid: string): Promise<string[]> {
        const { data } = await this.supabase
            .from('utracks')
            .select('track_uid')
            .eq('user_uid', user_uid)
            .eq('deleted', false);

        return (data ?? []).map(r => r.track_uid);
    }

    // -------------------------------------------------------------------------
    // Apply a pulled track with accumulate-merge strategy.
    // Local wins ties. Only utracks.deleted causes local deletion.
    // -------------------------------------------------------------------------
    private async apply_track(row: RemoteTrackWithUserData) {
        // Only delete locally if the user's utrack is flagged as deleted
        if (row.deleted) {
            const existed = await db.select().from(tracks_table)
                .where(eq(tracks_table.uid, row.uid)).get();
            await db.delete(tracks_table).where(eq(tracks_table.uid, row.uid));
            if (existed) {
                SQLGlobal.delete_global_track_item(row.uid);
            }
            return;
        }

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, row.uid)).get();

        if (existing) {
            // Accumulate merge — local wins ties, fill gaps from remote
            const merged = this.accumulate_merge_local(existing, row);
            await db.update(tracks_table).set(merged)
                .where(eq(tracks_table.uid, row.uid));

            // Update in-memory
            const updated = { ...existing, ...merged };
            SQLGlobal.update_global_track_item(row.uid, updated as LocalTrack);
        } else {
            // New track from remote — insert
            const local = this.remote_track_to_local(row);
            await db.insert(tracks_table).values(local);
            SQLGlobal.add_global_track_item(local as LocalTrack);
        }
    }

    // -------------------------------------------------------------------------
    // Accumulate merge: local wins ties, fill gaps from remote.
    // Service IDs always accumulate (take non-empty from either side).
    // -------------------------------------------------------------------------
    private accumulate_merge_local(
        existing: LocalTrack,
        remote: RemoteTrackWithUserData | Database['public']['Tables']['tracks']['Row'],
    ): Partial<LocalTrack> {
        const pick_str = (local: string, remote_val: string): string =>
            local !== '' ? local : remote_val;
        const pick_num = (local: number, remote_val: number): number =>
            local !== 0 ? local : remote_val;

        const remote_artists = typeof remote.artists === 'string'
            ? remote.artists : JSON.stringify(remote.artists);
        const remote_tags = typeof remote.tags === 'string'
            ? remote.tags : JSON.stringify(remote.tags);
        const remote_album = typeof remote.album === 'string'
            ? remote.album : JSON.stringify(remote.album);

        const local_artists_str = typeof existing.artists === 'string'
            ? existing.artists : JSON.stringify(existing.artists);
        const local_tags_str = typeof existing.tags === 'string'
            ? existing.tags : JSON.stringify(existing.tags);
        const local_album_str = typeof existing.album === 'string'
            ? existing.album : JSON.stringify(existing.album);

        const result: Partial<LocalTrack> = {
            // Metadata: local wins if non-empty, else take remote
            title:                pick_str(existing.title, remote.title),
            alt_title:            pick_str(existing.alt_title, remote.alt_title),
            artists:              local_artists_str !== '[]' ? existing.artists : (remote_artists as any),
            duration:             pick_num(existing.duration, remote.duration),
            prods:                pick_str(existing.prods, remote.prods),
            genre:                pick_str(existing.genre, remote.genre),
            tags:                 local_tags_str !== '[]' ? existing.tags : (remote_tags as any),
            explicit:             existing.explicit !== 'NONE' ? existing.explicit : remote.explicit as any,
            unreleased:           existing.unreleased || remote.unreleased,
            album:                local_album_str !== '{"name":"","uri":null}' && local_album_str !== '{"name":""}' ? existing.album : (remote_album as any),
            artwork_url:          pick_str(existing.artwork_url, remote.artwork_url),

            // Service IDs: always accumulate (take non-empty from either side)
            youtube_id:           pick_str(existing.youtube_id, remote.youtube_id),
            youtubemusic_id:      pick_str(existing.youtubemusic_id, remote.youtubemusic_id),
            soundcloud_id:        pick_num(existing.soundcloud_id, remote.soundcloud_id),
            soundcloud_permalink: pick_str(existing.soundcloud_permalink, remote.soundcloud_permalink),
            spotify_id:           pick_str(existing.spotify_id, remote.spotify_id),
            amazonmusic_id:       pick_str(existing.amazonmusic_id, remote.amazonmusic_id),
            applemusic_id:        pick_str(existing.applemusic_id, remote.applemusic_id),
            bandlab_id:           pick_str(existing.bandlab_id, remote.bandlab_id),
            illusi_id:            pick_str(existing.illusi_id, remote.illusi_id),
            imported_id:          pick_str(existing.imported_id, remote.imported_id),

            modified_at:          Math.max(existing.modified_at, safe_to_epoch(remote.modified_at)),
        };

        // User data fields (only present on RemoteTrackWithUserData)
        if ('plays' in remote && 'meta' in remote) {
            result.plays = existing.plays > 0 ? existing.plays : (remote as RemoteTrackWithUserData).plays;
            const local_meta_str = typeof existing.meta === 'string'
                ? existing.meta : JSON.stringify(existing.meta);
            result.meta = local_meta_str !== '{}' ? existing.meta : (remote as RemoteTrackWithUserData).meta as any;
        }

        return result;
    }

    // -------------------------------------------------------------------------
    // Accumulate merge between two local tracks (for UID collision during remap)
    // -------------------------------------------------------------------------
    private accumulate_merge_tracks(
        target: LocalTrack,
        source: LocalTrack,
    ): Partial<LocalTrack> {
        const pick_str = (a: string, b: string): string => a !== '' ? a : b;
        const pick_num = (a: number, b: number): number => a !== 0 ? a : b;

        const target_artists_str = typeof target.artists === 'string'
            ? target.artists : JSON.stringify(target.artists);
        const target_tags_str = typeof target.tags === 'string'
            ? target.tags : JSON.stringify(target.tags);
        const target_album_str = typeof target.album === 'string'
            ? target.album : JSON.stringify(target.album);

        return {
            title:                pick_str(target.title, source.title),
            alt_title:            pick_str(target.alt_title, source.alt_title),
            artists:              target_artists_str !== '[]' ? target.artists : source.artists,
            duration:             pick_num(target.duration, source.duration),
            prods:                pick_str(target.prods, source.prods),
            genre:                pick_str(target.genre, source.genre),
            tags:                 target_tags_str !== '[]' ? target.tags : source.tags,
            explicit:             target.explicit !== 'NONE' ? target.explicit : source.explicit,
            unreleased:           target.unreleased || source.unreleased,
            album:                target_album_str !== '{"name":"","uri":null}' && target_album_str !== '{"name":""}' ? target.album : source.album,
            artwork_url:          pick_str(target.artwork_url, source.artwork_url),
            youtube_id:           pick_str(target.youtube_id, source.youtube_id),
            youtubemusic_id:      pick_str(target.youtubemusic_id, source.youtubemusic_id),
            soundcloud_id:        pick_num(target.soundcloud_id, source.soundcloud_id),
            soundcloud_permalink: pick_str(target.soundcloud_permalink, source.soundcloud_permalink),
            spotify_id:           pick_str(target.spotify_id, source.spotify_id),
            amazonmusic_id:       pick_str(target.amazonmusic_id, source.amazonmusic_id),
            applemusic_id:        pick_str(target.applemusic_id, source.applemusic_id),
            bandlab_id:           pick_str(target.bandlab_id, source.bandlab_id),
            illusi_id:            pick_str(target.illusi_id, source.illusi_id),
            imported_id:          pick_str(target.imported_id, source.imported_id),
            thumbnail_uri:        pick_str(target.thumbnail_uri, source.thumbnail_uri),
            media_uri:            pick_str(target.media_uri, source.media_uri),
            lyrics_uri:           pick_str(target.lyrics_uri, source.lyrics_uri),
            plays:                Math.max(target.plays, source.plays),
            modified_at:          Math.max(target.modified_at, source.modified_at),
        };
    }

    private async pull_playlists(last_sync_iso: string) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;

        let cursor = last_sync_iso;
        let has_more = true;
        while (has_more) {
            const { data, error } = await this.supabase
                .from('playlists')
                .select('*')
                .eq('user_uid', user_uid)
                .gte('modified_at', cursor)
                .order('modified_at', { ascending: true })
                .limit(PULL_PAGE_SIZE);

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const row of data) {
                if (row.deleted) {
                    await db.delete(playlists_table).where(eq(playlists_table.uuid, row.uuid));
                    continue;
                }

                const existing = await db.select().from(playlists_table)
                    .where(eq(playlists_table.uuid, row.uuid)).get();
                const local = this.remote_playlist_to_local(row, existing?.thumbnail_uri ?? '');

                if (existing) {
                    await db.update(playlists_table).set(local).where(eq(playlists_table.uuid, row.uuid));
                } else {
                    await db.insert(playlists_table).values(local);
                }
            }

            has_more = data.length === PULL_PAGE_SIZE;
            if (has_more) cursor = data[data.length - 1].modified_at;
        }
    }

    private async pull_playlists_tracks(last_sync_iso: string) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;

        const { data: user_playlists } = await this.supabase
            .from('playlists')
            .select('uuid')
            .eq('user_uid', user_uid)
            .eq('deleted', false);

        const playlist_uuids = (user_playlists ?? []).map(p => p.uuid);
        if (playlist_uuids.length === 0) return;

        let cursor = last_sync_iso;
        let has_more = true;
        while (has_more) {
            const { data, error } = await this.supabase
                .from('playlists_tracks')
                .select('*')
                .in('uuid', playlist_uuids)
                .gte('modified_at', cursor)
                .order('modified_at', { ascending: true })
                .limit(PULL_PAGE_SIZE);

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const row of data) {
                const existing = await db.select().from(playlists_tracks_table)
                    .where(and(
                        eq(playlists_tracks_table.uuid, row.uuid),
                        eq(playlists_tracks_table.track_uid, row.track_uid)
                    )).get();

                if (row.deleted) {
                    if (existing) {
                        await db.delete(playlists_tracks_table)
                            .where(and(
                                eq(playlists_tracks_table.uuid, row.uuid),
                                eq(playlists_tracks_table.track_uid, row.track_uid)
                            ));
                    }
                    continue;
                }

                const local = this.remote_playlist_track_to_local(row);
                if (existing) {
                    await db.update(playlists_tracks_table).set(local)
                        .where(and(
                            eq(playlists_tracks_table.uuid, row.uuid),
                            eq(playlists_tracks_table.track_uid, row.track_uid)
                        ));
                } else {
                    await db.insert(playlists_tracks_table).values(local);
                }
            }

            has_more = data.length === PULL_PAGE_SIZE;
            if (has_more) cursor = data[data.length - 1].modified_at;
        }
    }

    private async pull_new_releases(last_sync_iso: string) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;

        let cursor = last_sync_iso;
        let has_more = true;
        while (has_more) {
            const { data, error } = await this.supabase
                .from('new_releases')
                .select('*')
                .eq('user_uid', user_uid)
                .gte('modified_at', cursor)
                .order('modified_at', { ascending: true })
                .limit(PULL_PAGE_SIZE);

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const row of data) {
                if (row.deleted) {
                    await db.delete(new_releases_table).where(eq(new_releases_table.id, row.id));
                    continue;
                }

                const local = this.remote_new_release_to_local(row);
                const existing = await db.select().from(new_releases_table)
                    .where(eq(new_releases_table.id, row.id)).get();

                if (existing) {
                    await db.update(new_releases_table).set(local).where(eq(new_releases_table.id, row.id));
                } else {
                    await db.insert(new_releases_table).values(local);
                }
            }

            has_more = data.length === PULL_PAGE_SIZE;
            if (has_more) cursor = data[data.length - 1].modified_at;
        }
    }

    // -------------------------------------------------------------------------
    // local → remote insert shapes (fully typed)
    // -------------------------------------------------------------------------
    private track_to_global_insert(t: LocalTrack): RemoteTrackInsert {
        return {
            uid:                  t.uid,
            title:                t.title,
            alt_title:            t.alt_title,
            artists:              t.artists,
            duration:             Math.round(t.duration),
            prods:                t.prods,
            genre:                t.genre,
            tags:                 t.tags,
            explicit:             t.explicit,
            unreleased:           t.unreleased,
            album:                t.album,
            illusi_id:            t.illusi_id,
            imported_id:          t.imported_id,
            youtube_id:           t.youtube_id,
            youtubemusic_id:      t.youtubemusic_id,
            soundcloud_id:        t.soundcloud_id,
            soundcloud_permalink: t.soundcloud_permalink,
            spotify_id:           t.spotify_id,
            amazonmusic_id:       t.amazonmusic_id,
            applemusic_id:        t.applemusic_id,
            bandlab_id:           t.bandlab_id,
            artwork_url:          t.artwork_url,
            created_at:           safe_to_iso(t.created_at),
            modified_at:          safe_to_iso(t.modified_at),
        };
    }

    private track_to_utrack_insert(t: LocalTrack, user_uid: string): RemoteUTrackInsert {
        return {
            user_uid,
            track_uid:   t.uid,
            plays:       t.plays,
            meta:        t.meta,
            created_at:  safe_to_iso(t.created_at),
            modified_at: safe_to_iso(t.modified_at),
        };
    }

    private playlist_to_insert(p: LocalPlaylist, user_uid: string): RemotePlaylistInsert {
        return {
            uuid:                p.uuid,
            user_uid,
            title:               p.title,
            description:         p.description,
            pinned:              p.pinned,
            archived:            p.archived,
            sort:                p.sort,
            public:              p.public,
            public_uuid:         p.public_uuid,
            inherited_playlists: p.inherited_playlists,
            inherited_searchs:   p.inherited_searchs,
            linked_playlists:    p.linked_playlists,
            created_at:          safe_to_iso(p.created_at),
            modified_at:         safe_to_iso(p.modified_at),
        };
    }

    private playlist_track_to_insert(pt: LocalPlaylistTrack): RemotePlaylistTrackInsert {
        return {
            uuid:       pt.uuid,
            track_uid:  pt.track_uid,
            created_at: safe_to_iso(pt.created_at),
        };
    }

    private new_release_to_insert(r: LocalNewRelease, user_uid: string): RemoteNewReleaseInsert {
        return {
            user_uid,
            title:              r.title,
            artist:             r.artist,
            artwork_url:        r.artwork_url,
            artwork_thumbnails: r.artwork_thumbnails,
            explicit:           r.explicit,
            album_type:         r.album_type,
            type:               r.type,
            date:               r.date,
            song_track:         r.song_track ?? null,
            created_at:         safe_to_iso(r.created_at),
        };
    }

    // -------------------------------------------------------------------------
    // remote → local shapes (fully typed, local-only fields preserved)
    // -------------------------------------------------------------------------
    private remote_track_to_local(row: RemoteTrackWithUserData): Omit<LocalTrack, 'id'> {
        return {
            uid:                  row.uid,
            title:                row.title,
            alt_title:            row.alt_title,
            artists:              row.artists,
            duration:             row.duration,
            prods:                row.prods,
            genre:                row.genre,
            tags:                 row.tags,
            explicit:             row.explicit,
            unreleased:           row.unreleased,
            album:                row.album,
            illusi_id:            row.illusi_id,
            imported_id:          row.imported_id,
            youtube_id:           row.youtube_id,
            youtubemusic_id:      row.youtubemusic_id,
            soundcloud_id:        row.soundcloud_id,
            soundcloud_permalink: row.soundcloud_permalink,
            spotify_id:           row.spotify_id,
            amazonmusic_id:       row.amazonmusic_id,
            applemusic_id:        row.applemusic_id,
            bandlab_id:           row.bandlab_id,
            artwork_url:          row.artwork_url,
            plays:                row.plays,
            meta:                 row.meta,
            // Local-only paths — never stored remotely; set empty for new inserts
            thumbnail_uri:        '',
            media_uri:            '',
            lyrics_uri:           '',
            created_at:           safe_to_epoch(row.created_at),
            modified_at:          safe_to_epoch(row.modified_at),
        };
    }

    private remote_playlist_to_local(
        row: Database['public']['Tables']['playlists']['Row'],
        existing_thumbnail_uri: string,
    ): Omit<LocalPlaylist, 'id'> {
        return {
            uuid:                row.uuid,
            title:               row.title,
            description:         row.description,
            pinned:              row.pinned,
            archived:            row.archived,
            sort:                row.sort as LocalPlaylist['sort'],
            public:              row.public,
            public_uuid:         row.public_uuid,
            inherited_playlists: row.inherited_playlists,
            inherited_searchs:   row.inherited_searchs,
            linked_playlists:    row.linked_playlists,
            // Local-only field — preserve existing value
            thumbnail_uri:       existing_thumbnail_uri,
            date:                row.created_at,
            created_at:          safe_to_epoch(row.created_at),
            modified_at:         safe_to_epoch(row.modified_at),
        };
    }

    private remote_playlist_track_to_local(
        row: Database['public']['Tables']['playlists_tracks']['Row'],
    ): Omit<LocalPlaylistTrack, 'id'> {
        return {
            uuid:       row.uuid,
            track_uid:  row.track_uid,
            created_at: safe_to_epoch(row.created_at),
        };
    }

    private remote_new_release_to_local(
        row: Database['public']['Tables']['new_releases']['Row'],
    ): Omit<LocalNewRelease, 'id'> {
        return {
            title:              row.title,
            artist:             row.artist,
            artwork_url:        row.artwork_url,
            artwork_thumbnails: row.artwork_thumbnails,
            explicit:           row.explicit,
            album_type:         row.album_type,
            type:               row.type,
            date:               row.date,
            song_track:         row.song_track,
            created_at:         safe_to_epoch(row.created_at),
        };
    }

    destroy() {
        if (this.sync_interval) clearInterval(this.sync_interval);
        if (this.debounce_timeout) clearTimeout(this.debounce_timeout);
    }
}
