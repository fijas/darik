-- Migration: Update assets table schema for Phase 7
-- Add timestamps, sync metadata, and consistent field naming

-- Drop old table and recreate with new schema
DROP TABLE IF EXISTS assets_old;
ALTER TABLE assets RENAME TO assets_old;

-- Create new assets table with updated schema
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  current_value INTEGER NOT NULL,
  reprice_rule TEXT NOT NULL DEFAULT 'manual',
  linked_security_id TEXT,
  account TEXT,
  maturity_date INTEGER,
  interest_rate REAL,
  notes TEXT,
  last_repriced INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  clock INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT,
  last_synced_ts INTEGER,
  FOREIGN KEY (linked_security_id) REFERENCES securities(id) ON DELETE SET NULL
);

-- Migrate existing data if any
INSERT INTO assets (
  id, type, name, category, current_value, reprice_rule, linked_security_id,
  account, maturity_date, interest_rate, notes, created_at, updated_at,
  clock, sync_status, last_synced_ts
)
SELECT
  id,
  type,
  name,
  NULL as category,
  value_paise as current_value,
  reprice_rule,
  linked_security_id,
  account,
  CASE
    WHEN maturity_date IS NOT NULL
    THEN CAST(strftime('%s', maturity_date) * 1000 AS INTEGER)
    ELSE NULL
  END as maturity_date,
  CASE
    WHEN interest_rate_bps IS NOT NULL
    THEN CAST(interest_rate_bps AS REAL) / 100.0
    ELSE NULL
  END as interest_rate,
  notes,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as created_at,
  CAST(strftime('%s', 'now') * 1000 AS INTEGER) as updated_at,
  0 as clock,
  sync_status,
  last_synced_ts
FROM assets_old;

-- Drop old table
DROP TABLE IF EXISTS assets_old;

-- Recreate indices
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name);
CREATE INDEX IF NOT EXISTS idx_assets_maturity_date ON assets(maturity_date);
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON assets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_assets_clock ON assets(clock);
