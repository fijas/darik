-- Migration: Add data column to sync_log
-- Stores the actual record data for sync pull operations

ALTER TABLE sync_log ADD COLUMN data TEXT;
