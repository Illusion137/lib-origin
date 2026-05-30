import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import {
    playlists_table,
    playlists_tracks_table,
    sync_deletes_table,
    sync_metadata_table,
    tracks_table,
} from '../schema';
import { and, asc, eq, gt, inArray, isNull } from 'drizzle-orm';
import type {
    LocalPlaylist,
    LocalPlaylistTrack,
    LocalTrack,
    RemotePlaylistInsert,
    RemotePlaylistTrackInsert,
    RemoteTrackInsert,
    RemoteTrackWithUserData,
    RemoteUTrackInsert,
} from './types';
import { Prefs } from '@illusive/prefs';
import type { Database } from '../database.types';
import { catch_log } from '@common/utils/error_util';
import { SQLGlobal } from '../../sql/sql_global';

// ---------------------------------------------------------------------------
// Push dependency order: tracks must precede playlists_tracks (FK constraint).
// new_releases is push-only by identity — wiring deferred until server unique
// constraint is confirmed; pull is intentionally disabled per product contract.
// ---------------------------------------------------------------------------
type SyncableLocalTableName = 'tracks' | 'playlists' | 'playlists_tracks';
const PULL_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks'];

const PUSH_BATCH_SIZE = 250;
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

// function new_release_identity_key(title_value: unknown): string | null {
//     if (title_value === null || title_value === undefined) return null;
//     const parsed = typeof title_value === 'string' ? (() => {
//         try {
//             return JSON.parse(title_value) as unknown;
//         } catch {
//             return title_value;
//         }
//     })() : title_value;

//     if (!parsed) return null;
//     if (typeof parsed === 'object' && 'uri' in parsed) {
//         const uri = (parsed as { uri?: unknown }).uri;
//         if (typeof uri === 'string' && uri.length > 0) return `uri:${uri}`;
//     }

//     try {
//         return `json:${JSON.stringify(parsed)}`;
//     } catch {
//         // eslint-disable-next-line @typescript-eslint/no-base-to-string
//         return `raw:${String(parsed)}`;
//     }
// }

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
/**
 * Wrap a thrown supabase error into a push outcome with a logged context label.
 * `dropped` outcomes carry the reason; `retry` outcomes are silent at the
 * data-layer and surface in the caller's per-table watermark stall.
 */
