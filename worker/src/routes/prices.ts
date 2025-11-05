/**
 * Price-related API routes
 */

import { Hono } from 'hono';
import { Env } from '../types';
import { fetchAMFIData, getLastFetchTime, getPriceStats } from '../prices/amfi-fetcher';

export const pricesRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/prices/fetch
 *
 * Trigger AMFI NAV fetch (manual or cron)
 * This endpoint can be called by cron or manually for testing
 */
pricesRouter.post('/fetch', async (c) => {
  try {
    console.log('Starting AMFI NAV fetch...');
    const result = await fetchAMFIData(c.env);

    if (!result.success) {
      return c.json({ error: result.error || 'Failed to fetch AMFI data' }, 500);
    }

    return c.json({
      message: result.pricesCount > 0
        ? `Successfully fetched ${result.pricesCount} NAV records`
        : 'No updates available (304 Not Modified)',
      ...result,
    });
  } catch (error) {
    console.error('Error in /api/prices/fetch:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/prices/stats
 *
 * Get pricing statistics (total prices, latest date, etc.)
 */
pricesRouter.get('/stats', async (c) => {
  try {
    const [stats, lastFetch] = await Promise.all([
      getPriceStats(c.env),
      getLastFetchTime(c.env),
    ]);

    return c.json( {
      ...stats,
      lastFetch,
    });
  } catch (error) {
    console.error('Error in /api/prices/stats:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/prices/:securityId
 *
 * Get historical prices for a specific security
 */
pricesRouter.get('/:securityId', async (c) => {
  try {
    const securityId = c.req.param('securityId');
    const limit = parseInt(c.req.query('limit') || '30');
    const offset = parseInt(c.req.query('offset') || '0');

    const prices = await c.env.DB.prepare(`
      SELECT
        id,
        security_id,
        date,
        price_paise,
        source,
        metadata,
        created_at
      FROM prices
      WHERE security_id = ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `)
      .bind(securityId, limit, offset)
      .all();

    return c.json( {
      prices: prices.results || [],
      count: prices.results?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in /api/prices/:securityId:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * GET /api/prices/:securityId/latest
 *
 * Get the latest price for a specific security
 */
pricesRouter.get('/:securityId/latest', async (c) => {
  try {
    const securityId = c.req.param('securityId');

    const price = await c.env.DB.prepare(`
      SELECT
        id,
        security_id,
        date,
        price_paise,
        source,
        metadata,
        created_at
      FROM prices
      WHERE security_id = ?
      ORDER BY date DESC
      LIMIT 1
    `)
      .bind(securityId)
      .first();

    if (!price) {
      return c.json({ error: 'No price found for this security'}, 404);
    }

    return c.json( price);
  } catch (error) {
    console.error('Error in /api/prices/:securityId/latest:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

/**
 * POST /api/prices/manual
 *
 * Add a manual price entry (for securities without automated pricing)
 * Requires authentication
 */
pricesRouter.post('/manual', async (c) => {
  try {
    const body = await c.req.json();
    const { securityId, date, pricePaise } = body;

    // Validate input
    if (!securityId || !date || pricePaise === undefined) {
      return c.json({ error: 'Missing required fields: securityId, date, pricePaise'}, 400);
    }

    if (typeof pricePaise !== 'number' || pricePaise < 0) {
      return c.json({ error: 'Invalid price: must be a non-negative number in paise'}, 400);
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) {
      return c.json({ error: 'Invalid date format: expected YYYY-MM-DD'}, 400);
    }

    // Insert or update the price
    await c.env.DB.prepare(`
      INSERT INTO prices (security_id, date, price_paise, source, created_at, updated_at)
      VALUES (?, ?, ?, 'manual', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(security_id, date) DO UPDATE SET
        price_paise = excluded.price_paise,
        source = excluded.source,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(securityId, date, pricePaise)
      .run();

    return c.json( {
      message: 'Price added successfully',
      securityId,
      date,
      pricePaise,
    }, 201);
  } catch (error) {
    console.error('Error in /api/prices/manual:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
