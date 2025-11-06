-- Migration: Update goals table schema for Phase 7
-- Add status tracking, timestamps, sync metadata, and additional fields

-- Drop old table (SQLite doesn't support ALTER COLUMN well, so recreate)
DROP TABLE IF EXISTS goals_old;
ALTER TABLE goals RENAME TO goals_old;

-- Create new goals table with updated schema
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  target_amount INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  target_date INTEGER NOT NULL,
  start_date INTEGER NOT NULL,
  monthly_sip INTEGER,
  expected_return_rate REAL NOT NULL DEFAULT 12.0,
  priority INTEGER NOT NULL DEFAULT 1,
  strategy TEXT NOT NULL DEFAULT 'sip',
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  icon TEXT,
  color TEXT,
  linked_account_ids TEXT,
  linked_holding_ids TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  clock INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Migrate existing data if any
INSERT INTO goals (
  id, name, category, target_amount, current_value, target_date, start_date,
  monthly_sip, expected_return_rate, priority, strategy, status,
  notes, icon, color, created_at, updated_at, clock, sync_status, last_synced_ts
)
SELECT
  id,
  name,
  NULL as category,
  target_value_paise as target_amount,
  current_corpus_paise as current_value,
  CAST(strftime('%s', target_date) * 1000 AS INTEGER) as target_date,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as start_date,
  required_sip_paise as monthly_sip,
  12.0 as expected_return_rate,
  priority,
  strategy,
  'active' as status,
  description as notes,
  icon,
  color,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as created_at,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as updated_at,
  0 as clock,
  sync_status,
  last_synced_ts
FROM goals_old;

-- Drop old table
DROP TABLE IF EXISTS goals_old;

-- Recreate indices
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_strategy ON goals(strategy);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_deleted_at ON goals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_goals_clock ON goals(clock);
