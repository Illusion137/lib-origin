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
import { SQLGlobal } from '../../sql/sql_global';

type SyncableLocalTableName = 'tracks' | 'playlists' | 'playlists_tracks' | 'new_releases';
const SYNCABLE_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks', 'new_releases'];
const BATCH_SIZE = 250;
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

/**
 * Epoch coercion for comparisons/merge logic.
 * If invalid/missing, return 0 so remote can't "win" by accident.
 */
function safe_to_epoch_merge(value: unknown): number {
    if (value == null) return 0;
    const d = new Date(value as number | string);
    return isNaN(d.getTime()) ? 0 : d.getTime();
}

function normalize_soundcloud_id(value: unknown): number {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    const r = Math.round(n);
    if (!Number.isSafeInteger(r) || r <= 0) return 0;
    return r;
}

// Coerce to PostgreSQL int4, using 0 as safe sentinel for invalid/out-of-range values.
function safe_int(value: unknown): number {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    const r = Math.round(n);
    if (r < -2147483648 || r > 2147483647) return 0;
    return r;
}

function safe_json_parse<T>(value: unknown, fallback: T): T {
    if (value == null) return fallback;
    if (typeof value !== 'string') return value as T;
    const trimmed = value.trim();
    if (trimmed.length === 0) return fallback;
    try {
        return JSON.parse(trimmed) as T;
    } catch {
        return fallback;
    }
}

function normalize_json_string(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'string') return value.trim();
    try {
        return JSON.stringify(value);
    } catch {
        return null;
    }
}

function is_empty_json_array(value: unknown): boolean {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') {
        const s = value.trim();
        if (s === '' || s === '[]') return true;
        const parsed = safe_json_parse<unknown>(s, null);
        return Array.isArray(parsed) ? parsed.length === 0 : false;
    }
    return false;
}

