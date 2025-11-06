-- Migration: Update liabilities table schema for Phase 7
-- Add timestamps, sync metadata, and consistent field naming

-- Drop old table and recreate with new schema
DROP TABLE IF EXISTS liabilities_old;
ALTER TABLE liabilities RENAME TO liabilities_old;

-- Create new liabilities table with updated schema
CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  current_balance INTEGER NOT NULL,
  interest_rate REAL NOT NULL,
  emi_amount INTEGER,
  next_emi_date INTEGER,
  account TEXT,
  start_date INTEGER,
  maturity_date INTEGER,
  lender TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  clock INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Migrate existing data if any
INSERT INTO liabilities (
  id, type, name, category, current_balance, interest_rate, emi_amount,
  next_emi_date, account, start_date, maturity_date, lender, notes,
  created_at, updated_at, clock, sync_status, last_synced_ts
)
SELECT
  id,
  type,
  name,
  NULL as category,
  outstanding_paise as current_balance,
  CAST(rate_bps AS REAL) / 100.0 as interest_rate,
  emi_paise as emi_amount,
  CASE
    WHEN next_due_date IS NOT NULL
    THEN CAST(strftime('%s', next_due_date) * 1000 AS INTEGER)
    ELSE NULL
  END as next_emi_date,
  account,
  CASE
    WHEN start_date IS NOT NULL
    THEN CAST(strftime('%s', start_date) * 1000 AS INTEGER)
    ELSE NULL
  END as start_date,
  CASE
    WHEN maturity_date IS NOT NULL
    THEN CAST(strftime('%s', maturity_date) * 1000 AS INTEGER)
    ELSE NULL
  END as maturity_date,
  lender,
  notes,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as created_at,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as updated_at,
  0 as clock,
  sync_status,
  last_synced_ts
FROM liabilities_old;

-- Drop old table
DROP TABLE IF EXISTS liabilities_old;

-- Recreate indices
CREATE INDEX IF NOT EXISTS idx_liabilities_type ON liabilities(type);
CREATE INDEX IF NOT EXISTS idx_liabilities_next_emi_date ON liabilities(next_emi_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_maturity_date ON liabilities(maturity_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_deleted_at ON liabilities(deleted_at);
CREATE INDEX IF NOT EXISTS idx_liabilities_clock ON liabilities(clock);
