import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import {
    backpack_table,
    change_log_table,
    new_releases_table,
    playlists_table,
    playlists_tracks_table,
    recently_played_tracks_table,
    sync_metadata_table,
    track_plays_table,
    tracks_table,
} from '../schema';
import { and, eq, inArray, lt } from 'drizzle-orm';
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
const IN_CLAUSE_CHUNK_SIZE = 300;
const INITIAL_SYNC_COMPLETE_MARKER = '_initial_sync_complete';
const INITIAL_SYNC_STARTED_MARKER = '_initial_sync_started_at';
const INITIAL_SYNC_STAGE_MARKERS = {
    tracks: '_initial_sync_tracks_complete',
    playlists: '_initial_sync_playlists_complete',
    playlists_tracks: '_initial_sync_playlists_tracks_complete',
    new_releases: '_initial_sync_new_releases_complete',
} as const;

interface InitialSyncStageResult {
    uploaded: number;
    skipped: number;
    failed: number;
}

interface RemoteNewReleaseIdentityRow {
    id: number;
    deleted: boolean;
}

function chunk_array<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

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

function to_int32_or_null(value: unknown): number | null {
    const n = Number(value);
    if (!isFinite(n)) return null;
    const r = Math.round(n);
    if (r < -2147483648 || r > 2147483647) return null;
    return r;
}

// Coerce to a PostgreSQL integer (int4) — clamps to 0 on NaN, non-finite, or int32 overflow.
function safe_int(value: unknown): number {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    const r = Math.round(n);
    if (r < -2147483648) return -2147483648;
    if (r > 2147483647) return 2147483647;
    return r;
}

function parse_playlist_track_record_id(record_id: string): { playlist_uuid: string; track_uid: string } | null {
    const colon_idx = record_id.indexOf(':');
    if (colon_idx <= 0 || colon_idx >= record_id.length - 1) return null;
    return {
        playlist_uuid: record_id.substring(0, colon_idx),
        track_uid: record_id.substring(colon_idx + 1),
    };
}

function new_release_identity_key(title_value: unknown): string | null {
    if (title_value === null || title_value === undefined) return null;
    const parsed = typeof title_value === 'string' ? (() => {
        try {
            return JSON.parse(title_value) as unknown;
        } catch (error) {
            console.warn('[SyncEngine] new_release identity parse failed for string title:', error);
            return title_value;
        }
    })() : title_value;

    if (!parsed) return null;
    if (typeof parsed === 'object' && 'uri' in parsed) {
        const uri = (parsed as { uri?: unknown }).uri;
        if (typeof uri === 'string' && uri.length > 0) return `uri:${uri}`;
    }

    try {
        return `json:${JSON.stringify(parsed)}`;
    } catch {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return `raw:${String(parsed)}`;
    }
}

async function get_authed_user_uid(supabase: SupabaseClient<Database>): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

export class SyncEngine {
    private is_syncing = false;
    private is_initialized = false;
    private is_destroyed = false;
    private initial_sync_promise?: Promise<void>;
    private destroy_generation = 0;
    private consecutive_failures = 0;
    private last_error_message?: string;
    private last_sync_started_at?: number;
    private last_sync_completed_at?: number;
    private sync_interval?: ReturnType<typeof setInterval>;
    private debounce_timeout?: ReturnType<typeof setTimeout>;
    private network_subscription?: ReturnType<NetworkMonitor['on_network_change']>;
    private readonly supabase: SupabaseClient<Database>;
    private readonly network_monitor: NetworkMonitor;

    constructor(supabase: SupabaseClient<Database>, networkMonitor: NetworkMonitor) {
        this.supabase = supabase;
        this.network_monitor = networkMonitor;
    }

    private assert_supabase_ok(context: string, error: unknown) {
        if (!error) return;
        const message = typeof error === 'object' && error !== null && 'message' in error
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            ? String((error as { message?: unknown }).message ?? '')
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            : String(error);
        throw new Error(`[SyncEngine] ${context} failed: ${message}`);
    }

    private is_playlists_tracks_track_fk_error(error: unknown): boolean {
        if (!error || typeof error !== 'object') return false;
        const maybe = error as { code?: unknown; message?: unknown };
        const code = typeof maybe.code === 'string' ? maybe.code : '';
        const message = typeof maybe.message === 'string' ? maybe.message : '';
        return code === '23503' && message.includes('playlists_tracks_track_uid_fkey');
    }

