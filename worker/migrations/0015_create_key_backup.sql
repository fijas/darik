-- Migration: Create key_backup table for encrypted master key storage
-- Stores encrypted master keys for cross-device synchronization

CREATE TABLE IF NOT EXISTS key_backup (
  user_id TEXT PRIMARY KEY NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  email TEXT NOT NULL,
  UNIQUE(email)
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_key_backup_email ON key_backup(email);