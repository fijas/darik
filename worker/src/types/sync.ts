/**
 * Sync Protocol Types
 * Defines the structure for client-server synchronization
 */

import { z } from 'zod';

/**
 * Sync operation types
 */
export type SyncOperation = 'insert' | 'update' | 'delete';

/**
 * Client clock information for delta sync
 */
export interface ClientClock {
  tableName: string;
  lastServerClock: number;
  lastSyncTs: number;
  pendingOps: number;
}

/**
 * Server clock state
 */
export interface ServerClock {
  tableName: string;
  currentClock: number;
  timestamp: number;
}

/**
 * Change record for sync
 */
export interface SyncChange<T = any> {
  id: string;
  operation: SyncOperation;
  data?: T; // Encrypted payload for insert/update, null for delete
  clock: number; // Server-side clock value
  timestamp: number; // Server timestamp
  tombstone?: boolean; // Soft delete flag
}

/**
 * Pull request - client wants changes from server
 */
export interface PullRequest {
  tableName: string;
  lastServerClock: number; // Last known server clock
  limit?: number; // Max records to pull (default: 500)
}

export const PullRequestSchema = z.object({
  tableName: z.string().min(1),
  lastServerClock: z.number().int().min(0),
  limit: z.number().int().min(1).max(1000).optional(),
});

/**
 * Pull response - server sends changes
 */
export interface PullResponse<T = any> {
  tableName: string;
  changes: SyncChange<T>[];
  currentServerClock: number;
  hasMore: boolean; // If true, client should pull again
}

/**
 * Push request - client sends changes to server
 */
export interface PushRequest<T = any> {
  tableName: string;
  changes: Array<{
    id: string;
    operation: SyncOperation;
    data?: T; // Encrypted payload
    clientTimestamp: number;
  }>;
}

export const PushRequestSchema = z.object({
  tableName: z.string().min(1),
  changes: z.array(
    z.object({
      id: z.string().uuid(),
      operation: z.enum(['insert', 'update', 'delete']),
      data: z.any().optional(),
      clientTimestamp: z.number().int(),
    })
  ),
});

/**
 * Push response - server confirms changes
 */
export interface PushResponse {
  tableName: string;
  accepted: number; // Number of changes accepted
  rejected: number; // Number of changes rejected
  conflicts: Array<{
    id: string;
    reason: string;
    serverVersion?: any; // Current server version
  }>;
  currentServerClock: number;
}

/**
 * Conflict resolution strategies
 */
export type ConflictStrategy = 'server-wins' | 'client-wins' | 'field-merge' | 'manual';

/**
 * Sync status for a table
 */
export interface SyncStatus {
  tableName: string;
  lastSyncTs: number;
  lastPullClock: number;
  pendingPushOps: number;
  isSyncing: boolean;
  lastError?: string;
}

/**
 * Batch sync request for multiple tables
 */
export interface BatchSyncRequest {
  pulls: PullRequest[];
  pushes: PushRequest[];
}

/**
 * Batch sync response
 */
export interface BatchSyncResponse {
  pulls: Record<string, PullResponse>;
  pushes: Record<string, PushResponse>;
  timestamp: number;
}

/**
 * Sync statistics
 */
export interface SyncStats {
  totalPulled: number;
  totalPushed: number;
  conflicts: number;
  duration: number; // milliseconds
  timestamp: number;
}
