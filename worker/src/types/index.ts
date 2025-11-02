// Type definitions for the Worker

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  // BACKUPS: R2Bucket;
  ENVIRONMENT: string;
}

// Sync protocol types
export interface SyncRequest {
  lastSyncTimestamp: number;
  changes: Record<string, any>[];
}

export interface SyncResponse {
  serverTimestamp: number;
  changes: Record<string, any>[];
  conflicts: any[];
}

// Auth types
export interface User {
  id: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}
