/**
 * User ID Management
 * Generates user ID from email for consistent cross-device identification
 */

/**
 * Generate a deterministic user ID from email address
 * Uses SHA-256 hash to create a consistent UUID across devices
 *
 * @param email User's email address
 * @returns UUID-format string derived from email hash
 */
export async function generateUserId(email: string): Promise<string> {
  // Normalize email (lowercase, trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Hash email using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedEmail);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Format as UUID v5 (deterministic)
  // UUID format: xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx
  const uuid = [
    hashHex.substring(0, 8),
    hashHex.substring(8, 12),
    '5' + hashHex.substring(13, 16), // Version 5
    ((parseInt(hashHex.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hashHex.substring(18, 20), // Variant
    hashHex.substring(20, 32),
  ].join('-');

  return uuid;
}

/**
 * Set user ID in localStorage
 *
 * @param userId User ID to store
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('darik-user-id', userId);
  }
}

/**
 * Get the stored user ID
 *
 * @returns Stored user ID or fallback for SSR
 */
export function getUserId(): string {
  // Server-side rendering fallback
  if (typeof window === 'undefined') {
    return 'local-user-00000000-0000-0000-0000-000000000000';
  }

  const stored = localStorage.getItem('darik-user-id');
  if (stored) {
    return stored;
  }

  // No user ID stored - user needs to authenticate
  return '';
}

/**
 * Clear the stored user ID (for logout/reset)
 */
export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('darik-user-id');
  }
}

/**
 * Get stored email address
 */
export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('darik-user-email');
}

/**
 * Set email address in localStorage
 */
export function setStoredEmail(email: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('darik-user-email', email.toLowerCase().trim());
  }
}

/**
 * Clear stored email
 */
export function clearStoredEmail(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('darik-user-email');
  }
}