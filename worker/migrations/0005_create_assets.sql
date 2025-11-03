-- Migration: Create assets table
-- Non-market assets (bank accounts, FDs, property, cash, etc.)

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  value_paise INTEGER NOT NULL,
  reprice_rule TEXT NOT NULL,
  linked_security_id TEXT,
  account TEXT,
  maturity_date TEXT,
  interest_rate_bps INTEGER,
  notes TEXT,
  sync_status TEXT,
  last_synced_ts INTEGER,
  FOREIGN KEY (linked_security_id) REFERENCES securities(id) ON DELETE SET NULL
);

-- Indices for filtering
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_name ON assets(name);
CREATE INDEX IF NOT EXISTS idx_assets_maturity_date ON assets(maturity_date);
