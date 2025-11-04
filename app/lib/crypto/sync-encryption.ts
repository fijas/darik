/**
 * Sync Encryption Integration
 * Handles encryption/decryption of data during sync operations
 *
 * Only sensitive fields are encrypted, metadata remains in plaintext
 * for indexing and querying on the server.
 */

import { encryptRow, decryptRow } from './encryption';
import { getMasterKey } from './key-storage';
import type { Transaction } from '@/types';

/**
 * Fields to encrypt for each table type
 * Other fields remain in plaintext for server-side indexing
 */
const ENCRYPTED_FIELDS = {
  transactions: ['merchant', 'note', 'rawText'] as (keyof Transaction)[],
  // Add other tables as needed
  securities: [],
  holdings: [],
  assets: [],
  liabilities: [],
  goals: [],
} as const;

/**
 * Check if encryption is enabled
 * Can be toggled via config or feature flag
 */
export function isEncryptionEnabled(): boolean {
  // For now, encryption is always enabled
  // Can be made configurable in the future
  return true;
}

/**
 * Encrypt a row before syncing to server
 *
 * @param tableName Table name
 * @param row Row data
 * @returns Encrypted row (or original if encryption disabled)
 */
export async function encryptForSync<T extends Record<string, unknown>>(
  tableName: keyof typeof ENCRYPTED_FIELDS,
  row: T
): Promise<T> {
  if (!isEncryptionEnabled()) {
    return row;
  }

  try {
    const key = await getMasterKey();
    const fieldsToEncrypt = ENCRYPTED_FIELDS[tableName] as (keyof T)[];

    if (fieldsToEncrypt.length === 0) {
      return row;
    }

    return await encryptRow(row, key, fieldsToEncrypt);
  } catch (error) {
    console.error(`[Encryption] Failed to encrypt ${tableName} row:`, error);
    // Return unencrypted row as fallback (or throw based on policy)
    throw new Error(`Encryption failed: ${error}`);
  }
}

/**
 * Decrypt a row after pulling from server
 *
 * @param tableName Table name
 * @param row Encrypted row data
 * @returns Decrypted row (or original if encryption disabled/not encrypted)
 */
export async function decryptFromSync<T extends Record<string, unknown>>(
  tableName: keyof typeof ENCRYPTED_FIELDS,
  row: T
): Promise<T> {
  if (!isEncryptionEnabled()) {
    return row;
  }

  // Check if row has encrypted data
  const hasEncryptedData = '_encrypted' in row;
  if (!hasEncryptedData) {
    // Row is not encrypted, return as-is
    return row;
  }

  try {
    const key = await getMasterKey();
    return await decryptRow(row, key);
  } catch (error) {
    console.error(`[Encryption] Failed to decrypt ${tableName} row:`, error);
    // Return encrypted row as-is (or throw based on policy)
    throw new Error(`Decryption failed: ${error}`);
  }
}

/**
 * Encrypt multiple rows for batch operations
 *
 * @param tableName Table name
 * @param rows Array of rows
 * @returns Array of encrypted rows
 */
export async function encryptBatch<T extends Record<string, unknown>>(
  tableName: keyof typeof ENCRYPTED_FIELDS,
  rows: T[]
): Promise<T[]> {
  if (!isEncryptionEnabled() || rows.length === 0) {
    return rows;
  }

  // Encrypt rows in parallel for performance
  return await Promise.all(rows.map((row) => encryptForSync(tableName, row)));
}

/**
 * Decrypt multiple rows for batch operations
 *
 * @param tableName Table name
 * @param rows Array of encrypted rows
 * @returns Array of decrypted rows
 */
export async function decryptBatch<T extends Record<string, unknown>>(
  tableName: keyof typeof ENCRYPTED_FIELDS,
  rows: T[]
): Promise<T[]> {
  if (!isEncryptionEnabled() || rows.length === 0) {
    return rows;
  }

  // Decrypt rows in parallel for performance
  return await Promise.all(rows.map((row) => decryptFromSync(tableName, row)));
}

/**
 * Check if a row is encrypted
 *
 * @param row Row data
 * @returns True if row has encrypted fields
 */
export function isRowEncrypted(row: Record<string, unknown>): boolean {
  return '_encrypted' in row;
}

/**
 * Get encryption status for UI display
 *
 * @returns Encryption status information
 */
export async function getEncryptionStatus(): Promise<{
  enabled: boolean;
  hasKey: boolean;
  keyType: 'passkey' | 'password' | 'none';
}> {
  const enabled = isEncryptionEnabled();

  if (!enabled) {
    return { enabled: false, hasKey: false, keyType: 'none' };
  }

  try {
    const key = await getMasterKey();
    const hasKey = key !== null;

    // Try to determine key type from metadata
    // This is simplified - in production you'd check key storage metadata
    const keyType: 'passkey' | 'password' | 'none' = hasKey ? 'passkey' : 'none';

    return { enabled, hasKey, keyType };
  } catch {
    return { enabled, hasKey: false, keyType: 'none' };
  }
}
