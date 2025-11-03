-- Migration: Create securities table
-- Tradeable financial instruments (mutual funds, stocks, ETFs, bonds, etc.)

CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price_source TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 2,
  isin TEXT,
  category TEXT,
  amc TEXT,
  risk_level TEXT,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Indices for search and filtering
CREATE INDEX IF NOT EXISTS idx_securities_symbol ON securities(symbol);
CREATE INDEX IF NOT EXISTS idx_securities_type ON securities(type);
CREATE INDEX IF NOT EXISTS idx_securities_name ON securities(name);
CREATE INDEX IF NOT EXISTS idx_securities_price_source ON securities(price_source);
CREATE INDEX IF NOT EXISTS idx_securities_isin ON securities(isin);
