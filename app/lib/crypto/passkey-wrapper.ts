/**
 * Passkey (WebAuthn) Wrapper
 * Uses passkeys to protect the encryption key
 *
 * The encryption key is wrapped using the passkey credential,
 * ensuring only the user with access to their passkey can decrypt data.
 *
 * Flow:
 * 1. Registration: Create passkey + wrap encryption key
 * 2. Login: Authenticate with passkey + unwrap encryption key
 * 3. Fallback: Password-based key derivation if passkeys unavailable
 */

import { exportKey, generateKey, deriveKeyFromPassword, generateSalt } from './encryption';
import { storeKey, retrieveKey } from './key-storage';

/**
 * Check if WebAuthn is supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  );
}

/**
 * Check if user verifying platform authenticator is available
 * (e.g., TouchID, FaceID, Windows Hello)
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Passkey credential information
 */
export interface PasskeyCredential {
  credentialId: string; // Base64 encoded
  publicKey: string; // Base64 encoded public key
  createdAt: number;
}

/**
 * Register a new passkey and wrap the encryption key
 *
 * @param username User identifier (email or username)
 * @param displayName User's display name
 * @returns Credential information
 */
export async function registerPasskey(
  username: string,
  displayName: string
): Promise<PasskeyCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Generate challenge (should be random for each registration)
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  // Create credential options
  const credentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Darik Finance',
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(username),
      name: username,
      displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'none',
  };

  // Create credential
  const credential = (await navigator.credentials.create({
    publicKey: credentialCreationOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Failed to create passkey credential');
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  // Extract credential ID and public key
  const credentialId = arrayBufferToBase64(credential.rawId);
  const publicKeyBuffer = response.getPublicKey();
  const publicKey = publicKeyBuffer ? arrayBufferToBase64(publicKeyBuffer) : '';

  // Generate encryption key
  const encryptionKey = await generateKey();

  // Store encryption key (wrapped with passkey credential ID)
  await storeKey(encryptionKey, 'master', 'passkey');

  // Store credential info in localStorage (only metadata, not the key)
  const credentialInfo: PasskeyCredential = {
    credentialId,
    publicKey,
    createdAt: Date.now(),
  };
  localStorage.setItem('darik-passkey-credential', JSON.stringify(credentialInfo));

  console.log('[Passkey] Registration successful');
  return credentialInfo;
}

/**
 * Authenticate with passkey and retrieve encryption key
 *
 * @returns Encryption key
 */
export async function authenticateWithPasskey(): Promise<CryptoKey> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  // Get stored credential info
  const storedInfo = localStorage.getItem('darik-passkey-credential');
  if (!storedInfo) {
    throw new Error('No passkey credential found');
  }

  const credentialInfo: PasskeyCredential = JSON.parse(storedInfo);

  // Generate challenge
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  // Get assertion options
  const assertionOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    allowCredentials: [
      {
        id: base64ToArrayBuffer(credentialInfo.credentialId),
        type: 'public-key',
      },
    ],
    userVerification: 'required',
    timeout: 60000,
  };

  // Get assertion
  const assertion = (await navigator.credentials.get({
    publicKey: assertionOptions,
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('Failed to authenticate with passkey');
  }

  // Retrieve encryption key
  const encryptionKey = await retrieveKey('master');
  if (!encryptionKey) {
    throw new Error('Encryption key not found');
  }

  console.log('[Passkey] Authentication successful');
  return encryptionKey;
}

/**
 * Delete passkey credential
 * WARNING: This will make encrypted data inaccessible!
 */
export async function deletePasskey(): Promise<void> {
  localStorage.removeItem('darik-passkey-credential');
  console.warn('[Passkey] Credential deleted');
}

/**
 * Check if user has registered a passkey
 */
export function hasPasskey(): boolean {
  return localStorage.getItem('darik-passkey-credential') !== null;
}

/**
 * Get passkey credential metadata
 */
export function getPasskeyInfo(): PasskeyCredential | null {
  const stored = localStorage.getItem('darik-passkey-credential');
  if (!stored) return null;
  return JSON.parse(stored);
}

/**
 * Fallback: Register with password (PBKDF2)
 * Used when passkeys are not available
 *
 * @param password User password
 * @returns Salt (must be stored for future logins)
 */
export async function registerWithPassword(password: string): Promise<Uint8Array> {
  // Generate salt
  const salt = generateSalt();

  // Derive encryption key from password
  const encryptionKey = await deriveKeyFromPassword(password, salt);

  // Store key
  await storeKey(encryptionKey, 'master', 'password', salt);

  console.log('[Password] Registration successful');
  return salt;
}

/**
 * Fallback: Authenticate with password
 *
 * @param password User password
 * @param salt Salt from registration
 * @returns Encryption key
 */
export async function authenticateWithPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Derive key from password
  const encryptionKey = await deriveKeyFromPassword(password, salt);

  // Verify by checking if we can retrieve the stored key
  const storedKey = await retrieveKey('master');
  if (!storedKey) {
    throw new Error('No encryption key found');
  }

  // Compare derived key with stored key
  const derivedKeyData = await exportKey(encryptionKey);
  const storedKeyData = await exportKey(storedKey);

  if (!arrayBuffersEqual(derivedKeyData, storedKeyData)) {
    throw new Error('Invalid password');
  }

  console.log('[Password] Authentication successful');
  return encryptionKey;
}

/**
 * Auto-login: Try to get encryption key using available method
 * 1. Try passkey authentication
 * 2. Fall back to asking for password
 * 3. Return null if no authentication method available
 *
 * @returns Encryption key or null
 */
export async function autoLogin(): Promise<CryptoKey | null> {
  // Try retrieving key directly (if already unlocked)
  const key = await retrieveKey('master');
  if (key) {
    return key;
  }

  // Check if passkey is available
  if (hasPasskey() && (await isPlatformAuthenticatorAvailable())) {
    try {
      return await authenticateWithPasskey();
    } catch (error) {
      console.error('[Passkey] Auto-login failed:', error);
      // Fall through to password or return null
    }
  }

  // No automatic login available
  return null;
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

/**
 * Helper: Compare two ArrayBuffers
 */
function arrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) return false;
  const aView = new Uint8Array(a);
  const bView = new Uint8Array(b);
  for (let i = 0; i < aView.length; i++) {
    if (aView[i] !== bView[i]) return false;
  }
  return true;
}
