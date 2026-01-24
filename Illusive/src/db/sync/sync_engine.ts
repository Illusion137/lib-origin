// sync/sync-engine.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import { playlists_table, playlists_tracks_table, sync_metadata_table, tracks_table } from '../schema';
import { eq } from 'drizzle-orm';
import type { sqliteTable } from 'drizzle-orm/sqlite-core';

export class SyncEngine {
    private is_syncing = false;
    private sync_interval?: NodeJS.Timeout;
    private readonly supabase: SupabaseClient;
    private readonly network_monitor: NetworkMonitor;

    constructor(
        supabase: SupabaseClient,
        networkMonitor: NetworkMonitor
    ) { 
        this.supabase = supabase;
        this.network_monitor = networkMonitor;
    }

    async initialize() {
        // Listen for network changes
        this.network_monitor.on_network_change(async (isGoodTime) => {
            if (isGoodTime && !this.is_syncing) {
                await this.sync();
            }
        });

        // Periodic sync check (every 5 minutes)
        this.sync_interval = setInterval(async () => {
            const isGoodTime = await this.network_monitor.is_good_time_to_sync();
            if (isGoodTime && !this.is_syncing) {
                await this.sync();
            }
        }, 5 * 60 * 1000);
    }

    async sync() {
        if (this.is_syncing) return;

        try {
            this.is_syncing = true;

            // 1. Push local changes to Supabase
            await this.push_changes();

            // 2. Pull changes from Supabase
            await this.pull_changes();

        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        } finally {
            this.is_syncing = false;
        }
    }

    private async push_changes() {
        const BATCH_SIZE = 50;
        let has_more = true;

        while (has_more) {
            const changes = await ChangeTracker.get_pending_changes(BATCH_SIZE);

            if (changes.length === 0) {
                has_more = false;
                break;
            }

            // Group changes by table
            const changes_by_tables = changes.reduce<Record<string, typeof changes>>((acc, change) => {
                if (!acc[change.table_name]) acc[change.table_name] = [];
                acc[change.table_name].push(change);
                return acc;
            }, {});

            // Process each table's changes
            for (const [table_name, table_changes] of Object.entries(changes_by_tables)) {
                await this.push_table_changes(table_name, table_changes);
            }

            // Mark as synced
            await ChangeTracker.mark_as_synced(changes.map(c => c.id));

            has_more = changes.length === BATCH_SIZE;
        }
    }

    private async push_table_changes(table_name: string, changes: any[]) {
        const supabase_table_name = this.get_supabase_table_name(table_name);

        for (const change of changes) {
            const data = JSON.parse(change.data);

            try {
                switch (change.operation) {
                    case 'insert':
                        await this.supabase
                            .from(supabase_table_name)
                            .insert(this.transform_to_supabase(table_name, data));
                        break;

                    case 'update':
                        await this.supabase
                            .from(supabase_table_name)
                            .update(this.transform_to_supabase(table_name, data))
                            .eq(this.get_primary_key(table_name), change.record_id);
                        break;

                    case 'delete':
                        // Soft delete
                        await this.supabase
                            .from(supabase_table_name)
                            .update({ deleted: true })
                            .eq(this.get_primary_key(table_name), change.record_id);
                        break;
                }
            } catch (error) {
                console.error(`Error syncing ${table_name}:`, error);
                // Could implement retry logic here
            }
        }
    }

    private async pull_changes() {
        const tables = ['tracks', 'playlists', 'playlists_tracks'];

        for (const table_name of tables) {
            await this.pull_table_changes(table_name);
        }
    }

    private async pull_table_changes(table_name: string) {
        // Get last sync timestamp
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        const last_sync_at = metadata?.last_sync_at || 0;
        const supabase_table_name = this.get_supabase_table_name(table_name);

        // Fetch changes since last sync
        const { data, error } = await this.supabase
            .from(supabase_table_name)
            .select('*')
            .gte('modified_at', new Date(last_sync_at).toISOString())
            .order('modified_at', { ascending: true });

        if (error) throw error;
        if (!data || data.length === 0) return;

        // Apply changes to local DB
        for (const record of data) {
            await this.apply_remote_changes(table_name, record);
        }

        // Update sync metadata
        const latest_modified = Math.max(
            ...data.map(r => new Date(r.modified_at).getTime())
        );

        await db
            .insert(sync_metadata_table)
            .values({
                table_name: table_name,
                last_sync_at: Date.now(),
                last_modified_at: latest_modified,
            })
            .onConflictDoUpdate({
                target: sync_metadata_table.table_name,
                set: {
                    last_sync_at: Date.now(),
                    last_modified_at: latest_modified,
                },
            });
    }

