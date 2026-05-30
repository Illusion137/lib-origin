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
import type { LocalTableName } from './types';

export class ChangeTracker {
    private static on_change_callback?: () => void;

    static set_on_change(callback: () => void) {
        ChangeTracker.on_change_callback = callback;
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
        db.$client.flushPendingReactiveQueries();
        ChangeTracker.on_change_callback?.();
    }
}
