import type { ChangeOp, CompressedChange, LocalTableName } from './types';

export interface ChangeLogLikeRow {
    id: number;
    table_name: LocalTableName;
    operation: ChangeOp;
    record_id: string;
    data: unknown;
    created_at: number;
    synced: boolean;
    attempts?: number;
    last_error?: string;
    dropped?: boolean;
}

/**
 * Compress multiple changes to the same record into a single operation.
 */
export function compress_record_changes(
    table_name: LocalTableName,
    record_id: string,
    changes: ChangeLogLikeRow[]
): CompressedChange | null {
    if (changes.length === 0) return null;

    const change_ids = changes.map(c => c.id);
    const operations = changes.map(c => c.operation);

    // Case 1: Delete is final operation.
    if (operations[operations.length - 1] === 'delete') {
        // Insert + delete is a net-zero operation.
        if (operations.includes('insert')) return null;
        return {
            table: table_name,
            operation: 'delete',
            record_id,
            data: null,
            change_ids,
        };
    }

    // Case 2: Insert followed by updates -> single insert.
    if (operations[0] === 'insert') {
        return {
            table: table_name,
            operation: 'insert',
            record_id,
            data: merge_changes(changes),
            change_ids,
        };
    }

    // Case 3: Update-only sequence -> single minimal update.
    if (operations.every(op => op === 'update')) {
        const merged_data = merge_changes(changes);
        return {
            table: table_name,
            operation: 'update',
            record_id,
            data: extract_minimal_update(merged_data),
            change_ids,
        };
    }

    // Fallback: keep latest change.
    const latest = changes[changes.length - 1];
    return {
        table: table_name,
        operation: latest.operation,
        record_id,
        data: latest.data as Record<string, unknown>,
        change_ids,
    };
}

/**
 * Merge multiple change records into one data object (later overrides earlier).
 */
function merge_changes(changes: ChangeLogLikeRow[]): Record<string, unknown> {
    let merged: Record<string, unknown> = {};
    for (const change of changes) {
        const data = change.data as Record<string, unknown>;
        merged = { ...merged, ...data };
    }
    return merged;
}

/**
 * Keep only relevant update fields; omit server-managed/noise values.
 */
function extract_minimal_update(data: Record<string, unknown>): Record<string, unknown> {
    const minimal: Record<string, unknown> = {};
    const excluded_fields = ['id', 'created_at'];

    for (const [key, value] of Object.entries(data)) {
        if (excluded_fields.includes(key)) continue;
        if (value === null || value === undefined) continue;
        if (value === '' && is_optional_field(key)) continue;
        if (Array.isArray(value) && value.length === 0 && is_optional_field(key)) continue;
        if (value === 0 && is_zero_means_unknown_field(key)) continue;
        minimal[key] = value;
    }

    minimal.modified_at = data.modified_at || Date.now();
    return minimal;
}

function is_zero_means_unknown_field(field_name: string): boolean {
    return field_name === 'duration';
}

function is_optional_field(field_name: string): boolean {
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
