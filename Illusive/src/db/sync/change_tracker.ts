/* eslint-disable @typescript-eslint/no-extraneous-class */

import { db } from '../database';
import {
    artists_table,
    backpack_table,
    new_releases_table,
    playlists_table,
    playlists_tracks_table,
    recently_played_tracks_table,
    track_plays_table,
    tracks_table,
} from '../schema';
import { and, eq, like } from 'drizzle-orm';
import { sqlite } from '@native/sqlite/sqlite';
import type { LocalTableName } from './types';

const batch_key_columns: Partial<Record<LocalTableName, string>> = {
    tracks: 'uid',
    playlists: 'uuid',
    artists: 'uri',
    backpack: 'uid',
    recently_played_tracks: 'uid',
};

export class ChangeTracker {
    private static on_change_callback?: () => void;

    static set_on_change(callback: () => void) {
        ChangeTracker.on_change_callback = callback;
    }

    // Batched variant of log_change: one UPDATE per chunk instead of one per row.
    // Timestamps are strictly increasing across the batch — the sync push loop
    // advances its watermark per row and would skip rows sharing a modified_at
    // if a push failed mid-batch.
    static async log_changes(
        table_name: LocalTableName,
        operation: 'insert' | 'update' | 'delete',
        record_ids: (string | number)[],
    ) {
        if (record_ids.length === 0) return;
        const now = Date.now();
        const CHUNK_SIZE = 200;
        const raw_connection = sqlite().wrap_client(db.$client);
        const ids = record_ids.map(String);
        const key_column = batch_key_columns[table_name];
        if (table_name === 'playlists_tracks') {
            const composite_ids = ids.filter(id => id.indexOf(':') > 0);
            for (let i = 0; i < composite_ids.length; i += CHUNK_SIZE) {
                const chunk = composite_ids.slice(i, i + CHUNK_SIZE);
                const values_sql = chunk.map(() => "(?, ?, ?)").join(", ");
                const params = chunk.flatMap((id, index) => {
                    const colon = id.indexOf(':');
                    return [id.substring(0, colon), id.substring(colon + 1), now + i + index];
                });
                // SQLite names VALUES columns column1..columnN — it has no alias-list syntax
                await raw_connection.execute_statement(
                    `UPDATE playlists_tracks SET modified_at = v.column3 FROM (VALUES ${values_sql}) AS v WHERE playlists_tracks.uuid = v.column1 AND playlists_tracks.track_uid = v.column2`,
                    params
                );
            }
        }
        else if (key_column !== undefined) {
            for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
                const chunk = ids.slice(i, i + CHUNK_SIZE);
                const values_sql = chunk.map(() => "(?, ?)").join(", ");
                const params = chunk.flatMap((id, index) => [id, now + i + index]);
                await raw_connection.execute_statement(
                    `UPDATE ${table_name} SET modified_at = v.column2 FROM (VALUES ${values_sql}) AS v WHERE ${table_name}.${key_column} = v.column1`,
                    params
                );
            }
        }
        else {
            // No batchable key (new_releases, track_plays) — fall back to the per-row path.
            for (const id of ids) await ChangeTracker.log_change(table_name, operation, id, undefined);
            return;
        }
        db.$client.flushPendingReactiveQueries?.();
        ChangeTracker.on_change_callback?.();
    }

    static async log_change(
        table_name: LocalTableName,
        _operation: 'insert' | 'update' | 'delete',
        record_id: string | number,
        _data: unknown,
    ) {
        const now = Date.now();
        const id = String(record_id);
        switch (table_name) {
            case 'tracks':
                await db.update(tracks_table)
                    .set({ modified_at: now })
                    .where(eq(tracks_table.uid, id));
                break;
            case 'playlists':
                await db.update(playlists_table)
                    .set({ modified_at: now })
                    .where(eq(playlists_table.uuid, id));
                break;
            case 'playlists_tracks': {
                const colon = id.indexOf(':');
                if (colon > 0) {
                    const uuid = id.substring(0, colon);
                    const track_uid = id.substring(colon + 1);
                    await db.update(playlists_tracks_table)
                        .set({ modified_at: now })
                        .where(and(
                            eq(playlists_tracks_table.uuid, uuid),
                            eq(playlists_tracks_table.track_uid, track_uid),
                        ));
                }
                break;
            }
            case 'new_releases': {
                if (id.startsWith('nr_')) {
                    const numeric_id = Number(id.slice(3));
                    if (Number.isFinite(numeric_id)) {
                        await db.update(new_releases_table)
                            .set({ modified_at: now })
                            .where(eq(new_releases_table.id, numeric_id));
                    }
                } else {
                    await db.update(new_releases_table)
                        .set({ modified_at: now })
                        .where(like(new_releases_table.title, `%"uri":"${id}"%`));
                }
                break;
            }
            case 'artists':
                await db.update(artists_table)
                    .set({ modified_at: now })
                    .where(eq(artists_table.uri, id));
                break;
            case 'backpack':
                await db.update(backpack_table)
                    .set({ modified_at: now })
                    .where(eq(backpack_table.uid, id));
                break;
            case 'recently_played_tracks':
                await db.update(recently_played_tracks_table)
                    .set({ modified_at: now })
                    .where(eq(recently_played_tracks_table.uid, id));
                break;
            case 'track_plays': {
                // No stable string key — fall back to numeric id if supplied that way.
                const numeric_id = Number(id);
                if (Number.isFinite(numeric_id)) {
                    await db.update(track_plays_table)
                        .set({ modified_at: now })
                        .where(eq(track_plays_table.id, numeric_id));
                }
                break;
            }
            default: {
                const _exhaustive: never = table_name;
                void _exhaustive;
                break;
            }
        }
        db.$client.flushPendingReactiveQueries?.();
        ChangeTracker.on_change_callback?.();
    }
}