    private async is_initial_sync_stage_complete(stage_marker: string): Promise<boolean> {
        const row = await db.select().from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, stage_marker)).get();
        return Boolean(row);
    }

    private async mark_initial_sync_stage_complete(stage_marker: string) {
        const now = Date.now();
        await db.insert(sync_metadata_table)
            .values({ table_name: stage_marker, last_sync_at: now, last_modified_at: now })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: { last_sync_at: now, last_modified_at: now },
            });
    }

    private async list_remote_uuids(remote_table: 'playlists', user_uid: string): Promise<Set<string>> {
        const result = new Set<string>();
        let fetch_offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from(remote_table)
                .select('uuid')
                .eq('user_uid', user_uid)
                .range(fetch_offset, fetch_offset + PULL_PAGE_SIZE - 1);
            this.assert_supabase_ok(`initial_sync ${remote_table} progress fetch`, error);
            if (!data || data.length === 0) break;
            for (const row of data) result.add(row.uuid);
            if (data.length < PULL_PAGE_SIZE) break;
            fetch_offset += data.length;
        }
        return result;
    }

    private async list_remote_playlist_track_keys(user_uid: string): Promise<Set<string>> {
        const keys = new Set<string>();
        const playlist_uuids = await this.list_remote_uuids('playlists', user_uid);
        if (playlist_uuids.size === 0) return keys;
        const uuid_chunks = chunk_array([...playlist_uuids], IN_CLAUSE_CHUNK_SIZE);
        for (const uuid_chunk of uuid_chunks) {
            let fetch_offset = 0;
            while (true) {
                const { data, error } = await this.supabase
                    .from('playlists_tracks')
                    .select('uuid,track_uid')
                    .in('uuid', uuid_chunk)
                    .range(fetch_offset, fetch_offset + PULL_PAGE_SIZE - 1);
                this.assert_supabase_ok('initial_sync playlists_tracks progress fetch', error);
                if (!data || data.length === 0) break;
                for (const row of data) {
                    keys.add(`${row.uuid}:${row.track_uid}`);
                }
                if (data.length < PULL_PAGE_SIZE) break;
                fetch_offset += data.length;
            }
        }
        return keys;
    }

    private async list_remote_new_release_identity_index(user_uid: string): Promise<Map<string, RemoteNewReleaseIdentityRow>> {
        const index = new Map<string, RemoteNewReleaseIdentityRow>();
        let fetch_offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('new_releases')
                .select('id,title,deleted')
                .eq('user_uid', user_uid)
                .range(fetch_offset, fetch_offset + PULL_PAGE_SIZE - 1);
            this.assert_supabase_ok('initial_sync new_releases progress fetch', error);
            if (!data || data.length === 0) break;

            this.refresh_new_release_identity_index(index, data);

            if (data.length < PULL_PAGE_SIZE) break;
            fetch_offset += data.length;
        }
        return index;
    }

    private refresh_new_release_identity_index(
        index: Map<string, RemoteNewReleaseIdentityRow>,
        rows: { id: number; title: unknown; deleted: boolean }[]
    ) {
        for (const row of rows) {
            const key = new_release_identity_key(row.title);
            if (key === null) continue;
            const existing = index.get(key);
            if (!existing) {
                index.set(key, { id: row.id, deleted: row.deleted });
                continue;
            }
            if (existing.deleted && !row.deleted) {
                index.set(key, { id: row.id, deleted: row.deleted });
                continue;
            }
            if (existing.deleted === row.deleted && row.id < existing.id) {
                index.set(key, { id: row.id, deleted: row.deleted });
            }
        }
    }

    schedule_sync(delay_ms = 3000) {
        if (this.is_destroyed) return;
        if (this.debounce_timeout) clearTimeout(this.debounce_timeout);
        const failure_multiplier = Math.min(Math.pow(2, Math.max(this.consecutive_failures - 1, 0)), 32);
        const effective_delay = Math.min(delay_ms * failure_multiplier, 5 * 60 * 1000);
        this.debounce_timeout = setTimeout(() => {
            this.debounce_timeout = undefined;
            if (this.is_destroyed) return;
            if (this.is_syncing) {
                this.schedule_sync(1000);
                return;
            }
            this.sync().catch(catch_log);
        }, effective_delay);
    }

    async initialize() {
        if (this.is_initialized || this.is_destroyed) return;
        const initialize_generation = this.destroy_generation;
        this.is_initialized = true;
        ChangeTracker.set_on_change(() => this.schedule_sync());
        await this.initial_sync().catch((error) => {
            // Don't rethrow — let the interval and network listeners still be set up
            // so that subsequent sync() calls can retry initial_sync via the sentinel check.
            console.warn('[SyncEngine] initial_sync failed, will retry on next sync:', error);
        });

        if (this.is_destroyed || initialize_generation !== this.destroy_generation) {
            this.is_initialized = false;
            return;
        }

        this.network_subscription = this.network_monitor.on_network_change(async (isGoodTime) => {
            if (this.is_destroyed) return;
            if (isGoodTime) {
                this.schedule_sync(500);
            }
        });

        if (this.is_destroyed || initialize_generation !== this.destroy_generation) {
            this.network_subscription?.();
            this.network_subscription = undefined;
            this.is_initialized = false;
            return;
        }

        this.sync_interval = setInterval(async () => {
            if (this.is_destroyed) return;
            const isGoodTime = await this.network_monitor.is_good_time_to_sync();
            if (this.is_destroyed) return;
            if (isGoodTime) {
                this.schedule_sync(1000);
            }
        }, 5 * 60 * 1000);
    }

    async sync() {
        if (this.is_syncing || this.is_destroyed) return;
        this.last_sync_started_at = Date.now();
        try {
            this.is_syncing = true;
            await this.initial_sync(); // no-op after first success (sentinel); retries if initial_sync previously failed
            if (this.is_destroyed) return;
            await this.push_changes();
            if (this.is_destroyed) return;
            await this.pull_changes();
            if (this.is_destroyed) return;
            await Prefs.save_pref('last_synced', new Date());
            this.consecutive_failures = 0;
            this.last_error_message = undefined;
            this.last_sync_completed_at = Date.now();
        } catch (error) {
            this.consecutive_failures += 1;
            this.last_error_message = error instanceof Error ? error.message : String(error);
            throw error;
        } finally {
            this.is_syncing = false;
        }
    }

    async get_sync_diagnostics() {
        const stats = await ChangeTracker.get_sync_stats();
        return {
            is_syncing: this.is_syncing,
            is_initialized: this.is_initialized,
            consecutive_failures: this.consecutive_failures,
            last_error_message: this.last_error_message,
            last_sync_started_at: this.last_sync_started_at,
            last_sync_completed_at: this.last_sync_completed_at,
            pending_changes: stats,
        };
    }

    // -------------------------------------------------------------------------
    // INITIAL SYNC
    // For users with large existing libraries that have never synced.
    // Uses the resolve_or_insert_tracks RPC to atomically handle service ID
    // collisions and UID canonicalization.
    // -------------------------------------------------------------------------
    private async initial_sync() {
        if (this.initial_sync_promise) {
            await this.initial_sync_promise;
            return;
        }

        this.initial_sync_promise = (async () => {
            // Check local sentinel first — avoids a network round-trip on every cold start
            const local_done = await db.select().from(sync_metadata_table)
                .where(eq(sync_metadata_table.table_name, INITIAL_SYNC_COMPLETE_MARKER)).get();
            if (local_done) return;

            const user_uid = await get_authed_user_uid(this.supabase);
            if (!user_uid) return;

            const started_row = await db.select().from(sync_metadata_table)
                .where(eq(sync_metadata_table.table_name, INITIAL_SYNC_STARTED_MARKER)).get();
            const initial_sync_started_at = started_row?.last_sync_at ?? Date.now();
            if (!started_row) {
                await db.insert(sync_metadata_table)
                    .values({
                        table_name: INITIAL_SYNC_STARTED_MARKER,
                        last_sync_at: initial_sync_started_at,
                        last_modified_at: initial_sync_started_at,
                    })
                    .onConflictDoUpdate({
                        target: sync_metadata_table.table_name,
                        set: {
                            last_sync_at: initial_sync_started_at,
                            last_modified_at: initial_sync_started_at,
                        },
                    });
            }

            const stage_succeeded = (result: InitialSyncStageResult) => result.failed === 0;

            let tracks_done = await this.is_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.tracks);
            if (!tracks_done) {
                try {
                    const result = await this.initial_sync_tracks(user_uid);
                    tracks_done = stage_succeeded(result);
                    if (tracks_done) {
                        await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.tracks);
                    }
                } catch (error) {
                    if (error !== null && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 'PGRST202') {
                        // Migration not yet applied or PostgREST schema cache stale — skip and retry on next start
                        console.warn('[SyncEngine] resolve_or_insert_tracks not in schema cache (PGRST202) — initial sync deferred');
                        return;
                    }
                    throw error;
                }
            }

            let playlists_done = await this.is_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.playlists);
            if (!playlists_done) {
                const result = await this.initial_sync_playlists(user_uid);
                playlists_done = stage_succeeded(result);
                if (playlists_done) {
                    await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.playlists);
                }
            }

            let playlists_tracks_done = await this.is_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.playlists_tracks);
            if (!playlists_tracks_done) {
                const result = await this.initial_sync_playlists_tracks(user_uid);
                playlists_tracks_done = stage_succeeded(result);
                if (playlists_tracks_done) {
                    await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.playlists_tracks);
                }
            }

            let new_releases_done = await this.is_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.new_releases);
            if (!new_releases_done) {
                const result = await this.initial_sync_new_releases(user_uid);
                // For new_releases, `skipped` means invalid local identity rows that should retry later.
                new_releases_done = result.failed === 0 && result.skipped === 0;
                if (new_releases_done) {
                    await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.new_releases);
                }
            }

            if (!tracks_done || !playlists_done || !playlists_tracks_done || !new_releases_done) {
                return;
            }

            // Drop only changes that existed before the first initial-sync attempt.
            // Changes logged after initial-sync started must still be pushed.
            await db.delete(change_log_table)
                .where(lt(change_log_table.created_at, initial_sync_started_at));

            const now = Date.now();
            await db.insert(sync_metadata_table)
                .values({ table_name: INITIAL_SYNC_COMPLETE_MARKER, last_sync_at: now, last_modified_at: now })
                .onConflictDoUpdate({
                    target: sync_metadata_table.table_name,
                    set: { last_sync_at: now, last_modified_at: now },
                });
        })();

        try {
            await this.initial_sync_promise;
        } finally {
            this.initial_sync_promise = undefined;
        }
    }

    private async initial_sync_tracks(user_uid: string): Promise<InitialSyncStageResult> {
        // Fetch UIDs already in remote utracks so partial-progress retries skip them
        const already_synced = new Set<string>();
        let fetch_offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('utracks')
                .select('track_uid')
                .eq('user_uid', user_uid)
                .range(fetch_offset, fetch_offset + PULL_PAGE_SIZE - 1);
            this.assert_supabase_ok('initial_sync_tracks progress fetch', error);
            if (!data || data.length === 0) break;
            for (const r of data) already_synced.add(r.track_uid);
            if (data.length < PULL_PAGE_SIZE) break;
            fetch_offset += data.length;
        }

        const all = await db.select().from(tracks_table);
        const to_sync = already_synced.size > 0 ? all.filter(t => !already_synced.has(t.uid)) : all;
        if (to_sync.length === 0) {
            return { uploaded: 0, skipped: all.length, failed: 0 };
        }

        let uploaded = 0;
        let failed = 0;

        for (let i = 0; i < to_sync.length; i += BATCH_SIZE) {
            const batch = to_sync.slice(i, i + BATCH_SIZE);
            let mappings: { local_uid: string; canonical_uid: string }[] | null = null;
            try {
                // Use RPC to atomically resolve service ID collisions
                const tracks_json = batch.map(t => this.track_to_global_insert(t));
                const { data: rpc_mappings, error: rpc_err } = await this.supabase
                    .rpc('resolve_or_insert_tracks', { tracks_json });
                if (rpc_err) throw rpc_err;
                mappings = rpc_mappings;
            } catch (batch_error) {
                // Keep syncing other rows: retry each row individually.
                for (const single of batch) {
                    try {
                        const { data: rpc_mappings, error: rpc_err } = await this.supabase
                            .rpc('resolve_or_insert_tracks', { tracks_json: [this.track_to_global_insert(single)] });
                        if (rpc_err) throw rpc_err;
                        if (rpc_mappings && rpc_mappings.length > 0) {
                            const mapping = rpc_mappings[0];
                            if (mapping.local_uid !== mapping.canonical_uid) {
                                await this.remap_local_uid(mapping.local_uid, mapping.canonical_uid, false, false);
                            }
                            const canonical = await db.select().from(tracks_table)
                                .where(eq(tracks_table.uid, mapping.canonical_uid)).get();
                            if (canonical) {
                                const { error: ue } = await this.supabase.from('utracks')
                                    .upsert(this.track_to_utrack_insert(canonical, user_uid), { onConflict: 'user_uid,track_uid' });
                                if (ue) throw ue;
                                uploaded += 1;
                            } else {
                                failed += 1;
                            }
                        } else {
                            failed += 1;
                        }
                    } catch (single_error) {
                        console.warn(`[SyncEngine] initial_sync tracks row failed ${single.uid}:`, single_error);
                        failed += 1;
                    }
                }
                console.warn('[SyncEngine] initial_sync tracks batch failed; continued with row-level retries:', batch_error);
                continue;
            }

            // Remap any UIDs that were resolved to a canonical UID
            if (mappings) {
                for (const mapping of mappings) {
                    if (mapping.local_uid !== mapping.canonical_uid) {
                        await this.remap_local_uid(mapping.local_uid, mapping.canonical_uid, false, false);
                    }
                }
            }

            // Re-read the batch after potential UID remaps to get canonical UIDs
            const remapped_batch: LocalTrack[] = [];
            const seen_uids = new Set<string>();
            for (const t of batch) {
                const remapped = mappings?.find(m => m.local_uid === t.uid);
                const uid = remapped?.canonical_uid ?? t.uid;
                // Skip duplicates (two batch items may have merged into the same canonical UID)
                if (seen_uids.has(uid)) continue;
                seen_uids.add(uid);
                const current = await db.select().from(tracks_table)
                    .where(eq(tracks_table.uid, uid)).get();
                if (!current) continue; // Track was merged away by a prior remap in this batch
                remapped_batch.push(current);
            }

            // Upsert utracks with canonical UIDs
            if (remapped_batch.length > 0) {
                const { error: ue } = await this.supabase.from('utracks')
                    .upsert(
                        remapped_batch.map(t => this.track_to_utrack_insert(t, user_uid)),
                        { onConflict: 'user_uid,track_uid' }
                    );
                if (ue) {
                    // Keep syncing others: fallback row-by-row.
                    for (const row of remapped_batch) {
                        try {
                            const { error: single_error } = await this.supabase.from('utracks')
                                .upsert(this.track_to_utrack_insert(row, user_uid), { onConflict: 'user_uid,track_uid' });
                            if (single_error) throw single_error;
                            uploaded += 1;
                        } catch (single_error) {
                            console.warn(`[SyncEngine] initial_sync tracks utrack upsert failed ${row.uid}:`, single_error);
                            failed += 1;
                        }
                    }
                } else {
                    uploaded += remapped_batch.length;
                }
            }
        }
        return { uploaded, skipped: all.length - to_sync.length, failed };
    }

    private async initial_sync_playlists(user_uid: string): Promise<InitialSyncStageResult> {
        const all = await db.select().from(playlists_table);
        const remote_uuids = await this.list_remote_uuids('playlists', user_uid);
        const to_sync = all.filter(p => !remote_uuids.has(p.uuid));
        if (to_sync.length === 0) {
            return { uploaded: 0, skipped: all.length, failed: 0 };
        }

        let uploaded = 0;
        let failed = 0;

        for (let i = 0; i < to_sync.length; i += BATCH_SIZE) {
            const batch = to_sync.slice(i, i + BATCH_SIZE);
            const { error } = await this.supabase.from('playlists')
                .upsert(batch.map(p => this.playlist_to_insert(p, user_uid)), { onConflict: 'uuid' });
            if (!error) {
                uploaded += batch.length;
                continue;
            }

            for (const playlist of batch) {
                try {
                    const { error: single_error } = await this.supabase.from('playlists')
                        .upsert(this.playlist_to_insert(playlist, user_uid), { onConflict: 'uuid' });
                    if (single_error) throw single_error;
                    uploaded += 1;
                } catch (single_error) {
                    console.warn(`[SyncEngine] initial_sync playlists row failed ${playlist.uuid}:`, single_error);
                    failed += 1;
                }
            }
        }
        return { uploaded, skipped: all.length - to_sync.length, failed };
    }

    private async initial_sync_playlists_tracks(user_uid: string): Promise<InitialSyncStageResult> {
        const all = await db.select().from(playlists_tracks_table);
        const remote_keys = await this.list_remote_playlist_track_keys(user_uid);
        const to_sync = all.filter(pt => !remote_keys.has(`${pt.uuid}:${pt.track_uid}`));
        if (to_sync.length === 0) {
            return { uploaded: 0, skipped: all.length, failed: 0 };
        }

        let uploaded = 0;
        let failed = 0;

        for (let i = 0; i < to_sync.length; i += BATCH_SIZE) {
            const batch = to_sync.slice(i, i + BATCH_SIZE);
            const { error } = await this.supabase.from('playlists_tracks')
                .upsert(batch.map(pt => this.playlist_track_to_insert(pt)), { onConflict: 'uuid,track_uid' });
            if (!error) {
                uploaded += batch.length;
                continue;
            }

            for (const row of batch) {
                try {
                    const { error: single_error } = await this.supabase.from('playlists_tracks')
                        .upsert(this.playlist_track_to_insert(row), { onConflict: 'uuid,track_uid' });
                    if (single_error) throw single_error;
                    uploaded += 1;
                } catch (single_error) {
                    console.warn(`[SyncEngine] initial_sync playlists_tracks row failed ${row.uuid}:${row.track_uid}:`, single_error);
                    failed += 1;
                }
            }
        }
        return { uploaded, skipped: all.length - to_sync.length, failed };
    }

    private async initial_sync_new_releases(user_uid: string): Promise<InitialSyncStageResult> {
        const all = await db.select().from(new_releases_table);
        const remote_identity_index = await this.list_remote_new_release_identity_index(user_uid);
        const to_sync: LocalNewRelease[] = [];
        let skipped = 0;
        const seen_local_identity_keys = new Set<string>();
        for (const release of all) {
            const key = new_release_identity_key(release.title);
            if (key === null) {
                console.warn(`[SyncEngine] initial_sync new_releases skipped local row with invalid title identity (id=${release.id})`);
                skipped += 1;
                continue;
            }
            if (seen_local_identity_keys.has(key)) {
                console.warn(`[SyncEngine] initial_sync new_releases skipped duplicate local identity (id=${release.id}, key=${key})`);
                skipped += 1;
                continue;
            }
            seen_local_identity_keys.add(key);
            const remote = remote_identity_index.get(key);
            if (!remote) {
                to_sync.push(release);
                continue;
            }
            if (remote.deleted) {
                to_sync.push(release);
            }
        }
        if (to_sync.length === 0) {
            return { uploaded: 0, skipped, failed: 0 };
        }

        let uploaded = 0;
        let failed = 0;

        const existing_by_key = new Map<string, LocalNewRelease>();
        for (const row of all) {
            const key = new_release_identity_key(row.title);
            if (key !== null) existing_by_key.set(key, row);
        }

        for (let i = 0; i < to_sync.length; i += BATCH_SIZE) {
            const batch = to_sync.slice(i, i + BATCH_SIZE);
            for (const release of batch) {
                try {
                    const key = new_release_identity_key(release.title);
                    if (key === null) {
                        // Should not happen because we filtered above; keep defensive.
                        console.warn(`[SyncEngine] initial_sync new_releases skipped during upload (invalid identity, id=${release.id})`);
                        skipped += 1;
                        continue;
                    }
                    const row = this.new_release_to_insert(release, user_uid);
                    const remote = remote_identity_index.get(key);
                    if (remote) {
                        const { error: update_error } = await this.supabase
                            .from('new_releases')
                            .update({ ...row, deleted: false })
                            .eq('id', remote.id)
                            .eq('user_uid', user_uid);
                        if (update_error) throw update_error;
                        uploaded += 1;
                        remote_identity_index.set(key, { id: remote.id, deleted: false });
                    } else {
                        const { error: insert_error } = await this.supabase
                            .from('new_releases')
                            .insert(row);
                        if (insert_error) throw insert_error;
                        uploaded += 1;
                    }

                    const existing = existing_by_key.get(key);
                    if (existing) {
                        await db.update(new_releases_table)
                            .set({
                                title: row.title,
                                artist: row.artist,
                                artwork_url: row.artwork_url,
                                artwork_thumbnails: row.artwork_thumbnails,
                                explicit: row.explicit,
                                album_type: row.album_type,
                                type: row.type,
                                date: row.date,
                                song_track: row.song_track,
                                created_at: safe_to_epoch(row.created_at),
                            })
                            .where(eq(new_releases_table.id, existing.id));
                    }
                } catch (single_error) {
                    console.warn('[SyncEngine] initial_sync new_releases row failed:', single_error);
                    failed += 1;
                }
            }
        }
        return { uploaded, skipped, failed };
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
            const ordered_table_names = [
                ...SYNCABLE_TABLES,
                ...Object.keys(by_table).filter((name) =>
                    !SYNCABLE_TABLES.includes(name as SyncableLocalTableName))
            ];

            for (const table_name of ordered_table_names) {
                const table_changes = by_table[table_name];
                if (!table_changes || table_changes.length === 0) continue;
                const remote_table = LOCAL_TO_REMOTE_TABLE_MAP[table_name as LocalTableName];
                if (remote_table === null) {
                    synced_ids.push(...table_changes.map(c => c.change_ids).flat());
                    continue;
                }
                const succeeded = await this.push_table_changes(table_name as SyncableLocalTableName, table_changes);
                synced_ids.push(...succeeded);
            }

            if (synced_ids.length === 0) {
                console.warn(`[SyncEngine] push stalled: ${changes.length} compressed changes failed; retrying on next sync cycle`);
                break;
            }

            await ChangeTracker.mark_as_synced(synced_ids);
            has_more = changes.length === BATCH_SIZE;
        }
    }

    private async push_table_changes(table_name: SyncableLocalTableName, changes: CompressedChange[]): Promise<number[]> {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return [];
        const remote_identity_index = table_name === 'new_releases'
            ? await this.list_remote_new_release_identity_index(user_uid)
            : undefined;

        const succeeded: number[] = [];
        for (const change of changes) {
            try {
                switch (table_name) {
                    case 'tracks':           await this.push_track_change(change, user_uid); break;
                    case 'playlists':        await this.push_playlist_change(change, user_uid); break;
                    case 'playlists_tracks': await this.push_playlist_track_change(change, user_uid); break;
                    case 'new_releases':     await this.push_new_release_change(change, user_uid, remote_identity_index); break;
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

            const { error } = await this.supabase.from('utracks')
                .update({ deleted: true })
                .eq('user_uid', user_uid)
                .eq('track_uid', uid);
            this.assert_supabase_ok(`push_track_change delete ${uid}`, error);
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
        const { error: track_error } = await this.supabase.from('tracks')
            .upsert(this.track_to_global_insert(track), { onConflict: 'uid' });
        this.assert_supabase_ok(`push_track_change tracks upsert ${track.uid}`, track_error);
        const { error: utrack_error } = await this.supabase.from('utracks')
            .upsert(this.track_to_utrack_insert(track, user_uid), { onConflict: 'user_uid,track_uid' });
        this.assert_supabase_ok(`push_track_change utracks upsert ${track.uid}`, utrack_error);
    }

    // Check if an existing global track shares any service ID with the given local track.
    // Returns the remote canonical uid, or the local uid if no collision is found.
    private async resolve_canonical_uid(track: LocalTrack): Promise<string> {
        const service_id_checks: [string, string | number][] = [];

        if (track.youtube_id)           service_id_checks.push(['youtube_id', track.youtube_id]);
        if (track.youtubemusic_id)      service_id_checks.push(['youtubemusic_id', track.youtubemusic_id]);
        if (track.soundcloud_id) {
            const soundcloud_id = to_int32_or_null(track.soundcloud_id);
            if (soundcloud_id !== null && soundcloud_id !== 0) {
                service_id_checks.push(['soundcloud_id', soundcloud_id]);
            }
        }
        if (track.soundcloud_permalink) service_id_checks.push(['soundcloud_permalink', track.soundcloud_permalink]);
        if (track.spotify_id)           service_id_checks.push(['spotify_id', track.spotify_id]);
        if (track.amazonmusic_id)       service_id_checks.push(['amazonmusic_id', track.amazonmusic_id]);
        if (track.applemusic_id)        service_id_checks.push(['applemusic_id', track.applemusic_id]);
        if (track.bandlab_id)           service_id_checks.push(['bandlab_id', track.bandlab_id]);
        if (track.illusi_id)            service_id_checks.push(['illusi_id', track.illusi_id]);
        if (track.imported_id)          service_id_checks.push(['imported_id', track.imported_id]);

        if (service_id_checks.length === 0) return track.uid;

        // Query each service ID individually to avoid PostgREST filter injection
        // from values containing special characters (commas, dots, etc.)
        const results = await Promise.all(
            service_id_checks.map(([column, value]) =>
                this.supabase
                    .from('tracks')
                    .select('uid')
                    .eq(column, value)
                    .neq('uid', track.uid)
                    .limit(1)
            )
        );

        for (const { data, error } of results) {
            this.assert_supabase_ok(`resolve_canonical_uid ${track.uid}`, error);
            if (data && data.length > 0) return data[0].uid;
        }

        return track.uid;
    }

    // -------------------------------------------------------------------------
    // Remap a local track UID to a canonical UID across all tables + in-memory
    // -------------------------------------------------------------------------
    private async remap_local_uid(
        old_uid: string,
        new_uid: string,
        queue_playlist_track_changes = true,
        queue_track_delete_change = true
    ) {
        await db.transaction(async (tx) => {
            // 1. Check if a track with new_uid already exists locally (collision)
            const existing_new = await tx.select().from(tracks_table)
                .where(eq(tracks_table.uid, new_uid)).get();

            if (existing_new) {
                // Merge the old track's data into the existing one, then delete the old
                const old_track = await tx.select().from(tracks_table)
                    .where(eq(tracks_table.uid, old_uid)).get();
                if (old_track) {
                    const merged = this.accumulate_merge_tracks(existing_new, old_track);
                    await tx.update(tracks_table).set(merged)
                        .where(eq(tracks_table.uid, new_uid));
                    await tx.delete(tracks_table).where(eq(tracks_table.uid, old_uid));
                    if (queue_track_delete_change) {
                        await tx.insert(change_log_table).values({
                            table_name: 'tracks',
                            operation: 'delete',
                            record_id: old_uid,
                            data: { uid: old_uid },
                            synced: false,
                        });
                    }
                }
            } else {
                // Simple rename
                await tx.update(tracks_table)
                    .set({ uid: new_uid })
                    .where(eq(tracks_table.uid, old_uid));
            }

            // 2. Update playlists_tracks references
            // First, delete rows where old_uid would collide with an existing new_uid in the same playlist
            const old_uid_rows = await tx.select().from(playlists_tracks_table)
                .where(eq(playlists_tracks_table.track_uid, old_uid));
            const old_uuids = old_uid_rows.map((row) => row.uuid);
            const conflict_uuids = old_uuids.length > 0
                ? new Set((await tx.select({ uuid: playlists_tracks_table.uuid })
                    .from(playlists_tracks_table)
                    .where(and(
                        inArray(playlists_tracks_table.uuid, old_uuids),
                        eq(playlists_tracks_table.track_uid, new_uid),
                    ))).map((row) => row.uuid))
                : new Set<string>();

            if (conflict_uuids.size > 0) {
                await tx.delete(playlists_tracks_table)
                    .where(and(
                        inArray(playlists_tracks_table.uuid, [...conflict_uuids]),
                        eq(playlists_tracks_table.track_uid, old_uid)
                    ));
            }
            await tx.update(playlists_tracks_table)
                .set({ track_uid: new_uid })
                .where(eq(playlists_tracks_table.track_uid, old_uid));

            if (queue_playlist_track_changes && old_uid_rows.length > 0) {
                const playlist_track_changes = old_uid_rows.flatMap((row) => ([
                    {
                        table_name: 'playlists_tracks' as const,
                        operation: 'delete' as const,
                        record_id: `${row.uuid}:${old_uid}`,
                        data: { uuid: row.uuid, track_uid: old_uid },
                        synced: false,
                    },
                    {
                        table_name: 'playlists_tracks' as const,
                        operation: 'insert' as const,
                        record_id: `${row.uuid}:${new_uid}`,
                        data: { ...row, track_uid: new_uid },
                        synced: false,
                    },
                ]));
                await tx.insert(change_log_table).values(playlist_track_changes);
            }

            // 3. Update backpack (full track copy keyed by uid)
            await tx.update(backpack_table)
                .set({ uid: new_uid })
                .where(eq(backpack_table.uid, old_uid));

            // 4. Update recently_played_tracks (full track copy keyed by uid)
            await tx.update(recently_played_tracks_table)
                .set({ uid: new_uid })
                .where(eq(recently_played_tracks_table.uid, old_uid));

            // 5. Update track_plays references
            await tx.update(track_plays_table)
                .set({ track_uid: new_uid })
                .where(eq(track_plays_table.track_uid, old_uid));

            // 6. Update pending change_log entries
            await tx.update(change_log_table)
                .set({ record_id: new_uid })
                .where(and(
                    eq(change_log_table.record_id, old_uid),
                    eq(change_log_table.table_name, 'tracks'),
                    inArray(change_log_table.operation, ['insert', 'update'])
                ));
        });

        // 4. Update in-memory globals — only after transaction commits
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
            const { error } = await this.supabase.from('playlists')
                .update({ deleted: true })
                .eq('uuid', change.record_id)
                .eq('user_uid', user_uid);
            this.assert_supabase_ok(`push_playlist_change delete ${change.record_id}`, error);
            return;
        }

        const full_playlist = await db.select().from(playlists_table)
            .where(eq(playlists_table.uuid, change.record_id)).get();
        if (!full_playlist) return;

        const playlist: LocalPlaylist = change.operation === 'update'
            ? { ...full_playlist, ...(change.data as Partial<LocalPlaylist>) }
            : full_playlist;

        const row = this.playlist_to_insert(playlist, user_uid);
        const { error } = await this.supabase.from('playlists').upsert(row, { onConflict: 'uuid' });
        this.assert_supabase_ok(`push_playlist_change upsert ${change.record_id}`, error);
    }

    // -------------------------------------------------------------------------
    // Playlist-track push
    // -------------------------------------------------------------------------
    private async push_playlist_track_change(change: CompressedChange, user_uid: string) {
        const parsed = parse_playlist_track_record_id(change.record_id);
        if (!parsed) {
            throw new Error(`[SyncEngine] invalid playlists_tracks record_id: ${change.record_id}`);
        }

        if (change.operation === 'delete') {
            const { playlist_uuid, track_uid } = parsed;
            await this.assert_user_owns_playlist(playlist_uuid, user_uid);
            const { error } = await this.supabase.from('playlists_tracks')
                .update({ deleted: true })
                .eq('uuid', playlist_uuid)
                .eq('track_uid', track_uid);
            this.assert_supabase_ok(`push_playlist_track_change delete ${change.record_id}`, error);
            return;
        }

        const { playlist_uuid, track_uid } = parsed;

        const full_pt = await db.select().from(playlists_tracks_table)
            .where(and(
                eq(playlists_tracks_table.uuid, playlist_uuid),
                eq(playlists_tracks_table.track_uid, track_uid)
            )).get();
        if (!full_pt) return;

        await this.assert_user_owns_playlist(full_pt.uuid, user_uid);
        const { error } = await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(full_pt), { onConflict: 'uuid,track_uid' });
        if (!error) return;
        if (!this.is_playlists_tracks_track_fk_error(error)) {
            this.assert_supabase_ok(`push_playlist_track_change upsert ${change.record_id}`, error);
            return;
        }

        // Self-heal FK failures by ensuring the remote dependency exists and retrying once.
        const local_track = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, track_uid)).get();
        if (!local_track) {
            await db.delete(playlists_tracks_table)
                .where(and(
                    eq(playlists_tracks_table.uuid, playlist_uuid),
                    eq(playlists_tracks_table.track_uid, track_uid)
                ));
            console.warn(`[SyncEngine] push_playlist_track_change dropped dangling local row (missing local track): ${change.record_id}`);
            return;
        }

        let canonical_uid = track_uid;
        const resolved_uid = await this.resolve_canonical_uid(local_track);
        if (resolved_uid !== track_uid) {
            await this.remap_local_uid(track_uid, resolved_uid, false, false);
            canonical_uid = resolved_uid;
        }

        const canonical_track = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, canonical_uid)).get();
        if (!canonical_track) {
            throw new Error(`[SyncEngine] push_playlist_track_change recovery failed: canonical track missing ${canonical_uid}`);
        }

        const { error: track_error } = await this.supabase.from('tracks')
            .upsert(this.track_to_global_insert(canonical_track), { onConflict: 'uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency track upsert ${canonical_uid}`, track_error);

        const { error: utrack_error } = await this.supabase.from('utracks')
            .upsert(this.track_to_utrack_insert(canonical_track, user_uid), { onConflict: 'user_uid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency utrack upsert ${canonical_uid}`, utrack_error);

        const refreshed = await db.select().from(playlists_tracks_table)
            .where(and(
                eq(playlists_tracks_table.uuid, playlist_uuid),
                eq(playlists_tracks_table.track_uid, canonical_uid)
            )).get();
        if (!refreshed) {
            // Local row was remapped/deleted while recovering.
            return;
        }

        const { error: retry_error } = await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(refreshed), { onConflict: 'uuid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change upsert-retry ${playlist_uuid}:${canonical_uid}`, retry_error);
    }

    // -------------------------------------------------------------------------
    // New release push
    // -------------------------------------------------------------------------
    private async push_new_release_change(
        change: CompressedChange,
        user_uid: string,
        remote_identity_index?: Map<string, RemoteNewReleaseIdentityRow>,
    ) {
        // record_id for new_releases is title.uri (a string), not the numeric id.
        // For deletes, the numeric id is in change.data. For inserts/updates,
        // look up the local row by the unique title field.
        const data = change.data as Partial<LocalNewRelease> | null;
        const identity_index = remote_identity_index ?? await this.list_remote_new_release_identity_index(user_uid);

        if (change.operation === 'delete') {
            let numeric_id = data?.id ?? null;
            if (numeric_id == null && change.record_id.length > 0) {
                const remote = identity_index.get(`uri:${change.record_id}`);
                numeric_id = remote?.id ?? null;
            }
            if (numeric_id == null) {
                console.warn(`[SyncEngine] push_new_release_change delete skipped (no remote id): ${change.record_id}`);
                return;
            }
            const { error } = await this.supabase.from('new_releases')
                .update({ deleted: true })
                .eq('id', numeric_id)
                .eq('user_uid', user_uid);
            this.assert_supabase_ok(`push_new_release_change delete ${change.record_id}`, error);
            if (change.record_id.length > 0) {
                const key = `uri:${change.record_id}`;
                const remote = identity_index.get(key);
                if (remote) {
                    identity_index.set(key, { id: remote.id, deleted: true });
                }
            }
            return;
        }

        // Look up by numeric id if available (from change.data), otherwise scan by title URI
        let full_release: LocalNewRelease | undefined;
        if (data?.id != null) {
            full_release = await db.select().from(new_releases_table)
                .where(eq(new_releases_table.id, data.id)).get();
        }
        if (!full_release) {
            // Fallback: find by title URI matching record_id
            const all_releases = await db.select().from(new_releases_table);
            full_release = all_releases.find(r => {
                return new_release_identity_key(r.title) === `uri:${change.record_id}`;
            });
        }
        if (!full_release) return;

        const release: LocalNewRelease = change.operation === 'update'
            ? { ...full_release, ...data }
            : full_release;

        const row = this.new_release_to_insert(release, user_uid);
        const identity_key = new_release_identity_key(release.title);
        if (identity_key === null) {
            console.warn(`[SyncEngine] push_new_release_change skipped ${change.operation} with invalid title identity: ${change.record_id}`);
            return;
        }

        const remote = identity_index.get(identity_key);
        if (remote) {
            const { error } = await this.supabase.from('new_releases')
                .update({ ...row, deleted: false })
                .eq('id', remote.id)
                .eq('user_uid', user_uid);
            this.assert_supabase_ok(`push_new_release_change update ${change.record_id}`, error);
            identity_index.set(identity_key, { id: remote.id, deleted: false });
            return;
        }

        const { data: inserted, error } = await this.supabase.from('new_releases')
            .insert(row)
            .select('id')
            .single();
        this.assert_supabase_ok(`push_new_release_change insert ${change.record_id}`, error);
        if (inserted && typeof inserted.id === 'number') {
            identity_index.set(identity_key, { id: inserted.id, deleted: false });
        }
    }

    private async assert_user_owns_playlist(playlist_uuid: string, user_uid: string) {
        const { data, error } = await this.supabase
            .from('playlists')
            .select('uuid')
            .eq('uuid', playlist_uuid)
            .eq('user_uid', user_uid)
            .limit(1);

        this.assert_supabase_ok(`assert_user_owns_playlist ${playlist_uuid}`, error);
        if (!data || data.length === 0) {
            throw new Error(`[SyncEngine] unauthorized playlist access: ${playlist_uuid}`);
        }
    }

    // -------------------------------------------------------------------------
    // PULL — fetch remote changes and apply to local DB
    // -------------------------------------------------------------------------
    private async pull_changes() {
        for (const table_name of SYNCABLE_TABLES) {
            await this.pull_table_changes(table_name);
        }
    }

    private async pull_table_changes(table_name: SyncableLocalTableName) {
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        // Subtract 2s buffer to cover sub-millisecond Supabase timestamp precision
        const last_sync_iso = new Date((metadata?.last_sync_at ?? 0) - 2000).toISOString();

        const pull_started_at = Date.now();
        const pull_started_iso = new Date(pull_started_at).toISOString();

        switch (table_name) {
            case 'tracks':           await this.pull_tracks(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'playlists':        await this.pull_playlists(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'new_releases':     await this.pull_new_releases(last_sync_iso, pull_started_iso, pull_started_at); break;
        }
    }

    private async save_pull_watermark(table_name: SyncableLocalTableName, pull_started_at: number) {
        await db
            .insert(sync_metadata_table)
            .values({ table_name, last_sync_at: pull_started_at, last_modified_at: pull_started_at })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: { last_sync_at: pull_started_at, last_modified_at: pull_started_at },
            });
    }

    private async pull_tracks(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;

        // Fetch utracks with embedded track data, paginated with stable ordering.
        let offset = 0;
        while (true) {
            const { data: utrack_rows, error: u_err } = await this.supabase
                .from('utracks')
                .select('*, tracks(*)')
                .eq('user_uid', user_uid)
                .gte('modified_at', last_sync_iso)
                .lte('modified_at', pull_started_iso)
                .order('modified_at', { ascending: true })
                .order('id', { ascending: true })
                .range(offset, offset + PULL_PAGE_SIZE - 1);

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

            if (utrack_rows.length < PULL_PAGE_SIZE) break;
            offset += utrack_rows.length;
        }

        // Also pull tracks enriched by other users since last sync
        const owned_uids = await this.get_owned_track_uids(user_uid);
        if (owned_uids.length > 0) {
            // Batch owned_uids to avoid PostgREST URL length limits on .in()
            const uid_chunks = chunk_array(owned_uids, IN_CLAUSE_CHUNK_SIZE);
            for (const uid_chunk of uid_chunks) {
                offset = 0;
                while (true) {
                    const { data: enriched, error: t_err } = await this.supabase
                        .from('tracks')
                        .select('*')
                        .gte('modified_at', last_sync_iso)
                        .lte('modified_at', pull_started_iso)
                        .in('uid', uid_chunk)
                        .order('modified_at', { ascending: true })
                        .order('uid', { ascending: true })
                        .range(offset, offset + PULL_PAGE_SIZE - 1);

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

                    if (enriched.length < PULL_PAGE_SIZE) break;
                    offset += enriched.length;
                }
            }
        }

        await this.save_pull_watermark('tracks', pull_started_at);
    }

    private async get_owned_track_uids(user_uid: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('utracks')
            .select('track_uid')
            .eq('user_uid', user_uid)
            .eq('deleted', false);
        this.assert_supabase_ok('get_owned_track_uids', error);

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
            result.plays = existing.plays > 0 ? existing.plays : (remote).plays;
            const local_meta_str = typeof existing.meta === 'string'
                ? existing.meta : JSON.stringify(existing.meta);
            result.meta = local_meta_str !== '{}' ? existing.meta : (remote).meta as any;
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

    private async pull_playlists(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;

        let offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('playlists')
                .select('*')
                .eq('user_uid', user_uid)
                .gte('modified_at', last_sync_iso)
                .lte('modified_at', pull_started_iso)
                .order('modified_at', { ascending: true })
                .order('uuid', { ascending: true })
                .range(offset, offset + PULL_PAGE_SIZE - 1);

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

            if (data.length < PULL_PAGE_SIZE) break;
            offset += data.length;
        }

        await this.save_pull_watermark('playlists', pull_started_at);
    }

    private async pull_playlists_tracks(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;

        const { data: user_playlists, error: user_playlist_error } = await this.supabase
            .from('playlists')
            .select('uuid')
            .eq('user_uid', user_uid)
            .eq('deleted', false);
        this.assert_supabase_ok('pull_playlists_tracks user playlists fetch', user_playlist_error);

        const playlist_uuids = (user_playlists ?? []).map(p => p.uuid);
        if (playlist_uuids.length === 0) {
            await this.save_pull_watermark('playlists_tracks', pull_started_at);
            return;
        }

        // Batch playlist UUIDs to avoid PostgREST URL length limits on .in()
        const uuid_chunks = chunk_array(playlist_uuids, IN_CLAUSE_CHUNK_SIZE);
        for (const uuid_chunk of uuid_chunks) {
            let offset = 0;
            while (true) {
                const { data, error } = await this.supabase
                    .from('playlists_tracks')
                    .select('*')
                    .in('uuid', uuid_chunk)
                    .gte('modified_at', last_sync_iso)
                    .lte('modified_at', pull_started_iso)
                    .order('modified_at', { ascending: true })
                    .order('id', { ascending: true })
                    .range(offset, offset + PULL_PAGE_SIZE - 1);

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

                if (data.length < PULL_PAGE_SIZE) break;
                offset += data.length;
            }
        }

        await this.save_pull_watermark('playlists_tracks', pull_started_at);
    }

    private async pull_new_releases(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;

        const local_rows = await db.select().from(new_releases_table);
        const local_by_key = new Map<string, LocalNewRelease[]>();
        for (const row of local_rows) {
            const key = new_release_identity_key(row.title);
            if (key === null) continue;
            const list = local_by_key.get(key) ?? [];
            list.push(row);
            local_by_key.set(key, list);
        }

        let offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('new_releases')
                .select('*')
                .eq('user_uid', user_uid)
                .gte('modified_at', last_sync_iso)
                .lte('modified_at', pull_started_iso)
                .order('modified_at', { ascending: true })
                .order('id', { ascending: true })
                .range(offset, offset + PULL_PAGE_SIZE - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const row of data) {
                // Remote and local IDs are independent autoincrement sequences,
                // so match by the unique `title` column instead.
                const title_key = new_release_identity_key(row.title);
                if (title_key === null) {
                    console.warn('[SyncEngine] pull_new_releases skipped row with invalid title identity');
                    continue;
                }

                if (row.deleted) {
                    const existing_rows = local_by_key.get(title_key) ?? [];
                    if (existing_rows.length > 0) {
                        await db.delete(new_releases_table)
                            .where(inArray(new_releases_table.id, existing_rows.map((item) => item.id)));
                        local_by_key.delete(title_key);
                    }
                    continue;
                }

                const local = this.remote_new_release_to_local(row);
                const existing_rows = local_by_key.get(title_key) ?? [];
                if (existing_rows.length > 0) {
                    const keeper = existing_rows[0];
                    await db.update(new_releases_table)
                        .set(local)
                        .where(eq(new_releases_table.id, keeper.id));
                    if (existing_rows.length > 1) {
                        await db.delete(new_releases_table)
                            .where(inArray(new_releases_table.id, existing_rows.slice(1).map((item) => item.id)));
                    }
                    local_by_key.set(title_key, [{ ...keeper, ...local }]);
                } else {
                    await db.insert(new_releases_table).values(local);
                    const inserted = await db.select().from(new_releases_table)
                        .where(eq(new_releases_table.title, local.title)).get();
                    if (inserted) {
                        local_by_key.set(title_key, [inserted]);
                    }
                }
            }

            if (data.length < PULL_PAGE_SIZE) break;
            offset += data.length;
        }

        await this.save_pull_watermark('new_releases', pull_started_at);
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
            ...(t.duration > 0 ? { duration: Math.round(t.duration) } : {}),
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
            plays:       safe_int(t.plays),
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
        this.is_destroyed = true;
        this.destroy_generation += 1;
        this.is_initialized = false;
        if (this.sync_interval) {
            clearInterval(this.sync_interval);
            this.sync_interval = undefined;
        }
        if (this.debounce_timeout) {
            clearTimeout(this.debounce_timeout);
            this.debounce_timeout = undefined;
        }
        if (this.network_subscription) {
            this.network_subscription();
            this.network_subscription = undefined;
        }
        ChangeTracker.set_on_change(() => undefined);
    }
}
