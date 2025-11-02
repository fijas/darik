# Darik Finance - Cloudflare Worker

Backend API for Darik Finance Tracker, built on Cloudflare Workers with D1, KV, and R2.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create D1 database**
   ```bash
   npm run d1:create
   # Copy the database_id from output and update wrangler.toml
   ```

3. **Create KV namespace**
   ```bash
   npm run kv:create
   # Copy the id from output and update wrangler.toml
   ```

4. **Run migrations**
   ```bash
   npm run d1:migrate  # For local development
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start local development server
- `npm run deploy` - Deploy to development environment
- `npm run deploy:prod` - Deploy to production environment
- `npm run typecheck` - Run TypeScript type checking
- `npm run d1:migrate` - Run migrations on local D1
- `npm run d1:migrate:remote` - Run migrations on remote dev D1
- `npm run d1:migrate:prod` - Run migrations on production D1

## Structure

```
worker/
├── src/
│   ├── index.ts           # Main entry point
│   ├── routes/            # API route handlers
│   ├── db/                # Database queries and migrations
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript type definitions
├── migrations/            # D1 database migrations
├── wrangler.toml          # Cloudflare Worker configuration
└── package.json
```

## Environment Variables

Set in `wrangler.toml` or `.dev.vars`:

- `ENVIRONMENT` - Current environment (development/production)

## Database Migrations

Migrations are stored in `/migrations` directory and applied via Wrangler CLI.

Create a new migration:
```bash
# Manually create a new file in migrations/
touch migrations/0001_create_users.sql
```

Apply migrations:
```bash
npm run d1:migrate        # Local
npm run d1:migrate:remote # Remote dev
npm run d1:migrate:prod   # Production
```
