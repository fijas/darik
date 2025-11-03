-- Migration: Create users and devices tables
-- User profiles and device registration for sync

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL,
  default_currency TEXT NOT NULL DEFAULT 'INR',
  base_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT DEFAULT 'auto',
  language TEXT DEFAULT 'en',
  encryption_enabled INTEGER NOT NULL DEFAULT 0,
  key_wrapped BLOB
);

CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  last_seen_at INTEGER NOT NULL,
  user_agent TEXT NOT NULL,
  public_key TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen_at ON devices(last_seen_at);
