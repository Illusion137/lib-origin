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
import { and, asc, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import type {
    LocalPlaylist,
    LocalPlaylistTrack,
    LocalTableName,
    LocalTrack,
    RemotePlaylistInsert,
    RemotePlaylistTrackInsert,
    RemoteTrackInsert,
    RemoteTrackWithUserData,
    RemoteUTrackInsert,
} from './types';
import { MergeResolver } from './merge_resolver';
import { Prefs } from '@illusive/prefs';
import type { Database } from '../database.types';
import { catch_log } from '@common/utils/error_util';
import { SQLGlobal } from '../../sql/sql_global';
import { SQLPlaylists } from '../../sql/sql_playlists';
import { PlaylistArtwork } from './playlist_artwork';
import { chunkify } from '@common/utils/util';

type SyncableLocalTableName = 'tracks' | 'playlists' | 'playlists_tracks';
const PULL_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists', 'playlists_tracks'];
const PLAYLISTS_TRACKS_TABLES: SyncableLocalTableName[] = ['playlists_tracks'];
const OTHER_TABLES: SyncableLocalTableName[] = ['tracks', 'playlists'];

const PUSH_BATCH_SIZE = 250;
const PULL_PAGE_SIZE = 1000;
const IN_CLAUSE_CHUNK_SIZE = 300;

const PLAYLISTS_TRACKS_DEBOUNCE_MS = 60 * 1000;
const OTHER_DEBOUNCE_MS = 10 * 1000;

type PushResult = 'synced' | 'dropped' | 'retry';

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

function parse_playlist_track_record_id(record_id: string): { playlist_uuid: string; track_uid: string } | null {
    const colon_idx = record_id.indexOf(':');
    if (colon_idx <= 0 || colon_idx >= record_id.length - 1) return null;
    return {
        playlist_uuid: record_id.substring(0, colon_idx),
        track_uid: record_id.substring(colon_idx + 1),
    };
}

async function get_authed_user_uid(supabase: SupabaseClient<Database>): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

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

    if (code === '23505') return 'dropped';
    if (code === '23514') return 'dropped';
    if (code === '22P02') return 'dropped';
    if (code === '22003') return 'dropped';
    if (code === '42501') return 'dropped';
    if (code === 'PGRST301') return 'dropped';

    if (status === 409) return 'dropped';
    if (status === 422) return 'dropped';

    return 'retry';
}

export class SyncEngine {
    private is_syncing = false;
    private is_initialized = false;
    private is_destroyed = false;
    private pull_dirty_global_tracks = 0;
    private resync_requested = false;
    private consecutive_failures = 0;
    private last_error_message?: string;
    private last_sync_started_at?: number;
    private last_sync_completed_at?: number;
    private sync_interval?: ReturnType<typeof setInterval>;
    private full_debounce_timeout?: ReturnType<typeof setTimeout>;
    private pt_debounce_timeout?: ReturnType<typeof setTimeout>;
    private other_debounce_timeout?: ReturnType<typeof setTimeout>;
    private network_subscription?: ReturnType<NetworkMonitor['on_network_change']>;
    private server_offset_ms = 0;
    private server_time_synced = false;
    private readonly last_pushed_global_hash = new Map<string, string>();
    private readonly resyncing_tables = new Set<SyncableLocalTableName>();
    private readonly supabase: SupabaseClient<Database>;
    private readonly network_monitor: NetworkMonitor;

    constructor(supabase: SupabaseClient<Database>, networkMonitor: NetworkMonitor) {
        this.supabase = supabase;
        this.network_monitor = networkMonitor;
    }

    request_resync() {
        this.resync_requested = true;
        this.schedule_full_sync(500);
    }

    schedule_full_sync(delay_ms = 1000) {
        if (this.is_destroyed) return;
        if (this.full_debounce_timeout) clearTimeout(this.full_debounce_timeout);
        const failure_multiplier = Math.min(Math.pow(2, Math.max(this.consecutive_failures - 1, 0)), 32);
        const effective_delay = Math.min(delay_ms * failure_multiplier, 5 * 60 * 1000);
        this.full_debounce_timeout = setTimeout(() => {
            this.full_debounce_timeout = undefined;
            this.fire_sync(PULL_TABLES);
        }, effective_delay);
    }

