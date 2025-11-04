/**
 * Client-Side Encryption Helpers
 * Uses WebCrypto API for AES-GCM 256-bit encryption
 *
 * All data is encrypted client-side before sync to server.
 * Server only stores ciphertext and can never decrypt data.
 */

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  nonce: string; // Base64 encoded IV (12 bytes for GCM)
  version: number; // Encryption version for future migrations
}

/**
 * Generate a new AES-GCM 256-bit encryption key
 * @returns CryptoKey that can be used for encryption/decryption
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // Extractable (needed for export/import)
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to raw format (ArrayBuffer)
 * @param key The CryptoKey to export
 * @returns Raw key as ArrayBuffer
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Import a raw key (ArrayBuffer) to CryptoKey
 * @param rawKey Raw key as ArrayBuffer
 * @returns CryptoKey for encryption/decryption
 */
export async function importKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a cryptographically secure random nonce (IV)
 * @returns 12-byte nonce for AES-GCM
 */
export function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data using AES-GCM
 * @param data Object to encrypt (will be JSON stringified)
 * @param key CryptoKey for encryption
 * @returns Encrypted data with nonce
 */
export async function encryptData(
  data: unknown,
  key: CryptoKey
): Promise<EncryptedData> {
  // Serialize data to JSON
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(jsonString);

  // Generate random nonce
  const nonce = generateNonce();

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce as BufferSource,
    },
    key,
    plaintext
  );

  // Convert to base64 for storage
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    nonce: arrayBufferToBase64(nonce.buffer),
    version: 1,
  };
}

/**
 * Decrypt data using AES-GCM
 * @param encrypted Encrypted data structure
 * @param key CryptoKey for decryption
 * @returns Decrypted and parsed data
 */
export async function decryptData<T = unknown>(
  encrypted: EncryptedData,
  key: CryptoKey
): Promise<T> {
  // Convert base64 to ArrayBuffer
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
  const nonce = base64ToArrayBuffer(encrypted.nonce);

  // Decrypt
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce as BufferSource,
    },
    key,
    ciphertext
  );

  // Parse JSON
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(plaintext);
  return JSON.parse(jsonString) as T;
}

/**
 * Encrypt a database row (transaction, holding, etc.)
 * Only encrypts sensitive fields, preserves metadata for indexing
 *
 * @param row Database row to encrypt
 * @param key Encryption key
 * @param fieldsToEncrypt List of field names to encrypt
 * @returns Row with encrypted fields
 */
export async function encryptRow<T extends Record<string, unknown>>(
  row: T,
  key: CryptoKey,
  fieldsToEncrypt: (keyof T)[]
): Promise<T> {
  const encrypted = { ...row };

  // Collect sensitive fields
  const sensitiveData: Record<string, unknown> = {};
  for (const field of fieldsToEncrypt) {
    if (field in row) {
      sensitiveData[field as string] = row[field];
      delete encrypted[field];
    }
  }

  // Encrypt sensitive fields as single blob
  const encryptedBlob = await encryptData(sensitiveData, key);

  // Store encrypted data in special field
  (encrypted as unknown as Record<string, unknown>)._encrypted = JSON.stringify(encryptedBlob);

  return encrypted;
}

/**
 * Decrypt a database row
 *
 * @param row Encrypted database row
 * @param key Decryption key
 * @returns Decrypted row with all fields restored
 */
export async function decryptRow<T extends Record<string, unknown>>(
  row: T,
  key: CryptoKey
): Promise<T> {
  const decrypted = { ...row };

  // Extract encrypted blob
  const encryptedField = (row as unknown as Record<string, unknown>)._encrypted;
  if (typeof encryptedField !== 'string') {
    // No encryption, return as-is
    return row;
  }

  const encryptedBlob: EncryptedData = JSON.parse(encryptedField);

  // Decrypt sensitive fields
  const sensitiveData = await decryptData<Record<string, unknown>>(
    encryptedBlob,
    key
  );

  // Merge decrypted fields back
  Object.assign(decrypted, sensitiveData);

  // Remove encrypted field
  delete (decrypted as unknown as Record<string, unknown>)._encrypted;

  return decrypted;
}

/**
 * Convert ArrayBuffer or ArrayBufferLike to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive an encryption key from a password using PBKDF2
 * Used as fallback when WebAuthn is not available
 *
 * @param password User password
 * @param salt Salt for key derivation (should be stored)
 * @returns Derived CryptoKey
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000, // OWASP recommendation
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a cryptographically secure random salt
 * @returns 16-byte salt for PBKDF2
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Test encryption/decryption with a sample payload
 * Useful for verifying encryption is working
 */
export async function testEncryption(): Promise<boolean> {
  try {
    const key = await generateKey();
    const testData = { foo: 'bar', number: 123, nested: { value: true } };

    const encrypted = await encryptData(testData, key);
    const decrypted = await decryptData(encrypted, key);

    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
