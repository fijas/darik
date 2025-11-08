# Deployment Guide

This guide covers deploying Darik to Cloudflare infrastructure with staging and production environments.

## Architecture

- **Frontend**: Next.js app on Cloudflare Pages
- **Backend**: Cloudflare Worker
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **CI/CD**: GitHub Actions

## Environments

- **Development**: Local development (localhost)
- **Staging**: Auto-deploys from `master` branch
- **Production**: Manual deploy via version tags (e.g., `v1.0.0`)

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **GitHub Repository** with secrets configured
3. **Wrangler CLI** installed globally: `npm install -g wrangler`
4. **Node.js 20+** and npm

## Initial Setup

### 1. Cloudflare Authentication

```bash
# Login to Cloudflare
wrangler login

# Get your Account ID
wrangler whoami
```

### 2. Create Cloudflare Resources

#### Staging Environment

```bash
cd worker

# Create D1 database
wrangler d1 create darik-finance-staging

# Create KV namespace
wrangler kv:namespace create "darik-kv-staging"

# Optional: Create R2 bucket for backups
wrangler r2 bucket create darik-backups-staging
```

#### Production Environment

```bash
# Create D1 database
wrangler d1 create darik-finance-prod

# Create KV namespace
wrangler kv:namespace create "darik-kv-prod"

# Optional: Create R2 bucket
wrangler r2 bucket create darik-backups-prod
```

### 3. Update wrangler.toml

After creating the resources, update `worker/wrangler.toml` with the returned IDs:

```toml
[[env.staging.d1_databases]]
binding = "DB"
database_name = "darik-finance-staging"
database_id = "YOUR_STAGING_DATABASE_ID"

[[env.staging.kv_namespaces]]
binding = "KV"
id = "YOUR_STAGING_KV_ID"

[[env.production.d1_databases]]
binding = "DB"
database_name = "darik-finance-prod"
database_id = "YOUR_PRODUCTION_DATABASE_ID"

[[env.production.kv_namespaces]]
binding = "KV"
id = "YOUR_PRODUCTION_KV_ID"
```

### 4. Run Database Migrations

```bash
cd worker

# Staging
wrangler d1 migrations apply darik-finance-staging --remote

# Production (when ready)
wrangler d1 migrations apply darik-finance-prod --remote
```

### 5. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build --workspace=app`
   - **Build output directory**: `app/out`
   - **Root directory**: `/`
5. Add environment variables:
   - `NEXT_PUBLIC_WORKER_URL`: Your worker URL
   - `NEXT_PUBLIC_ENABLE_SYNC`: `true`

### 6. Configure GitHub Secrets

In your GitHub repository settings → Secrets and variables → Actions, add:

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token (with Workers and Pages permissions)
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID
- `STAGING_WORKER_URL`: `https://darik-finance-worker-staging.your-account.workers.dev`
- `PRODUCTION_WORKER_URL`: `https://darik-finance-worker-prod.your-account.workers.dev`

**To create an API token:**
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add "Cloudflare Pages" permissions
5. Add "D1" permissions

## Deployment Workflows

### Continuous Integration (CI)

**Triggers:** Pull requests and pushes to master/main

**What it does:**
- Runs linters and type checks
- Runs all tests (unit + integration)
- Builds both app and worker
- Runs security audit

**File:** `.github/workflows/ci.yml`

### Staging Deployment

**Triggers:** Push to `master` or `main` branch

**What it does:**
1. Runs D1 migrations on staging database
2. Deploys Worker to staging environment
3. Builds Next.js app with staging env vars
4. Deploys app to Cloudflare Pages (staging branch)

**File:** `.github/workflows/deploy-staging.yml`

**URL:** `https://staging.darik-finance.pages.dev`

### Production Deployment

**Triggers:** Push of version tag (e.g., `v1.0.0`)

**What it does:**
1. Runs D1 migrations on production database
2. Deploys Worker to production environment
3. Builds Next.js app with production env vars
4. Deploys app to Cloudflare Pages (production branch)
5. Creates GitHub Release

**File:** `.github/workflows/deploy-production.yml`

**URL:** `https://darik-finance.pages.dev` or custom domain

## Manual Deployment

### Deploy Worker Manually

```bash
cd worker

# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

### Deploy App Manually

```bash
cd app

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=darik-finance --branch=staging
```

## Creating a Production Release

1. **Ensure staging is tested and stable**
2. **Create and push a version tag:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

3. **GitHub Actions will automatically:**
   - Run migrations
   - Deploy worker to production
   - Build and deploy app to production
   - Create a GitHub release

## Monitoring

### View Worker Logs

```bash
# Staging
wrangler tail darik-finance-worker-staging

# Production
wrangler tail darik-finance-worker-prod
```

### Check D1 Database

```bash
# Staging
wrangler d1 execute darik-finance-staging --command "SELECT COUNT(*) FROM transactions"

# Production
wrangler d1 execute darik-finance-prod --command "SELECT COUNT(*) FROM transactions"
```

### View Pages Analytics

Go to Cloudflare Dashboard → Pages → darik-finance → Analytics

## Custom Domain Setup

1. Go to Cloudflare Pages → darik-finance → Custom domains
2. Add your domain (e.g., `app.darik.finance`)
3. Configure DNS records (Cloudflare will guide you)
4. Enable "Always Use HTTPS"

## Rollback Strategy

### Worker Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

### App Rollback

Go to Cloudflare Dashboard → Pages → darik-finance → Deployments → Rollback

## Environment Variables

### Staging

- `NEXT_PUBLIC_WORKER_URL`: Staging worker URL
- `NEXT_PUBLIC_ENABLE_SYNC`: `true`
- `NEXT_PUBLIC_APP_NAME`: `Darik (Staging)`

### Production

- `NEXT_PUBLIC_WORKER_URL`: Production worker URL
- `NEXT_PUBLIC_ENABLE_SYNC`: `true`
- `NEXT_PUBLIC_APP_NAME`: `Darik`

## Troubleshooting

### Build Fails

- Check Node.js version (should be 20+)
- Verify all dependencies are installed: `npm ci`
- Check for TypeScript errors: `npm run typecheck --workspace=app`

### Worker Fails to Deploy

- Verify wrangler.toml has correct database/KV IDs
- Check Cloudflare API token has correct permissions
- Ensure D1 migrations have run successfully

### App Not Connecting to Worker

- Verify `NEXT_PUBLIC_WORKER_URL` is correct
- Check Worker CORS settings in `worker/src/index.ts`
- Ensure Worker is deployed and accessible

### Database Issues

- Run migrations: `wrangler d1 migrations apply <database-name> --remote`
- Check migration status: `wrangler d1 migrations list <database-name> --remote`
- Verify D1 binding in wrangler.toml

## Security Checklist

- [ ] All secrets configured in GitHub Actions
- [ ] API tokens have minimal required permissions
- [ ] CORS configured correctly in Worker
- [ ] Environment variables use staging/production URLs correctly
- [ ] HTTPS enforced on custom domain
- [ ] Rate limiting enabled in Worker

## Cost Estimate

Cloudflare free tier includes:
- **Pages**: 500 builds/month, unlimited requests
- **Workers**: 100,000 requests/day
- **D1**: 5GB storage, 5M rows read/day
- **KV**: 100,000 reads/day, 1,000 writes/day

For most personal use cases, this should be completely free!

## Support

If you encounter issues:
1. Check Cloudflare Workers logs: `wrangler tail`
2. Review GitHub Actions logs in your repository
3. Check Cloudflare Dashboard for service status
4. Open an issue in the GitHub repository

---

**Last Updated:** 2025-11-08