    private schedule_table_sync(table_name: LocalTableName) {
        if (this.is_destroyed) return;
        if (table_name === 'playlists_tracks') {
            if (this.pt_debounce_timeout) clearTimeout(this.pt_debounce_timeout);
            this.pt_debounce_timeout = setTimeout(() => {
                this.pt_debounce_timeout = undefined;
                this.fire_sync(PLAYLISTS_TRACKS_TABLES);
            }, PLAYLISTS_TRACKS_DEBOUNCE_MS);
            return;
        }
        if (table_name === 'tracks' || table_name === 'playlists') {
            if (this.other_debounce_timeout) clearTimeout(this.other_debounce_timeout);
            this.other_debounce_timeout = setTimeout(() => {
                this.other_debounce_timeout = undefined;
                this.fire_sync(OTHER_TABLES);
            }, OTHER_DEBOUNCE_MS);
        }
    }

    private fire_sync(scope: SyncableLocalTableName[]) {
        if (this.is_destroyed) return;
        const effective = scope.filter(table_name => !this.resyncing_tables.has(table_name));
        if (effective.length === 0) return;
        if (this.is_syncing) {
            setTimeout(() => this.fire_sync(effective), 1000);
            return;
        }
        this.sync(effective).catch(catch_log);
    }

    private async sync_server_time() {
        const url = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL;
        const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY;
        if (!url || !key) return;
        try {
            const started = Date.now();
            const res = await fetch(`${url}/rest/v1/`, { method: 'HEAD', headers: { apikey: key } });
            const date_header = res.headers.get('date');
            if (!date_header) return;
            const server_ms = new Date(date_header).getTime();
            if (!isFinite(server_ms)) return;
            const round_trip = Date.now() - started;
            this.server_offset_ms = server_ms + Math.round(round_trip / 2) - Date.now();
            this.server_time_synced = true;
        } catch (error) {
            catch_log(error);
        }
    }

    private remote_to_local_epoch(remote_modified_at: unknown): number {
        return safe_to_epoch_merge(remote_modified_at) - this.server_offset_ms;
    }

    async initialize() {
        if (this.is_initialized || this.is_destroyed) return;
        const initialize_generation = this.destroy_generation;
        this.is_initialized = true;
        ChangeTracker.set_on_change((table_name) => this.schedule_table_sync(table_name));

        void this.sync_server_time();

        this.schedule_full_sync(1000);

        if (this.is_destroyed || initialize_generation !== this.destroy_generation) {
            this.is_initialized = false;
            return;
        }

        this.network_subscription = this.network_monitor.on_network_change(async (isGoodTime) => {
            if (this.is_destroyed) return;
            if (isGoodTime) {
                this.schedule_full_sync(500);
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
                this.schedule_full_sync(1000);
            }
        }, 5 * 60 * 1000);
    }

    private destroy_generation = 0;

    private readonly pull_applied_upserts: Record<SyncableLocalTableName, Map<string, number>> = {
        tracks: new Map(), playlists: new Map(), playlists_tracks: new Map(),
    };
    private readonly pull_applied_deletes: Record<SyncableLocalTableName, Set<string>> = {
        tracks: new Set(), playlists: new Set(), playlists_tracks: new Set(),
    };

    private record_pull_upsert(table_name: SyncableLocalTableName, record_id: string, modified_at: number) {
        this.pull_applied_upserts[table_name].set(record_id, modified_at);
    }
    private record_pull_delete(table_name: SyncableLocalTableName, record_id: string) {
        this.pull_applied_deletes[table_name].add(record_id);
    }
    private is_pull_echo(table_name: SyncableLocalTableName, record_id: string, modified_at: number): boolean {
        return this.pull_applied_upserts[table_name].get(record_id) === modified_at;
    }
    private is_pull_echo_delete(table_name: string, record_id: string): boolean {
        return this.pull_applied_deletes[table_name as SyncableLocalTableName]?.has(record_id) ?? false;
    }

