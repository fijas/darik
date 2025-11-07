/**
 * Encryption Tests
 * Tests for AES-GCM encryption, key management, and password derivation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateKey,
  exportKey,
  importKey,
  generateNonce,
  encryptData,
  decryptData,
  encryptRow,
  decryptRow,
  deriveKeyFromPassword,
  generateSalt,
  testEncryption,
  type EncryptedData,
} from '../encryption';

describe('Encryption', () => {
  describe('Key Generation', () => {
    it('should generate a valid AES-GCM key', async () => {
      const key = await generateKey();

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    it('should generate different keys each time', async () => {
      const key1 = await generateKey();
      const key2 = await generateKey();

      const raw1 = await exportKey(key1);
      const raw2 = await exportKey(key2);

      expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
    });

    it('should generate 256-bit keys', async () => {
      const key = await generateKey();
      const rawKey = await exportKey(key);

      expect(rawKey.byteLength).toBe(32); // 256 bits = 32 bytes
    });
  });

  describe('Key Export/Import', () => {
    it('should export and import keys correctly', async () => {
      const originalKey = await generateKey();
      const rawKey = await exportKey(originalKey);
      const importedKey = await importKey(rawKey);

      expect(importedKey.type).toBe('secret');
      expect(importedKey.algorithm.name).toBe('AES-GCM');
    });

    it('should maintain key functionality after export/import', async () => {
      const originalKey = await generateKey();
      const testData = { test: 'data' };

      const encrypted = await encryptData(testData, originalKey);

      // Export and re-import key
      const rawKey = await exportKey(originalKey);
      const reimportedKey = await importKey(rawKey);

      // Should be able to decrypt with re-imported key
      const decrypted = await decryptData(encrypted, reimportedKey);

      expect(decrypted).toEqual(testData);
    });
  });

  describe('Nonce Generation', () => {
    it('should generate 12-byte nonce for GCM', () => {
      const nonce = generateNonce();

      expect(nonce).toBeInstanceOf(Uint8Array);
      expect(nonce.length).toBe(12);
    });

    it('should generate different nonces each time', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).not.toEqual(nonce2);
    });

    it('should generate cryptographically random nonces', () => {
      const nonces = Array.from({ length: 100 }, () => generateNonce());

      // Check that nonces are unique (probability of collision is astronomically low)
      const uniqueNonces = new Set(nonces.map(n => n.join(',')));
      expect(uniqueNonces.size).toBe(100);
    });
  });

  describe('Data Encryption/Decryption', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      key = await generateKey();
    });

    it('should encrypt and decrypt simple objects', async () => {
      const data = { foo: 'bar', number: 42 };

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt nested objects', async () => {
      const data = {
        user: {
          name: 'John',
          profile: {
            age: 30,
            preferences: ['dark-mode', 'notifications'],
          },
        },
      };

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt arrays', async () => {
      const data = [1, 2, 3, 4, 5];

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should return encrypted data with correct structure', async () => {
      const data = { test: 'value' };

      const encrypted = await encryptData(data, key);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('nonce');
      expect(encrypted).toHaveProperty('version');
      expect(typeof encrypted.ciphertext).toBe('string');
      expect(typeof encrypted.nonce).toBe('string');
      expect(encrypted.version).toBe(1);
    });

    it('should produce different ciphertext for same data (due to random nonce)', async () => {
      const data = { foo: 'bar' };

      const encrypted1 = await encryptData(data, key);
      const encrypted2 = await encryptData(data, key);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
    });

    it('should fail to decrypt with wrong key', async () => {
      const data = { secret: 'data' };
      const wrongKey = await generateKey();

      const encrypted = await encryptData(data, key);

      await expect(decryptData(encrypted, wrongKey)).rejects.toThrow();
    });

    it('should handle empty objects', async () => {
      const data = {};

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should handle strings', async () => {
      const data = 'This is a test string';

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should handle numbers', async () => {
      const data = 12345.67;

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should handle booleans', async () => {
      const data = true;

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(data);
    });

    it('should handle null', async () => {
      const data = null;

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(data);
    });
  });

  describe('Row Encryption/Decryption', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      key = await generateKey();
    });

    it('should encrypt and decrypt database rows', async () => {
      const row = {
        id: '123',
        amount: 50000,
        merchant: 'Test Store',
        notes: 'Sensitive note',
        timestamp: Date.now(),
      };

      const encrypted = await encryptRow(row, key, ['merchant', 'notes']);
      const decrypted = await decryptRow(encrypted, key);

      expect(decrypted).toEqual(row);
    });

    it('should preserve non-encrypted fields in plaintext', async () => {
      const row = {
        id: '123',
        amount: 50000,
        merchant: 'Test Store',
      };

      const encrypted = await encryptRow(row, key, ['merchant']);

      expect(encrypted.id).toBe('123');
      expect(encrypted.amount).toBe(50000);
      expect(encrypted.merchant).toBeUndefined();
      expect((encrypted as Record<string, unknown>)._encrypted).toBeDefined();
    });

    it('should handle rows with no encrypted fields', async () => {
      const row = {
        id: '123',
        amount: 50000,
      };

      const encrypted = await encryptRow(row, key, []);
      const decrypted = await decryptRow(encrypted, key);

      expect(decrypted).toEqual(row);
    });

    it('should handle rows without _encrypted field', async () => {
      const row = {
        id: '123',
        amount: 50000,
      };

      const decrypted = await decryptRow(row, key);

      expect(decrypted).toEqual(row);
    });
  });

  describe('Password-Based Key Derivation', () => {
    it('should derive key from password', async () => {
      const password = 'secure-password-123';
      const salt = generateSalt();

      const key = await deriveKeyFromPassword(password, salt);

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe('secret');
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    it('should generate 16-byte salt', () => {
      const salt = generateSalt();

      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(16);
    });

    it('should derive same key from same password and salt', async () => {
      const password = 'my-password';
      const salt = generateSalt();

      const key1 = await deriveKeyFromPassword(password, salt);
      const key2 = await deriveKeyFromPassword(password, salt);

      const raw1 = await exportKey(key1);
      const raw2 = await exportKey(key2);

      expect(new Uint8Array(raw1)).toEqual(new Uint8Array(raw2));
    });

    it('should derive different keys for different passwords', async () => {
      const salt = generateSalt();

      const key1 = await deriveKeyFromPassword('password1', salt);
      const key2 = await deriveKeyFromPassword('password2', salt);

      const raw1 = await exportKey(key1);
      const raw2 = await exportKey(key2);

      expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
    });

    it('should derive different keys for different salts', async () => {
      const password = 'same-password';

      const key1 = await deriveKeyFromPassword(password, generateSalt());
      const key2 = await deriveKeyFromPassword(password, generateSalt());

      const raw1 = await exportKey(key1);
      const raw2 = await exportKey(key2);

      expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
    });

    it('should use derived key for encryption/decryption', async () => {
      const password = 'test-password';
      const salt = generateSalt();
      const key = await deriveKeyFromPassword(password, salt);

      const data = { sensitive: 'information' };
      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });
  });

  describe('Encryption Test Function', () => {
    it('should return true for working encryption', async () => {
      const result = await testEncryption();

      expect(result).toBe(true);
    });
  });

  describe('Security Properties', () => {
    let key: CryptoKey;

    beforeAll(async () => {
      key = await generateKey();
    });

    it('should not leak plaintext in ciphertext', async () => {
      const data = { secret: 'my-secret-value-12345' };

      const encrypted = await encryptData(data, key);

      // Ciphertext should not contain plaintext
      expect(encrypted.ciphertext).not.toContain('secret');
      expect(encrypted.ciphertext).not.toContain('my-secret-value');
    });

    it('should handle large data', async () => {
      const largeData = {
        array: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `value-${i}`,
        })),
      };

      const encrypted = await encryptData(largeData, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(largeData);
    });

    it('should handle special characters', async () => {
      const data = {
        text: 'Special chars: ₹ € £ $ 中文 日本語 한국어 🎉',
      };

      const encrypted = await encryptData(data, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toEqual(data);
    });
  });
});