function classify_outcome(err: unknown, label: string): { outcome: PushResult; reason?: string } {
    const reason = err instanceof Error ? err.message : String(err);
    const classification = classify_push_error(err);
    if (classification === 'dropped') {
        console.warn(`[SyncEngine] dropping ${label} (non-retryable): ${reason}`);
        return { outcome: 'dropped', reason };
    }
    console.warn(`[SyncEngine] retryable error for ${label}: ${reason}`);
    return { outcome: 'retry' };
}

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

    /**
     * Set the pull and push watermarks for all tables to the current time.
     * Useful after a manual data import so the next sync only fetches changes
     * that occurred after the import, rather than re-pulling/re-pushing everything.
     */
    async mark_all_tables_synced_now() {
        const now = Date.now();
        for (const table_name of PULL_TABLES) {
            await db.insert(sync_metadata_table)
                .values({ table_name, last_sync_at: now, last_pushed_at: now, last_modified_at: now })
                .onConflictDoUpdate({
                    target: sync_metadata_table.table_name,
                    set: { last_sync_at: now, last_pushed_at: now, last_modified_at: now },
                });
        }
    }

    async get_sync_diagnostics() {
        const dirty_by_table: Record<string, number> = {};
        for (const table_name of PULL_TABLES) {
            dirty_by_table[table_name] = await this.count_dirty_rows(table_name);
        }
        const pending_deletes = await db.select({ table_name: sync_deletes_table.table_name })
            .from(sync_deletes_table)
            .where(isNull(sync_deletes_table.sync_error));
        const deletes_by_table: Record<string, number> = {};
        for (const r of pending_deletes) {
            deletes_by_table[r.table_name] = (deletes_by_table[r.table_name] ?? 0) + 1;
        }
        return {
            is_syncing: this.is_syncing,
            is_initialized: this.is_initialized,
            consecutive_failures: this.consecutive_failures,
            last_error_message: this.last_error_message,
            last_sync_started_at: this.last_sync_started_at,
            last_sync_completed_at: this.last_sync_completed_at,
            pending_changes: {
                dirty_by_table,
                deletes_by_table,
            },
        };
    }

    private async count_dirty_rows(table_name: SyncableLocalTableName): Promise<number> {
        const last_pushed_at = await this.get_push_watermark(table_name);
        switch (table_name) {
            case 'tracks': {
                const rows = await db.select({ id: tracks_table.id }).from(tracks_table)
                    .where(and(gt(tracks_table.modified_at, last_pushed_at), isNull(tracks_table.sync_error)));
                return rows.length;
            }
            case 'playlists': {
                const rows = await db.select({ id: playlists_table.id }).from(playlists_table)
                    .where(and(gt(playlists_table.modified_at, last_pushed_at), isNull(playlists_table.sync_error)));
                return rows.length;
            }
            case 'playlists_tracks': {
                const rows = await db.select({ id: playlists_tracks_table.id }).from(playlists_tracks_table)
                    .where(and(gt(playlists_tracks_table.modified_at, last_pushed_at), isNull(playlists_tracks_table.sync_error)));
                return rows.length;
            }
        }
    }

    // -------------------------------------------------------------------------
    // RESYNC — re-upload every local row by upsert, then reset both watermarks
    // so the next push and pull scan from scratch.
    // -------------------------------------------------------------------------
    private async resync(user_uid: string) {
        console.info('[SyncEngine] resync started — pushing all local state');

        // Upsert all local tracks (global + utrack), preserving each row's `deleted` state.
        const all_tracks = await db.select().from(tracks_table);
        for (let i = 0; i < all_tracks.length; i += PUSH_BATCH_SIZE) {
            const batch = all_tracks.slice(i, i + PUSH_BATCH_SIZE);
            const { error: te } = await this.supabase.from('tracks')
                .upsert(batch.map(t => this.track_to_global_insert(t)), { onConflict: 'uid' });
            if (te) console.warn('[SyncEngine] resync tracks upsert error:', te);
            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    batch.map(t => ({ ...this.track_to_utrack_insert(t, user_uid), deleted: t.deleted })),
                    { onConflict: 'user_uid,track_uid' });
            if (ue) console.warn('[SyncEngine] resync utracks upsert error:', ue);
        }

        const all_playlists = await db.select().from(playlists_table);
        for (let i = 0; i < all_playlists.length; i += PUSH_BATCH_SIZE) {
            const batch = all_playlists.slice(i, i + PUSH_BATCH_SIZE);
            const { error } = await this.supabase.from('playlists')
                .upsert(
                    batch.map(p => ({ ...this.playlist_to_insert(p, user_uid), deleted: p.deleted })),
                    { onConflict: 'uuid' });
            if (error) console.warn('[SyncEngine] resync playlists upsert error:', error);
        }

        const all_pts = await db.select().from(playlists_tracks_table);
        for (let i = 0; i < all_pts.length; i += PUSH_BATCH_SIZE) {
            const batch = all_pts.slice(i, i + PUSH_BATCH_SIZE);
            const { error } = await this.supabase.from('playlists_tracks')
                .upsert(
                    batch.map(pt => ({ ...this.playlist_track_to_insert(pt), deleted: pt.deleted })),
                    { onConflict: 'uuid,track_uid' });
            if (error) console.warn('[SyncEngine] resync playlists_tracks upsert error:', error);
        }

        // Reset both watermarks to epoch so the next sync re-scans everything.
        for (const table_name of PULL_TABLES) {
            await db.insert(sync_metadata_table)
                .values({ table_name, last_sync_at: 0, last_pushed_at: 0, last_modified_at: 0 })
                .onConflictDoUpdate({
                    target: sync_metadata_table.table_name,
                    set: { last_sync_at: 0, last_pushed_at: 0, last_modified_at: 0 },
                });
        }
        // Clear any sync_error marks so previously-rejected rows get another try.
        await db.update(tracks_table).set({ sync_error: null });
        await db.update(playlists_table).set({ sync_error: null });
        await db.update(playlists_tracks_table).set({ sync_error: null });
        await db.update(sync_deletes_table).set({ sync_error: null });

        console.info('[SyncEngine] resync complete');
    }

    // -------------------------------------------------------------------------
    // PUSH — dirty-row scan.
    //
    // Per syncable table: select rows where modified_at > last_pushed_at AND
    // sync_error IS NULL, ordered by modified_at ASC. Push each via upsert.
    //   - synced  → advance watermark to this row's modified_at.
    //   - dropped → mark sync_error so the row is excluded next scan, then continue.
    //   - retry   → stop pushing this table this cycle (next sync re-tries).
    //
    // Tracks must precede playlists_tracks (FK). Tombstone-driven deletes are
    // applied after the upsert pass so they don't fight in-flight restores.
    // -------------------------------------------------------------------------
    private async push_changes(user_uid: string) {
        await this.push_dirty_tracks(user_uid);
        if (this.is_destroyed) return;
        await this.push_dirty_playlists(user_uid);
        if (this.is_destroyed) return;
        await this.push_dirty_playlists_tracks(user_uid);
        if (this.is_destroyed) return;
        await this.push_pending_deletes(user_uid);
    }

    private async get_push_watermark(table_name: SyncableLocalTableName): Promise<number> {
        const row = await db
            .select({ last_pushed_at: sync_metadata_table.last_pushed_at })
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();
        return row?.last_pushed_at ?? 0;
    }

    private async save_push_watermark(table_name: SyncableLocalTableName, watermark_ms: number) {
        if (watermark_ms <= 0) return;
        await db
            .insert(sync_metadata_table)
            .values({ table_name, last_pushed_at: watermark_ms })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: { last_pushed_at: watermark_ms },
            });
    }

    private async push_dirty_tracks(user_uid: string) {
        const last_pushed_at = await this.get_push_watermark('tracks');
        const dirty = await db.select().from(tracks_table)
            .where(and(
                gt(tracks_table.modified_at, last_pushed_at),
                isNull(tracks_table.sync_error),
            ))
            .orderBy(asc(tracks_table.modified_at))
            .limit(PUSH_BATCH_SIZE);

        let watermark = last_pushed_at;
        for (const track of dirty) {
            if (this.is_destroyed) break;
            const result = await this.upload_track_row(track, user_uid);
            if (result.outcome === 'synced') {
                watermark = track.modified_at;
            } else if (result.outcome === 'dropped') {
                await db.update(tracks_table)
                    .set({ sync_error: result.reason ?? 'unknown' })
                    .where(eq(tracks_table.id, track.id));
                watermark = track.modified_at;
            } else {
                // Retryable — stop here so we don't skip past this row.
                break;
            }
        }
        await this.save_push_watermark('tracks', watermark);
    }

    private async push_dirty_playlists(user_uid: string) {
        const last_pushed_at = await this.get_push_watermark('playlists');
        const dirty = await db.select().from(playlists_table)
            .where(and(
                gt(playlists_table.modified_at, last_pushed_at),
                isNull(playlists_table.sync_error),
            ))
            .orderBy(asc(playlists_table.modified_at))
            .limit(PUSH_BATCH_SIZE);

        let watermark = last_pushed_at;
        for (const playlist of dirty) {
            if (this.is_destroyed) break;
            const result = await this.upload_playlist_row(playlist, user_uid);
            if (result.outcome === 'synced') {
                watermark = playlist.modified_at;
            } else if (result.outcome === 'dropped') {
                await db.update(playlists_table)
                    .set({ sync_error: result.reason ?? 'unknown' })
                    .where(eq(playlists_table.id, playlist.id));
                watermark = playlist.modified_at;
            } else {
                break;
            }
        }
        await this.save_push_watermark('playlists', watermark);
    }

    private async push_dirty_playlists_tracks(user_uid: string) {
        const last_pushed_at = await this.get_push_watermark('playlists_tracks');
        const dirty = await db.select().from(playlists_tracks_table)
            .where(and(
                gt(playlists_tracks_table.modified_at, last_pushed_at),
                isNull(playlists_tracks_table.sync_error),
            ))
            .orderBy(asc(playlists_tracks_table.modified_at))
            .limit(PUSH_BATCH_SIZE);

        let watermark = last_pushed_at;
        for (const pt of dirty) {
            if (this.is_destroyed) break;
            const result = await this.upload_playlist_track_row(pt, user_uid);
            if (result.outcome === 'synced') {
                watermark = pt.modified_at;
            } else if (result.outcome === 'dropped') {
                await db.update(playlists_tracks_table)
                    .set({ sync_error: result.reason ?? 'unknown' })
                    .where(eq(playlists_tracks_table.id, pt.id));
                watermark = pt.modified_at;
            } else {
                break;
            }
        }
        await this.save_push_watermark('playlists_tracks', watermark);
    }

    // -------------------------------------------------------------------------
    // Track upload — dual-write: `tracks` (global) + `utracks` (per-user).
    // Duration rule: server stores max(local, remote).
    // `plays` is NEVER pushed; per-device counts live only in meta.plays.
    // -------------------------------------------------------------------------
    private async upload_track_row(track: LocalTrack, user_uid: string): Promise<{ outcome: PushResult; reason?: string }> {
        try {
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
                console.warn(`[SyncEngine] upload_track_row remote duration fetch failed ${track.uid}:`, e);
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
            const local_duration = Math.round(Number(track.duration ?? 0));
            const best_duration = Math.max(
                isFinite(local_duration) ? local_duration : 0,
                isFinite(remote_duration) ? remote_duration : 0,
            );

            const global_insert = this.track_to_global_insert({
                ...track,
                duration: best_duration,
            } as LocalTrack);

            const { error: te } = await this.supabase.from('tracks')
                .upsert(global_insert, { onConflict: 'uid' });
            if (te) throw te;

            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    { ...this.track_to_utrack_insert(track, user_uid), deleted: track.deleted },
                    { onConflict: 'user_uid,track_uid' },
                );
            if (ue) throw ue;
            return { outcome: 'synced' };
        } catch (err) {
            return classify_outcome(err, `tracks/${track.uid}`);
        }
    }

    private async upload_playlist_row(playlist: LocalPlaylist, user_uid: string): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            const row: RemotePlaylistInsert = {
                ...this.playlist_to_insert(playlist, user_uid),
                deleted: playlist.deleted,
            };
            const { error } = await this.supabase.from('playlists').upsert(row, { onConflict: 'uuid' });
            if (error) throw error;
            return { outcome: 'synced' };
        } catch (err) {
            return classify_outcome(err, `playlists/${playlist.uuid}`);
        }
    }

    private async upload_playlist_track_row(pt: LocalPlaylistTrack, user_uid: string): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            const payload: RemotePlaylistTrackInsert = {
                ...this.playlist_track_to_insert(pt),
                deleted: pt.deleted,
            };
            const { error } = await this.supabase.from('playlists_tracks')
                .upsert(payload, { onConflict: 'uuid,track_uid' });
            if (!error) return { outcome: 'synced' };

            // FK violation: the track doesn't exist remotely yet — attempt repair.
            if (!this.is_playlists_tracks_track_fk_error(error)) throw error;

            const local_track = await db.select().from(tracks_table)
                .where(eq(tracks_table.uid, pt.track_uid)).get();
            if (!local_track) {
                // Dangling reference — soft-delete locally so it's never selected again.
                await db.update(playlists_tracks_table)
                    .set({ deleted: true })
                    .where(and(
                        eq(playlists_tracks_table.uuid, pt.uuid),
                        eq(playlists_tracks_table.track_uid, pt.track_uid),
                    ));
                return { outcome: 'dropped', reason: 'missing local track for FK repair' };
            }

            // Upload the missing track first.
            const { error: te } = await this.supabase.from('tracks')
                .upsert(this.track_to_global_insert(local_track), { onConflict: 'uid' });
            if (te) throw te;
            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    { ...this.track_to_utrack_insert(local_track, user_uid), deleted: local_track.deleted },
                    { onConflict: 'user_uid,track_uid' },
                );
            if (ue) throw ue;

            // Retry the playlist-track upsert.
            const { error: retry_error } = await this.supabase.from('playlists_tracks')
                .upsert(payload, { onConflict: 'uuid,track_uid' });
            if (retry_error) throw retry_error;
            return { outcome: 'synced' };
        } catch (err) {
            return classify_outcome(err, `playlists_tracks/${pt.uuid}:${pt.track_uid}`);
        }
    }

    // -------------------------------------------------------------------------
    // Tombstone-driven deletes — drain sync_deletes for hard-deleted rows.
    // DELETE triggers (see migration 0008) capture hard deletes into this table
    // since the dirty-row scan can't see rows that no longer exist locally.
    // -------------------------------------------------------------------------
    private async push_pending_deletes(user_uid: string) {
        const tombstones = await db.select().from(sync_deletes_table)
            .where(isNull(sync_deletes_table.sync_error))
            .orderBy(asc(sync_deletes_table.deleted_at))
            .limit(PUSH_BATCH_SIZE);

        if (tombstones.length === 0) return;

        const synced_ids: number[] = [];
        for (const ts of tombstones) {
            if (this.is_destroyed) break;
            const result = await this.upload_tombstone(ts, user_uid);
            if (result.outcome === 'synced') {
                synced_ids.push(ts.id);
            } else if (result.outcome === 'dropped') {
                await db.update(sync_deletes_table)
                    .set({ sync_error: result.reason ?? 'unknown' })
                    .where(eq(sync_deletes_table.id, ts.id));
            }
            // retryable: leave tombstone for next cycle
        }
        if (synced_ids.length > 0) {
            await db.delete(sync_deletes_table).where(inArray(sync_deletes_table.id, synced_ids));
        }
    }

    private async upload_tombstone(
        tombstone: { id: number; table_name: string; record_id: string },
        user_uid: string,
    ): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            switch (tombstone.table_name) {
                case 'tracks': {
                    const { error } = await this.supabase.from('utracks')
                        .update({ deleted: true })
                        .eq('user_uid', user_uid)
                        .eq('track_uid', tombstone.record_id);
                    if (error) throw error;
                    return { outcome: 'synced' };
                }
                case 'playlists': {
                    const { error } = await this.supabase.from('playlists')
                        .update({ deleted: true })
                        .eq('uuid', tombstone.record_id)
                        .eq('user_uid', user_uid);
                    if (error) throw error;
                    return { outcome: 'synced' };
                }
                case 'playlists_tracks': {
                    const parsed = parse_playlist_track_record_id(tombstone.record_id);
                    if (!parsed) return { outcome: 'dropped', reason: `invalid playlists_tracks record_id: ${tombstone.record_id}` };
                    const { error } = await this.supabase.from('playlists_tracks')
                        .update({ deleted: true })
                        .eq('uuid', parsed.playlist_uuid)
                        .eq('track_uid', parsed.track_uid);
                    if (error) throw error;
                    return { outcome: 'synced' };
                }
                default:
                    // Unknown table — keep the tombstone visible for inspection.
                    return { outcome: 'dropped', reason: `unknown tombstone table: ${tombstone.table_name}` };
            }
        } catch (err) {
            return classify_outcome(err, `tombstone/${tombstone.table_name}/${tombstone.record_id}`);
        }
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

        switch (table_name) {
            case 'tracks': await this.pull_tracks(last_sync_iso, user_uid); break;
            case 'playlists': await this.pull_playlists(last_sync_iso, user_uid); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso, user_uid); break;
        }
    }

    /**
     * Watermark is the maximum server-side `modified_at` observed in this pull.
     * Using the server's own timestamp (not client `Date.now()`) avoids skipping
     * rows when the client clock runs ahead of the DB clock.
     * If nothing was observed we leave the existing watermark untouched —
     * the next sync re-queries the same range and is cheap when empty.
     */
    private async save_pull_watermark(table_name: SyncableLocalTableName, max_modified_at_ms: number) {
        if (max_modified_at_ms <= 0) return;
        await db
            .insert(sync_metadata_table)
            .values({ table_name, last_sync_at: max_modified_at_ms, last_modified_at: max_modified_at_ms })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: { last_sync_at: max_modified_at_ms, last_modified_at: max_modified_at_ms },
            });
    }

    private async pull_tracks(last_sync_iso: string, user_uid: string) {
        const pending_track_changes = await this.get_pending_change_sets('tracks');
        const owned_uids = await this.get_owned_track_uids_all(user_uid);

        let max_modified_at = 0;
        const observe = (iso: unknown) => {
            const v = safe_to_epoch_merge(iso);
            if (v > max_modified_at) max_modified_at = v;
        };

        // PASS A: utracks changes (delete/restore + user meta fields).
        let offset = 0;
        while (true) {
            const { data: utrack_rows, error: u_err } = await this.supabase
                .from('utracks')
                .select('*, tracks(*)')
                .eq('user_uid', user_uid)
                .gte('modified_at', last_sync_iso)
                .order('modified_at', { ascending: true })
                .order('id', { ascending: true })
                .range(offset, offset + PULL_PAGE_SIZE - 1);

            if (u_err) throw u_err;
            if (!utrack_rows || utrack_rows.length === 0) break;

            for (const row of utrack_rows) {
                observe(row.modified_at);
                const track_data = row.tracks as Database['public']['Tables']['tracks']['Row'] | null;
                if (!track_data) continue;
                observe(track_data.modified_at);

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

            db.$client.flushPendingReactiveQueries();
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
                        .in('uid', uid_chunk)
                        .order('modified_at', { ascending: true })
                        .order('uid', { ascending: true })
                        .range(offset, offset + PULL_PAGE_SIZE - 1);

                    if (t_err) throw t_err;
                    if (!global_rows || global_rows.length === 0) break;

                    for (const track_row of global_rows) {
                        observe(track_row.modified_at);
                        try {
                            await this.apply_global_track(track_row, pending_track_changes);
                        } catch (err) {
                            console.warn('[SyncEngine] pull_tracks apply_global_track failed:', err);
                        }
                    }

                    db.$client.flushPendingReactiveQueries();
                    if (global_rows.length < PULL_PAGE_SIZE) break;
                    offset += global_rows.length;
                }
            }
        }

        await this.save_pull_watermark('tracks', max_modified_at);
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

    /**
     * Used by pull-apply paths to know which local rows have unpushed changes,
     * so a remote row doesn't clobber a local edit that hasn't reached the server yet.
     *   - upserts:  rows where modified_at > last_pushed_at AND sync_error IS NULL
     *               and deleted = false (or soft-restored).
     *   - deletes:  pending tombstones in sync_deletes (with no sync_error) PLUS
     *               dirty rows whose `deleted` is true (soft-delete still pending push).
     */
    private async get_pending_change_sets(table_name: SyncableLocalTableName): Promise<{
        upserts: Set<string>;
        deletes: Set<string>;
    }> {
        const upserts = new Set<string>();
        const deletes = new Set<string>();
        const last_pushed_at = await this.get_push_watermark(table_name);

        switch (table_name) {
            case 'tracks': {
                const rows = await db.select({
                    uid: tracks_table.uid,
                    deleted: tracks_table.deleted,
                }).from(tracks_table)
                    .where(and(
                        gt(tracks_table.modified_at, last_pushed_at),
                        isNull(tracks_table.sync_error),
                    ));
                for (const r of rows) {
                    if (r.deleted) deletes.add(r.uid);
                    else upserts.add(r.uid);
                }
                break;
            }
            case 'playlists': {
                const rows = await db.select({
                    uuid: playlists_table.uuid,
                    deleted: playlists_table.deleted,
                }).from(playlists_table)
                    .where(and(
                        gt(playlists_table.modified_at, last_pushed_at),
                        isNull(playlists_table.sync_error),
                    ));
                for (const r of rows) {
                    if (r.deleted) deletes.add(r.uuid);
                    else upserts.add(r.uuid);
                }
                break;
            }
            case 'playlists_tracks': {
                const rows = await db.select({
                    uuid: playlists_tracks_table.uuid,
                    track_uid: playlists_tracks_table.track_uid,
                    deleted: playlists_tracks_table.deleted,
                }).from(playlists_tracks_table)
                    .where(and(
                        gt(playlists_tracks_table.modified_at, last_pushed_at),
                        isNull(playlists_tracks_table.sync_error),
                    ));
                for (const r of rows) {
                    const key = `${r.uuid}:${r.track_uid}`;
                    if (r.deleted) deletes.add(key);
                    else upserts.add(key);
                }
                break;
            }
        }

        // Hard-delete tombstones recorded by DELETE triggers.
        const tombstones = await db.select({ record_id: sync_deletes_table.record_id })
            .from(sync_deletes_table)
            .where(and(
                eq(sync_deletes_table.table_name, table_name),
                isNull(sync_deletes_table.sync_error),
            ));
        for (const t of tombstones) deletes.add(t.record_id);

        return { upserts, deletes };
    }

    private async apply_global_track(
        row: Database['public']['Tables']['tracks']['Row'],
        pending_track_changes: { upserts: Set<string>; deletes: Set<string> },
    ) {
        const uid = row.uid;
        if (!uid) return;

        // If there's a pending local delete, never let remote "restore" win.
        if (pending_track_changes.deletes.has(uid)) return;

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, uid)).get();
        if (!existing) return;

        const merged = this.remote_merge_global(existing, row);
        await db.update(tracks_table).set(merged).where(eq(tracks_table.uid, uid));
        SQLGlobal.update_global_track_item(uid, { ...existing, ...merged } as LocalTrack);
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
                SQLGlobal.delete_global_track_item(row.uid);
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
            return;
        }

        // Insert new track received from remote.
        const local = this.remote_track_to_local(row);
        await db.insert(tracks_table).values(local);
        SQLGlobal.add_global_track_item(local as LocalTrack);
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
            audiomack_id: pick_str(existing.audiomack_id, remote.audiomack_id),
            deezer_id: pick_str(existing.deezer_id, remote.deezer_id),
            tidal_id: pick_str(existing.tidal_id, remote.tidal_id),
            pandora_id: pick_str(existing.pandora_id, remote.pandora_id),
            illusi_id: pick_str(existing.illusi_id, remote.illusi_id),
            imported_id: pick_str(existing.imported_id, remote.imported_id),
            media_uri: existing.media_uri,
            thumbnail_uri: existing.thumbnail_uri,
            lyrics_uri: existing.lyrics_uri,
            synced_lyrics_uri: existing.synced_lyrics_uri,
            acousticness: Math.max(existing.acousticness, remote.acousticness),
            danceability: Math.max(existing.danceability, remote.danceability),
            energy: Math.max(existing.energy, remote.energy),
            instrumentalness: Math.max(existing.instrumentalness, remote.instrumentalness),
            liveness: Math.max(existing.liveness, remote.liveness),
            speechiness: Math.max(existing.speechiness, remote.speechiness),
            valence: Math.max(existing.valence, remote.valence),
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

    private async pull_playlists(last_sync_iso: string, user_uid: string) {
        const pending_changes = await this.get_pending_change_sets('playlists');
        let max_modified_at = 0;

        let offset = 0;
        while (true) {
            const { data, error } = await this.supabase
                .from('playlists')
                .select('*')
                .eq('user_uid', user_uid)
                .gte('modified_at', last_sync_iso)
                .order('modified_at', { ascending: true })
                .order('uuid', { ascending: true })
                .range(offset, offset + PULL_PAGE_SIZE - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const row of data) {
                const row_mod = safe_to_epoch_merge(row.modified_at);
                if (row_mod > max_modified_at) max_modified_at = row_mod;
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
        await this.save_pull_watermark('playlists', max_modified_at);
    }

    private async pull_playlists_tracks(last_sync_iso: string, user_uid: string) {
        const pending_changes = await this.get_pending_change_sets('playlists_tracks');
        let max_modified_at = 0;

        const { data: user_playlists, error: user_playlist_error } = await this.supabase
            .from('playlists')
            .select('uuid')
            .eq('user_uid', user_uid)
            .eq('deleted', false);
        this.assert_supabase_ok('pull_playlists_tracks user playlists fetch', user_playlist_error);

        const playlist_uuids = (user_playlists ?? []).map(p => p.uuid);
        if (playlist_uuids.length === 0) return;

        const uuid_chunks = chunk_array(playlist_uuids, IN_CLAUSE_CHUNK_SIZE);
        for (const uuid_chunk of uuid_chunks) {
            let offset = 0;
            while (true) {
                const { data, error } = await this.supabase
                    .from('playlists_tracks')
                    .select('*')
                    .in('uuid', uuid_chunk)
                    .gte('modified_at', last_sync_iso)
                    .order('modified_at', { ascending: true })
                    .order('id', { ascending: true })
                    .range(offset, offset + PULL_PAGE_SIZE - 1);

                if (error) throw error;
                if (!data || data.length === 0) break;

                for (const row of data) {
                    const row_mod = safe_to_epoch_merge(row.modified_at);
                    if (row_mod > max_modified_at) max_modified_at = row_mod;
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
        await this.save_pull_watermark('playlists_tracks', max_modified_at);
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
            audiomack_id: t.audiomack_id,
            deezer_id: t.deezer_id,
            tidal_id: t.tidal_id,
            pandora_id: t.pandora_id,
            artwork_url: t.artwork_url,
            acousticness: t.acousticness,
            danceability: t.danceability,
            energy: t.energy,
            instrumentalness: t.instrumentalness,
            liveness: t.liveness,
            speechiness: t.speechiness,
            valence: t.valence,

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

    // private new_release_to_insert(r: LocalNewRelease, user_uid: string): RemoteNewReleaseInsert {
    //     return {
    //         user_uid,
    //         title: r.title,
    //         artist: r.artist,
    //         artwork_url: r.artwork_url,
    //         artwork_thumbnails: r.artwork_thumbnails,
    //         explicit: r.explicit,
    //         album_type: r.album_type,
    //         type: r.type,
    //         date: r.date,
    //         song_track: r.song_track ?? null,
    //         deleted: false,
    //         created_at: safe_to_iso(r.created_at),
    //     };
    // }

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
            audiomack_id: row.audiomack_id,
            deezer_id: row.deezer_id,
            tidal_id: row.tidal_id,
            pandora_id: row.pandora_id,
            artwork_url: row.artwork_url,
            acousticness: row.acousticness,
            danceability: row.danceability,
            energy: row.energy,
            instrumentalness: row.instrumentalness,
            liveness: row.liveness,
            speechiness: row.speechiness,
            valence: row.valence,
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
            sync_error: null,
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
            sync_error: null,
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
            modified_at: safe_to_epoch(row.modified_at),
            sync_error: null,
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
