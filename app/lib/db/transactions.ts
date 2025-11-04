/**
 * Transaction Database Operations
 * CRUD functions and query helpers for transactions
 */

import { db } from './schema';
import type { Transaction, TransactionCategory, PaymentMethod } from '@/types';

/**
 * Add a new transaction
 * @param transaction Transaction data (id will be generated if not provided)
 * @returns Created transaction ID
 */
export async function addTransaction(transaction: Omit<Transaction, 'id'> & { id?: string }): Promise<string> {
  const id = transaction.id || crypto.randomUUID();
  const now = Date.now();

  const newTransaction: Transaction = {
    ...transaction,
    id,
    createdTs: transaction.createdTs || now,
    postedTs: transaction.postedTs || now,
    syncStatus: 'pending',
  };

  await db.transactions.add(newTransaction);

  // Update clock for sync
  const clock = await db._clock.get('transactions');
  if (clock) {
    await db._clock.update('transactions', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }

  return id;
}

/**
 * Update an existing transaction
 * @param id Transaction ID
 * @param updates Partial transaction data to update
 * @returns Number of records updated (should be 1)
 */
export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdTs'>>
): Promise<number> {
  const result = await db.transactions.update(id, {
    ...updates,
    postedTs: Date.now(), // Update posted timestamp
    syncStatus: 'pending', // Mark for sync
  });

  if (result) {
    // Update clock for sync
    const clock = await db._clock.get('transactions');
    if (clock) {
      await db._clock.update('transactions', {
        pendingOps: (clock.pendingOps || 0) + 1,
      });
    }
  }

  return result;
}

/**
 * Delete a transaction (soft delete if synced, hard delete if local only)
 * @param id Transaction ID
 * @returns Number of records deleted
 */
export async function deleteTransaction(id: string): Promise<number> {
  const transaction = await db.transactions.get(id);

  if (!transaction) {
    return 0;
  }

  // For now, hard delete (will implement soft delete with tombstones in Phase 4)
  const result = await db.transactions.delete(id);

  if (result === undefined) {
    // Delete succeeded (Dexie returns undefined on success)
    const clock = await db._clock.get('transactions');
    if (clock) {
      await db._clock.update('transactions', {
        pendingOps: (clock.pendingOps || 0) + 1,
      });
    }
    return 1;
  }

  return 0;
}

/**
 * Get a single transaction by ID
 * @param id Transaction ID
 * @returns Transaction or undefined
 */
export async function getTransaction(id: string): Promise<Transaction | undefined> {
  return await db.transactions.get(id);
}

/**
 * Transaction query filters
 */
export interface TransactionFilters {
  userId?: string;
  type?: Transaction['type'] | Transaction['type'][];
  category?: TransactionCategory | TransactionCategory[];
  method?: PaymentMethod | PaymentMethod[];
  dateFrom?: number; // Timestamp
  dateTo?: number; // Timestamp
  minAmount?: number; // In paise
  maxAmount?: number; // In paise
  merchant?: string; // Partial match
  account?: string;
  isRecurring?: boolean;
  search?: string; // Search in merchant, note, rawText
}

/**
 * Query options for pagination and sorting
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: keyof Transaction;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get transactions with filters
 * @param filters Optional filters
 * @param options Optional query options
 * @returns Array of transactions
 */
export async function getTransactions(
  filters?: TransactionFilters,
  options?: QueryOptions
): Promise<Transaction[]> {
  let query = db.transactions.toCollection();

  // Apply filters
  if (filters) {
    // Filter by userId
    if (filters.userId) {
      query = db.transactions.where('userId').equals(filters.userId);
    }

    // Filter by date range
    if (filters.dateFrom && filters.dateTo) {
      query = query.and((tx) => tx.createdTs >= filters.dateFrom! && tx.createdTs <= filters.dateTo!);
    } else if (filters.dateFrom) {
      query = query.and((tx) => tx.createdTs >= filters.dateFrom!);
    } else if (filters.dateTo) {
      query = query.and((tx) => tx.createdTs <= filters.dateTo!);
    }

    // Filter by type
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      query = query.and((tx) => types.includes(tx.type));
    }

    // Filter by category
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      query = query.and((tx) => categories.includes(tx.category));
    }

    // Filter by payment method
    if (filters.method) {
      const methods = Array.isArray(filters.method) ? filters.method : [filters.method];
      query = query.and((tx) => methods.includes(tx.method));
    }

    // Filter by amount range
    if (filters.minAmount !== undefined) {
      query = query.and((tx) => tx.amountPaise >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      query = query.and((tx) => tx.amountPaise <= filters.maxAmount!);
    }

    // Filter by merchant (partial match, case-insensitive)
    if (filters.merchant) {
      const merchantLower = filters.merchant.toLowerCase();
      query = query.and((tx) => tx.merchant.toLowerCase().includes(merchantLower));
    }

    // Filter by account
    if (filters.account) {
      query = query.and((tx) => tx.account === filters.account);
    }

    // Filter by recurring status
    if (filters.isRecurring !== undefined) {
      query = query.and((tx) => tx.isRecurring === filters.isRecurring);
    }

    // Search across multiple fields
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      query = query.and((tx) => {
        const merchantMatch = tx.merchant.toLowerCase().includes(searchLower);
        const noteMatch = tx.note?.toLowerCase().includes(searchLower) || false;
        const rawMatch = tx.rawText?.toLowerCase().includes(searchLower) || false;
        return merchantMatch || noteMatch || rawMatch;
      });
    }
  }

  // Get results
  let results = await query.toArray();

  // Apply sorting (in-memory since Dexie can't sort after filtering)
  if (options?.sortBy) {
    const sortBy = options.sortBy;
    const order = options.sortOrder === 'desc' ? -1 : 1;
    results.sort((a, b) => {
      const aVal = a[sortBy] as any;
      const bVal = b[sortBy] as any;
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return (aVal > bVal ? 1 : -1) * order;
    });
  } else {
    // Default: sort by createdTs descending (newest first)
    results.sort((a, b) => b.createdTs - a.createdTs);
  }

  // Apply pagination
  const start = options?.offset || 0;
  const end = options?.limit ? start + options.limit : undefined;

  return end ? results.slice(start, end) : results.slice(start);
}

