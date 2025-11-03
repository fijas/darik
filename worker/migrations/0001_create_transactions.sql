-- Migration: Create transactions table
-- Core table for all financial transactions (income/expenses)

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  created_ts INTEGER NOT NULL,
  posted_ts INTEGER NOT NULL,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  method TEXT NOT NULL,
  note TEXT,
  raw_text TEXT,
  tags TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  enc BLOB,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Indices for efficient queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_ts ON transactions(created_ts);
CREATE INDEX IF NOT EXISTS idx_transactions_posted_ts ON transactions(posted_ts);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_method ON transactions(method);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_ts);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);
