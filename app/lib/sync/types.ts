/**
 * Client-side sync types
 * Mirrors worker sync types for client usage
 */

export type SyncOperation = 'insert' | 'update' | 'delete';

export interface SyncChange<T = any> {
  id: string;
  operation: SyncOperation;
  data?: T;
  clock: number;
  timestamp: number;
  tombstone?: boolean;
}

export interface PullRequest {
  tableName: string;
  lastServerClock: number;
  limit?: number;
}

export interface PullResponse<T = any> {
  tableName: string;
  changes: SyncChange<T>[];
  currentServerClock: number;
  hasMore: boolean;
}

export interface PushRequest<T = any> {
  tableName: string;
  changes: Array<{
    id: string;
    operation: SyncOperation;
    data?: T;
    clientTimestamp: number;
  }>;
}

export interface PushResponse {
  tableName: string;
  accepted: number;
  rejected: number;
  conflicts: Array<{
    id: string;
    reason: string;
    serverVersion?: any;
  }>;
  currentServerClock: number;
}

export interface SyncStatus {
  tableName: string;
  lastSyncTs: number;
  lastPullClock: number;
  pendingPushOps: number;
  isSyncing: boolean;
  lastError?: string;
}

export interface SyncConfig {
  workerUrl: string;
  userId: string;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // milliseconds
}
