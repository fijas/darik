import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  // BACKUPS: R2Bucket;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('/*', cors({
  origin: (origin) => origin, // TODO: Restrict to app domain in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Health check endpoint
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
    return c.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// API routes will be added here
// Example structure:
// import authRoutes from './routes/auth';
// import syncRoutes from './routes/sync';
// app.route('/api/auth', authRoutes);
// app.route('/api/sync', syncRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({
    error: err.message || 'Internal Server Error',
  }, 500);
});

export default app;