    private async apply_remote_changes(table_name: string, record: any) {
        const local_table = this.get_local_table(table_name);
        const transformed = this.transform_from_supabase(table_name, record);

        if (record.deleted) {
            // Move to deleted table or just delete
            await db.delete(local_table).where(
                eq(local_table[this.get_primary_key(table_name)], record[this.get_primary_key(table_name)])
            );
        } else {
            // Upsert
            await db
                .insert(local_table)
                .values(transformed)
                .onConflictDoUpdate({
                    target: local_table[this.get_primary_key(table_name)],
                    set: transformed,
                });
        }
    }

    // Helper methods for table name mapping and data transformation
    private get_supabase_table_name(local_table: string): string {
        const mapping: Record<string, string> = {
            'tracks': 'tracks',
            'playlists': 'playlists',
            'playlists_tracks': 'uptracks',
        };
        return mapping[local_table] || local_table;
    }

    private get_local_table(table_name: string): ReturnType<typeof sqliteTable> {
        // Return the actual drizzle table object
        // You'll need to import these
        const tables = {
            'tracks': tracks_table,
            'playlists': playlists_table,
            'playlists_tracks': playlists_tracks_table,
        };
        return tables[table_name] as ReturnType<typeof sqliteTable>;
    }

    private get_primary_key(table_name: string): string {
        const keys: Record<string, string> = {
            'tracks': 'uid',
            'playlists': 'uuid',
            'playlists_tracks': 'uuid',
        };
        return keys[table_name] || 'id';
    }

    private transform_to_supabase(table_name: string, data: any): any {
        // Transform local schema to Supabase schema
        // Handle differences like sqlite int timestamps vs postgres timestamps
        // TODO fix ids
        switch (table_name) {
            case 'tracks':
                return {
                    uuid: data.uid,
                    title: data.title,
                    artists: data.artists,
                    album: data.album,
                    duration: data.duration,
                    prods: data.prods ? [data.prods] : [],
                    tags: data.tags,
                    explicit: data.explicit !== 'NONE',
                    plays: data.plays,
                    artwork_url: data.artwork_url,
                    created_at: new Date(data.created_at).toISOString(),
                    modified_at: new Date(data.modified_at).toISOString(),
                };

            case 'playlists':
                return {
                    uuid: data.uuid,
                    title: data.title,
                    description: data.description,
                    pinned: data.pinned,
                    archived: data.archived,
                    public: data.public,
                    sort: data.sort,
                    inherited_playlists: data.inherited_playlists,
                    inherited_searchs: data.inherited_searchs,
                    created_at: new Date(data.created_at).toISOString(),
                    modified_at: new Date(data.modified_at).toISOString(),
                };

            default:
                return data;
        }
    }

    private transform_from_supabase(table_name: string, data: any): any {
        // Transform Supabase schema to local schema
        // TODO fix this to
        switch (table_name) {
            case 'tracks':
                return {
                    uid: data.uuid,
                    title: data.title,
                    artists: data.artists,
                    album: data.album,
                    duration: data.duration,
                    prods: Array.isArray(data.prods) ? data.prods.join(', ') : '',
                    tags: data.tags,
                    explicit: data.explicit ? 'EXPLICIT' : 'NONE',
                    plays: data.plays,
                    artwork_url: data.artwork_url,
                    created_at: new Date(data.created_at).getTime(),
                    modified_at: new Date(data.modified_at).getTime(),
                };

            case 'playlists':
                return {
                    uuid: data.uuid,
                    title: data.title,
                    description: data.description,
                    pinned: data.pinned,
                    archived: data.archived,
                    public: data.public,
                    sort: data.sort,
                    inherited_playlists: data.inherited_playlists,
                    inherited_searchs: data.inherited_searchs,
                    created_at: new Date(data.created_at).getTime(),
                    modified_at: new Date(data.modified_at).getTime(),
                };

            default:
                return data;
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    destroy() {
        if (this.sync_interval) {
            clearInterval(this.sync_interval);
        }
    }
}