    async sync(scope: SyncableLocalTableName[] = PULL_TABLES) {
        if (this.is_syncing || this.is_destroyed) return;
        this.last_sync_started_at = Date.now();
        try {
            this.is_syncing = true;

            const user_uid = await get_authed_user_uid(this.supabase);
            if (!user_uid) return;

            if (this.is_destroyed) return;

            if (!this.server_time_synced) await this.sync_server_time();
            if (this.is_destroyed) return;

            const is_full_sync = PULL_TABLES.every(table_name => scope.includes(table_name));
            if (this.resync_requested && is_full_sync) {
                this.resync_requested = false;
                for (const table_name of scope) this.resyncing_tables.add(table_name);
                try {
                    await this.resync(user_uid, scope);
                } finally {
                    for (const table_name of scope) this.resyncing_tables.delete(table_name);
                }
                if (this.is_destroyed) return;
            }

            await this.pull_changes(user_uid, scope);
            if (this.is_destroyed) return;
            await this.push_changes(user_uid, scope);
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

    async mark_all_tables_pushed() {
        const now = Date.now();
        const newest_tracks = await db.select({ modified_at: tracks_table.modified_at })
            .from(tracks_table).orderBy(desc(tracks_table.modified_at)).limit(1).get();
        const newest_playlists = await db.select({ modified_at: playlists_table.modified_at })
            .from(playlists_table).orderBy(desc(playlists_table.modified_at)).limit(1).get();
        const newest_playlists_tracks = await db.select({ modified_at: playlists_tracks_table.modified_at })
            .from(playlists_tracks_table).orderBy(desc(playlists_tracks_table.modified_at)).limit(1).get();
        await this.save_push_watermark('tracks', Math.min(newest_tracks?.modified_at ?? 0, now));
        await this.save_push_watermark('playlists', Math.min(newest_playlists?.modified_at ?? 0, now));
        await this.save_push_watermark('playlists_tracks', Math.min(newest_playlists_tracks?.modified_at ?? 0, now));
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

    private async resync(user_uid: string, scope: SyncableLocalTableName[]) {
        console.info('[SyncEngine] resync started — pushing local state for', scope.join(', '));

        if (scope.includes('tracks')) {
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
        }

        if (scope.includes('playlists')) {
            const all_playlists = await db.select().from(playlists_table);
            for (let i = 0; i < all_playlists.length; i += PUSH_BATCH_SIZE) {
                const batch = all_playlists.slice(i, i + PUSH_BATCH_SIZE);
                for (const p of batch) await this.ensure_playlist_artwork_uploaded(p);
                const { error } = await this.supabase.from('playlists')
                    .upsert(
                        batch.map(p => ({ ...this.playlist_to_insert(p, user_uid), deleted: p.deleted })),
                        { onConflict: 'uuid' });
                if (error) console.warn('[SyncEngine] resync playlists upsert error:', error);
            }
        }

        if (scope.includes('playlists_tracks')) {
            const all_pts = await db.select().from(playlists_tracks_table);
            for (let i = 0; i < all_pts.length; i += PUSH_BATCH_SIZE) {
                const batch = all_pts.slice(i, i + PUSH_BATCH_SIZE);
                const { error } = await this.supabase.from('playlists_tracks')
                    .upsert(
                        batch.map(pt => ({ ...this.playlist_track_to_insert(pt), deleted: pt.deleted })),
                        { onConflict: 'uuid,track_uid' });
                if (error) console.warn('[SyncEngine] resync playlists_tracks upsert error:', error);
            }
        }

        for (const table_name of scope) {
            await db.insert(sync_metadata_table)
                .values({ table_name, last_sync_at: 0, last_pushed_at: 0, last_modified_at: 0 })
                .onConflictDoUpdate({
                    target: sync_metadata_table.table_name,
                    set: { last_sync_at: 0, last_pushed_at: 0, last_modified_at: 0 },
                });
        }

        if (scope.includes('tracks')) await db.update(tracks_table).set({ sync_error: null });
        if (scope.includes('playlists')) await db.update(playlists_table).set({ sync_error: null });
        if (scope.includes('playlists_tracks')) await db.update(playlists_tracks_table).set({ sync_error: null });
        await db.update(sync_deletes_table).set({ sync_error: null })
            .where(inArray(sync_deletes_table.table_name, scope));

        console.info('[SyncEngine] resync complete');
    }

    private async push_changes(user_uid: string, scope: SyncableLocalTableName[]) {
        if (scope.includes('tracks')) {
            await this.push_dirty_tracks(user_uid);
            if (this.is_destroyed) return;
        }
        if (scope.includes('playlists')) {
            await this.push_dirty_playlists(user_uid);
            if (this.is_destroyed) return;
        }
        if (scope.includes('playlists_tracks')) {
            await this.push_dirty_playlists_tracks(user_uid);
            if (this.is_destroyed) return;
        }
        await this.push_pending_deletes(user_uid, scope);
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
        let watermark = await this.get_push_watermark('tracks');
        while (!this.is_destroyed) {
            const dirty = await db.select().from(tracks_table)
                .where(and(
                    gt(tracks_table.modified_at, watermark),
                    isNull(tracks_table.sync_error),
                ))
                .orderBy(asc(tracks_table.modified_at))
                .limit(PUSH_BATCH_SIZE);
            if (dirty.length === 0) break;

            const to_push = dirty.filter(track => !this.is_pull_echo('tracks', track.uid, track.modified_at));
            if (to_push.length === 0) {
                watermark = dirty[dirty.length - 1].modified_at;
                await this.save_push_watermark('tracks', watermark);
                if (dirty.length < PUSH_BATCH_SIZE) break;
                continue;
            }

            const batch_ok = await this.upload_track_rows_batch(to_push, user_uid);
            if (batch_ok) {
                watermark = dirty[dirty.length - 1].modified_at;
                await this.save_push_watermark('tracks', watermark);
                if (dirty.length < PUSH_BATCH_SIZE) break;
                continue;
            }

            let hit_retryable = false;
            for (const track of dirty) {
                if (this.is_destroyed) break;
                if (this.is_pull_echo('tracks', track.uid, track.modified_at)) {
                    watermark = track.modified_at;
                    continue;
                }
                const result = await this.upload_track_row(track, user_uid);
                if (result.outcome === 'synced') {
                    watermark = track.modified_at;
                } else if (result.outcome === 'dropped') {
                    await db.update(tracks_table)
                        .set({ sync_error: result.reason ?? 'unknown' })
                        .where(eq(tracks_table.id, track.id));
                    watermark = track.modified_at;
                } else {
                    hit_retryable = true;
                    break;
                }
            }
            await this.save_push_watermark('tracks', watermark);
            if (hit_retryable || dirty.length < PUSH_BATCH_SIZE) break;
        }
    }

    private global_hash(insert: RemoteTrackInsert): string {
        const { created_at: _created_at, modified_at: _modified_at, ...content } = insert;
        return JSON.stringify(content);
    }

    private async upload_track_rows_batch(tracks: LocalTrack[], user_uid: string): Promise<boolean> {
        try {
            const global_inserts: RemoteTrackInsert[] = [];
            const pushed_hashes: { uid: string; hash: string }[] = [];
            for (const track of tracks) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
                const local_duration = Math.round(Number(track.duration ?? 0));
                const insert = this.track_to_global_insert({ ...track, duration: isFinite(local_duration) ? local_duration : 0 } as LocalTrack);
                const hash = this.global_hash(insert);
                if (this.last_pushed_global_hash.get(track.uid) === hash) continue;
                global_inserts.push(insert);
                pushed_hashes.push({ uid: track.uid, hash });
            }
            if (global_inserts.length > 0) {
                const { error: te } = await this.supabase.from('tracks')
                    .upsert(global_inserts, { onConflict: 'uid' });
                if (te) throw te;
            }

            const utrack_inserts = tracks.map(track => ({
                ...this.track_to_utrack_insert(track, user_uid),
                deleted: track.deleted,
            }));
            const { error: ue } = await this.supabase.from('utracks')
                .upsert(utrack_inserts, { onConflict: 'user_uid,track_uid' });
            if (ue) throw ue;
            for (const entry of pushed_hashes) this.last_pushed_global_hash.set(entry.uid, entry.hash);
            return true;
        } catch (err) {
            console.warn('[SyncEngine] batch track push failed, falling back to per-row:', (err as {message?: string})?.message ?? err, (err as {code?: string})?.code ?? '', (err as {details?: string})?.details ?? '');
            return false;
        }
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
            if (this.is_pull_echo('playlists', playlist.uuid, playlist.modified_at)) {
                watermark = playlist.modified_at;
                continue;
            }
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
        let watermark = await this.get_push_watermark('playlists_tracks');
        while (!this.is_destroyed) {
            const dirty = await db.select().from(playlists_tracks_table)
                .where(and(
                    gt(playlists_tracks_table.modified_at, watermark),
                    isNull(playlists_tracks_table.sync_error),
                ))
                .orderBy(asc(playlists_tracks_table.modified_at))
                .limit(PUSH_BATCH_SIZE);
            if (dirty.length === 0) break;

            const to_push = dirty.filter(pt => !this.is_pull_echo('playlists_tracks', `${pt.uuid}:${pt.track_uid}`, pt.modified_at));
            if (to_push.length === 0) {
                watermark = dirty[dirty.length - 1].modified_at;
                await this.save_push_watermark('playlists_tracks', watermark);
                if (dirty.length < PUSH_BATCH_SIZE) break;
                continue;
            }

            const batch_ok = await this.upload_playlist_track_rows_batch(to_push);
            if (batch_ok) {
                watermark = dirty[dirty.length - 1].modified_at;
                await this.save_push_watermark('playlists_tracks', watermark);
                if (dirty.length < PUSH_BATCH_SIZE) break;
                continue;
            }

            let hit_retryable = false;
            for (const pt of dirty) {
                if (this.is_destroyed) break;
                if (this.is_pull_echo('playlists_tracks', `${pt.uuid}:${pt.track_uid}`, pt.modified_at)) {
                    watermark = pt.modified_at;
                    continue;
                }
                const result = await this.upload_playlist_track_row(pt, user_uid);
                if (result.outcome === 'synced') {
                    watermark = pt.modified_at;
                } else if (result.outcome === 'dropped') {
                    await db.update(playlists_tracks_table)
                        .set({ sync_error: result.reason ?? 'unknown' })
                        .where(eq(playlists_tracks_table.id, pt.id));
                    watermark = pt.modified_at;
                } else {
                    hit_retryable = true;
                    break;
                }
            }
            await this.save_push_watermark('playlists_tracks', watermark);
            if (hit_retryable || dirty.length < PUSH_BATCH_SIZE) break;
        }
    }

    private async upload_playlist_track_rows_batch(pts: LocalPlaylistTrack[]): Promise<boolean> {
        try {
            const by_key = new Map<string, RemotePlaylistTrackInsert>();
            for (const pt of pts) {
                by_key.set(`${pt.uuid}:${pt.track_uid}`, {
                    ...this.playlist_track_to_insert(pt),
                    deleted: pt.deleted,
                });
            }
            const { error } = await this.supabase.from('playlists_tracks')
                .upsert([...by_key.values()], { onConflict: 'uuid,track_uid' });
            if (error) throw error;
            return true;
        } catch (err) {
            console.warn('[SyncEngine] batch playlists_tracks push failed, falling back to per-row:', (err as {message?: string})?.message ?? err, (err as {code?: string})?.code ?? '', (err as {details?: string})?.details ?? '');
            return false;
        }
    }

    private async upload_track_row(track: LocalTrack, user_uid: string): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
            const local_duration = Math.round(Number(track.duration ?? 0));

            const global_insert = this.track_to_global_insert({
                ...track,
                duration: isFinite(local_duration) ? local_duration : 0,
            } as LocalTrack);

            const hash = this.global_hash(global_insert);
            if (this.last_pushed_global_hash.get(track.uid) !== hash) {
                const { error: te } = await this.supabase.from('tracks')
                    .upsert(global_insert, { onConflict: 'uid' });
                if (te) throw te;
            }

            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    { ...this.track_to_utrack_insert(track, user_uid), deleted: track.deleted },
                    { onConflict: 'user_uid,track_uid' },
                );
            if (ue) throw ue;
            this.last_pushed_global_hash.set(track.uid, hash);
            return { outcome: 'synced' };
        } catch (err) {
            return classify_outcome(err, `tracks/${track.uid}`);
        }
    }

    private async ensure_playlist_artwork_uploaded(playlist: LocalPlaylist): Promise<'ok' | 'retry'> {
        if (playlist.deleted) return 'ok';
        if (playlist.artwork_path != null) return 'ok';
        if (!playlist.thumbnail_uri) return 'ok';

        const uploaded = await PlaylistArtwork.upload_playlist_artwork(playlist.thumbnail_uri);
        if ('error' in uploaded) {
            console.warn(`[SyncEngine] playlist artwork upload failed ${playlist.uuid}:`, uploaded.error);
            return 'retry';
        }
        await db.update(playlists_table)
            .set({ artwork_path: uploaded.artwork_path, thumbnail_uri: uploaded.artwork_path })
            .where(eq(playlists_table.id, playlist.id));
        playlist.artwork_path = uploaded.artwork_path;
        playlist.thumbnail_uri = uploaded.artwork_path;
        return 'ok';
    }

    private async upload_playlist_row(playlist: LocalPlaylist, user_uid: string): Promise<{ outcome: PushResult; reason?: string }> {
        try {
            const artwork_outcome = await this.ensure_playlist_artwork_uploaded(playlist);
            if (artwork_outcome === 'retry') return { outcome: 'retry' };

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

            if (!this.is_playlists_tracks_track_fk_error(error)) throw error;

            const local_track = await db.select().from(tracks_table)
                .where(eq(tracks_table.uid, pt.track_uid)).get();
            if (!local_track) {
                await db.update(playlists_tracks_table)
                    .set({ deleted: true })
                    .where(and(
                        eq(playlists_tracks_table.uuid, pt.uuid),
                        eq(playlists_tracks_table.track_uid, pt.track_uid),
                    ));
                return { outcome: 'dropped', reason: 'missing local track for FK repair' };
            }

            const { error: te } = await this.supabase.from('tracks')
                .upsert(this.track_to_global_insert(local_track), { onConflict: 'uid' });
            if (te) throw te;
            const { error: ue } = await this.supabase.from('utracks')
                .upsert(
                    { ...this.track_to_utrack_insert(local_track, user_uid), deleted: local_track.deleted },
                    { onConflict: 'user_uid,track_uid' },
                );
            if (ue) throw ue;

            const { error: retry_error } = await this.supabase.from('playlists_tracks')
                .upsert(payload, { onConflict: 'uuid,track_uid' });
            if (retry_error) throw retry_error;
            return { outcome: 'synced' };
        } catch (err) {
            return classify_outcome(err, `playlists_tracks/${pt.uuid}:${pt.track_uid}`);
        }
    }

    private async push_pending_deletes(user_uid: string, scope: SyncableLocalTableName[]) {
        const tombstones = await db.select().from(sync_deletes_table)
            .where(and(
                isNull(sync_deletes_table.sync_error),
                inArray(sync_deletes_table.table_name, scope),
            ))
            .orderBy(asc(sync_deletes_table.deleted_at))
            .limit(PUSH_BATCH_SIZE);

        if (tombstones.length === 0) return;

        const synced_ids: number[] = [];
        for (const ts of tombstones) {
            if (this.is_destroyed) break;
            if (this.is_pull_echo_delete(ts.table_name, ts.record_id)) {
                synced_ids.push(ts.id);
                continue;
            }
            const result = await this.upload_tombstone(ts, user_uid);
            if (result.outcome === 'synced') {
                synced_ids.push(ts.id);
            } else if (result.outcome === 'dropped') {
                await db.update(sync_deletes_table)
                    .set({ sync_error: result.reason ?? 'unknown' })
                    .where(eq(sync_deletes_table.id, ts.id));
            }
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
                    return { outcome: 'dropped', reason: `unknown tombstone table: ${tombstone.table_name}` };
            }
        } catch (err) {
            return classify_outcome(err, `tombstone/${tombstone.table_name}/${tombstone.record_id}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
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

    private async pull_changes(user_uid: string, scope: SyncableLocalTableName[]) {
        for (const table_name of PULL_TABLES) {
            if (this.is_destroyed) return;
            if (!scope.includes(table_name)) continue;
            await this.pull_table_changes(table_name, user_uid);
        }
    }

    private async pull_table_changes(table_name: SyncableLocalTableName, user_uid: string) {
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        const last_sync_iso = new Date((metadata?.last_sync_at ?? 0) - 2000).toISOString();

        switch (table_name) {
            case 'tracks':
                try {
                    await this.pull_tracks(last_sync_iso, user_uid);
                } finally {
                    this.flush_pull_dirty_global_tracks();
                }
                break;
            case 'playlists': await this.pull_playlists(last_sync_iso, user_uid); break;
            case 'playlists_tracks': await this.pull_playlists_tracks(last_sync_iso, user_uid); break;
        }
    }

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
        const { count: changed_count, error: count_error } = await this.supabase
            .from('utracks')
            .select('*', { count: 'exact', head: true })
            .eq('user_uid', user_uid)
            .gte('modified_at', last_sync_iso);
        if (count_error) throw count_error;
        if (!changed_count) return;

        const pending_track_changes = await this.get_pending_change_sets('tracks');

        let max_modified_at = 0;
        const observe = (iso: unknown) => {
            const v = safe_to_epoch_merge(iso);
            if (v > max_modified_at) max_modified_at = v;
        };

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

            db.$client.flushPendingReactiveQueries?.();
            if (utrack_rows.length < PULL_PAGE_SIZE) break;
            offset += utrack_rows.length;
        }

        await this.save_pull_watermark('tracks', max_modified_at);
    }

    private flush_pull_dirty_global_tracks() {
        if (this.pull_dirty_global_tracks === 0) return;
        this.pull_dirty_global_tracks = 0;
        SQLGlobal.notify_global_tracks_updated();
    }

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

        const tombstones = await db.select({ record_id: sync_deletes_table.record_id })
            .from(sync_deletes_table)
            .where(and(
                eq(sync_deletes_table.table_name, table_name),
                isNull(sync_deletes_table.sync_error),
            ));
        for (const t of tombstones) deletes.add(t.record_id);

        return { upserts, deletes };
    }

    private async apply_track(
        row: RemoteTrackWithUserData,
        pending_track_changes: { upserts: Set<string>; deletes: Set<string> }
    ) {
        const has_pending_delete = pending_track_changes.deletes.has(row.uid);
        const has_pending_upsert = pending_track_changes.upserts.has(row.uid);
        const is_conflict = has_pending_delete || has_pending_upsert;

        const existing = await db.select().from(tracks_table)
            .where(eq(tracks_table.uid, row.uid)).get();

        if (is_conflict && existing) {
            const merged = MergeResolver.resolve_track(existing, row);
            merged.id = existing.id;
            merged.uid = existing.uid;
            merged.media_uri = existing.media_uri;
            merged.thumbnail_uri = existing.thumbnail_uri;
            merged.lyrics_uri = existing.lyrics_uri;
            merged.synced_lyrics_uri = existing.synced_lyrics_uri;
            merged.plays = existing.plays;
            await db.update(tracks_table).set(merged).where(eq(tracks_table.uid, row.uid));
            if (merged.deleted) SQLGlobal.delete_global_track_item(row.uid, false);
            else SQLGlobal.update_global_track_item(row.uid, merged, false);
            this.pull_dirty_global_tracks++;
            return;
        }
        if (is_conflict && row.deleted) return;

        const remote_modified = this.remote_to_local_epoch(row.modified_at);
        if (existing && remote_modified < existing.modified_at) return;

        if (row.deleted) {
            if (existing) {
                await db.update(tracks_table)
                    .set({ deleted: true, modified_at: remote_modified })
                    .where(eq(tracks_table.uid, row.uid));
                this.record_pull_upsert('tracks', row.uid, remote_modified);
                SQLGlobal.delete_global_track_item(row.uid, false);
                this.pull_dirty_global_tracks++;
            }
            return;
        }

        if (!existing) {
            const inserted = this.remote_track_to_local(row);
            await db.insert(tracks_table).values(inserted);
            this.record_pull_upsert('tracks', row.uid, inserted.modified_at);
            SQLGlobal.add_global_track_item(inserted as LocalTrack, false);
            this.pull_dirty_global_tracks++;
            return;
        }

        const updated = this.remote_track_to_local(row);
        updated.media_uri = existing.media_uri;
        updated.thumbnail_uri = existing.thumbnail_uri;
        updated.lyrics_uri = existing.lyrics_uri;
        updated.synced_lyrics_uri = existing.synced_lyrics_uri;
        updated.plays = existing.plays;
        await db.update(tracks_table).set(updated).where(eq(tracks_table.uid, row.uid));
        this.record_pull_upsert('tracks', row.uid, updated.modified_at);
        SQLGlobal.update_global_track_item(row.uid, { ...existing, ...updated } as LocalTrack, false);
        this.pull_dirty_global_tracks++;
    }

    private async pull_playlists(last_sync_iso: string, user_uid: string) {
        const { count: changed_count, error: count_error } = await this.supabase
            .from('playlists')
            .select('*', { count: 'exact', head: true })
            .eq('user_uid', user_uid)
            .gte('modified_at', last_sync_iso);
        if (count_error) throw count_error;
        if (!changed_count) return;

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
                const is_conflict = has_pending_upsert || has_pending_delete;

                const existing = await db.select().from(playlists_table)
                    .where(eq(playlists_table.uuid, row.uuid)).get();

                if (is_conflict && existing) {
                    const merged = MergeResolver.resolve_playlist(existing, row);
                    merged.id = existing.id;
                    merged.uuid = existing.uuid;
                    if (merged.deleted) {
                        await db.delete(playlists_table).where(eq(playlists_table.uuid, row.uuid));
                    } else {
                        await db.update(playlists_table).set(merged).where(eq(playlists_table.uuid, row.uuid));
                    }
                    continue;
                }
                if (is_conflict && row.deleted) continue;

                const remote_modified = this.remote_to_local_epoch(row.modified_at);
                if (existing && remote_modified < existing.modified_at) continue;

                if (row.deleted) {
                    if (existing) {
                        await db.delete(playlists_table).where(eq(playlists_table.uuid, row.uuid));
                        this.record_pull_delete('playlists', row.uuid);
                    }
                    continue;
                }

                const local = await this.remote_playlist_to_local(row, existing);
                if (existing) {
                    await db.update(playlists_table).set(local).where(eq(playlists_table.uuid, row.uuid));
                } else {
                    await db.insert(playlists_table).values(local);
                }
                this.record_pull_upsert('playlists', row.uuid, local.modified_at);
            }

            if (data.length < PULL_PAGE_SIZE) break;
            offset += data.length;
        }
        db.$client.flushPendingReactiveQueries?.();
        SQLPlaylists.invalidate_playlist_tracks_cache();
        await this.save_pull_watermark('playlists', max_modified_at);
    }

    private async pull_playlists_tracks(last_sync_iso: string, _user_uid: string) {
        const local_playlists = await db.select({ uuid: playlists_table.uuid })
            .from(playlists_table)
            .where(eq(playlists_table.deleted, false));
        const playlist_uuids = local_playlists.map(p => p.uuid);
        if (playlist_uuids.length === 0) return;

        let pending_changes: { upserts: Set<string>; deletes: Set<string> } | null = null;
        let max_modified_at = 0;

        const uuid_chunks = chunkify(playlist_uuids, IN_CLAUSE_CHUNK_SIZE);
        for (const uuid_chunk of uuid_chunks) {
            const { count: changed_count, error: count_error } = await this.supabase
                .from('playlists_tracks')
                .select('*', { count: 'exact', head: true })
                .in('uuid', uuid_chunk)
                .gte('modified_at', last_sync_iso);
            if (count_error) throw count_error;
            if (!changed_count) continue;
            const pending = (pending_changes ??= await this.get_pending_change_sets('playlists_tracks'));

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
                    const has_pending_upsert = pending.upserts.has(record_id);
                    const has_pending_delete = pending.deletes.has(record_id);
                    const is_conflict = has_pending_upsert || has_pending_delete;
                    const existing = await db.select().from(playlists_tracks_table)
                        .where(and(
                            eq(playlists_tracks_table.uuid, row.uuid),
                            eq(playlists_tracks_table.track_uid, row.track_uid)
                        )).get();

                    if (is_conflict && existing) {
                        const merged = MergeResolver.resolve_playlist_track(existing, row);
                        merged.id = existing.id;
                        merged.uuid = existing.uuid;
                        merged.track_uid = existing.track_uid;
                        await db.update(playlists_tracks_table).set(merged)
                            .where(and(
                                eq(playlists_tracks_table.uuid, row.uuid),
                                eq(playlists_tracks_table.track_uid, row.track_uid)
                            ));
                        continue;
                    }
                    if (is_conflict && row.deleted) continue;

                    const remote_modified = this.remote_to_local_epoch(row.modified_at);
                    if (existing && remote_modified < existing.modified_at) continue;

                    if (row.deleted) {
                        if (existing) {
                            await db.update(playlists_tracks_table)
                                .set({ deleted: true, modified_at: remote_modified })
                                .where(and(
                                    eq(playlists_tracks_table.uuid, row.uuid),
                                    eq(playlists_tracks_table.track_uid, row.track_uid)
                                ));
                            this.record_pull_upsert('playlists_tracks', record_id, remote_modified);
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
                    this.record_pull_upsert('playlists_tracks', record_id, local.modified_at);
                }

                if (data.length < PULL_PAGE_SIZE) break;
                offset += data.length;
            }
        }
        db.$client.flushPendingReactiveQueries?.();
        SQLPlaylists.invalidate_playlist_tracks_cache();
        await this.save_pull_watermark('playlists_tracks', max_modified_at);
    }

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
            artwork_path: p.artwork_path,
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
            plays: 0,
            meta: row.meta,
            thumbnail_uri: '',
            media_uri: '',
            lyrics_uri: '',
            synced_lyrics_uri: '',
            deleted: false,
            created_at: safe_to_epoch(row.created_at),
            modified_at: this.remote_to_local_epoch(row.modified_at),
            sync_error: null,
        };
    }

    private async remote_playlist_artwork_fields(
        remote_artwork_path: string | null,
        existing: LocalPlaylist | undefined,
    ): Promise<Pick<LocalPlaylist, 'thumbnail_uri' | 'artwork_path'>> {
        const existing_fields = {
            thumbnail_uri: existing?.thumbnail_uri ?? '',
            artwork_path: existing?.artwork_path ?? null,
        };
        if (remote_artwork_path === existing_fields.artwork_path) return existing_fields;
        if (remote_artwork_path === null) return { thumbnail_uri: '', artwork_path: null };

        const downloaded = await PlaylistArtwork.download_playlist_artwork(remote_artwork_path);
        if ('error' in downloaded) {
            console.warn(`[SyncEngine] playlist artwork download failed ${remote_artwork_path}:`, downloaded.error);
            return existing_fields;
        }
        return { thumbnail_uri: downloaded.thumbnail_uri, artwork_path: remote_artwork_path };
    }

    private async remote_playlist_to_local(
        row: Database['public']['Tables']['playlists']['Row'],
        existing: LocalPlaylist | undefined,
    ): Promise<Omit<LocalPlaylist, 'id'>> {
        const artwork_fields = await this.remote_playlist_artwork_fields(row.artwork_path, existing);
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
            thumbnail_uri: artwork_fields.thumbnail_uri,
            artwork_path: artwork_fields.artwork_path,
            deleted: false,
            date: row.created_at,
            created_at: safe_to_epoch(row.created_at),
            modified_at: this.remote_to_local_epoch(row.modified_at),
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
            modified_at: this.remote_to_local_epoch(row.modified_at),
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
        if (this.full_debounce_timeout) {
            clearTimeout(this.full_debounce_timeout);
            this.full_debounce_timeout = undefined;
        }
        if (this.pt_debounce_timeout) {
            clearTimeout(this.pt_debounce_timeout);
            this.pt_debounce_timeout = undefined;
        }
        if (this.other_debounce_timeout) {
            clearTimeout(this.other_debounce_timeout);
            this.other_debounce_timeout = undefined;
        }
        if (this.network_subscription) {
            this.network_subscription();
            this.network_subscription = undefined;
        }
        ChangeTracker.set_on_change(() => undefined);
    }
}
