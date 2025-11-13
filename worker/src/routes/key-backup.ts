/**
 * Key Backup Routes
 * Handles encrypted master key storage and retrieval for cross-device access
 */

import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * Store encrypted master key
 * POST /api/auth/key-backup
 */
app.post('/key-backup', async (c) => {
  try {
    const { userId, email, encryptedKey } = await c.req.json();

    // Validation
    if (!userId || !email || !encryptedKey) {
      return c.json({ error: 'Missing required fields: userId, email, encryptedKey' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // Validate userId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return c.json({ error: 'Invalid userId format' }, 400);
    }

    const now = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if key backup already exists
    const existing = await c.env.DB.prepare(
      'SELECT user_id FROM key_backup WHERE user_id = ? OR email = ?'
    )
      .bind(userId, normalizedEmail)
      .first();

    if (existing) {
      // Update existing backup
      await c.env.DB.prepare(
        'UPDATE key_backup SET encrypted_key = ?, updated_at = ? WHERE user_id = ?'
      )
        .bind(encryptedKey, now, userId)
        .run();

      return c.json({
        success: true,
        message: 'Key backup updated',
        userId,
      });
    } else {
      // Insert new backup
      await c.env.DB.prepare(
        'INSERT INTO key_backup (user_id, email, encrypted_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(userId, normalizedEmail, encryptedKey, now, now)
        .run();

      return c.json({
        success: true,
        message: 'Key backup created',
        userId,
      });
    }
  } catch (error) {
    console.error('[KeyBackup] Store failed:', error);
    return c.json({ error: 'Failed to store key backup' }, 500);
  }
});

/**
 * Retrieve encrypted master key
 * GET /api/auth/key-backup?email=user@example.com
 */
app.get('/key-backup', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Missing required parameter: email' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get key backup by email
    const result = await c.env.DB.prepare(
      'SELECT user_id, encrypted_key, created_at FROM key_backup WHERE email = ?'
    )
      .bind(normalizedEmail)
      .first<{
        user_id: string;
        encrypted_key: string;
        created_at: number;
      }>();

    if (!result) {
      return c.json({ error: 'No key backup found for this email' }, 404);
    }

    return c.json({
      userId: result.user_id,
      encryptedKey: result.encrypted_key,
      createdAt: result.created_at,
    });
  } catch (error) {
    console.error('[KeyBackup] Retrieve failed:', error);
    return c.json({ error: 'Failed to retrieve key backup' }, 500);
  }
});

/**
 * Delete key backup (for account deletion)
 * DELETE /api/auth/key-backup?email=user@example.com
 */
app.delete('/key-backup', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Missing required parameter: email' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    await c.env.DB.prepare('DELETE FROM key_backup WHERE email = ?')
      .bind(normalizedEmail)
      .run();

    return c.json({
      success: true,
      message: 'Key backup deleted',
    });
  } catch (error) {
    console.error('[KeyBackup] Delete failed:', error);
    return c.json({ error: 'Failed to delete key backup' }, 500);
  }
});

export default app;