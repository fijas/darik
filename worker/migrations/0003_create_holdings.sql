-- Migration: Create holdings table
-- Current holdings of securities (portfolio positions)

CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY NOT NULL,
  security_id TEXT NOT NULL,
  units TEXT NOT NULL,
  avg_cost_paise INTEGER NOT NULL,
  account TEXT NOT NULL,
  lots TEXT NOT NULL,
  sync_status TEXT,
  last_synced_ts INTEGER,
  FOREIGN KEY (security_id) REFERENCES securities(id) ON DELETE CASCADE
);

-- Indices for queries
CREATE INDEX IF NOT EXISTS idx_holdings_security_id ON holdings(security_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account ON holdings(account);
CREATE INDEX IF NOT EXISTS idx_holdings_security_account ON holdings(security_id, account);
