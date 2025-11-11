/**
 * Sync Protocol Implementation
 * Core logic for client-server synchronization with conflict resolution
 */

import type {
  PullRequest,
  PullResponse,
  PushRequest,
  PushResponse,
  SyncChange,
  SyncOperation,
} from '../types/sync';

/**
 * Sync service for managing synchronization
 */
export class SyncService {
  constructor(private db: D1Database) {}

  /**
   * Handle pull request - send changes from server to client
   */
  async pull(userId: string, request: PullRequest): Promise<PullResponse> {
    const { tableName, lastServerClock, limit = 500 } = request;

    // Validate table name
    if (!this.isValidTable(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    // Get changes since lastServerClock
    const query = `
      SELECT
        id,
        operation,
        data,
        clock,
        timestamp,
        tombstone
      FROM sync_log
      WHERE user_id = ?
        AND table_name = ?
        AND clock > ?
      ORDER BY clock ASC
      LIMIT ?
    `;

    const result = await this.db
      .prepare(query)
      .bind(userId, tableName, lastServerClock, limit)
      .all<{
        id: string;
        operation: SyncOperation;
        data: string | null;
        clock: number;
        timestamp: number;
        tombstone: number;
      }>();

    const changes: SyncChange[] = (result.results || []).map((row: {
      id: string;
      operation: SyncOperation;
      data: string | null;
      clock: number;
      timestamp: number;
      tombstone: number;
    }) => ({
      id: row.id,
      operation: row.operation,
      data: row.data ? JSON.parse(row.data) : undefined,
      clock: row.clock,
      timestamp: row.timestamp,
      tombstone: Boolean(row.tombstone),
    }));

    // Get current server clock for this table
    const clockResult = await this.db
      .prepare('SELECT MAX(clock) as maxClock FROM sync_log WHERE user_id = ? AND table_name = ?')
      .bind(userId, tableName)
      .first<{ maxClock: number | null }>();

    const currentServerClock = clockResult?.maxClock || 0;
    const hasMore = changes.length === limit;

    return {
      tableName,
      changes,
      currentServerClock,
      hasMore,
    };
  }

  /**
   * Handle push request - accept changes from client
   */
  async push<T = any>(userId: string, request: PushRequest<T>): Promise<PushResponse> {
    const { tableName, changes } = request;

    // Validate table name
    if (!this.isValidTable(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    let accepted = 0;
    let rejected = 0;
    const conflicts: PushResponse['conflicts'] = [];

    // Process each change
    for (const change of changes) {
      try {
        await this.applyChange(userId, tableName, change);
        accepted++;
      } catch (error) {
        rejected++;
        conflicts.push({
          id: change.id,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Get current server clock
    const clockResult = await this.db
      .prepare('SELECT MAX(clock) as maxClock FROM sync_log WHERE user_id = ? AND table_name = ?')
      .bind(userId, tableName)
      .first<{ maxClock: number | null }>();

    const currentServerClock = clockResult?.maxClock || 0;

    return {
      tableName,
      accepted,
      rejected,
      conflicts,
      currentServerClock,
    };
  }

  /**
   * Apply a single change to the database
   */
  private async applyChange<T = any>(
    userId: string,
    tableName: string,
    change: PushRequest<T>['changes'][0]
  ): Promise<void> {
    const { id, operation, data } = change;
    const now = Date.now();

    // Get next clock value
    const nextClock = await this.getNextClock(userId, tableName);

    // Start transaction
    const batch: D1PreparedStatement[] = [];

    // Apply operation to main table
    if (operation === 'insert' || operation === 'update') {
      if (!data) {
        throw new Error('Data required for insert/update operation');
      }

      // For transactions table, we need to handle the full record
      if (tableName === 'transactions') {
        const tx = data as any;
        const upsertQuery = `
          INSERT INTO transactions (
            id, user_id, type, created_ts, posted_ts, amount_paise, currency,
            merchant, category, method, account, note, raw_text, tags,
            reference, location, attachments, split_with, is_recurring,
            recurrence_rule, recurrence_end_ts, parent_transaction_id, source, enc
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            type = excluded.type,
            posted_ts = excluded.posted_ts,
            amount_paise = excluded.amount_paise,
            currency = excluded.currency,
            merchant = excluded.merchant,
            category = excluded.category,
            method = excluded.method,
            account = excluded.account,
            note = excluded.note,
            raw_text = excluded.raw_text,
            tags = excluded.tags,
            reference = excluded.reference,
            location = excluded.location,
            attachments = excluded.attachments,
            split_with = excluded.split_with,
            is_recurring = excluded.is_recurring,
            recurrence_rule = excluded.recurrence_rule,
            recurrence_end_ts = excluded.recurrence_end_ts,
            parent_transaction_id = excluded.parent_transaction_id,
            source = excluded.source,
            enc = excluded.enc
        `;

        batch.push(
          this.db.prepare(upsertQuery).bind(
            id,
            userId,
            tx.type || 'expense',
            tx.createdTs || now,
            tx.postedTs || now,
            tx.amountPaise || 0,
            tx.currency || 'INR',
            tx.merchant || '',
            tx.category || 'other',
            tx.method || 'cash',
            tx.account || null,
            tx.note || null,
            tx.rawText || null,
            tx.tags || null,
            tx.reference || null,
            tx.location ? JSON.stringify(tx.location) : null,
            tx.attachments ? JSON.stringify(tx.attachments) : null,
            tx.splitWith ? JSON.stringify(tx.splitWith) : null,
            tx.isRecurring ? 1 : 0,
            tx.recurrenceRule || null,
            tx.recurrenceEndTs || null,
            tx.parentTransactionId || null,
            tx.source || 'manual',
            tx.enc || null
          )
        );
      }
    } else if (operation === 'delete') {
      // Soft delete with tombstone
      batch.push(
        this.db
          .prepare(`UPDATE ${tableName} SET deleted_at = ? WHERE id = ? AND user_id = ?`)
          .bind(now, id, userId)
      );
    }

    // Record in sync log
    batch.push(
      this.db
        .prepare(
          `INSERT INTO sync_log (
          id, user_id, table_name, record_id, clock, operation, timestamp, tombstone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          crypto.randomUUID(),
          userId,
          tableName,
          id,
          nextClock,
          operation,
          now,
          operation === 'delete' ? 1 : 0
        )
    );

    // Execute batch
    await this.db.batch(batch);
  }

  /**
   * Get next clock value for a user/table
   */
  private async getNextClock(userId: string, tableName: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT MAX(clock) as maxClock FROM sync_log WHERE user_id = ? AND table_name = ?')
      .bind(userId, tableName)
      .first<{ maxClock: number | null }>();

    return (result?.maxClock || 0) + 1;
  }

  /**
   * Validate table name against allowed list
   */
  private isValidTable(tableName: string): boolean {
    const allowedTables = [
      'transactions',
      'securities',
      'holdings',
      'prices',
      'assets',
      'liabilities',
      'goals',
    ];
    return allowedTables.includes(tableName);
  }

  /**
   * Get sync statistics for a user
   */
  async getStats(userId: string, tableName?: string): Promise<any> {
    let query = `
      SELECT
        table_name,
        COUNT(*) as totalOps,
        SUM(CASE WHEN operation = 'insert' THEN 1 ELSE 0 END) as inserts,
        SUM(CASE WHEN operation = 'update' THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN operation = 'delete' THEN 1 ELSE 0 END) as deletes,
        MAX(clock) as maxClock,
        MAX(timestamp) as lastSync
      FROM sync_log
      WHERE user_id = ?
    `;

    const bindings: any[] = [userId];

    if (tableName) {
      query += ' AND table_name = ?';
      bindings.push(tableName);
    }

    query += ' GROUP BY table_name';

    const result = await this.db.prepare(query).bind(...bindings).all();
    return result.results || [];
  }
}
