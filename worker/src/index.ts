import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import syncRoutes from './routes/sync';
import { pricesRouter } from './routes/prices';
import keyBackupRoutes from './routes/key-backup';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limit';
import { securityHeaders } from './middleware/security-headers';

const app = new Hono<{ Bindings: Env }>();

// Security headers for all responses
app.use('/*', securityHeaders);

// CORS configuration
app.use(
  '/*',
  cors({
    origin: (origin) => {
      // Allow localhost for development
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return origin;
      }
      // Allow Cloudflare Pages domains (staging and production)
      if (origin && origin.match(/https:\/\/.*\.darik-finance\.pages\.dev$/)) {
        return origin;
      }
      // Allow custom production domain (if configured)
      const allowedOrigins = [
        'https://darik-finance.pages.dev',
        'https://staging.darik-finance.pages.dev',
      ];
      return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: [
      'Content-Length',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 600,
    credentials: true,
  })
);

// Health check endpoint (no auth required)
app.get('/api/health', async (c) => {
  try {
    // Check D1 connection
    const dbCheck = await c.env.DB.prepare('SELECT 1 as ok').first();

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbCheck ? 'connected' : 'disconnected',
      environment: c.env.ENVIRONMENT || 'unknown',
    });
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Sync routes - require authentication and rate limiting
app.use('/api/sync/*', authMiddleware, rateLimiter('sync'));
app.route('/api/sync', syncRoutes);

// Price routes - require authentication and rate limiting for write operations
app.use('/api/prices/manual', authMiddleware, rateLimiter('sync'));
app.use('/api/prices/fetch', rateLimiter('global')); // Cron or manual trigger
app.route('/api/prices', pricesRouter);

// Key backup routes - rate limiting on GET (to prevent brute force), no auth required for initial setup
app.use('/api/auth/key-backup', rateLimiter('auth'));
app.route('/api/auth', keyBackupRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json(
    {
      error: err.message || 'Internal Server Error',
    },
    500
  );
});

// Scheduled event handler for cron jobs
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // Daily AMFI NAV fetch (runs at 23:00 IST)
    console.log('Cron triggered: AMFI NAV fetch');

    const { fetchAMFIData } = await import('./prices/amfi-fetcher');
    const result = await fetchAMFIData(env);

    console.log('Cron result:', result);
  },
};
