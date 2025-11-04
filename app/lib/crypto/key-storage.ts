/**
 * Encryption Key Storage
 * Securely stores encryption keys in IndexedDB
 *
 * Keys are stored in a separate database to isolate them from application data.
 * The encryption key never leaves the client.
 */

import Dexie, { type EntityTable } from 'dexie';
import { exportKey, importKey, generateKey } from './encryption';

/**
 * Stored key metadata
 */
export interface StoredKey {
  id: string; // 'master' for the main encryption key
  keyData: ArrayBuffer; // Raw key material
  createdAt: number; // Timestamp
  lastUsedAt: number; // Timestamp
  wrappedBy?: 'passkey' | 'password'; // How the key is protected
  salt?: ArrayBuffer; // Salt for password-derived keys
}

/**
 * Key storage database (separate from main app database)
 */
class KeyDatabase extends Dexie {
  keys!: EntityTable<StoredKey, 'id'>;

  constructor() {
    super('darik-keys');

    this.version(1).stores({
      keys: 'id, createdAt, lastUsedAt',
    });
  }
}

// Singleton instance
const keyDb = new KeyDatabase();

/**
 * Store an encryption key in IndexedDB
 * @param key CryptoKey to store
 * @param id Key identifier (default: 'master')
 * @param wrappedBy How the key is protected
 * @param salt Optional salt for password-derived keys
 */
export async function storeKey(
  key: CryptoKey,
  id: string = 'master',
  wrappedBy?: 'passkey' | 'password',
  salt?: Uint8Array
): Promise<void> {
  const keyData = await exportKey(key);
  const now = Date.now();

  await keyDb.keys.put({
    id,
    keyData,
    createdAt: now,
    lastUsedAt: now,
    wrappedBy,
    salt: salt ? (salt.buffer as ArrayBuffer) : undefined,
  });

  console.log(`[KeyStorage] Key stored: ${id}`);
}

/**
 * Retrieve an encryption key from IndexedDB
 * @param id Key identifier (default: 'master')
 * @returns CryptoKey or null if not found
 */
export async function retrieveKey(id: string = 'master'): Promise<CryptoKey | null> {
  const stored = await keyDb.keys.get(id);

  if (!stored) {
    return null;
  }

  // Update last used timestamp
  await keyDb.keys.update(id, { lastUsedAt: Date.now() });

  // Import key
  return await importKey(stored.keyData);
}

/**
 * Check if a key exists
 * @param id Key identifier (default: 'master')
 * @returns True if key exists
 */
export async function hasKey(id: string = 'master'): Promise<boolean> {
  const count = await keyDb.keys.where('id').equals(id).count();
  return count > 0;
}

/**
 * Delete an encryption key
 * @param id Key identifier (default: 'master')
 */
export async function deleteKey(id: string = 'master'): Promise<void> {
  await keyDb.keys.delete(id);
  console.log(`[KeyStorage] Key deleted: ${id}`);
}

/**
 * Delete all encryption keys
 * WARNING: This will make all encrypted data unrecoverable!
 */
export async function deleteAllKeys(): Promise<void> {
  await keyDb.keys.clear();
  console.warn('[KeyStorage] All keys deleted - encrypted data is now unrecoverable');
}

/**
 * Get key metadata (without exposing the key itself)
 * @param id Key identifier (default: 'master')
 * @returns Key metadata or null
 */
export async function getKeyMetadata(
  id: string = 'master'
): Promise<Omit<StoredKey, 'keyData'> | null> {
  const stored = await keyDb.keys.get(id);

  if (!stored) {
    return null;
  }

  // Return metadata without keyData
  const { keyData, ...metadata } = stored;
  return metadata;
}

/**
 * Initialize key storage for first-time users
 * Generates and stores a new master encryption key
 *
 * @returns The generated key
 */
export async function initializeKeyStorage(): Promise<CryptoKey> {
  // Check if master key already exists
  if (await hasKey('master')) {
    throw new Error('Master key already exists');
  }

  // Generate new key
  const key = await generateKey();

  // Store key
  await storeKey(key, 'master');

  console.log('[KeyStorage] Initialized with new master key');
  return key;
}

/**
 * Get or create the master encryption key
 * Use this as the main entry point for encryption operations
 *
 * @returns The master encryption key
 */
export async function getMasterKey(): Promise<CryptoKey> {
  let key = await retrieveKey('master');

  if (!key) {
    // First-time setup: create new key
    key = await initializeKeyStorage();
  }

  return key;
}

/**
 * Rotate the encryption key
 * This creates a new key and requires re-encryption of all data
 *
 * @returns The new key
 */
export async function rotateKey(): Promise<CryptoKey> {
  // Generate new key
  const newKey = await generateKey();

  // Store as master (overwrites old key)
  await storeKey(newKey, 'master');

  console.warn('[KeyStorage] Key rotated - all data must be re-encrypted');
  return newKey;
}

/**
 * Export key storage database for backup
 * This should be encrypted before storage/transmission!
 */
export async function exportKeyStorage(): Promise<string> {
  const keys = await keyDb.keys.toArray();

  // Convert ArrayBuffers to Base64 for JSON serialization
  const serializable = keys.map((k) => ({
    ...k,
    keyData: arrayBufferToBase64(k.keyData),
    salt: k.salt ? arrayBufferToBase64(k.salt) : undefined,
  }));

  return JSON.stringify({
    version: 1,
    exportedAt: Date.now(),
    keys: serializable,
  });
}

/**
 * Import key storage from backup
 * WARNING: This will overwrite existing keys
 */
export async function importKeyStorage(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);

  await keyDb.transaction('rw', keyDb.keys, async () => {
    await keyDb.keys.clear();

    for (const k of data.keys) {
      await keyDb.keys.add({
        ...k,
        keyData: base64ToArrayBuffer(k.keyData),
        salt: k.salt ? base64ToArrayBuffer(k.salt) : undefined,
      });
    }
  });

  console.log('[KeyStorage] Key storage imported from backup');
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
