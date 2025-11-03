-- Migration: Create goals table
-- Financial goals with target tracking (retirement, house, education, etc.)

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  target_value_paise INTEGER NOT NULL,
  target_date TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  strategy TEXT NOT NULL,
  current_corpus_paise INTEGER NOT NULL DEFAULT 0,
  assigned_accounts TEXT,
  required_sip_paise INTEGER,
  on_track INTEGER,
  probability_success REAL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sync_status TEXT,
  last_synced_ts INTEGER
);

-- Indices for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_strategy ON goals(strategy);
