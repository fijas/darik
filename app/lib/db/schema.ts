/**
 * Dexie (IndexedDB) Schema
 * Client-side database matching the D1 (server) schema
 *
 * Key principles:
 * - Schema mirrors D1 for consistency
 * - Indices for efficient queries
 * - Sync metadata stored in _clock table
 * - All monetary values in paise (integers)
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
  Transaction,
  Security,
  Holding,
  Price,
  Asset,
  Liability,
  Goal,
  Clock,
  User,
  DeviceInfo,
} from '@/types';

/**
 * Main database class
 * Extends Dexie with typed table definitions
 */
export class DarikDatabase extends Dexie {
  // Transaction table
  transactions!: EntityTable<Transaction, 'id'>;

  // Investment tables
  securities!: EntityTable<Security, 'id'>;
  holdings!: EntityTable<Holding, 'id'>;
  prices!: EntityTable<Price, 'securityId'>; // Compound key: [securityId+date]

  // Asset & liability tables
  assets!: EntityTable<Asset, 'id'>;
  liabilities!: EntityTable<Liability, 'id'>;

  // Goals table
  goals!: EntityTable<Goal, 'id'>;

  // Sync metadata
  _clock!: EntityTable<Clock, 'tableName'>;

  // User data
  user!: EntityTable<User, 'id'>;
  devices!: EntityTable<DeviceInfo, 'deviceId'>;

  constructor() {
    super('darik-finance');

    // Version 1: Initial schema
    this.version(1).stores({
      // Transactions table
      // Indices: userId, createdTs, postedTs, type, category, method, merchant, account, isRecurring, parentTransactionId
      transactions:
        'id, userId, type, createdTs, postedTs, category, method, merchant, account, isRecurring, parentTransactionId, [userId+createdTs], [userId+category], [userId+method], [userId+type]',

      // Securities table
      // Indices: symbol, type, name (for search)
      securities: 'id, symbol, type, name, priceSource',

      // Holdings table
      // Indices: securityId, account
      holdings: 'id, securityId, account, [securityId+account]',

      // Prices table
      // Compound primary key: [securityId+date]
      // Indices: securityId, date
      prices: '[securityId+date], securityId, date',

      // Assets table
      // Indices: type
      assets: 'id, type, name',

      // Liabilities table
      // Indices: type, nextDueDate
      liabilities: 'id, type, nextDueDate',

      // Goals table
      // Indices: targetDate, priority
      goals: 'id, targetDate, priority',

      // Sync clock table (tracks last sync state per table)
      // Primary key: tableName
      _clock: 'tableName, lastSyncTs',

      // User table
      user: 'id, email',

      // Devices table
      devices: 'deviceId, lastSeenAt',
    });

    // Version 2: Add syncStatus index for efficient sync queries
    this.version(2).stores({
      transactions:
        'id, userId, type, createdTs, postedTs, category, method, merchant, account, isRecurring, parentTransactionId, syncStatus, [userId+createdTs], [userId+category], [userId+method], [userId+type]',
    });
  }
}

/**
 * Singleton database instance
 * Import this in components/hooks
 */
export const db = new DarikDatabase();

/**
 * Initialize database with default data
 * Call this on app startup
 */
export async function initializeDatabase(): Promise<void> {
  // Check if database is already initialized
  const clockCount = await db._clock.count();

  if (clockCount === 0) {
    // First-time setup: create clock entries for all tables
    const tables: Array<Clock['tableName']> = [
      'transactions',
      'securities',
      'holdings',
      'prices',
      'assets',
      'liabilities',
      'goals',
    ];

    await db._clock.bulkAdd(
      tables.map((tableName) => ({
        tableName,
        lastServerClock: 0,
        lastSyncTs: 0,
        pendingOps: 0,
      }))
    );

    console.log('[DB] Database initialized with clock entries');
  }

  // Check database version
  console.log(`[DB] Dexie database opened: v${db.verno}, name: ${db.name}`);
}

/**
 * Clear all data (for testing or reset)
 * WARNING: This deletes everything!
 */
export async function clearDatabase(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });
  console.log('[DB] All data cleared');

  // Re-initialize clock entries
  await initializeDatabase();
}

/**
 * Get database statistics
 * Useful for debugging and settings page
 */
export async function getDatabaseStats() {
  const [
    transactionCount,
    securityCount,
    holdingCount,
    priceCount,
    assetCount,
    liabilityCount,
    goalCount,
  ] = await Promise.all([
    db.transactions.count(),
    db.securities.count(),
    db.holdings.count(),
    db.prices.count(),
    db.assets.count(),
    db.liabilities.count(),
    db.goals.count(),
  ]);

  return {
    transactions: transactionCount,
    securities: securityCount,
    holdings: holdingCount,
    prices: priceCount,
    assets: assetCount,
    liabilities: liabilityCount,
    goals: goalCount,
    total:
      transactionCount +
      securityCount +
      holdingCount +
      priceCount +
      assetCount +
      liabilityCount +
      goalCount,
  };
}

/**
 * Export database to JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  const data = {
    version: db.verno,
    exportedAt: Date.now(),
    transactions: await db.transactions.toArray(),
    securities: await db.securities.toArray(),
    holdings: await db.holdings.toArray(),
    prices: await db.prices.toArray(),
    assets: await db.assets.toArray(),
    liabilities: await db.liabilities.toArray(),
    goals: await db.goals.toArray(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import database from JSON backup
 * WARNING: This will clear existing data
 */
export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);

  await db.transaction('rw', db.tables, async () => {
    // Clear existing data
    await db.transactions.clear();
    await db.securities.clear();
    await db.holdings.clear();
    await db.prices.clear();
    await db.assets.clear();
    await db.liabilities.clear();
    await db.goals.clear();

    // Import new data
    if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
    if (data.securities?.length) await db.securities.bulkAdd(data.securities);
    if (data.holdings?.length) await db.holdings.bulkAdd(data.holdings);
    if (data.prices?.length) await db.prices.bulkAdd(data.prices);
    if (data.assets?.length) await db.assets.bulkAdd(data.assets);
    if (data.liabilities?.length) await db.liabilities.bulkAdd(data.liabilities);
    if (data.goals?.length) await db.goals.bulkAdd(data.goals);
  });

  console.log('[DB] Database imported successfully');
}

/**
 * Check if database is healthy
 * Returns true if database is accessible
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db._clock.count();
    return true;
  } catch (error) {
    console.error('[DB] Database health check failed:', error);
    return false;
  }
}
