-- Migration: Create sync_log table
-- Server-side sync tracking for conflict resolution and delta sync

CREATE TABLE IF NOT EXISTS sync_log (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  clock INTEGER NOT NULL,
  operation TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  device_id TEXT,
  tombstone INTEGER DEFAULT 0
);

-- Indices for sync queries
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_table_name ON sync_log(table_name);
CREATE INDEX IF NOT EXISTS idx_sync_log_record_id ON sync_log(record_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_clock ON sync_log(clock);
CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_sync_log_user_table ON sync_log(user_id, table_name);
CREATE INDEX IF NOT EXISTS idx_sync_log_table_clock ON sync_log(table_name, clock);
