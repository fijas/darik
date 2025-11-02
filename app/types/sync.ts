/**
 * Sync protocol types
 * Defines structures for client-server synchronization
 *
 * Implements a delta-sync protocol with conflict resolution
 * using Lamport clocks and last-write-wins with field-level merging
 */

/**
 * Table names that can be synced
 */
export type SyncTable =
  | 'transactions'
  | 'securities'
  | 'holdings'
  | 'prices'
  | 'assets'
  | 'liabilities'
  | 'goals';

/**
 * Sync operation types
 */
export type SyncOperation = 'insert' | 'update' | 'delete';

/**
 * Sync row with metadata
 * Generic wrapper for any table row being synced
 */
export interface SyncRow<T = Record<string, any>> {
  id: string; // Record ID
  data?: T; // Actual data (undefined for deletes)
  enc?: Uint8Array; // Encrypted payload (if encryption enabled)
  clock: number; // Lamport or vector clock value
  operation: SyncOperation;
  tombstone?: boolean; // True if this is a soft delete
  deviceId?: string; // Originating device
  userId?: string; // Owner
  timestamp?: number; // Server timestamp
  hash?: string; // Content hash for deduplication
}

/**
 * Pull request - Client requests changes from server
 */
export interface SyncPullRequest {
  table: SyncTable;
  sinceClock: number; // Last known server clock
  limit?: number; // Max rows to fetch (default 500)
  deviceId: string; // Client device identifier
}

/**
 * Pull response - Server sends changes to client
 */
export interface SyncPullResponse {
  table: SyncTable;
  rows: SyncRow[];
  serverClock: number; // Current server clock
  hasMore: boolean; // Are there more changes?
  nextClock?: number; // Clock value for next request
}

/**
 * Push request - Client sends changes to server
 */
export interface SyncPushRequest {
  table: SyncTable;
  rows: SyncRow[];
  deviceId: string;
  deviceClock: number; // Client's clock value
}

/**
 * Push response - Server confirms receipt and returns conflicts
 */
export interface SyncPushResponse {
  table: SyncTable;
  accepted: string[]; // IDs that were accepted
  rejected: string[]; // IDs that were rejected
  conflicts: SyncConflict[]; // Conflicts that need resolution
  serverClock: number; // New server clock value
}

/**
 * Conflict information
 */
export interface SyncConflict {
  id: string; // Record ID
  table: SyncTable;
  clientRow: SyncRow; // What client sent
  serverRow: SyncRow; // What server has
  reason: 'clock_mismatch' | 'hash_mismatch' | 'concurrent_edit' | 'deleted';
  resolution?: 'server_wins' | 'client_wins' | 'merge' | 'manual';
  mergedRow?: SyncRow; // Auto-merged result (if resolution = 'merge')
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution =
  | 'server_wins' // Use server version
  | 'client_wins' // Use client version
  | 'last_write_wins' // Use highest clock value
  | 'merge' // Field-level merge
  | 'manual'; // Require user intervention

/**
 * Sync queue item
 * Pending operation waiting to be synced
 */
export interface SyncQueueItem {
  id: string; // Queue item ID
  table: SyncTable;
  recordId: string; // ID of the record being synced
  operation: SyncOperation;
  data: Record<string, any>; // Data to sync
  clock: number; // Client clock when queued
  queuedAt: number; // When it was queued
  retries: number; // Number of retry attempts
  lastError?: string; // Last error message
  priority: number; // Higher = sync sooner
}

/**
 * Sync state for UI display
 */
export interface SyncState {
  isSyncing: boolean; // Is sync currently in progress?
  lastSyncAt?: number; // Last successful sync timestamp
  nextSyncAt?: number; // When next sync is scheduled
  pendingOps: number; // Number of pending operations
  errors: number; // Number of errors
  queueSize: number; // Total queue size
  uploadProgress?: number; // 0-1
  downloadProgress?: number; // 0-1
}

/**
 * Sync statistics
 */
export interface SyncStats {
  totalSynced: number; // Total records synced
  uploaded: number; // Records sent to server
  downloaded: number; // Records received from server
  conflicts: number; // Conflicts encountered
  errors: number; // Errors encountered
  duration: number; // Sync duration in ms
  bytesUploaded: number;
  bytesDownloaded: number;
}

/**
 * Batch sync request
 * Sync multiple tables at once
 */
export interface BatchSyncRequest {
  tables: Array<{
    table: SyncTable;
    sinceClock: number;
  }>;
  deviceId: string;
}

/**
 * Batch sync response
 */
export interface BatchSyncResponse {
  results: Array<{
    table: SyncTable;
    success: boolean;
    pullResponse?: SyncPullResponse;
    error?: string;
  }>;
  serverTimestamp: number;
}

/**
 * Vector clock for distributed sync
 * Alternative to Lamport clocks
 */
export interface VectorClock {
  deviceId: string;
  clocks: Record<string, number>; // deviceId -> clock value
}

/**
 * Sync engine configuration
 */
export interface SyncConfig {
  enabled: boolean; // Is sync enabled?
  encryptionEnabled: boolean; // Encrypt data before sync?
  autoSync: boolean; // Auto-sync on changes?
  syncInterval: number; // Auto-sync interval (ms)
  batchSize: number; // Max rows per sync request
  maxRetries: number; // Max retry attempts
  retryBackoff: number; // Backoff multiplier for retries
  conflictResolution: ConflictResolution;
  syncOnFocus: boolean; // Sync when app gains focus?
  syncOnNetwork: boolean; // Sync when network is restored?
  compressPayloads: boolean; // Use gzip compression?
}

/**
 * Sync event for monitoring
 */
export interface SyncEvent {
  type:
    | 'sync_started'
    | 'sync_completed'
    | 'sync_failed'
    | 'conflict_detected'
    | 'queue_updated'
    | 'network_changed';
  table?: SyncTable;
  timestamp: number;
  data?: Record<string, any>;
  error?: string;
}

/**
 * Network status
 */
export interface NetworkStatus {
  online: boolean;
  type?: 'wifi' | '4g' | '3g' | '2g' | 'ethernet' | 'unknown';
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean; // User wants to save data
}

/**
 * Sync policy based on network conditions
 */
export interface SyncPolicy {
  syncOnMetered: boolean; // Sync on metered connections (mobile data)?
  syncOnSlow: boolean; // Sync on slow connections?
  maxPayloadSize: number; // Max payload size for current network
  priority: 'high' | 'normal' | 'low' | 'background';
}

/**
 * Delta calculation result
 * What changed between two versions
 */
export interface Delta {
  added: string[]; // New field keys
  modified: string[]; // Changed field keys
  deleted: string[]; // Removed field keys
  changes: Record<string, { old: any; new: any }>;
}

/**
 * Merge result
 * Result of merging two conflicting versions
 */
export interface MergeResult<T = Record<string, any>> {
  merged: T; // Merged data
  conflicts: Array<{
    field: string;
    clientValue: any;
    serverValue: any;
    resolution: 'client' | 'server' | 'both';
  }>;
  strategy: ConflictResolution;
}

/**
 * Tombstone for soft deletes
 * Keeps record of deleted items for sync purposes
 */
export interface Tombstone {
  id: string; // Record ID
  table: SyncTable;
  deletedAt: number; // When it was deleted
  deletedBy: string; // Device that deleted it
  clock: number; // Clock value at deletion
  ttl: number; // Time-to-live (when to purge)
}

/**
 * Sync session
 * Tracks an ongoing sync session
 */
export interface SyncSession {
  id: string; // Session ID
  startedAt: number;
  completedAt?: number;
  tables: SyncTable[];
  stats: SyncStats;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}
