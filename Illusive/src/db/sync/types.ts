export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface SyncMetadata {
    last_sync_at: number;
    pending_changes: number;
    sync_status: SyncStatus;
}

export interface ChangeLog {
    id: number;
    table: string;
    operation: 'insert' | 'update' | 'delete';
    record_id: string;
    data: any;
    created_at: number;
    synced: boolean;
}