/**
 * D1 SQL Query Helpers
 * Reusable prepared statements for common database operations
 */

/**
 * Transaction queries
 */
export const transactionQueries = {
  /**
   * Get transactions for a user with optional filters
   */
  getByUserId(db: D1Database, userId: string, limit = 100): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM transactions
         WHERE user_id = ?
         ORDER BY posted_ts DESC
         LIMIT ?`
      )
      .bind(userId, limit);
  },

  /**
   * Get transactions by date range
   */
  getByDateRange(
    db: D1Database,
    userId: string,
    startTs: number,
    endTs: number
  ): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM transactions
         WHERE user_id = ?
         AND posted_ts BETWEEN ? AND ?
         ORDER BY posted_ts DESC`
      )
      .bind(userId, startTs, endTs);
  },

  /**
   * Get transactions by category
   */
  getByCategory(
    db: D1Database,
    userId: string,
    category: string,
    limit = 50
  ): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM transactions
         WHERE user_id = ?
         AND category = ?
         ORDER BY posted_ts DESC
         LIMIT ?`
      )
      .bind(userId, category, limit);
  },

  /**
   * Insert a new transaction
   */
  insert(db: D1Database, transaction: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO transactions (
          id, user_id, created_ts, posted_ts, amount_paise, currency,
          merchant, category, method, note, raw_text, tags, source, enc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        transaction.id,
        transaction.user_id,
        transaction.created_ts,
        transaction.posted_ts,
        transaction.amount_paise,
        transaction.currency,
        transaction.merchant,
        transaction.category,
        transaction.method,
        transaction.note,
        transaction.raw_text,
        transaction.tags,
        transaction.source,
        transaction.enc
      );
  },

  /**
   * Update a transaction
   */
  update(db: D1Database, id: string, updates: Record<string, any>): D1PreparedStatement {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updates);

    return db.prepare(`UPDATE transactions SET ${fields} WHERE id = ?`).bind(...values, id);
  },

  /**
   * Delete a transaction
   */
  delete(db: D1Database, id: string): D1PreparedStatement {
    return db.prepare(`DELETE FROM transactions WHERE id = ?`).bind(id);
  },
};

/**
 * Security queries
 */
export const securityQueries = {
  /**
   * Get security by ID
   */
  getById(db: D1Database, id: string): D1PreparedStatement {
    return db.prepare(`SELECT * FROM securities WHERE id = ?`).bind(id);
  },

  /**
   * Get security by symbol
   */
  getBySymbol(db: D1Database, symbol: string): D1PreparedStatement {
    return db.prepare(`SELECT * FROM securities WHERE symbol = ?`).bind(symbol);
  },

  /**
   * Search securities by name
   */
  search(db: D1Database, query: string, limit = 20): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM securities
         WHERE name LIKE ? OR symbol LIKE ?
         LIMIT ?`
      )
      .bind(`%${query}%`, `%${query}%`, limit);
  },

  /**
   * Insert a security
   */
  insert(db: D1Database, security: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO securities (
          id, symbol, name, type, price_source, decimals, isin, category, amc, risk_level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        security.id,
        security.symbol,
        security.name,
        security.type,
        security.price_source,
        security.decimals,
        security.isin,
        security.category,
        security.amc,
        security.risk_level
      );
  },
};

/**
 * Price queries
 */