/**
 * Get transactions by date range
 * Convenience wrapper for getTransactions with date filters
 * @param fromDate Start date (inclusive)
 * @param toDate End date (inclusive)
 * @param options Optional query options
 * @returns Array of transactions
 */
export async function getTransactionsByDateRange(
  fromDate: Date,
  toDate: Date,
  options?: QueryOptions
): Promise<Transaction[]> {
  return await getTransactions(
    {
      dateFrom: fromDate.getTime(),
      dateTo: toDate.getTime(),
    },
    options
  );
}

/**
 * Get transactions for a specific month
 * @param year Year (e.g., 2024)
 * @param month Month (1-12)
 * @param options Optional query options
 * @returns Array of transactions
 */
export async function getTransactionsByMonth(
  year: number,
  month: number,
  options?: QueryOptions
): Promise<Transaction[]> {
  const fromDate = new Date(year, month - 1, 1);
  const toDate = new Date(year, month, 0, 23, 59, 59, 999);
  return await getTransactionsByDateRange(fromDate, toDate, options);
}

/**
 * Get recent transactions
 * @param limit Number of transactions to return (default: 10)
 * @returns Array of recent transactions
 */
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  return await db.transactions.orderBy('createdTs').reverse().limit(limit).toArray();
}

/**
 * Get transaction statistics
 * @param filters Optional filters
 * @returns Statistics object
 */
export async function getTransactionStats(filters?: TransactionFilters) {
  const transactions = await getTransactions(filters);

  const stats = {
    count: transactions.length,
    totalIncome: 0,
    totalExpense: 0,
    totalTransfer: 0,
    byCategory: {} as Record<TransactionCategory, number>,
    byMethod: {} as Record<PaymentMethod, number>,
    byAccount: {} as Record<string, number>,
  };

  transactions.forEach((tx) => {
    // Sum by type
    if (tx.type === 'income') {
      stats.totalIncome += tx.amountPaise;
    } else if (tx.type === 'expense') {
      stats.totalExpense += tx.amountPaise;
    } else if (tx.type === 'transfer') {
      stats.totalTransfer += tx.amountPaise;
    }

    // Count by category
    stats.byCategory[tx.category] = (stats.byCategory[tx.category] || 0) + tx.amountPaise;

    // Count by method
    stats.byMethod[tx.method] = (stats.byMethod[tx.method] || 0) + tx.amountPaise;

    // Count by account
    if (tx.account) {
      stats.byAccount[tx.account] = (stats.byAccount[tx.account] || 0) + tx.amountPaise;
    }
  });

  return stats;
}

/**
 * Count transactions matching filters
 * @param filters Optional filters
 * @returns Count of transactions
 */
export async function countTransactions(filters?: TransactionFilters): Promise<number> {
  const transactions = await getTransactions(filters);
  return transactions.length;
}

/**
 * Bulk add transactions
 * Useful for importing from CSV or other sources
 * @param transactions Array of transactions to add
 * @returns Array of created transaction IDs
 */
export async function bulkAddTransactions(
  transactions: Array<Omit<Transaction, 'id'> & { id?: string }>
): Promise<string[]> {
  const ids: string[] = [];
  const now = Date.now();

  const newTransactions: Transaction[] = transactions.map((tx) => {
    const id = tx.id || crypto.randomUUID();
    ids.push(id);
    return {
      ...tx,
      id,
      createdTs: tx.createdTs || now,
      postedTs: tx.postedTs || now,
      syncStatus: 'pending',
    };
  });

  await db.transactions.bulkAdd(newTransactions);

  // Update clock for sync
  const clock = await db._clock.get('transactions');
  if (clock) {
    await db._clock.update('transactions', {
      pendingOps: (clock.pendingOps || 0) + newTransactions.length,
    });
  }

  return ids;
}

/**
 * Get transactions that need to be synced
 * @returns Array of transactions with pending sync status
 */
export async function getPendingSyncTransactions(): Promise<Transaction[]> {
  return await db.transactions.where('syncStatus').equals('pending').toArray();
}

/**
 * Mark transactions as synced
 * @param ids Array of transaction IDs to mark as synced
 */
export async function markTransactionsSynced(ids: string[]): Promise<void> {
  const now = Date.now();
  await Promise.all(
    ids.map((id) =>
      db.transactions.update(id, {
        syncStatus: 'synced',
        lastSyncedTs: now,
      })
    )
  );
}
