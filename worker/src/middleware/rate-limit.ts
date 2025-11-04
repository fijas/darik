/**
 * Rate Limiting Middleware
 * Uses Cloudflare KV to track request counts per IP/user
 */

import type { Context, Next } from 'hono';
import type { Env, ContextVariables } from '../types';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  maxRequests: number; // Max requests
  windowMs: number; // Time window in milliseconds
  keyPrefix: string; // KV key prefix
}

/**
 * Default rate limits
 */
const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  global: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:global',
  },
  sync: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:sync',
  },
  auth: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:auth',
  },
};

/**
 * Rate limit data stored in KV
 */
interface RateLimitData {
  count: number;
  resetAt: number;
}

/**
 * Create a rate limiter middleware
 */
export const rateLimiter = (configName: keyof typeof DEFAULT_LIMITS = 'global') => {
  return async (c: Context<{ Bindings: Env; Variables: ContextVariables }>, next: Next) => {
    const config = DEFAULT_LIMITS[configName];
    if (!config) {
      throw new Error(`Invalid rate limit config: ${configName}`);
    }
    const kv = c.env.KV;

    // Get identifier (user ID if authenticated, otherwise IP)
    const userId = c.get('userId') as string | undefined;
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const identifier = userId || ip;

    const key = `${config.keyPrefix}:${identifier}`;
    const now = Date.now();

    try {
      // Get current rate limit data
      const dataStr = await kv.get(key);
      let data: RateLimitData;

      if (dataStr) {
        data = JSON.parse(dataStr);

        // Check if window has expired
        if (now >= data.resetAt) {
          // Reset counter
          data = {
            count: 1,
            resetAt: now + config.windowMs,
          };
        } else if (data.count >= config.maxRequests) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((data.resetAt - now) / 1000);
          return c.json(
            {
              error: 'Rate limit exceeded',
              retryAfter,
            },
            429,
            {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': data.resetAt.toString(),
            }
          );
        } else {
          // Increment counter
          data.count += 1;
        }
      } else {
        // First request in window
        data = {
          count: 1,
          resetAt: now + config.windowMs,
        };
      }

      // Store updated data (expire after window + 60s buffer)
      const ttl = Math.ceil((data.resetAt - now) / 1000) + 60;
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });

      // Add rate limit headers
      const remaining = Math.max(0, config.maxRequests - data.count);
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', data.resetAt.toString());

      await next();
    } catch (error) {
      // If KV fails, log error but allow request through
      console.error('Rate limit check failed:', error);
      await next();
    }
  };
};

/**
 * Clear rate limit for a user (useful for testing or admin operations)
 */
export const clearRateLimit = async (
  kv: KVNamespace,
  identifier: string,
  configName: keyof typeof DEFAULT_LIMITS = 'global'
) => {
  const config = DEFAULT_LIMITS[configName];
  if (!config) {
    throw new Error(`Invalid rate limit config: ${configName}`);
  }
  const key = `${config.keyPrefix}:${identifier}`;
  await kv.delete(key);
};
