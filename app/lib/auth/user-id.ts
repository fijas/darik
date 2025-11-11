/**
 * User ID Management
 * Generates and retrieves a persistent user ID (UUID) for authentication and data ownership
 */

/**
 * Get or create a persistent user ID
 * The ID is stored in localStorage and used for authentication and data ownership
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

  // Generate a valid UUID v4
  const userId = crypto.randomUUID();
  localStorage.setItem('darik-user-id', userId);
  return userId;
}

/**
 * Clear the stored user ID (for logout/reset)
 */
export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('darik-user-id');
  }
}