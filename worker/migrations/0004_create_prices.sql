-- Migration: Create prices table
-- Historical price data for securities (daily NAV/prices)

CREATE TABLE IF NOT EXISTS prices (
  security_id TEXT NOT NULL,
  date TEXT NOT NULL,
  price_paise INTEGER NOT NULL,
  volume INTEGER,
  source TEXT,
  PRIMARY KEY (security_id, date),
  FOREIGN KEY (security_id) REFERENCES securities(id) ON DELETE CASCADE
);

-- Indices for querying prices
CREATE INDEX IF NOT EXISTS idx_prices_security_id ON prices(security_id);
CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(date);
