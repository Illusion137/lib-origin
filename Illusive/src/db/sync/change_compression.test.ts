import { describe, expect, it } from 'vitest';
import { compress_record_changes, type ChangeLogLikeRow } from './change_compression';

type TestOp = 'insert' | 'update' | 'delete';

function row(id: number, operation: TestOp, data: Record<string, unknown>): ChangeLogLikeRow {
    return {
        id,
        table_name: 'tracks',
        operation,
        record_id: 'track-1',
        data,
        created_at: id,
        synced: false,
    };
}

describe('sync change compression edge cases', () => {
    it('drops insert+delete as net-zero', () => {
        const compressed = compress_record_changes('tracks', 'track-1', [
            row(1, 'insert', { uid: 'track-1', title: 'A' }),
            row(2, 'delete', { uid: 'track-1' }),
        ]);

        expect(compressed).toBeNull();
    });

    it('merges insert+updates into one insert with final values', () => {
        const compressed = compress_record_changes('tracks', 'track-1', [
            row(1, 'insert', { uid: 'track-1', title: 'A', genre: '' }),
            row(2, 'update', { title: 'B' }),
            row(3, 'update', { genre: 'Hip-Hop' }),
        ]);

        expect(compressed).not.toBeNull();
        expect(compressed?.operation).toBe('insert');
        expect(compressed?.data).toMatchObject({
            uid: 'track-1',
            title: 'B',
            genre: 'Hip-Hop',
        });
        expect(compressed?.change_ids).toEqual([1, 2, 3]);
    });

    it('builds minimal update payload for update-only sequences', () => {
        const compressed = compress_record_changes('tracks', 'track-1', [
            row(1, 'update', {
                id: 999,
                created_at: 123,
                title: 'Track Name',
                alt_title: '',
                genre: '',
                thumbnail_uri: '',
                youtube_id: '',
                tags: [],
                modified_at: 456,
            }),
            row(2, 'update', {
                lyrics_uri: '',
                media_uri: '',
            }),
        ]);

        expect(compressed).not.toBeNull();
        expect(compressed?.operation).toBe('update');
        expect(compressed?.data).toEqual({
            title: 'Track Name',
            tags: [],
            media_uri: '',
            modified_at: 456,
        });
    });

    it('keeps final delete when there was no insert in sequence', () => {
        const compressed = compress_record_changes('tracks', 'track-1', [
            row(1, 'update', { title: 'A' }),
            row(2, 'delete', { uid: 'track-1' }),
        ]);

        expect(compressed).toEqual({
            table: 'tracks',
            operation: 'delete',
            record_id: 'track-1',
            data: null,
            change_ids: [1, 2],
        });
    });
});