export const priceQueries = {
  /**
   * Get latest price for a security
   */
  getLatest(db: D1Database, securityId: string): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM prices
         WHERE security_id = ?
         ORDER BY date DESC
         LIMIT 1`
      )
      .bind(securityId);
  },

  /**
   * Get price for a specific date
   */
  getByDate(db: D1Database, securityId: string, date: string): D1PreparedStatement {
    return db
      .prepare(`SELECT * FROM prices WHERE security_id = ? AND date = ?`)
      .bind(securityId, date);
  },

  /**
   * Get price history for a security
   */
  getHistory(db: D1Database, securityId: string, limit = 365): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM prices
         WHERE security_id = ?
         ORDER BY date DESC
         LIMIT ?`
      )
      .bind(securityId, limit);
  },

  /**
   * Insert or update a price (upsert)
   */
  upsert(db: D1Database, price: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO prices (security_id, date, price_paise, volume, source)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(security_id, date) DO UPDATE SET
         price_paise = excluded.price_paise,
         volume = excluded.volume,
         source = excluded.source`
      )
      .bind(price.security_id, price.date, price.price_paise, price.volume, price.source);
  },

  /**
   * Bulk insert prices (for AMFI fetch)
   */
  bulkInsert(db: D1Database, prices: Array<Record<string, any>>): D1PreparedStatement[] {
    return prices.map((price) => this.upsert(db, price));
  },
};

/**
 * Holding queries
 */
export const holdingQueries = {
  /**
   * Get all holdings for a user
   */
  getAll(db: D1Database): D1PreparedStatement {
    return db.prepare(`SELECT * FROM holdings`);
  },

  /**
   * Get holdings by security
   */
  getBySecurity(db: D1Database, securityId: string): D1PreparedStatement {
    return db.prepare(`SELECT * FROM holdings WHERE security_id = ?`).bind(securityId);
  },

  /**
   * Insert a holding
   */
  insert(db: D1Database, holding: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO holdings (id, security_id, units, avg_cost_paise, account, lots)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        holding.id,
        holding.security_id,
        holding.units,
        holding.avg_cost_paise,
        holding.account,
        holding.lots
      );
  },
};

/**
 * Sync log queries
 */
export const syncLogQueries = {
  /**
   * Get sync log entries since a clock value
   */
  getSince(
    db: D1Database,
    userId: string,
    tableName: string,
    sinceClock: number,
    limit = 500
  ): D1PreparedStatement {
    return db
      .prepare(
        `SELECT * FROM sync_log
         WHERE user_id = ?
         AND table_name = ?
         AND clock > ?
         ORDER BY clock ASC
         LIMIT ?`
      )
      .bind(userId, tableName, sinceClock, limit);
  },

  /**
   * Get current max clock for a table
   */
  getMaxClock(db: D1Database, userId: string, tableName: string): D1PreparedStatement {
    return db
      .prepare(
        `SELECT MAX(clock) as max_clock
         FROM sync_log
         WHERE user_id = ?
         AND table_name = ?`
      )
      .bind(userId, tableName);
  },

  /**
   * Insert sync log entry
   */
  insert(db: D1Database, entry: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO sync_log (
          id, user_id, table_name, record_id, clock, operation, timestamp, device_id, tombstone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        entry.id,
        entry.user_id,
        entry.table_name,
        entry.record_id,
        entry.clock,
        entry.operation,
        entry.timestamp,
        entry.device_id,
        entry.tombstone ? 1 : 0
      );
  },
};

/**
 * User queries
 */
export const userQueries = {
  /**
   * Get user by ID
   */
  getById(db: D1Database, id: string): D1PreparedStatement {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id);
  },

  /**
   * Get user by email
   */
  getByEmail(db: D1Database, email: string): D1PreparedStatement {
    return db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email);
  },

  /**
   * Insert a user
   */
  insert(db: D1Database, user: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO users (
          id, email, display_name, created_at, last_login_at,
          default_currency, base_currency, theme, language, encryption_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.email,
        user.display_name,
        user.created_at,
        user.last_login_at,
        user.default_currency,
        user.base_currency,
        user.theme,
        user.language,
        user.encryption_enabled ? 1 : 0
      );
  },

  /**
   * Update last login timestamp
   */
  updateLastLogin(db: D1Database, id: string, timestamp: number): D1PreparedStatement {
    return db.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).bind(timestamp, id);
  },
};

/**
 * Asset queries
 */
export const assetQueries = {
  getAll(db: D1Database): D1PreparedStatement {
    return db.prepare(`SELECT * FROM assets ORDER BY value_paise DESC`);
  },

  insert(db: D1Database, asset: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO assets (
          id, type, name, value_paise, reprice_rule, linked_security_id,
          account, maturity_date, interest_rate_bps, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        asset.id,
        asset.type,
        asset.name,
        asset.value_paise,
        asset.reprice_rule,
        asset.linked_security_id,
        asset.account,
        asset.maturity_date,
        asset.interest_rate_bps,
        asset.notes
      );
  },
};

/**
 * Liability queries
 */
export const liabilityQueries = {
  getAll(db: D1Database): D1PreparedStatement {
    return db.prepare(`SELECT * FROM liabilities ORDER BY outstanding_paise DESC`);
  },

  insert(db: D1Database, liability: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO liabilities (
          id, type, name, outstanding_paise, rate_bps, emi_paise,
          next_due_date, account, start_date, maturity_date, lender, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        liability.id,
        liability.type,
        liability.name,
        liability.outstanding_paise,
        liability.rate_bps,
        liability.emi_paise,
        liability.next_due_date,
        liability.account,
        liability.start_date,
        liability.maturity_date,
        liability.lender,
        liability.notes
      );
  },
};

/**
 * Goal queries
 */
export const goalQueries = {
  getAll(db: D1Database): D1PreparedStatement {
    return db.prepare(`SELECT * FROM goals ORDER BY priority DESC, target_date ASC`);
  },

  insert(db: D1Database, goal: Record<string, any>): D1PreparedStatement {
    return db
      .prepare(
        `INSERT INTO goals (
          id, name, target_value_paise, target_date, priority, strategy,
          current_corpus_paise, assigned_accounts, description, icon, color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        goal.id,
        goal.name,
        goal.target_value_paise,
        goal.target_date,
        goal.priority,
        goal.strategy,
        goal.current_corpus_paise,
        goal.assigned_accounts,
        goal.description,
        goal.icon,
        goal.color
      );
  },
};
