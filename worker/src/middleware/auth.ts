/**
 * Authentication Middleware
 * Simple token-based authentication for development
 * TODO: Replace with WebAuthn/Passkeys in Phase 5
 */

import type { Context, Next } from 'hono';
import type { Env, ContextVariables } from '../types';

/**
 * Simple auth middleware that checks for a bearer token
 * For now, we'll use a simple user ID as the token for development
 * In production, this should be replaced with proper JWT or session tokens
 */
export const authMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return c.json({ error: 'Invalid Authorization header format' }, 401);
  }

  // For development: accept any valid UUID as a user ID
  // TODO: Implement proper session validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return c.json({ error: 'Invalid token format' }, 401);
  }

  // Store user ID in context for downstream handlers
  c.set('userId', token);

  await next();
};

/**
 * Optional auth middleware - allows requests with or without auth
 */
export const optionalAuthMiddleware = async (
  c: Context<{ Bindings: Env; Variables: ContextVariables }>,
  next: Next
) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader) {
    const [scheme, token] = authHeader.split(' ');
    if (scheme === 'Bearer' && token) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(token)) {
        c.set('userId', token);
      }
    }
  }

  await next();
};

/**
 * Get user ID from context (set by auth middleware)
 */
export const getUserId = (c: Context): string => {
  const userId = c.get('userId');
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};
