/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
// sync/sync-engine.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { ChangeTracker } from './change_tracker';
import type { NetworkMonitor } from './network_monitor';
import { db } from '../database';
import { artists_table, backpack_table, new_releases_table, playlists_table, playlists_tracks_table, recently_played_tracks_table, sync_metadata_table, track_plays_table, tracks_table } from '../schema';
import { eq } from 'drizzle-orm';
import type { CompressedChange, LocalPlaylist, LocalPlaylistTrack, LocalTableName, LocalTrack, RemotePlaylist, RemotePlaylistTrack, RemoteTrack, RemoteTableName } from './types';
import { LOCAL_TO_REMOTE_TABLE_MAP } from './types';
import { Prefs } from '@illusive/prefs';

type LocalTable = typeof tracks_table | typeof playlists_table | typeof playlists_tracks_table | typeof artists_table | typeof new_releases_table | typeof backpack_table | typeof recently_played_tracks_table | typeof track_plays_table;

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
                if (!acc[change.table]) acc[change.table] = [];
                acc[change.table].push(change);
                return acc;
            }, {});

            // Process each table's changes
            for (const [table_name, table_changes] of Object.entries(changes_by_tables)) {
                await this.push_table_changes(table_name as LocalTableName, table_changes);
            }

            // Mark as synced
            await ChangeTracker.mark_as_synced(changes.map(c => c.change_ids).flat());

            has_more = changes.length === BATCH_SIZE;
        }
    }

    private async push_table_changes(table_name: LocalTableName, changes: CompressedChange[]) {
        const supabase_table_name = this.get_supabase_table_name(table_name);
        if(!supabase_table_name) return; // table not synced

        for (const change of changes) {
            const data = change.data;

            try {
                switch (change.operation) {
                    case 'insert':
                        await this.supabase
                            .from(supabase_table_name)
                            .insert(this.transform_to_supabase(table_name, data));
                        break;

                    case 'update':
                        {
                            const update_query = this.supabase
                                .from(supabase_table_name)
                                .update(this.transform_to_supabase(table_name, data))
                            
                            if(table_name === 'playlists_tracks'){
                                const [playlist_uuid, track_uid] = change.record_id.split(':');
                                await update_query.eq('playlist_uuid', playlist_uuid).eq('track_uuid', track_uid);
                            }else{
                                await update_query.eq(this.get_primary_key(table_name), change.record_id);
                            }
                        }
                        break;

                    case 'delete':
                        {
                            const delete_query = this.supabase
                                .from(supabase_table_name)
                                .update({ deleted: true } as any)
                            
                            if(table_name === 'playlists_tracks'){
                                const [playlist_uuid, track_uid] = change.record_id.split(':');
                                await delete_query.eq('playlist_uuid', playlist_uuid).eq('track_uuid', track_uid);
                            }else{
                                await delete_query.eq(this.get_primary_key(table_name), change.record_id);
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error(`Error syncing ${table_name}:`, error);
                // Could implement retry logic here
            }
        }
    }

    private async pull_changes() {
        const tables_to_sync = Object.keys(LOCAL_TO_REMOTE_TABLE_MAP).filter(k => LOCAL_TO_REMOTE_TABLE_MAP[k as LocalTableName] !== null);

        for (const table_name of tables_to_sync) {
            await this.pull_table_changes(table_name as LocalTableName);
        }
    }

    private async pull_table_changes(table_name: LocalTableName) {
        // Get last sync timestamp
        const metadata = await db
            .select()
            .from(sync_metadata_table)
            .where(eq(sync_metadata_table.table_name, table_name))
            .get();

        const last_sync_at = metadata?.last_sync_at || 0;
        const supabase_table_name = this.get_supabase_table_name(table_name);
        if(!supabase_table_name) return;

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

    private async apply_remote_changes(table_name: LocalTableName, record: any) {
        const local_table = this.get_local_table(table_name);
        if(!local_table) return;

        const transformed = this.transform_from_supabase(table_name, record);
        const pk_column = this.get_primary_key(table_name);

        if (record.deleted) {
            await db.delete(local_table).where(
                eq(local_table[pk_column], record[pk_column])
            );
        } else {
            await db
                .insert(local_table)
                .values(transformed)
                .onConflictDoUpdate({
                    target: local_table[pk_column],
                    set: transformed,
                });
        }
    }

    // Helper methods for table name mapping and data transformation
    private get_supabase_table_name(local_table: LocalTableName): RemoteTableName | null {
        return LOCAL_TO_REMOTE_TABLE_MAP[local_table];
    }

    private get_local_table(table_name: LocalTableName): LocalTable | null {
        const tables: Record<LocalTableName, LocalTable> = {
            'tracks': tracks_table,
            'playlists': playlists_table,
            'playlists_tracks': playlists_tracks_table,
            'artists': artists_table,
            'new_releases': new_releases_table,
            'backpack': backpack_table,
            'recently_played_tracks': recently_played_tracks_table,
            'track_plays': track_plays_table
        };
        return tables[table_name] ?? null;
    }

    private get_primary_key(table_name: LocalTableName): string {
        const keys: Record<string, string> = {
            'tracks': 'uid',
            'playlists': 'uuid',
            'artists': 'uri',
            'new_releases': 'id',
        };
        return keys[table_name] || 'id';
    }

    private transform_to_supabase(table_name: LocalTableName, data: Partial<LocalTrack & LocalPlaylist & LocalPlaylistTrack>): any {
        const user_uid = Prefs.get_pref('user_uuid');
        // TODO exhaustiveness check
        switch (table_name) {
            case 'tracks': {
                const track = data as LocalTrack;
                return {
                    uuid: track.uid,
                    title: track.title,
                    artists: track.artists,
                    album: track.album,
                    duration: track.duration,
                    explicit: track.explicit !== 'NONE',
                    plays: track.plays,
                    artwork_url: track.artwork_url,
                    prods: track.prods ? [track.prods] : [],
                    tags: track.tags,
                    service_uris: {
                        youtube: track.youtube_id,
                        youtubemusic: track.youtubemusic_id,
                        spotify: track.spotify_id,
                        amazonmusic: track.amazonmusic_id,
                        applemusic: track.applemusic_id,
                        soundcloud: track.soundcloud_id,
                        bandlab: track.bandlab_id
                    }
                } as Omit<RemoteTrack, 'created_at' | 'modified_at'>;
            }
            case 'playlists': {
                const playlist = data as LocalPlaylist;
                return {
                    uuid: playlist.uuid,
                    title: playlist.title,
                    description: playlist.description,
                    pinned: playlist.pinned,
                    archived: playlist.archived,
                    public: playlist.public,
                    sort: playlist.sort,
                    inherited_playlists: playlist.inherited_playlists as any[],
                    inherited_searchs: playlist.inherited_searchs as any[],
                    user_uid: user_uid,
                } as Omit<RemotePlaylist, 'id' | 'created_at' | 'modified_at' | 'deleted'>;
            }
            case 'playlists_tracks': {
                const playlistTrack = data as LocalPlaylistTrack;
                return {
                    playlist_uuid: playlistTrack.uuid,
                    track_uuid: playlistTrack.track_uid,
                } as Omit<RemotePlaylistTrack, 'id' | 'created_at' | 'modified_at' | 'deleted'>;
            }

            default:
                return data;
        }
    }

    private transform_from_supabase(table_name: LocalTableName, data: any): any {
        // TODO exhaustiveness check
        switch (table_name) {
            case 'tracks': {
                const remoteTrack = data as RemoteTrack;
                const service_uris = (typeof remoteTrack.service_uris === 'object' && remoteTrack.service_uris !== null && !Array.isArray(remoteTrack.service_uris)) ? remoteTrack.service_uris as any : {};
                return {
                    uid: remoteTrack.uuid,
                    title: remoteTrack.title,
                    artists: remoteTrack.artists,
                    album: remoteTrack.album,
                    duration: remoteTrack.duration,
                    explicit: remoteTrack.explicit ? 'EXPLICIT' : 'NONE',
                    plays: remoteTrack.plays,
                    artwork_url: remoteTrack.artwork_url,
                    prods: Array.isArray(remoteTrack.prods) ? (remoteTrack.prods as string[]).join(', ') : '',
                    tags: remoteTrack.tags,
                    youtube_id: service_uris.youtube,
                    youtubemusic_id: service_uris.youtubemusic,
                    spotify_id: service_uris.spotify,
                    amazonmusic_id: service_uris.amazonmusic,
                    applemusic_id: service_uris.applemusic,
                    soundcloud_id: service_uris.soundcloud,
                    bandlab_id: service_uris.bandlab,
                    created_at: new Date(remoteTrack.created_at).getTime(),
                    modified_at: new Date(remoteTrack.modified_at).getTime(),
                } as unknown as LocalTrack;
            }
            case 'playlists': {
                const remotePlaylist = data as RemotePlaylist;
                return {
                    id: remotePlaylist.id,
                    uuid: remotePlaylist.uuid,
                    title: remotePlaylist.title,
                    description: remotePlaylist.description,
                    pinned: remotePlaylist.pinned,
                    archived: remotePlaylist.archived,
                    public: remotePlaylist.public,
                    sort: remotePlaylist.sort,
                    inherited_playlists: remotePlaylist.inherited_playlists,
                    inherited_searchs: remotePlaylist.inherited_searchs,
                    created_at: new Date(remotePlaylist.created_at).getTime(),
                    modified_at: new Date(remotePlaylist.modified_at).getTime(),
                    thumbnail_uri: '', // default value
                    date: new Date(remotePlaylist.created_at).toISOString(), // default value
                    public_uuid: '', // default value
                    linked_playlists: [], // default value
                } as unknown as LocalPlaylist;
            }
            case 'playlists_tracks': {
                const remotePlaylistTrack = data as RemotePlaylistTrack;
                return {
                    uuid: remotePlaylistTrack.playlist_uuid,
                    track_uid: remotePlaylistTrack.track_uuid
                } as unknown as LocalPlaylistTrack
            }
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