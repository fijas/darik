/**
 * Key Backup Module
 * Handles encrypted master key backup to server for cross-device access
 */

import { generateKey, wrapKey, unwrapKey, deriveKeyFromPassword } from './encryption';
import { storeKey, retrieveKey } from './key-storage';
import { generateUserId, setUserId, setStoredEmail } from '../auth/user-id';

/**
 * Backup encrypted master key to server
 *
 * @param email User's email address
 * @param password User's password
 * @param workerUrl Worker API base URL
 * @returns User ID
 */
export async function backupKeyToServer(
  email: string,
  password: string,
  workerUrl: string
): Promise<string> {
  // Generate user ID from email
  const userId = await generateUserId(email);

  // Get or generate master key
  let masterKey = await retrieveKey('master');
  if (!masterKey) {
    masterKey = await generateKey();
    await storeKey(masterKey, 'master', 'password');
  }

  // Derive wrapping key from password
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrappingKey = await deriveKeyFromPassword(password, salt);

  // Export master key
  const exportedKey = await crypto.subtle.exportKey('raw', masterKey);

  // Encrypt master key with wrapping key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    exportedKey
  );

  // Prepare encrypted blob (salt + iv + encrypted key)
  const blob = new Uint8Array(salt.length + iv.length + encryptedKey.byteLength);
  blob.set(salt, 0);
  blob.set(iv, salt.length);
  blob.set(new Uint8Array(encryptedKey), salt.length + iv.length);

  // Convert to base64
  const encryptedKeyBase64 = btoa(String.fromCharCode(...blob));

  // Upload to server
  const response = await fetch(`${workerUrl}/api/auth/key-backup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      email,
      encryptedKey: encryptedKeyBase64,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to backup key to server');
  }

  // Store user ID and email locally
  setUserId(userId);
  setStoredEmail(email);

  return userId;
}

/**
 * Restore master key from server
 *
 * @param email User's email address
 * @param password User's password
 * @param workerUrl Worker API base URL
 * @returns User ID
 */
export async function restoreKeyFromServer(
  email: string,
  password: string,
  workerUrl: string
): Promise<string> {
  // Fetch encrypted key from server
  const response = await fetch(
    `${workerUrl}/api/auth/key-backup?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to restore key from server');
  }

  const data = await response.json();
  const { userId, encryptedKey } = data;

  // Decode base64
  const blob = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));

  // Extract salt, IV, and encrypted key
  const salt = blob.slice(0, 16);
  const iv = blob.slice(16, 28);
  const encryptedKeyData = blob.slice(28);

  // Derive wrapping key from password
  const wrappingKey = await deriveKeyFromPassword(password, salt);

  // Decrypt master key
  try {
    const decryptedKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      encryptedKeyData
    );

    // Import as CryptoKey
    const masterKey = await crypto.subtle.importKey(
      'raw',
      decryptedKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Store master key locally
    await storeKey(masterKey, 'master', 'password');

    // Store user ID and email locally
    setUserId(userId);
    setStoredEmail(email);

    return userId;
  } catch (error) {
    throw new Error('Incorrect password or corrupted key backup');
  }
}

/**
 * Check if key backup exists for email
 *
 * @param email User's email address
 * @param workerUrl Worker API base URL
 * @returns True if backup exists
 */
export async function hasKeyBackup(email: string, workerUrl: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${workerUrl}/api/auth/key-backup?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}