import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import {
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
import { SQLGlobal } from '../../sql/sql_global';

// ---------------------------------------------------------------------------
// Tables that participate in push (change_log processing order matters:
// tracks must be pushed before playlists_tracks to avoid FK errors).
// ---------------------------------------------------------------------------
type SyncableLocalTableName = 'tracks' | 'playlists' | 'playlists_tracks' | 'new_releases';
const PUSH_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks', 'new_releases'];
// new_releases is push-only; pull is disabled per product contract.
const PULL_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks'];

const BATCH_SIZE = 250;
const PULL_PAGE_SIZE = 1000;
const IN_CLAUSE_CHUNK_SIZE = 300;

// ---------------------------------------------------------------------------
// Classification of push errors
// ---------------------------------------------------------------------------
type PushResult = 'synced' | 'dropped' | 'retry';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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
        if (parsed == null) return false;
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
        } catch {
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

/**
 * Classify a Supabase/PostgREST error for push retry logic.
 *
 * - dropped: non-retryable (unique/check constraint, invalid data).
 *   The changelog entry should be removed so the queue can drain.
 * - retry:   transient (network failure, 5xx, rate-limit).
 *   The changelog entry should be kept and retried later.
 */
function classify_push_error(error: unknown): PushResult {
    if (!error || typeof error !== 'object') return 'retry';
    const e = error as { code?: unknown; message?: unknown; status?: unknown };
    const code = typeof e.code === 'string' ? e.code : '';
    const status = typeof e.status === 'number' ? e.status : 0;

    // PostgreSQL unique-constraint and check-constraint violations → drop
    if (code === '23505') return 'dropped'; // unique_violation
    if (code === '23514') return 'dropped'; // check_violation
    if (code === '22P02') return 'dropped'; // invalid_text_representation
    if (code === '22003') return 'dropped'; // numeric_value_out_of_range
    if (code === '42501') return 'dropped'; // insufficient_privilege (RLS rejected)
    if (code === 'PGRST301') return 'dropped'; // JWT expired — needs re-auth, not a data problem

    // HTTP-level non-retryable client errors
    if (status === 409) return 'dropped'; // Conflict
    if (status === 422) return 'dropped'; // Unprocessable entity

    // Everything else: network issue, 5xx, etc. — retry
    return 'retry';
}

export class SyncEngine {
    private is_syncing = false;
    private is_initialized = false;
    private is_destroyed = false;
    private resync_requested = false;
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

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Request a full resync. On the next sync cycle the engine will:
     * 1. Push all local state to remote (idempotent upserts).
     * 2. Reset pull watermarks to epoch so all remote data is re-fetched.
     * 3. Resume normal incremental sync.
     */
    request_resync() {
        this.resync_requested = true;
        this.schedule_sync(500);
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

        // Schedule an initial sync shortly after startup.
        this.schedule_sync(1000);

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

    // destroy_generation is used to cancel inflight initialize() calls after destroy().
    private destroy_generation = 0;

    async sync() {
        if (this.is_syncing || this.is_destroyed) return;
        this.last_sync_started_at = Date.now();
        try {
            this.is_syncing = true;

            const user_uid = await get_authed_user_uid(this.supabase);
            if (!user_uid) return;

            if (this.is_destroyed) return;

            // Handle resync request: push all local state then reset pull watermarks.
            if (this.resync_requested) {
                this.resync_requested = false;
                await this.resync(user_uid);
                if (this.is_destroyed) return;
            }

            await this.push_changes(user_uid);
            if (this.is_destroyed) return;
            await this.pull_changes(user_uid);
            if (this.is_destroyed) return;
            await ChangeTracker.delete_irresolvable_changes();
            if (this.is_destroyed) return;

            // Always update last_synced after a complete push+pull cycle.
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
    // RESYNC — push all local state and reset pull watermarks
    // -------------------------------------------------------------------------
    private async resync(user_uid: string) {
        console.info('[SyncEngine] resync started — pushing all local state');

        // Push all local tracks (global + utrack).
        const all_tracks = await db.select().from(tracks_table);
        for (let i = 0; i < all_tracks.length; i += BATCH_SIZE) {
            const batch = all_tracks.slice(i, i + BATCH_SIZE);
            await this.supabase.from('tracks')
                .upsert(batch.map(t => this.track_to_global_insert(t)), { onConflict: 'uid' });
            await this.supabase.from('utracks')
                .upsert(batch.map(t => this.track_to_utrack_insert(t, user_uid)), { onConflict: 'user_uid,track_uid' });
        }

        // Push all local playlists.
        const all_playlists = await db.select().from(playlists_table);
        for (let i = 0; i < all_playlists.length; i += BATCH_SIZE) {
            const batch = all_playlists.slice(i, i + BATCH_SIZE);
            await this.supabase.from('playlists')
                .upsert(batch.map(p => this.playlist_to_insert(p, user_uid)), { onConflict: 'uuid' });
        }

        // Push all local playlist tracks.
        const all_pts = await db.select().from(playlists_tracks_table);
        for (let i = 0; i < all_pts.length; i += BATCH_SIZE) {
            const batch = all_pts.slice(i, i + BATCH_SIZE);
            await this.supabase.from('playlists_tracks')
                .upsert(batch.map(pt => this.playlist_track_to_insert(pt)), { onConflict: 'uuid,track_uid' });
        }

        // Push all local new_releases (push-only, insert with conflict ignore).
        const all_nr = await db.select().from(new_releases_table);
        for (let i = 0; i < all_nr.length; i += BATCH_SIZE) {
            const batch = all_nr.slice(i, i + BATCH_SIZE);
            const rows = batch.flatMap(r => {
                const key = new_release_identity_key(r.title);
                if (key === null) return [];
                return [this.new_release_to_insert(r, user_uid)];
            });
            if (rows.length > 0) {
                await this.supabase.from('new_releases')
                    .upsert(rows, { onConflict: 'user_uid,title', ignoreDuplicates: true });
            }
        }

        // Reset all pull watermarks so everything is re-fetched from epoch.
        for (const table_name of PULL_TABLES) {
            await db.insert(sync_metadata_table)
                .values({ table_name, last_sync_at: 0, last_modified_at: 0 })
                .onConflictDoUpdate({
                    target: sync_metadata_table.table_name,
                    set: { last_sync_at: 0, last_modified_at: 0 },
                });
        }

        console.info('[SyncEngine] resync complete');
    }

    // -------------------------------------------------------------------------
    // PUSH — process pending change_log entries with per-record failure isolation
    // -------------------------------------------------------------------------
    private async push_changes(user_uid: string) {
        let has_more = true;

        while (has_more) {
            const changes = await ChangeTracker.get_pending_changes(BATCH_SIZE);
            if (changes.length === 0) { has_more = false; break; }

            const by_table = changes.reduce<Record<string, CompressedChange[]>>((acc, c) => {
                (acc[c.table] ??= []).push(c);
                return acc;
            }, {});

            const synced_ids: number[] = [];
            const dropped_ids: number[] = [];
            const dropped_reasons = new Map<number, string>();

            // Process in dependency order (tracks before playlists_tracks).
            const ordered_table_names = [
                ...PUSH_TABLES,
                ...Object.keys(by_table).filter((name) =>
                    !PUSH_TABLES.includes(name as SyncableLocalTableName))
            ];

            for (const table_name of ordered_table_names) {
                const table_changes = by_table[table_name];
                if (!table_changes || table_changes.length === 0) continue;
                const remote_table = LOCAL_TO_REMOTE_TABLE_MAP[table_name as LocalTableName];
                if (remote_table === null) {
                    // Local-only table — mark as synced immediately.
                    synced_ids.push(...table_changes.flatMap(c => c.change_ids));
                    continue;
                }

                for (const change of table_changes) {
                    const result = await this.push_single_change(
                        table_name as SyncableLocalTableName, change, user_uid
                    );
                    if (result.outcome === 'synced') {
                        synced_ids.push(...change.change_ids);
                    } else if (result.outcome === 'dropped') {
                        dropped_ids.push(...change.change_ids);
                        for (const id of change.change_ids) {
                            dropped_reasons.set(id, result.reason ?? '');
                        }
                    }
                    // 'retry' → leave in change_log for next cycle
                }
            }

            if (synced_ids.length > 0) {
                await ChangeTracker.mark_as_synced(synced_ids);
            }
            if (dropped_ids.length > 0) {
                // Group drops by reason to avoid N separate DB calls.
                const by_reason = new Map<string, number[]>();
                for (const id of dropped_ids) {
                    const reason = dropped_reasons.get(id) ?? '';
                    const list = by_reason.get(reason) ?? [];
                    list.push(id);
                    by_reason.set(reason, list);
                }
                for (const [reason, ids] of by_reason.entries()) {
                    await ChangeTracker.mark_as_dropped(ids, reason);
                }
            }

            const progress = synced_ids.length + dropped_ids.length;
            if (progress === 0) {
                // All changes in this batch are retryable — stop and backoff.
                console.warn(
                    `[SyncEngine] push stalled: ${changes.length} compressed changes are all retryable; ` +
                    'will retry on next sync cycle'
                );
                break;
            }
            has_more = changes.length === BATCH_SIZE;
        }
    }

    private async push_single_change(
        table_name: SyncableLocalTableName,
        change: CompressedChange,
        user_uid: string,
    ): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            switch (table_name) {
                case 'tracks':           await this.push_track_change(change, user_uid); break;
                case 'playlists':        await this.push_playlist_change(change, user_uid); break;
                case 'playlists_tracks': await this.push_playlist_track_change(change, user_uid); break;
                case 'new_releases': {
                    const nr_result = await this.push_new_release_change(change, user_uid);
                    if (nr_result === 'dropped') {
                        return { outcome: 'dropped', reason: `new_release invalid identity: ${change.record_id}` };
                    }
                    break;
                }
            }
            return { outcome: 'synced' };
        } catch (err) {
            const classification = classify_push_error(err);
            const reason = err instanceof Error ? err.message : String(err);
            if (classification === 'dropped') {
                console.warn(
                    `[SyncEngine] dropping ${table_name}/${change.record_id} ` +
                    `(non-retryable error): ${reason}`
                );
                return { outcome: 'dropped', reason };
            }
            console.warn(
                `[SyncEngine] retryable error for ${table_name}/${change.record_id}: ${reason}`
            );
            return { outcome: 'retry' };
        }
    }

    // -------------------------------------------------------------------------
    // Track push — dual-write: `tracks` (global) + `utracks` (per-user).
    // Duration rule: always write max(local, remote) to the server.
    // plays is NOT pushed — only meta is synced via utracks.
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

        // Enforce "greatest duration wins" at the remote source of truth.
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

        const { error } = await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(full_pt), { onConflict: 'uuid,track_uid' });
        if (!error) return;

        // FK violation: the track doesn't exist remotely yet — attempt repair.
        if (!this.is_playlists_tracks_track_fk_error(error)) {
            this.assert_supabase_ok(`push_playlist_track_change upsert ${change.record_id}`, error);
            return;
        }

        const local_track = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, track_uid)).get();
        if (!local_track) {
            // Dangling reference — drop the playlist-track entry.
            await db.delete(playlists_tracks_table)
                .where(and(
                    eq(playlists_tracks_table.uuid, playlist_uuid),
                    eq(playlists_tracks_table.track_uid, track_uid)
                ));
            console.warn(`[SyncEngine] push_playlist_track_change dropped dangling row (missing local track): ${change.record_id}`);
            return;
        }

        // Upload the missing track first.
        const { error: track_error } = await this.supabase.from('tracks')
            .upsert(this.track_to_global_insert(local_track), { onConflict: 'uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency track upsert ${track_uid}`, track_error);

        const { error: utrack_error } = await this.supabase.from('utracks')
            .upsert({ ...this.track_to_utrack_insert(local_track, user_uid), deleted: false }, { onConflict: 'user_uid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change dependency utrack upsert ${track_uid}`, utrack_error);

        // Retry the playlist-track upsert.
        const { error: retry_error } = await this.supabase.from('playlists_tracks')
            .upsert(this.playlist_track_to_insert(full_pt), { onConflict: 'uuid,track_uid' });
        this.assert_supabase_ok(`push_playlist_track_change upsert-retry ${playlist_uuid}:${track_uid}`, retry_error);
    }

    /**
     * New-releases push: insert-only by title.uri identity.
     * On any unique-constraint conflict (server already has the release): treat as synced/dropped.
     * Deletes are not pushed (server never deletes new_releases per product contract).
     *
     * Returns 'dropped' when the entry has an invalid identity and can never be pushed.
     * Throws for transient errors so the caller retries.
     */
    private async push_new_release_change(change: CompressedChange, user_uid: string): Promise<'ok' | 'dropped'> {
        // Server never deletes new_releases — silently treat local deletes as synced.
        if (change.operation === 'delete') return 'ok';

        const data = change.data as Partial<LocalNewRelease> | null;

        // Resolve the local release record.
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
        if (!full_release) return 'ok'; // Already gone locally — nothing to push.

        const identity_key = new_release_identity_key(full_release.title);
        if (identity_key === null) {
            // Invalid title identity: this entry can never be pushed — drop it.
            console.warn(`[SyncEngine] new_release invalid title identity: ${change.record_id}`);
            return 'dropped';
        }

        const release: LocalNewRelease = change.operation === 'update'
            ? { ...full_release, ...data }
            : full_release;

        const row = this.new_release_to_insert(release, user_uid);

        // Insert with ignoreDuplicates — on conflict with existing server row, do nothing.
        const { error } = await this.supabase.from('new_releases')
            .upsert(row, { onConflict: 'user_uid,title', ignoreDuplicates: true });
        if (error) throw error;
        return 'ok';
    }

    // -------------------------------------------------------------------------
    // Error helpers
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // PULL — fetch remote changes and apply locally
    // new_releases is intentionally excluded (push-only).
    // -------------------------------------------------------------------------
    private async pull_changes(user_uid: string) {
        for (const table_name of PULL_TABLES) {
            if (this.is_destroyed) return;
            await this.pull_table_changes(table_name, user_uid);
        }
    }

    private async pull_table_changes(table_name: SyncableLocalTableName, user_uid: string) {
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        // Subtract a small overlap (2 s) to tolerate clock skew between client and DB server.
        const last_sync_iso = new Date((metadata?.last_sync_at ?? 0) - 2000).toISOString();

        const pull_started_at = Date.now();
        const pull_started_iso = new Date(pull_started_at).toISOString();

        switch (table_name) {
            case 'tracks':          await this.pull_tracks(last_sync_iso, pull_started_iso, pull_started_at, user_uid); break;
            case 'playlists':       await this.pull_playlists(last_sync_iso, pull_started_iso, pull_started_at, user_uid); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso, pull_started_iso, pull_started_at, user_uid); break;
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

    private async pull_tracks(last_sync_iso: string, pull_started_iso: string, pull_started_at: number, user_uid: string) {
        const pending_track_changes = await this.get_pending_change_sets('tracks');
        const owned_uids = await this.get_owned_track_uids_all(user_uid);

        // PASS A: utracks changes (delete/restore + user meta fields).
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

        // PASS B: global metadata edits (tracks.modified_at) for owned tracks.
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

    /**
     * Fetch all remote track UIDs owned by this user, with proper keyset pagination
     * to handle large libraries (> 1000 tracks).
     */
    private async get_owned_track_uids_all(user_uid: string): Promise<string[]> {
        const result: string[] = [];
        let last_id = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('utracks')
                .select('id,track_uid')
                .eq('user_uid', user_uid)
                .gt('id', last_id)
                .order('id', { ascending: true })
                .limit(PULL_PAGE_SIZE);
            this.assert_supabase_ok('get_owned_track_uids_all', error);
            if (!data || data.length === 0) break;
            for (const r of data) result.push(r.track_uid);
            if (data.length < PULL_PAGE_SIZE) break;
            last_id = data[data.length - 1].id;
        }
        return result;
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

        const merged = this.remote_merge_global(existing, row);
        await db.update(tracks_table).set(merged).where(eq(tracks_table.uid, uid));
        SQLGlobal.update_global_track_item(uid, { ...existing, ...merged } as LocalTrack);
        db.$client.flushPendingReactiveQueries();
    }

    private async apply_track(
        row: RemoteTrackWithUserData,
        pending_track_changes: { upserts: Set<string>; deletes: Set<string> }
    ) {
        const has_pending_delete = pending_track_changes.deletes.has(row.uid);
        const has_pending_upsert = pending_track_changes.upserts.has(row.uid);

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, row.uid)).get();

        // Remote delete → soft-delete locally (never overwrite if local wants to keep it).
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

        // Remote restore / update.
        if (has_pending_delete) return;

        if (existing) {
            const merged = this.remote_merge_utrack(existing, row);

            // Always preserve local-only file URIs — they are never synced.
            merged.media_uri = existing.media_uri;
            merged.thumbnail_uri = existing.thumbnail_uri;
            merged.lyrics_uri = existing.lyrics_uri;
            merged.synced_lyrics_uri = existing.synced_lyrics_uri;

            merged.deleted = false;

            // If there's a pending local upsert, local meta takes priority.
            if (has_pending_upsert) {
                merged.meta = existing.meta;
            }

            // plays is NEVER synced from remote — always keep local value.
            merged.plays = existing.plays;

            await db.update(tracks_table).set(merged)
                .where(eq(tracks_table.uid, row.uid));
            SQLGlobal.update_global_track_item(row.uid, { ...existing, ...merged } as LocalTrack);
            db.$client.flushPendingReactiveQueries();
            return;
        }

        // Insert new track received from remote.
        const local = this.remote_track_to_local(row);
        await db.insert(tracks_table).values(local);
        SQLGlobal.add_global_track_item(local as LocalTrack);
        db.$client.flushPendingReactiveQueries();
    }

    // -------------------------------------------------------------------------
    // Merge helpers
    // -------------------------------------------------------------------------

    /**
     * Merge a global tracks row (no plays/meta) into an existing local track.
     * Used by apply_global_track (PASS B).
     */
    private remote_merge_global(
        existing: LocalTrack,
        remote: Database['public']['Tables']['tracks']['Row'],
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

        return {
            title: remote.title && remote.title.trim() !== '' ? remote.title : existing.title,
            alt_title: remote.alt_title && remote.alt_title.trim() !== '' ? remote.alt_title : existing.alt_title,
            artists: remote_artists_non_empty ? remote_artists : existing.artists,
            duration: Math.max(existing.duration ?? 0, remote.duration ?? 0),
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
    }

    /**
     * Merge a utracks-joined row (has plays + meta) into an existing local track.
     * Used by apply_track (PASS A).
     * plays is intentionally NOT carried over; meta is synced from utracks.
     */
    private remote_merge_utrack(
        existing: LocalTrack,
        remote: RemoteTrackWithUserData,
    ): Partial<LocalTrack> {
        const base = this.remote_merge_global(existing, remote);

        // Sync meta from utracks (includes meta.plays).
        // Never overwrite with an empty remote meta payload.
        const remote_meta = typeof remote.meta === 'string'
            ? safe_json_parse<any>(remote.meta, {})
            : remote.meta;
        const remote_meta_str = normalize_json_string(remote_meta) ?? '';
        const remote_meta_is_empty = remote_meta_str === '' || remote_meta_str === '{}' || remote_meta_str === 'null';
        base.meta = remote_meta_is_empty ? existing.meta : remote_meta;

        // plays is NOT synced from remote (track-level play counter is local-only).
        // Preserve existing local value; callers can override if needed.
        base.plays = existing.plays;

        return base;
    }

    private async pull_playlists(last_sync_iso: string, pull_started_iso: string, pull_started_at: number, user_uid: string) {
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
                    // Accept server deletion only when local intent agrees: pending delete AND no pending upsert.
                    // Otherwise local wins (e.g. locally re-adding this playlist).
                    if (has_pending_upsert || !has_pending_delete) {
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

    private async pull_playlists_tracks(last_sync_iso: string, pull_started_iso: string, pull_started_at: number, user_uid: string) {
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
                        // Accept server deletion only when local intent agrees: pending delete AND no pending upsert.
                        if (has_pending_upsert || !has_pending_delete) {
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

    /**
     * Build a utracks insert payload.
     * plays is intentionally omitted — it is not synced between devices.
     * meta (which contains meta.plays) IS synced.
     */
    private track_to_utrack_insert(t: LocalTrack, user_uid: string): RemoteUTrackInsert {
        return {
            user_uid,
            track_uid: t.uid,
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
            // plays is intentionally NOT synced from remote. Each device tracks play counts
            // independently via the local play counter. The remote utracks.plays value is
            // not authoritative and is ignored. Per-device play semantics live in meta.plays.
            plays: 0,
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
