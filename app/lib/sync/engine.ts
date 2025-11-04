/**
 * Client-side Sync Engine
 * Manages synchronization between IndexedDB and Cloudflare Worker
 */

import { db } from '../db/schema';
import type { Transaction } from '@/types';
import type {
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
  SyncConfig,
  SyncStatus,
} from './types';

export class SyncEngine {
  private config: SyncConfig;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(config: SyncConfig) {
    this.config = config;
  }

  /**
   * Start automatic sync
   */
  start() {
    if (!this.config.enabled || !this.config.autoSync) {
      return;
    }

    // Clear existing interval
    this.stop();

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      this.sync().catch((error) => {
        console.error('Auto-sync failed:', error);
      });
    }, this.config.syncInterval);

    // Sync immediately
    this.sync().catch((error) => {
      console.error('Initial sync failed:', error);
    });
  }

  /**
   * Stop automatic sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform full sync (push then pull)
   */
  async sync(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Sync is not enabled');
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    this.syncInProgress = true;

    try {
      // Push local changes first
      await this.pushTransactions();

      // Then pull server changes
      await this.pullTransactions();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Push local changes to server
   */
  async pushTransactions(): Promise<PushResponse> {
    // Get pending transactions
    const pendingTransactions = await db.transactions
      .where('syncStatus')
      .equals('pending')
      .toArray();

    if (pendingTransactions.length === 0) {
      return {
        tableName: 'transactions',
        accepted: 0,
        rejected: 0,
        conflicts: [],
        currentServerClock: 0,
      };
    }

    // Build push request
    const pushRequest: PushRequest<Transaction> = {
      tableName: 'transactions',
      changes: pendingTransactions.map((tx) => ({
        id: tx.id,
        operation: 'update', // For now, treat everything as update
        data: tx,
        clientTimestamp: tx.postedTs,
      })),
    };

    // Send to server
    const response = await fetch(`${this.config.workerUrl}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.userId}`,
      },
      body: JSON.stringify(pushRequest),
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.statusText}`);
    }

    const pushResponse: PushResponse = await response.json();

    // Mark accepted transactions as synced
    const acceptedIds = pendingTransactions
      .slice(0, pushResponse.accepted)
      .map((tx) => tx.id);

    if (acceptedIds.length > 0) {
      await Promise.all(
        acceptedIds.map((id) =>
          db.transactions.update(id, {
            syncStatus: 'synced',
            lastSyncedTs: Date.now(),
          })
        )
      );
    }

    // Update clock
    const clock = await db._clock.get('transactions');
    if (clock) {
      await db._clock.update('transactions', {
        lastServerClock: pushResponse.currentServerClock,
        lastSyncTs: Date.now(),
        pendingOps: Math.max(0, (clock.pendingOps || 0) - pushResponse.accepted),
      });
    }

    return pushResponse;
  }

  /**
   * Pull changes from server
   */
  async pullTransactions(): Promise<PullResponse<Transaction>> {
    // Get current clock
    let clock = await db._clock.get('transactions');
    if (!clock) {
      // Initialize clock if it doesn't exist
      await db._clock.add({
        tableName: 'transactions',
        lastServerClock: 0,
        lastSyncTs: Date.now(),
        pendingOps: 0,
      });
      clock = await db._clock.get('transactions');
    }

    // Build pull request
    const pullRequest: PullRequest = {
      tableName: 'transactions',
      lastServerClock: clock?.lastServerClock || 0,
      limit: 500,
    };

    // Send to server
    const response = await fetch(`${this.config.workerUrl}/api/sync/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.userId}`,
      },
      body: JSON.stringify(pullRequest),
    });

    if (!response.ok) {
      throw new Error(`Pull failed: ${response.statusText}`);
    }

    const pullResponse: PullResponse<Transaction> = await response.json();

    // Apply changes locally
    for (const change of pullResponse.changes) {
      await this.applyChange(change);
    }

    // Update clock
    await db._clock.update('transactions', {
      lastServerClock: pullResponse.currentServerClock,
      lastSyncTs: Date.now(),
    });

    // If there are more changes, pull again
    if (pullResponse.hasMore) {
      return await this.pullTransactions();
    }

    return pullResponse;
  }

  /**
   * Apply a single change from server
   */
  private async applyChange(change: any): Promise<void> {
    const { id, operation, data } = change;

    if (operation === 'delete') {
      // Hard delete (or mark as tombstone if needed)
      await db.transactions.delete(id);
    } else if (operation === 'insert' || operation === 'update') {
      if (!data) {
        console.warn(`No data for ${operation} operation on ${id}`);
        return;
      }

      // Check if exists locally
      const existing = await db.transactions.get(id);

      if (existing) {
        // Update existing
        await db.transactions.update(id, {
          ...data,
          syncStatus: 'synced',
          lastSyncedTs: Date.now(),
        });
      } else {
        // Insert new
        await db.transactions.add({
          ...data,
          syncStatus: 'synced',
          lastSyncedTs: Date.now(),
        });
      }
    }
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const clock = await db._clock.get('transactions');
    const pendingCount = await db.transactions.where('syncStatus').equals('pending').count();

    return {
      tableName: 'transactions',
      lastSyncTs: clock?.lastSyncTs || 0,
      lastPullClock: clock?.lastServerClock || 0,
      pendingPushOps: pendingCount,
      isSyncing: this.syncInProgress,
    };
  }

  /**
   * Check if sync is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<SyncConfig>) {
    this.config = { ...this.config, ...config };

    // Restart if auto-sync settings changed
    if (config.autoSync !== undefined || config.syncInterval !== undefined) {
      if (this.config.autoSync) {
        this.start();
      } else {
        this.stop();
      }
    }
  }
}

// Singleton instance
let syncEngine: SyncEngine | null = null;

/**
 * Get or create sync engine instance
 */
export function getSyncEngine(): SyncEngine {
  if (!syncEngine) {
    const config: SyncConfig = {
      workerUrl: process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787',
      userId: 'local', // TODO: Get from user session
      enabled: process.env.NEXT_PUBLIC_ENABLE_SYNC === 'true',
      autoSync: true,
      syncInterval: 5 * 60 * 1000, // 5 minutes
    };

    syncEngine = new SyncEngine(config);
  }

  return syncEngine;
}