function is_empty_album(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === 'string') {
        const s = value.trim();
        if (s === '') return true;
        const parsed = safe_json_parse<any>(s, null);
        if (parsed == null) return false; // invalid JSON => treat as non-empty to avoid clobbering
        return is_empty_album(parsed);
    }
    if (typeof value !== 'object') return false;
    const v = value as { name?: unknown; uri?: unknown };
    const name = typeof v.name === 'string' ? v.name : '';
    const uri = v.uri;
    const uri_is_empty = uri == null || uri === '';
    return name.trim() === '' && uri_is_empty;
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

    private async is_initial_sync_complete(): Promise<boolean> {
        const row = await db.select().from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, INITIAL_SYNC_COMPLETE_MARKER)).get();
        return Boolean(row);
    }

    private async get_pending_change_sets(table_name: SyncableLocalTableName): Promise<{
        upserts: Set<string>;
        deletes: Set<string>;
    }> {
        const upserts = new Set<string>();
        const deletes = new Set<string>();
        const compressed_changes = await ChangeTracker.get_pending_changes(Number.MAX_SAFE_INTEGER);
        for (const change of compressed_changes) {
            if (change.table !== table_name) continue;
            if (change.operation === 'delete') deletes.add(change.record_id);
            else upserts.add(change.record_id);
        }
        return { upserts, deletes };
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
                .eq('deleted', false)
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
                    .eq('deleted', false)
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
            await this.initial_sync();
            const initial_sync_complete = await this.is_initial_sync_complete();
            if (!initial_sync_complete) {
                if (this.is_destroyed) return;
                await this.push_changes();
                return;
            }
            if (this.is_destroyed) return;
            await this.push_changes();
            if (this.is_destroyed) return;
            await this.pull_changes();
            if (this.is_destroyed) return;
            await ChangeTracker.delete_irresolvable_changes();
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
    // -------------------------------------------------------------------------
    private async initial_sync() {
        if (this.initial_sync_promise) {
            await this.initial_sync_promise;
            return;
        }

        this.initial_sync_promise = (async () => {
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
                const result = await this.initial_sync_tracks(user_uid);
                tracks_done = stage_succeeded(result);
                if (tracks_done) {
                    await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.tracks);
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
                new_releases_done = result.failed === 0 && result.skipped === 0;
                if (new_releases_done) {
                    await this.mark_initial_sync_stage_complete(INITIAL_SYNC_STAGE_MARKERS.new_releases);
                }
            }

            if (!tracks_done || !playlists_done || !playlists_tracks_done || !new_releases_done) {
                return;
            }

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
        const already_synced = new Set<string>();
        let fetch_offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('utracks')
                .select('track_uid')
                .eq('user_uid', user_uid)
                .eq('deleted', false)
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

            const { error: tracks_err } = await this.supabase.from('tracks')
                .upsert(batch.map(t => this.track_to_global_insert(t)), { onConflict: 'uid' });

            if (tracks_err) {
                for (const single of batch) {
                    try {
                        const { error: te } = await this.supabase.from('tracks')
                            .upsert(this.track_to_global_insert(single), { onConflict: 'uid' });
                        if (te) throw te;
                        const { error: ue } = await this.supabase.from('utracks')
                            .upsert(this.track_to_utrack_insert(single, user_uid), { onConflict: 'user_uid,track_uid' });
                        if (ue) throw ue;
                        uploaded += 1;
                    } catch (single_error) {
                        console.warn(`[SyncEngine] initial_sync tracks row failed ${single.uid}:`, single_error);
                        failed += 1;
                    }
                }
                console.warn('[SyncEngine] initial_sync tracks batch failed; continued with row-level retries:', tracks_err);
                continue;
            }

            const { error: utracks_err } = await this.supabase.from('utracks')
                .upsert(batch.map(t => this.track_to_utrack_insert(t, user_uid)), { onConflict: 'user_uid,track_uid' });

            if (utracks_err) {
                for (const row of batch) {
                    try {
                        const { error: ue } = await this.supabase.from('utracks')
                            .upsert(this.track_to_utrack_insert(row, user_uid), { onConflict: 'user_uid,track_uid' });
                        if (ue) throw ue;
                        uploaded += 1;
                    } catch (single_error) {
                        console.warn(`[SyncEngine] initial_sync tracks utrack upsert failed ${row.uid}:`, single_error);
                        failed += 1;
                    }
                }
            } else {
                uploaded += batch.length;
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
        db.$client.flushPendingReactiveQueries();
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
                    case 'tracks': await this.push_track_change(change, user_uid); break;
                    case 'playlists': await this.push_playlist_change(change, user_uid); break;
                    case 'playlists_tracks': await this.push_playlist_track_change(change, user_uid); break;
                    case 'new_releases': await this.push_new_release_change(change, user_uid, remote_identity_index); break;
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
    // Also ensure duration is monotonic-max: always write the greatest duration to server.
    // -------------------------------------------------------------------------
    private async push_track_change(change: CompressedChange, user_uid: string) {
        if (change.operation === 'delete') {
            const { error } = await this.supabase.from('utracks')
                .update({ deleted: true })
                .eq('user_uid', user_uid)
                .eq('track_uid', change.record_id);
            this.assert_supabase_ok(`push_track_change delete ${change.record_id}`, error);
            return;
        }

        const full_track = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, change.record_id)).get();
        if (!full_track) return;

        const track: LocalTrack = change.operation === 'update'
            ? { ...full_track, ...(change.data as Partial<LocalTrack>) }
            : full_track;

        // Fetch remote duration so we can enforce "greatest duration wins" at the source of truth (tracks table).
        let remote_duration = 0;
        try {
            const { data: remote_row, error: remote_error } = await this.supabase
                .from('tracks')
                .select('duration')
                .eq('uid', track.uid)
                .limit(1)
                .maybeSingle();
            if (remote_error) throw remote_error;
            remote_duration = typeof remote_row?.duration === 'number' ? remote_row.duration : 0;
        } catch (e) {
            // Don't fail the whole push; fallback to local duration.
            console.warn(`[SyncEngine] push_track_change remote duration fetch failed ${track.uid}:`, e);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
        const local_duration = Math.round(Number(track.duration ?? 0));
        const best_duration = Math.max(
            isFinite(local_duration) ? local_duration : 0,
            isFinite(remote_duration) ? remote_duration : 0
        );

        const global_insert = this.track_to_global_insert({
            ...track,
            duration: best_duration,
        } as LocalTrack);

        const { error: track_error } = await this.supabase.from('tracks')
            .upsert(global_insert, { onConflict: 'uid' });
        this.assert_supabase_ok(`push_track_change tracks upsert ${track.uid}`, track_error);

        const { error: utrack_error } = await this.supabase.from('utracks')
            .upsert({ ...this.track_to_utrack_insert(track, user_uid), deleted: false }, { onConflict: 'user_uid,track_uid' });
        this.assert_supabase_ok(`push_track_change utracks upsert ${track.uid}`, utrack_error);
    }

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

        const { error: track_error } = await this.supabase.from('tracks')
            .upsert(this.track_to_global_insert(local_track), { onConflict: 'uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency track upsert ${track_uid}`, track_error);

        const { error: utrack_error } = await this.supabase.from('utracks')
            .upsert({ ...this.track_to_utrack_insert(local_track, user_uid), deleted: false }, { onConflict: 'user_uid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency utrack upsert ${track_uid}`, utrack_error);

        const { error: retry_error } = await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(full_pt), { onConflict: 'uuid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change upsert-retry ${playlist_uuid}:${track_uid}`, retry_error);
    }

    private async push_new_release_change(
        change: CompressedChange,
        user_uid: string,
        remote_identity_index?: Map<string, RemoteNewReleaseIdentityRow>,
    ) {
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

        let full_release: LocalNewRelease | undefined;
        if (data?.id != null) {
            full_release = await db.select().from(new_releases_table)
                .where(eq(new_releases_table.id, data.id)).get();
        }
        if (!full_release) {
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

        const last_sync_iso = new Date((metadata?.last_sync_at ?? 0) - 2000).toISOString();

        const pull_started_at = Date.now();
        const pull_started_iso = new Date(pull_started_at).toISOString();

        switch (table_name) {
            case 'tracks': await this.pull_tracks(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'playlists': await this.pull_playlists(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso, pull_started_iso, pull_started_at); break;
            case 'new_releases': await this.pull_new_releases(last_sync_iso, pull_started_iso, pull_started_at); break;
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

        const pending_track_changes = await this.get_pending_change_sets('tracks');
        const owned_uids = await this.get_owned_track_uids_all(user_uid);

        // PASS A: utracks changes (delete/restore + user fields)
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
                    plays: row.plays,
                    meta: row.meta,
                    deleted: row.deleted,
                };

                try {
                    await this.apply_track(merged, pending_track_changes);
                } catch (err) {
                    console.warn('[SyncEngine] pull_tracks apply_track failed:', err);
                }
            }

            if (utrack_rows.length < PULL_PAGE_SIZE) break;
            offset += utrack_rows.length;
        }

        // PASS B: global metadata edits (tracks.modified_at) for owned tracks (including deleted ones)
        if (owned_uids.length > 0) {
            const uid_chunks = chunk_array(owned_uids, IN_CLAUSE_CHUNK_SIZE);
            for (const uid_chunk of uid_chunks) {
                offset = 0;
                while (true) {
                    const { data: global_rows, error: t_err } = await this.supabase
                        .from('tracks')
                        .select('*')
                        .gte('modified_at', last_sync_iso)
                        .lte('modified_at', pull_started_iso)
                        .in('uid', uid_chunk)
                        .order('modified_at', { ascending: true })
                        .order('uid', { ascending: true })
                        .range(offset, offset + PULL_PAGE_SIZE - 1);

                    if (t_err) throw t_err;
                    if (!global_rows || global_rows.length === 0) break;

                    for (const track_row of global_rows) {
                        try {
                            await this.apply_global_track(track_row, pending_track_changes);
                        } catch (err) {
                            console.warn('[SyncEngine] pull_tracks apply_global_track failed:', err);
                        }
                    }

                    if (global_rows.length < PULL_PAGE_SIZE) break;
                    offset += global_rows.length;
                }
            }
        }

        await this.save_pull_watermark('tracks', pull_started_at);
    }

    private async get_owned_track_uids_all(user_uid: string): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('utracks')
            .select('track_uid')
            .eq('user_uid', user_uid);
        this.assert_supabase_ok('get_owned_track_uids_all', error);

        return (data ?? []).map(r => r.track_uid);
    }

    private async apply_global_track(
        row: Database['public']['Tables']['tracks']['Row'],
        pending_track_changes: { upserts: Set<string>; deletes: Set<string> },
    ) {
        const uid = row.uid;
        if (!uid) return;

        if (pending_track_changes.deletes.has(uid)) return;

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, uid)).get();
        if (!existing) return;

        const merged = this.remote_merge_local(existing, row);
        await db.update(tracks_table).set(merged).where(eq(tracks_table.uid, uid));
        SQLGlobal.update_global_track_item(uid, { ...existing, ...merged } as LocalTrack);
        db.$client.flushPendingReactiveQueries();
    }

    private async apply_track(
        row: RemoteTrackWithUserData,
        pending_track_changes?: { upserts: Set<string>; deletes: Set<string> }
    ) {
        const has_pending_delete = pending_track_changes
            ? pending_track_changes.deletes.has(row.uid)
            : Boolean(await db.select({ id: change_log_table.id })
                .from(change_log_table)
                .where(and(
                    eq(change_log_table.synced, false),
                    eq(change_log_table.table_name, 'tracks'),
                    eq(change_log_table.operation, 'delete'),
                    eq(change_log_table.record_id, row.uid),
                ))
                .limit(1)
                .get());

        const has_pending_upsert = pending_track_changes
            ? pending_track_changes.upserts.has(row.uid)
            : Boolean(await db.select({ id: change_log_table.id })
                .from(change_log_table)
                .where(and(
                    eq(change_log_table.synced, false),
                    eq(change_log_table.table_name, 'tracks'),
                    inArray(change_log_table.operation, ['insert', 'update']),
                    eq(change_log_table.record_id, row.uid),
                ))
                .limit(1)
                .get());

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, row.uid)).get();

        // Remote delete -> soft-delete locally (preserve URIs)
        if (row.deleted) {
            if (has_pending_upsert) return;

            if (existing) {
                await db.update(tracks_table)
                    .set({
                        deleted: true,
                        modified_at: Math.max(existing.modified_at, safe_to_epoch_merge(row.modified_at)),
                    })
                    .where(eq(tracks_table.uid, row.uid));
                SQLGlobal.update_global_track_item(row.uid, { ...existing, deleted: true } as LocalTrack);
                db.$client.flushPendingReactiveQueries();
            }
            return;
        }

        // Remote restore
        if (has_pending_delete) return;

        if (existing) {
            const merged = this.remote_merge_local(existing, row);

            // Always preserve local-only URIs
            merged.media_uri = existing.media_uri;
            merged.thumbnail_uri = existing.thumbnail_uri;
            merged.lyrics_uri = existing.lyrics_uri;
            merged.synced_lyrics_uri = existing.synced_lyrics_uri;

            merged.deleted = false;

            // If there's a pending local upsert, preserve user fields
            if (has_pending_upsert) {
                merged.plays = existing.plays;
                // merged.meta = existing.meta;
            }

            await db.update(tracks_table).set(merged)
                .where(eq(tracks_table.uid, row.uid));
            SQLGlobal.update_global_track_item(row.uid, { ...existing, ...merged } as LocalTrack);
            db.$client.flushPendingReactiveQueries();
            return;
        }

        // Insert new non-deleted track (will have empty URIs; can't preserve what never existed locally)
        const local = this.remote_track_to_local(row);
        await db.insert(tracks_table).values(local);
        SQLGlobal.add_global_track_item(local as LocalTrack);
        db.$client.flushPendingReactiveQueries();
    }

    // -------------------------------------------------------------------------
    // Merge helpers
    // -------------------------------------------------------------------------
    // eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
    private accumulate_merge_local(
        existing: LocalTrack,
        remote: RemoteTrackWithUserData | Database['public']['Tables']['tracks']['Row'],
    ): Partial<LocalTrack> {
        const pick_str = (local: string, remote_val: string): string =>
            local !== '' ? local : remote_val;
        const pick_num = (local: number, remote_val: number): number =>
            local !== 0 ? local : remote_val;

        const remote_artists = typeof remote.artists === 'string'
            ? safe_json_parse<any[]>(remote.artists, [])
            : (remote.artists as any[]);
        const remote_tags = typeof remote.tags === 'string'
            ? safe_json_parse<any[]>(remote.tags, [])
            : (remote.tags as any[]);
        const remote_album = typeof remote.album === 'string'
            ? safe_json_parse<any>(remote.album, { name: '', uri: null })
            : remote.album;

        const local_artists_is_empty = is_empty_json_array(existing.artists);
        const local_tags_is_empty = is_empty_json_array(existing.tags);
        const local_album_is_empty = is_empty_album(existing.album);

        const result: Partial<LocalTrack> = {
            title: pick_str(existing.title, remote.title),
            alt_title: pick_str(existing.alt_title, remote.alt_title),
            artists: local_artists_is_empty ? remote_artists : existing.artists,
            duration: Math.max(existing.duration ?? 0, remote.duration ?? 0), // greatest duration wins locally
            prods: pick_str(existing.prods, remote.prods),
            genre: pick_str(existing.genre, remote.genre),
            tags: local_tags_is_empty ? remote_tags : existing.tags,
            explicit: existing.explicit !== 'NONE' ? existing.explicit : remote.explicit as any,
            unreleased: existing.unreleased || remote.unreleased,
            album: local_album_is_empty ? remote_album : existing.album,
            artwork_url: pick_str(existing.artwork_url, remote.artwork_url),

            youtube_id: pick_str(existing.youtube_id, remote.youtube_id),
            youtubemusic_id: pick_str(existing.youtubemusic_id, remote.youtubemusic_id),
            soundcloud_id: pick_num(existing.soundcloud_id, remote.soundcloud_id),
            soundcloud_permalink: pick_str(existing.soundcloud_permalink, remote.soundcloud_permalink),
            spotify_id: pick_str(existing.spotify_id, remote.spotify_id),
            amazonmusic_id: pick_str(existing.amazonmusic_id, remote.amazonmusic_id),
            applemusic_id: pick_str(existing.applemusic_id, remote.applemusic_id),
            bandlab_id: pick_str(existing.bandlab_id, remote.bandlab_id),
            illusi_id: pick_str(existing.illusi_id, remote.illusi_id),
            imported_id: pick_str(existing.imported_id, remote.imported_id),

            modified_at: Math.max(existing.modified_at, safe_to_epoch_merge(remote.modified_at)),
        };

        if ('plays' in remote && 'meta' in remote) {
            result.plays = existing.plays > 0 ? existing.plays : (remote).plays;

            // const local_meta_str = normalize_json_string(existing.meta) ?? '';
            // const remote_meta = typeof (remote).meta === 'string'
            //     ? safe_json_parse<any>((remote).meta, {})
            //     : (remote).meta;

            // Remote-first meta, but never wipe local with an empty remote meta payload.
            const remote_meta = typeof (remote).meta === 'string'
                ? safe_json_parse<any>((remote).meta, {})
                : (remote).meta;
            const remote_meta_str = normalize_json_string(remote_meta) ?? '';
            const remote_meta_is_empty = remote_meta_str === '' || remote_meta_str === '{}' || remote_meta_str === 'null';
            result.meta = remote_meta_is_empty ? existing.meta : remote_meta;
        }

        return result;
    }

    private remote_merge_local(
        existing: LocalTrack,
        remote: RemoteTrackWithUserData | Database['public']['Tables']['tracks']['Row'],
    ): Partial<LocalTrack> {
        const pick_str = (local: string, remote_val: string): string =>
            local !== '' ? local : remote_val;
        const pick_num = (local: number, remote_val: number): number =>
            local !== 0 ? local : remote_val;

        const remote_artists = typeof remote.artists === 'string'
            ? safe_json_parse<any[]>(remote.artists, [])
            : (remote.artists as any[]);
        const remote_tags = typeof remote.tags === 'string'
            ? safe_json_parse<any[]>(remote.tags, [])
            : (remote.tags as any[]);
        const remote_album = typeof remote.album === 'string'
            ? safe_json_parse<any>(remote.album, { name: '', uri: null })
            : remote.album;

        const remote_artists_non_empty = !is_empty_json_array(remote_artists);
        const remote_tags_non_empty = !is_empty_json_array(remote_tags);
        const remote_album_non_empty = !is_empty_album(remote_album);

        const best_duration = Math.max(existing.duration ?? 0, remote.duration ?? 0);

        const result: Partial<LocalTrack> = {
            title: remote.title && remote.title.trim() !== '' ? remote.title : existing.title,
            alt_title: remote.alt_title && remote.alt_title.trim() !== '' ? remote.alt_title : existing.alt_title,
            artists: remote_artists_non_empty ? remote_artists : existing.artists,

            // greatest duration wins (prevents "starts at 0 then updates" from clobbering)
            duration: best_duration,

            prods: remote.prods && remote.prods.trim() !== '' ? remote.prods : existing.prods,
            genre: remote.genre && remote.genre.trim() !== '' ? remote.genre : existing.genre,
            tags: remote_tags_non_empty ? remote_tags : existing.tags,
            explicit: (remote.explicit !== 'NONE' ? remote.explicit : existing.explicit) as any,
            unreleased: remote.unreleased || existing.unreleased,
            album: remote_album_non_empty ? remote_album : existing.album,
            artwork_url: remote.artwork_url && remote.artwork_url.trim() !== '' ? remote.artwork_url : existing.artwork_url,

            youtube_id: pick_str(existing.youtube_id, remote.youtube_id),
            youtubemusic_id: pick_str(existing.youtubemusic_id, remote.youtubemusic_id),
            soundcloud_id: pick_num(existing.soundcloud_id, remote.soundcloud_id),
            soundcloud_permalink: pick_str(existing.soundcloud_permalink, remote.soundcloud_permalink),
            spotify_id: pick_str(existing.spotify_id, remote.spotify_id),
            amazonmusic_id: pick_str(existing.amazonmusic_id, remote.amazonmusic_id),
            applemusic_id: pick_str(existing.applemusic_id, remote.applemusic_id),
            bandlab_id: pick_str(existing.bandlab_id, remote.bandlab_id),
            illusi_id: pick_str(existing.illusi_id, remote.illusi_id),
            imported_id: pick_str(existing.imported_id, remote.imported_id),

            media_uri: existing.media_uri,
            thumbnail_uri: existing.thumbnail_uri,
            lyrics_uri: existing.lyrics_uri,
            synced_lyrics_uri: existing.synced_lyrics_uri,

            modified_at: Math.max(existing.modified_at, safe_to_epoch_merge(remote.modified_at)),
        };

        if ('plays' in remote && 'meta' in remote) {
            result.plays = existing.plays > 0 ? existing.plays : (remote).plays;

            // Remote-first meta, but never wipe local with an empty remote meta payload.
            const remote_meta = typeof (remote).meta === 'string'
                ? safe_json_parse<any>((remote).meta, {})
                : (remote).meta;
            const remote_meta_str = normalize_json_string(remote_meta) ?? '';
            const remote_meta_is_empty = remote_meta_str === '' || remote_meta_str === '{}' || remote_meta_str === 'null';
            result.meta = remote_meta_is_empty ? existing.meta : remote_meta;
        }

        return result;
    }

    private async pull_playlists(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (!user_uid) return;
        const pending_changes = await this.get_pending_change_sets('playlists');

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
                const record_id = row.uuid;
                const has_pending_upsert = pending_changes.upserts.has(record_id);
                const has_pending_delete = pending_changes.deletes.has(record_id);
                if (row.deleted) {
                    if (!has_pending_delete || has_pending_upsert) {
                        continue;
                    }
                    await db.delete(playlists_table).where(eq(playlists_table.uuid, row.uuid));
                    continue;
                }
                if (has_pending_upsert || has_pending_delete) {
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
        db.$client.flushPendingReactiveQueries();
        await this.save_pull_watermark('playlists', pull_started_at);
    }

    private async pull_playlists_tracks(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;
        const pending_changes = await this.get_pending_change_sets('playlists_tracks');

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
                    const record_id = `${row.uuid}:${row.track_uid}`;
                    const has_pending_upsert = pending_changes.upserts.has(record_id);
                    const has_pending_delete = pending_changes.deletes.has(record_id);
                    const existing = await db.select().from(playlists_tracks_table)
                        .where(and(
                            eq(playlists_tracks_table.uuid, row.uuid),
                            eq(playlists_tracks_table.track_uid, row.track_uid)
                        )).get();

                    if (row.deleted) {
                        if (!has_pending_delete || has_pending_upsert) {
                            continue;
                        }
                        if (existing) {
                            await db.delete(playlists_tracks_table)
                                .where(and(
                                    eq(playlists_tracks_table.uuid, row.uuid),
                                    eq(playlists_tracks_table.track_uid, row.track_uid)
                                ));
                        }
                        continue;
                    }
                    if (has_pending_upsert || has_pending_delete) {
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
        db.$client.flushPendingReactiveQueries();
        await this.save_pull_watermark('playlists_tracks', pull_started_at);
    }

    private async pull_new_releases(last_sync_iso: string, pull_started_iso: string, pull_started_at: number) {
        const user_uid = await get_authed_user_uid(this.supabase);
        if (user_uid === null) return;
        const pending_changes = await this.get_pending_change_sets('new_releases');

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
                const title_key = new_release_identity_key(row.title);
                if (title_key === null) {
                    console.warn('[SyncEngine] pull_new_releases skipped row with invalid title identity');
                    continue;
                }
                const release_record_id = title_key.startsWith('uri:') ? title_key.slice('uri:'.length) : null;

                if (row.deleted) {
                    const existing_rows = local_by_key.get(title_key) ?? [];
                    if (existing_rows.length > 0) {
                        if (release_record_id === null) {
                            continue;
                        }
                        const has_pending_upsert = pending_changes.upserts.has(release_record_id);
                        const has_pending_delete = pending_changes.deletes.has(release_record_id);
                        if (!has_pending_delete || has_pending_upsert) {
                            continue;
                        }
                        await db.delete(new_releases_table)
                            .where(inArray(new_releases_table.id, existing_rows.map((item) => item.id)));
                        local_by_key.delete(title_key);
                    }
                    continue;
                }
                if (release_record_id !== null) {
                    const has_pending_upsert = pending_changes.upserts.has(release_record_id);
                    const has_pending_delete = pending_changes.deletes.has(release_record_id);
                    if (has_pending_upsert || has_pending_delete) {
                        continue;
                    }
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

        db.$client.flushPendingReactiveQueries();
        await this.save_pull_watermark('new_releases', pull_started_at);
    }

    // -------------------------------------------------------------------------
    // local → remote insert shapes
    // -------------------------------------------------------------------------
    private track_to_global_insert(t: LocalTrack): RemoteTrackInsert {
        return {
            uid: t.uid,
            title: t.title,
            alt_title: t.alt_title,
            artists: t.artists,
            ...(t.duration > 0 ? { duration: Math.round(t.duration) } : {}),
            prods: t.prods,
            genre: t.genre,
            tags: t.tags,
            explicit: t.explicit,
            unreleased: t.unreleased,
            album: t.album,
            illusi_id: t.illusi_id,
            imported_id: t.imported_id,
            youtube_id: t.youtube_id,
            youtubemusic_id: t.youtubemusic_id,
            soundcloud_id: normalize_soundcloud_id(t.soundcloud_id),
            soundcloud_permalink: t.soundcloud_permalink,
            spotify_id: t.spotify_id,
            amazonmusic_id: t.amazonmusic_id,
            applemusic_id: t.applemusic_id,
            bandlab_id: t.bandlab_id,
            artwork_url: t.artwork_url,
            created_at: safe_to_iso(t.created_at),
            modified_at: safe_to_iso(t.modified_at),
        };
    }

    private track_to_utrack_insert(t: LocalTrack, user_uid: string): RemoteUTrackInsert {
        return {
            user_uid,
            track_uid: t.uid,
            plays: safe_int(t.plays),
            meta: t.meta,
            deleted: false,
            created_at: safe_to_iso(t.created_at),
            modified_at: safe_to_iso(t.modified_at),
        };
    }

    private playlist_to_insert(p: LocalPlaylist, user_uid: string): RemotePlaylistInsert {
        return {
            uuid: p.uuid,
            user_uid,
            title: p.title,
            description: p.description,
            pinned: p.pinned,
            archived: p.archived,
            sort: p.sort,
            public: p.public,
            public_uuid: p.public_uuid,
            inherited_playlists: p.inherited_playlists,
            inherited_searchs: p.inherited_searchs,
            linked_playlists: p.linked_playlists,
            deleted: false,
            created_at: safe_to_iso(p.created_at),
            modified_at: safe_to_iso(p.modified_at),
        };
    }

    private playlist_track_to_insert(pt: LocalPlaylistTrack): RemotePlaylistTrackInsert {
        return {
            uuid: pt.uuid,
            track_uid: pt.track_uid,
            deleted: false,
            created_at: safe_to_iso(pt.created_at),
        };
    }

    private new_release_to_insert(r: LocalNewRelease, user_uid: string): RemoteNewReleaseInsert {
        return {
            user_uid,
            title: r.title,
            artist: r.artist,
            artwork_url: r.artwork_url,
            artwork_thumbnails: r.artwork_thumbnails,
            explicit: r.explicit,
            album_type: r.album_type,
            type: r.type,
            date: r.date,
            song_track: r.song_track ?? null,
            deleted: false,
            created_at: safe_to_iso(r.created_at),
        };
    }

    // -------------------------------------------------------------------------
    // remote → local shapes
    // -------------------------------------------------------------------------
    private remote_track_to_local(row: RemoteTrackWithUserData): Omit<LocalTrack, 'id'> {
        return {
            uid: row.uid,
            title: row.title,
            alt_title: row.alt_title,
            artists: row.artists,
            duration: row.duration,
            prods: row.prods,
            genre: row.genre,
            tags: row.tags,
            explicit: row.explicit,
            unreleased: row.unreleased,
            album: row.album,
            illusi_id: row.illusi_id,
            imported_id: row.imported_id,
            youtube_id: row.youtube_id,
            youtubemusic_id: row.youtubemusic_id,
            soundcloud_id: row.soundcloud_id,
            soundcloud_permalink: row.soundcloud_permalink,
            spotify_id: row.spotify_id,
            amazonmusic_id: row.amazonmusic_id,
            applemusic_id: row.applemusic_id,
            bandlab_id: row.bandlab_id,
            artwork_url: row.artwork_url,
            plays: row.plays,
            meta: row.meta,
            thumbnail_uri: '',
            media_uri: '',
            lyrics_uri: '',
            synced_lyrics_uri: '',
            deleted: false,
            created_at: safe_to_epoch(row.created_at),
            modified_at: safe_to_epoch(row.modified_at),
        };
    }

    private remote_playlist_to_local(
        row: Database['public']['Tables']['playlists']['Row'],
        existing_thumbnail_uri: string,
    ): Omit<LocalPlaylist, 'id'> {
        return {
            uuid: row.uuid,
            title: row.title,
            description: row.description,
            pinned: row.pinned,
            archived: row.archived,
            sort: row.sort as LocalPlaylist['sort'],
            public: row.public,
            public_uuid: row.public_uuid,
            inherited_playlists: row.inherited_playlists,
            inherited_searchs: row.inherited_searchs,
            linked_playlists: row.linked_playlists,
            thumbnail_uri: existing_thumbnail_uri,
            deleted: false,
            date: row.created_at,
            created_at: safe_to_epoch(row.created_at),
            modified_at: safe_to_epoch(row.modified_at),
        };
    }

    private remote_playlist_track_to_local(
        row: Database['public']['Tables']['playlists_tracks']['Row'],
    ): Omit<LocalPlaylistTrack, 'id'> {
        return {
            uuid: row.uuid,
            track_uid: row.track_uid,
            deleted: false,
            created_at: safe_to_epoch(row.created_at),
        };
    }

    private remote_new_release_to_local(
        row: Database['public']['Tables']['new_releases']['Row'],
    ): Omit<LocalNewRelease, 'id'> {
        return {
            title: row.title,
            artist: row.artist,
            artwork_url: row.artwork_url,
            artwork_thumbnails: row.artwork_thumbnails,
            explicit: row.explicit,
            album_type: row.album_type,
            type: row.type,
            date: row.date,
            song_track: row.song_track,
            deleted: false,
            created_at: safe_to_epoch(row.created_at),
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