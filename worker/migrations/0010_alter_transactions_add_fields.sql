-- Migration: Add missing fields to transactions table
-- Adds type, account, reference, location, attachments, splitWith, and recurring fields

-- Add type field (income/expense/transfer)
ALTER TABLE transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'expense' CHECK(type IN ('income', 'expense', 'transfer'));

-- Add account identifier
ALTER TABLE transactions ADD COLUMN account TEXT;

-- Add bank reference/UPI ID
ALTER TABLE transactions ADD COLUMN reference TEXT;

-- Add location data (stored as JSON)
ALTER TABLE transactions ADD COLUMN location TEXT; -- JSON: {latitude, longitude, name, address}

-- Add attachments (stored as JSON array)
ALTER TABLE transactions ADD COLUMN attachments TEXT; -- JSON array

-- Add split transaction data (stored as JSON)
ALTER TABLE transactions ADD COLUMN split_with TEXT; -- JSON: {shares: [], totalPaise}

-- Add recurring transaction fields
ALTER TABLE transactions ADD COLUMN is_recurring INTEGER NOT NULL DEFAULT 0; -- Boolean: 0 = false, 1 = true
ALTER TABLE transactions ADD COLUMN recurrence_rule TEXT; -- RFC 5545 RRULE format
ALTER TABLE transactions ADD COLUMN recurrence_end_ts INTEGER; -- When recurrence ends
ALTER TABLE transactions ADD COLUMN parent_transaction_id TEXT; -- If instance of recurring transaction

-- Create indices for new fields
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account);
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX IF NOT EXISTS idx_transactions_parent ON transactions(parent_transaction_id);

-- Remove sync_status and last_synced_ts columns (they're client-side only)
-- Note: SQLite doesn't support DROP COLUMN in older versions, so we'll leave them
-- but mark them as deprecated. In a future major version, we can recreate the table.
-- For now, just document that these columns should NOT be used.
