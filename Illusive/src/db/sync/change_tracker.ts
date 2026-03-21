/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-extraneous-class */
 
import { db } from '../database';
import { change_log_table } from '../schema';
import { eq, and, inArray, asc, lt } from 'drizzle-orm';
import type { CompressedChange, LocalTableName } from './types';

export class ChangeTracker {
    /**
     * Log a change to the change log table
     */
    static async log_change(
        table_name: LocalTableName,
        operation: 'insert' | 'update' | 'delete',
        record_id: string | number,
        data: any
    ) {
        await db.insert(change_log_table).values({
            table_name,
            operation,
            record_id: String(record_id),
            data: JSON.stringify(data),
            synced: false,
        });
        db.$client.flushPendingReactiveQueries();
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
            const [table_name, record_id] = key.split(':');
            const compressed_change = this.compress_record_changes(
                table_name as LocalTableName,
                record_id,
                record_changes
            );
            
            if (compressed_change) {
                compressed.push(compressed_change);
            }
        }

        // Return up to batch_size compressed changes
        return compressed.slice(0, batch_size);
    }

    /**
     * Compress multiple changes to the same record into a single operation
     */
    private static compress_record_changes(
        table_name: LocalTableName,
        record_id: string,
        changes: any[]
    ): CompressedChange | null {
        if (changes.length === 0) return null;

        const change_ids = changes.map(c => c.id);
        const operations = changes.map(c => c.operation);
        
        // Case 1: Delete is the final operation - only keep the delete
        if (operations[operations.length - 1] === 'delete') {
            // If there was an insert earlier, we can skip entirely (net zero)
            if (operations.includes('insert')) {
                return null;
            }
            
            return {
                table: table_name,
                operation: 'delete',
                record_id,
                data: null,
                change_ids,
            };
        }

        // Case 2: Insert followed by updates - merge into single insert
        if (operations[0] === 'insert') {
            const merged_data = this.merge_changes(changes);
            return {
                table: table_name,
                operation: 'insert',
                record_id,
                data: merged_data,
                change_ids,
            };
        }

        // Case 3: Only updates - merge into single update with only changed fields
        if (operations.every(op => op === 'update')) {
            const merged_data = this.merge_changes(changes);
            const minimal_data = this.extract_minimal_update(merged_data);
            
            return {
                table: table_name,
                operation: 'update',
                record_id,
                data: minimal_data,
                change_ids,
            };
        }

        // Default: return the latest change
        const latest = changes[changes.length - 1];
        return {
            table: table_name,
            operation: latest.operation,
            record_id,
            data: JSON.parse(latest.data),
            change_ids,
        };
    }

    /**
     * Merge multiple change records into a single data object
     * Later changes override earlier ones
     */
    private static merge_changes(changes: any[]): any {
        let merged = {};
        
        for (const change of changes) {
            const data = JSON.parse(change.data);
            merged = { ...merged, ...data };
        }
        
        return merged;
    }

    /**
     * Extract only the fields that were actually modified
     * Remove metadata fields that don't need to sync
     */
    private static extract_minimal_update(data: any): any {
        const minimal: any = {};
        
        // Fields to always exclude from updates (managed server-side)
        const excluded_fields = ['id', 'created_at'];
        
        // Only include fields that have actual values and aren't excluded
        for (const [key, value] of Object.entries(data)) {
            if (excluded_fields.includes(key)) continue;
            
            // Skip null/undefined values
            if (value === null || value === undefined) continue;
            
            // Skip empty strings for optional fields
            if (value === '' && this.is_optional_field(key)) continue;
            
            // Skip empty arrays for optional array fields
            if (Array.isArray(value) && value.length === 0 && this.is_optional_field(key)) continue;
            
            minimal[key] = value;
        }
        
        // Always include modified_at for tracking
        minimal.modified_at = data.modified_at || new Date().toISOString();
        
        return minimal;
    }

    /**
     * Check if a field is optional (can be omitted if empty)
     */
    private static is_optional_field(field_name: string): boolean {
        const optional_fields = [
            'alt_title',
            'prods',
            'genre',
            'description',
            'youtube_id',
            'youtubemusic_id',
            'soundcloud_permalink',
            'spotify_id',
            'amazonmusic_id',
            'applemusic_id',
            'bandlab_id',
            'artwork_url',
            'thumbnail_uri',
            'lyrics_uri',
        ];
        
        return optional_fields.includes(field_name);
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