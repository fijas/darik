-- Migration: Create liabilities table
-- Loans and debts (home loans, car loans, credit cards, etc.)

CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  outstanding_paise INTEGER NOT NULL,
  rate_bps INTEGER NOT NULL,
  emi_paise INTEGER,
  next_due_date TEXT,
  account TEXT,
  start_date TEXT,
  maturity_date TEXT,
  lender TEXT,
  notes TEXT,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Indices for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_liabilities_type ON liabilities(type);
CREATE INDEX IF NOT EXISTS idx_liabilities_next_due_date ON liabilities(next_due_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_maturity_date ON liabilities(maturity_date);
