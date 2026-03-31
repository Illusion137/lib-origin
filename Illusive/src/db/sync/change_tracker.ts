/* eslint-disable @typescript-eslint/no-extraneous-class */

import { db } from '../database';
import { change_log_table } from '../schema';
import { eq, and, inArray, asc, lt } from 'drizzle-orm';
import type { CompressedChange, LocalTableName } from './types';
import { compress_record_changes, type ChangeLogLikeRow } from './change_compression';

type ChangeLogRow = typeof change_log_table.$inferSelect;

export class ChangeTracker {
    private static on_change_callback?: () => void;

    static set_on_change(callback: () => void) {
        ChangeTracker.on_change_callback = callback;
    }

    /**
     * Log a change to the change log table
     */
    static async log_change(
        table_name: LocalTableName,
        operation: 'insert' | 'update' | 'delete',
        record_id: string | number,
        data: unknown
    ) {
        await db.insert(change_log_table).values({
            table_name,
            operation,
            record_id: String(record_id),
            data: data,
            synced: false,
        });
        db.$client.flushPendingReactiveQueries();
        ChangeTracker.on_change_callback?.();
    }

    /**
     * Get pending changes with intelligent compression:
     * 1. Consolidate multiple updates to same record into one
     * 2. Remove insert+delete for same record (net zero)
     * 3. Convert insert+updates into single insert
     * 4. Keep only final state for each record
     */
    static async get_pending_changes(batch_size = 100): Promise<CompressedChange[]> {
        // Get all unsynced changes ordered by creation time
        const all_changes = await db
            .select()
            .from(change_log_table)
            .where(eq(change_log_table.synced, false))
            .orderBy(asc(change_log_table.created_at));

        if (all_changes.length === 0) {
            return [];
        }

        // Group changes by table and record
        const changes_by_record = new Map<string, typeof all_changes>();
        
        for (const change of all_changes) {
            const key = `${change.table_name}:${change.record_id}`;
            if (!changes_by_record.has(key)) {
                changes_by_record.set(key, []);
            }
            changes_by_record.get(key)!.push(change);
        }

        // Compress changes for each record
        const compressed: CompressedChange[] = [];
        
        for (const [key, record_changes] of changes_by_record.entries()) {
            const colon_idx = key.indexOf(':');
            const table_name = key.substring(0, colon_idx);
            const record_id = key.substring(colon_idx + 1);
            const compressed_change = compress_record_changes(
                table_name as LocalTableName,
                record_id,
                record_changes as ChangeLogLikeRow[]
            );
            
            if (compressed_change) {
                compressed.push(compressed_change);
            }
        }

        // Return up to batch_size compressed changes
        return compressed.slice(0, batch_size);
    }

    static compress_record_changes_for_tests(
        table_name: LocalTableName,
        record_id: string,
        changes: ChangeLogLikeRow[]
    ): CompressedChange | null {
        return compress_record_changes(table_name, record_id, changes);
    }

    /**
     * Mark changes as synced
     */
    static async mark_as_synced(change_ids: number[]) {
        if (change_ids.length === 0) return;
        
        await db
            .update(change_log_table)
            .set({ synced: true })
            .where(inArray(change_log_table.id, change_ids));
    }

    /**
     * Get statistics about pending changes
     */
    static async get_sync_stats() {
        const pending = await db
            .select()
            .from(change_log_table)
            .where(eq(change_log_table.synced, false));

        const stats_by_table: Record<string, { inserts: number; updates: number; deletes: number }> = {};
        
        for (const change of pending) {
            if (!stats_by_table[change.table_name]) {
                stats_by_table[change.table_name] = { inserts: 0, updates: 0, deletes: 0 };
            }
            
            if (change.operation === 'insert') stats_by_table[change.table_name].inserts++;
            if (change.operation === 'update') stats_by_table[change.table_name].updates++;
            if (change.operation === 'delete') stats_by_table[change.table_name].deletes++;
        }

        return {
            total_pending: pending.length,
            by_table: stats_by_table,
        };
    }

    /**
     * Delete changelog entries that can never be synced:
     * - insert+delete pairs for the same record (net-zero, compress to null)
     * These stay with synced=false indefinitely otherwise, clogging the changelog.
     */
    static async delete_irresolvable_changes(): Promise<number> {
        const all_changes = await db
            .select()
            .from(change_log_table)
            .where(eq(change_log_table.synced, false))
            .orderBy(asc(change_log_table.created_at));

        if (all_changes.length === 0) return 0;

        const changes_by_record = new Map<string, typeof all_changes>();
        for (const change of all_changes) {
            const key = `${change.table_name}:${change.record_id}`;
            if (!changes_by_record.has(key)) changes_by_record.set(key, []);
            changes_by_record.get(key)!.push(change);
        }

        const ids_to_delete: number[] = [];
        for (const [key, record_changes] of changes_by_record.entries()) {
            const colon_idx = key.indexOf(':');
            const table_name = key.substring(0, colon_idx) as LocalTableName;
            const record_id = key.substring(colon_idx + 1);
            const compressed = compress_record_changes(table_name, record_id, record_changes as ChangeLogLikeRow[]);
            if (compressed === null) {
                ids_to_delete.push(...record_changes.map(c => c.id));
            }
        }

        if (ids_to_delete.length === 0) return 0;

        await db.delete(change_log_table).where(inArray(change_log_table.id, ids_to_delete));
        return ids_to_delete.length;
    }

    /**
     * Clean up old synced changes
     */
    static async cleanup_old_changes(days_to_keep = 30) {
        const cutoff_time = Date.now() - (days_to_keep * 24 * 60 * 60 * 1000);
        
        await db
            .delete(change_log_table)
            .where(
                and(
                    eq(change_log_table.synced, true),
                    lt(change_log_table.created_at, cutoff_time)
                )
            );
    }
}
