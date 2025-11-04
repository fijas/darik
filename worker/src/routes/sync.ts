/**
 * Sync API Routes
 * Endpoints for client-server synchronization
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types';
import { PullRequestSchema, PushRequestSchema } from '../types/sync';
import { SyncService } from '../sync/protocol';
import { getUserId } from '../middleware/auth';

const sync = new Hono<{ Bindings: Env }>();

/**
 * Pull changes from server
 * POST /sync/pull
 */
sync.post('/pull', zValidator('json', PullRequestSchema), async (c) => {
  try {
    const userId = getUserId(c);
    const request = c.req.valid('json');

    const syncService = new SyncService(c.env.DB);
    const response = await syncService.pull(userId, request);

    return c.json(response);
  } catch (error) {
    console.error('Pull error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Pull failed',
      },
      500
    );
  }
});

/**
 * Push changes to server
 * POST /sync/push
 */
sync.post('/push', zValidator('json', PushRequestSchema), async (c) => {
  try {
    const userId = getUserId(c);
    const request = c.req.valid('json');

    const syncService = new SyncService(c.env.DB);
    const response = await syncService.push(userId, request);

    return c.json(response);
  } catch (error) {
    console.error('Push error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Push failed',
      },
      500
    );
  }
});

/**
 * Get sync statistics
 * GET /sync/stats?table=transactions
 */
sync.get('/stats', async (c) => {
  try {
    const userId = getUserId(c);
    const tableName = c.req.query('table');

    const syncService = new SyncService(c.env.DB);
    const stats = await syncService.getStats(userId, tableName);

    return c.json({
      stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get stats',
      },
      500
    );
  }
});

/**
 * Health check for sync service
 * GET /sync/health
 */
sync.get('/health', async (c) => {
  try {
    // Try a simple query to check DB connection
    await c.env.DB.prepare('SELECT COUNT(*) as count FROM sync_log LIMIT 1').first();

    return c.json({
      status: 'healthy',
      timestamp: Date.now(),
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

export default sync;
