# Personal Finance Tracker - Implementation TODO

> Comprehensive step-by-step implementation plan with checkboxes to track progress.
> Format: `- [ ]` = pending, `- [x]` = completed

---

## Phase 0: Project Setup & Scaffolding

### 0.1 Repository & Structure Setup

- [x] Clean up old codebase (delete client/ and server/ directories)
- [x] Initialize monorepo structure or single repo with `/app` and `/worker`
- [x] Set up `.gitignore` for Node.js, Next.js, and Cloudflare Workers
- [x] Create `README.md` with project overview and setup instructions
- [x] Set up package.json at root level with workspace configuration (if monorepo)

### 0.2 Next.js App Setup

- [x] Initialize Next.js 16+ with App Router
  - [x] Run `npx create-next-app@latest app --typescript --tailwind --app`
  - [x] Configure TypeScript (strict mode, path aliases)
  - [x] Set up Tailwind CSS with custom theme (colors, spacing)
  - [x] Configure `next.config.js` for PWA support
- [x] Install core dependencies
  - [x] `dexie` (IndexedDB wrapper)
  - [x] `dexie-react-hooks` (React integration)
  - [x] `@ducanh2912/next-pwa` or `serwist` (PWA support)
  - [x] `chrono-node` (date parsing)
  - [x] `zod` (schema validation)
  - [x] `date-fns` (date utilities)
- [x] Set up basic folder structure
  - [x] `/app` - Next.js pages (App Router)
  - [x] `/lib` - utilities, database, sync engine
  - [x] `/components` - React components
  - [x] `/hooks` - custom React hooks
  - [x] `/types` - TypeScript type definitions
  - [x] `/constants` - enums, categories, config

### 0.3 Cloudflare Worker Setup

- [x] Install Cloudflare Wrangler CLI globally: `npm install -g wrangler`
- [x] Create `/worker` directory
- [x] Initialize Worker project: `wrangler init worker`
- [x] Install Worker dependencies
  - [x] `hono` or `itty-router` (lightweight routing)
  - [x] `zod` (validation)
- [x] Create `wrangler.toml` configuration
  - [x] Set up D1 database binding
  - [x] Set up KV namespace binding
  - [x] Set up R2 bucket binding (optional)
  - [x] Configure cron triggers
- [x] Set up Worker folder structure
  - [x] `/src/routes` - API endpoints
  - [x] `/src/db` - D1 migrations and queries
  - [x] `/src/utils` - helper functions
  - [x] `/src/types` - TypeScript types

### 0.4 Development Environment

- [x] Set up ESLint configuration
- [x] Set up Prettier configuration
- [x] Create `tsconfig.json` with shared settings
- [x] Set up EditorConfig for PhpStorm
- [x] Create development scripts in package.json
  - [x] `dev:app` - Next.js dev server
  - [x] `dev:worker` - Wrangler dev server
  - [x] `dev` - Run both concurrently
  - [x] `build:app` - Production build
  - [x] `build:worker` - Worker build

---

## Phase 1: Data Models & Database Schema

### 1.1 TypeScript Type Definitions ✅

- [x] Create `/types/database.ts` with all table interfaces
  - [x] `Transaction` interface
  - [x] `Security` interface
  - [x] `Holding` interface
  - [x] `Price` interface
  - [x] `Asset` interface
  - [x] `Liability` interface
  - [x] `Goal` interface
  - [x] `SyncLog` interface
- [x] Create `/types/enums.ts` for category, payment method, asset types
- [x] Create `/types/parsed.ts` for parser output types
- [x] Create `/types/sync.ts` for sync protocol types

### 1.2 Dexie (IndexedDB) Schema ✅

- [x] Create `/lib/db/schema.ts` with Dexie database class
- [x] Define all tables matching D1 schema
  - [x] `transactions` table with indices
  - [x] `securities` table with indices
  - [x] `holdings` table with indices
  - [x] `prices` table with compound index
  - [x] `assets` table
  - [x] `liabilities` table
  - [x] `goals` table
  - [x] `_clock` table for sync metadata
- [x] Implement database versioning and migrations
- [x] Create database initialization function
- [x] Export singleton database instance

### 1.3 D1 (SQLite) Schema & Migrations ✅

- [x] Create D1 database: `wrangler d1 create darik-finance`
- [x] Create migration files in `/worker/migrations/`
  - [x] `0001_create_transactions.sql`
  - [x] `0002_create_securities.sql`
  - [x] `0003_create_holdings.sql`
  - [x] `0004_create_prices.sql`
  - [x] `0005_create_assets.sql`
  - [x] `0006_create_liabilities.sql`
  - [x] `0007_create_goals.sql`
  - [x] `0008_create_sync_log.sql`
  - [x] `0009_create_users_devices.sql`
- [x] Apply migrations to local D1: `wrangler d1 migrations apply darik-finance --local`
- [x] Create SQL query helpers in `/worker/src/db/queries.ts`

### 1.4 Constants & Configuration ✅

- [x] Create `/lib/config.ts` for app configuration
  - [x] Sync intervals
  - [x] Cache strategies
  - [x] Feature flags
  - [x] API endpoints
  - [x] UI configuration
  - [x] Parser configuration
  - [x] Validation rules
  - [x] Storage keys

---

## Phase 2: Basic UI Layout & Navigation

### 2.1 Design System Setup ✅

- [x] Create `/components/ui/` with base components
  - [x] `Button.tsx`
  - [x] `Input.tsx`
  - [x] `Card.tsx`
  - [x] `Badge.tsx`
  - [x] `Sheet.tsx`
  - [x] `Toast.tsx` (notification system)
  - [x] `Tabs.tsx`
- [x] Set up Tailwind custom classes for consistent spacing/colors
- [x] Create theme configuration (light/dark mode support)

### 2.2 Layout Components ✅

- [x] Create `/components/layout/Layout.tsx` with main structure
- [x] Create `/components/layout/BottomNav.tsx` (mobile navigation)
- [x] Create `/components/layout/Header.tsx`
- [x] Implement navigation state management (using Next.js usePathname)

### 2.3 Core Pages ✅

- [x] Create `/app/page.tsx` - Capture/Home page
- [x] Create `/app/portfolio/page.tsx` - Portfolio view
- [x] Create `/app/plan/page.tsx` - Goals & planning
- [x] Create `/app/settings/page.tsx` - Settings
- [x] Set up basic routing and navigation between pages

### 2.4 Loading & Error States ✅

- [x] Create `/app/loading.tsx` - Loading skeleton
- [x] Create `/app/error.tsx` - Error boundary
- [x] Create offline state indicators
- [x] Create sync status indicator component

---

## Phase 3: Expense Capture & Parsing

### 3.1 Natural Language Parser ✅

- [x] Create `/lib/parsers/expense-parser.ts`
  - [x] Amount extraction (₹, Rs, INR patterns)
  - [x] Merchant name extraction
  - [x] Payment method detection (UPI, GPay, PhonePe, card, cash)
  - [x] Date/time parsing with `chrono-node`
  - [x] Note/description extraction
- [x] Create fallback rules for common patterns
- [x] Implement confidence scoring
- [ ] Create unit tests for parser edge cases (deferred)

### 3.2 Category Auto-Learning

- [ ] Create `/lib/ml/categorizer.ts`
  - [ ] Merchant-to-category dictionary
  - [ ] Rule-based categorization
  - [ ] Simple Naive Bayes classifier (optional)
  - [ ] Learning from user corrections
- [ ] Seed with common merchant patterns
- [ ] Implement category suggestion with confidence

### 3.3 Capture UI Component

- [ ] Create `/components/capture/CaptureInput.tsx`
  - [ ] Large text input field
  - [ ] Voice input button (Web Speech API)
  - [ ] Camera/gallery button
  - [ ] Parse on input change (debounced)
- [ ] Create `/components/capture/PreviewCard.tsx`
  - [ ] Show parsed fields
  - [ ] Edit individual fields inline
  - [ ] Category selector dropdown
  - [ ] Save/Cancel actions
- [ ] Create `/components/capture/RecentTransactions.tsx`
  - [ ] List last 10 transactions
  - [ ] Quick edit/delete actions
  - [ ] Swipe gestures (mobile)

### 3.4 Voice Input Integration

- [ ] Implement Web Speech API wrapper
- [ ] Handle browser compatibility
- [ ] Add voice recording indicator
- [ ] Process transcript through parser
- [ ] Error handling for speech recognition

### 3.5 Transaction Management

- [ ] Create `/lib/db/transactions.ts` with CRUD functions
  - [ ] `addTransaction()`
  - [ ] `updateTransaction()`
  - [ ] `deleteTransaction()`
  - [ ] `getTransactions()` with filters
  - [ ] `getTransactionsByDateRange()`
- [ ] Implement optimistic updates
- [ ] Add undo functionality
- [ ] Queue operations for sync

---

## Phase 4: Cloudflare Worker API & Sync Engine

### 4.1 Worker Authentication Setup

- [ ] Create `/worker/src/auth/passkey.ts` for WebAuthn
  - [ ] Registration challenge generation
  - [ ] Verification logic
  - [ ] Session token creation
- [ ] Implement session middleware
- [ ] Set up cookie-based authentication (SameSite=Lax)
- [ ] Create `/worker/src/auth/routes.ts`
  - [ ] `POST /api/auth/passkey/register/begin`
  - [ ] `POST /api/auth/passkey/register/finish`
  - [ ] `POST /api/auth/passkey/login/begin`
  - [ ] `POST /api/auth/passkey/login/finish`

### 4.2 Rate Limiting

- [ ] Create `/worker/src/middleware/rate-limit.ts` using KV
- [ ] Implement per-IP rate limiting
- [ ] Implement per-user rate limiting
- [ ] Add rate limit headers in responses

### 4.3 Sync Protocol Implementation

- [ ] Create `/worker/src/sync/protocol.ts`
  - [ ] Clock/timestamp management (Lamport or vector clocks)
  - [ ] Conflict resolution logic (last-write-wins with field merging)
  - [ ] Tombstone handling for deletes
- [ ] Create sync routes for each table
  - [ ] `POST /api/sync/transactions/pull`
  - [ ] `POST /api/sync/transactions/push`
  - [ ] `POST /api/sync/holdings/pull`
  - [ ] `POST /api/sync/holdings/push`
  - [ ] (Repeat for other tables)
- [ ] Implement batching (500 rows per page)
- [ ] Add compression support (gzip)

### 4.4 Client-Side Sync Engine

- [ ] Create `/lib/sync/engine.ts`
  - [ ] Background sync scheduler
  - [ ] Delta pull implementation
  - [ ] Delta push with queued operations
  - [ ] Network status monitoring
  - [ ] Retry logic with exponential backoff
- [ ] Create `/lib/sync/queue.ts` for operation queueing
- [ ] Implement sync status hooks
  - [ ] `useSyncStatus()` - sync state
  - [ ] `useQueuedOperations()` - pending ops
- [ ] Add sync trigger on app focus/network regain

---

## Phase 5: Client-Side Encryption

### 5.1 WebCrypto Helpers

- [ ] Create `/lib/crypto/encryption.ts`
  - [ ] `generateKey()` - AES-GCM 256 key generation
  - [ ] `encryptRow(data)` - encrypt with random nonce
  - [ ] `decryptRow(encData)` - decrypt and verify
  - [ ] `exportKey()` / `importKey()`
- [ ] Implement key storage in IndexedDB
- [ ] Create nonce generation (cryptographically secure random)

### 5.2 Passkey Integration

- [ ] Create `/lib/crypto/passkey-wrapper.ts`
  - [ ] Wrap encryption key with passkey credential
  - [ ] Unwrap key on login
  - [ ] Fallback to password-derived key (PBKDF2)
- [ ] Implement key rotation logic
- [ ] Test WebAuthn across browsers/devices

### 5.3 Encryption Integration

- [ ] Update sync engine to encrypt before push
- [ ] Update sync engine to decrypt after pull
- [ ] Modify Dexie schema to optionally store encrypted data
- [ ] Create `/lib/crypto/field-encryption.ts` for selective field encryption
- [ ] Add encryption status indicator in UI

### 5.4 Client-Side Auth UI

- [ ] Create `/app/auth/login/page.tsx`
- [ ] Create `/components/auth/PasskeySetup.tsx`
- [ ] Create `/components/auth/PasskeyLogin.tsx`
- [ ] Implement first-time setup flow
- [ ] Implement device registration flow

---

## Phase 6: Pricing Data & Portfolio

### 6.1 AMFI Price Fetcher

- [ ] Create `/worker/src/prices/amfi-fetcher.ts`
  - [ ] Fetch AMFI NAV JSON (https://www.amfiindia.com/spages/NAVAll.txt)
  - [ ] Parse NAV data to structured format
  - [ ] Normalize prices to paise
  - [ ] Cache raw data in KV with ETag headers
- [ ] Create cron handler: `POST /api/prices/fetch`
- [ ] Implement incremental updates
- [ ] Insert/update prices in D1
- [ ] Add error handling and retry logic

### 6.2 Securities Management

- [ ] Create `/lib/db/securities.ts`
  - [ ] `addSecurity()`
  - [ ] `updateSecurity()`
  - [ ] `getSecurityById()`
  - [ ] `searchSecurities()` - fuzzy search by name/code
- [ ] Create `/components/portfolio/SecurityPicker.tsx`
- [ ] Implement manual price entry UI
- [ ] Support multiple price sources (AMFI, manual, NSE)

### 6.3 Holdings Management

- [ ] Create `/lib/db/holdings.ts`
  - [ ] `addHolding()` with lot tracking
  - [ ] `updateHolding()`
  - [ ] `deleteHolding()`
  - [ ] `getHoldingsBySecurity()`
  - [ ] `getAllHoldings()`
- [ ] Create `/components/portfolio/HoldingCard.tsx`
- [ ] Implement lot drilldown view
- [ ] Add buy/sell transaction recording

### 6.4 Portfolio Valuation

- [ ] Create `/lib/calculations/portfolio.ts`
  - [ ] `calculateMarketValue(holdings, prices)`
  - [ ] `calculateUnrealizedPnL(holdings, prices)`
  - [ ] `calculateDayChange(prices)`
  - [ ] `calculateXIRR()` (internal rate of return)
- [ ] Create `/components/portfolio/PortfolioSummary.tsx`
  - [ ] Total value display
  - [ ] Day change (₹ and %)
  - [ ] Asset allocation chart
- [ ] Create `/components/portfolio/HoldingsList.tsx`
- [ ] Add asset class filters (MF, Equity, Gold, etc.)

### 6.5 CSV Import

- [ ] Create `/lib/importers/csv-parser.ts`
  - [ ] Generic CSV parser
  - [ ] CAMS format parser
  - [ ] KFintech format parser
  - [ ] Kuvera format parser
  - [ ] Zerodha format parser
- [ ] Create `/components/import/CsvImporter.tsx`
  - [ ] File upload
  - [ ] Format detection
  - [ ] Preview diff
  - [ ] Confirm & import
- [ ] Create `/app/import/page.tsx`

---

## Phase 7: Goals & Net Worth

### 7.1 Financial Calculations

- [ ] Create `/lib/calculations/goals.ts`
  - [ ] `calculateRequiredSIP(target, current, rate, months)`
  - [ ] `calculateFutureValue(principal, sip, rate, months)`
  - [ ] `calculateProbability()` - 3-path Monte Carlo
  - [ ] Goal tracking progress
- [ ] Create unit tests for financial formulas
- [ ] Validate edge cases (negative returns, short periods)

### 7.2 Goals Management

- [ ] Create `/lib/db/goals.ts` - CRUD operations
- [ ] Create `/components/goals/GoalCard.tsx`
  - [ ] Target amount and date
  - [ ] Current corpus
  - [ ] Required SIP amount
  - [ ] On-track indicator
  - [ ] Progress bar
- [ ] Create `/components/goals/GoalForm.tsx`
  - [ ] Name, target, date inputs
  - [ ] Strategy selector (SIP/lumpsum/hybrid)
  - [ ] Assign accounts/holdings
  - [ ] Real-time SIP calculation
- [ ] Create `/app/plan/page.tsx` with goals list

### 7.3 Assets & Liabilities

- [ ] Create `/lib/db/assets.ts` - CRUD operations
- [ ] Create `/lib/db/liabilities.ts` - CRUD operations
- [ ] Create `/components/networth/AssetCard.tsx`
- [ ] Create `/components/networth/LiabilityCard.tsx`
- [ ] Create `/components/networth/AssetForm.tsx`
- [ ] Create `/components/networth/LiabilityForm.tsx`
- [ ] Implement reprice rules for assets

### 7.4 Net Worth Dashboard

- [ ] Create `/lib/calculations/networth.ts`
  - [ ] Calculate total assets
  - [ ] Calculate total liabilities
  - [ ] Calculate net worth
  - [ ] Track historical snapshots
- [ ] Create `/components/networth/NetWorthCard.tsx`
  - [ ] Current net worth
  - [ ] Breakdown by type
  - [ ] Sparkline/chart
- [ ] Create `/app/networth/page.tsx`

### 7.5 Rebalancing Helper

- [ ] Create `/lib/calculations/rebalancing.ts`
  - [ ] Define target allocation bands
  - [ ] Calculate current allocation
  - [ ] Suggest rebalancing actions
- [ ] Create `/components/portfolio/RebalancingView.tsx`
  - [ ] Current vs target visualization
  - [ ] Suggested actions
  - [ ] Impact calculator

---

## Phase 8: PWA & Offline Functionality

### 8.1 PWA Configuration

- [ ] Configure `@ducanh2912/next-pwa` in `next.config.js`
- [ ] Create `/public/manifest.json` with app metadata
  - [ ] App name, description, theme colors
  - [ ] Icons (192x192, 512x512, maskable)
  - [ ] Display mode (standalone)
  - [ ] Start URL
- [ ] Create app icons in multiple sizes
- [ ] Test PWA installability on Chrome, Safari, Firefox

### 8.2 Service Worker & Caching

- [ ] Configure cache strategies
  - [ ] Static assets: CacheFirst
  - [ ] API calls: NetworkFirst with fallback
  - [ ] Images: CacheFirst with expiration
- [ ] Implement background sync for queued operations
- [ ] Add offline page/component
- [ ] Test offline functionality
  - [ ] Add transactions offline
  - [ ] View cached data
  - [ ] Sync when back online

### 8.3 Share Target (Android)

- [ ] Add `share_target` to manifest.json
  - [ ] Accept `text/plain` (SMS, WhatsApp text)
  - [ ] Accept `image/*` (receipts)
- [ ] Create `/app/share/page.tsx` handler
- [ ] Parse shared text through expense parser
- [ ] Handle shared images (OCR later)

### 8.4 Performance Optimization

- [ ] Implement lazy loading for components
- [ ] Add loading skeletons
- [ ] Optimize bundle size
  - [ ] Analyze with `@next/bundle-analyzer`
  - [ ] Code splitting by route
  - [ ] Tree-shake unused dependencies
- [ ] Optimize images (use Next.js Image)
- [ ] Add service worker precaching
- [ ] Test cold-start performance (<2s target)

---

## Phase 9: Advanced Features

### 9.1 OCR for Receipts (Optional)

- [ ] Install `tesseract.js`
- [ ] Create `/lib/ocr/receipt-parser.ts`
  - [ ] Extract text from image
  - [ ] Parse merchant, amount, date
  - [ ] Confidence scoring
- [ ] Create `/components/capture/ReceiptScanner.tsx`
- [ ] Integrate with capture flow
- [ ] Add manual correction UI

### 9.2 Telegram Bot (Optional)

- [ ] Create Telegram bot with BotFather
- [ ] Create `/worker/src/webhooks/telegram.ts`
  - [ ] Handle incoming messages
  - [ ] Parse through expense parser
  - [ ] Store in D1
  - [ ] Send confirmation message
- [ ] Add webhook route: `POST /api/webhooks/telegram`
- [ ] Set up Telegram webhook with Cloudflare Worker URL
- [ ] Test with various message formats

### 9.3 SMS/Email Parsing (Future)

- [ ] Research Android SMS forwarding (Tasker/IFTTT)
- [ ] Create webhook endpoint: `POST /api/webhooks/sms`
- [ ] Parse bank transaction SMS formats
- [ ] Extract amount, merchant, date, account
- [ ] Auto-categorize transactions

### 9.4 Dark Mode

- [ ] Set up Tailwind dark mode (class strategy)
- [ ] Create theme toggle component
- [ ] Store preference in localStorage
- [ ] Apply theme on initial load
- [ ] Test all components in dark mode

---

## Phase 10: Testing

### 10.1 Unit Tests

- [ ] Set up testing framework (Vitest or Jest)
- [ ] Test expense parser
  - [ ] Amount extraction
  - [ ] Date parsing
  - [ ] Merchant extraction
  - [ ] Edge cases
- [ ] Test financial calculations
  - [ ] SIP calculation
  - [ ] Portfolio valuation
  - [ ] XIRR
  - [ ] Monte Carlo
- [ ] Test encryption helpers
  - [ ] Key generation
  - [ ] Encryption/decryption
  - [ ] Nonce uniqueness
- [ ] Test sync protocol
  - [ ] Clock management
  - [ ] Conflict resolution
  - [ ] Tombstones

### 10.2 Integration Tests

- [ ] Test Dexie database operations
- [ ] Test Worker endpoints with Miniflare
  - [ ] Auth flow
  - [ ] Sync endpoints
  - [ ] Price fetcher
- [ ] Test end-to-end sync flow
  - [ ] Push from client
  - [ ] Pull from server
  - [ ] Conflict resolution
- [ ] Test offline → online sync

### 10.3 E2E Tests

- [ ] Set up Playwright
- [ ] Test critical user flows
  - [ ] Add expense (text input)
  - [ ] Add expense (voice input)
  - [ ] Edit transaction
  - [ ] Add holding
  - [ ] Import CSV
  - [ ] Create goal
  - [ ] View portfolio
- [ ] Test offline functionality
- [ ] Test across devices (mobile viewport)
- [ ] Test PWA installation

### 10.4 Test Data & Fixtures

- [ ] Create sample CSV files (CAMS, KFin, Kuvera)
- [ ] Create sample receipt images
- [ ] Create seed data script for development
- [ ] Generate mock AMFI NAV data

---

## Phase 11: Deployment & CI/CD

### 11.1 Environment Setup

- [ ] Create Cloudflare account
- [ ] Create D1 databases
  - [ ] Production: `darik-finance-prod`
  - [ ] Staging: `darik-finance-staging`
- [ ] Create KV namespaces
  - [ ] Production: `darik-kv-prod`
  - [ ] Staging: `darik-kv-staging`
- [ ] Create R2 buckets (optional)
  - [ ] `darik-backups-prod`
  - [ ] `darik-backups-staging`
- [ ] Configure wrangler.toml for multiple environments

### 11.2 GitHub Actions Setup

- [ ] Create `.github/workflows/ci.yml`
  - [ ] Lint & typecheck on PR
  - [ ] Run unit tests
  - [ ] Build Next.js app
  - [ ] Build Worker
- [ ] Create `.github/workflows/preview.yml`
  - [ ] Deploy to Cloudflare Pages preview
  - [ ] Deploy Worker to staging
  - [ ] Run migrations on staging D1
  - [ ] Comment PR with preview URL
- [ ] Create `.github/workflows/production.yml`
  - [ ] Trigger on tag `v*`
  - [ ] Deploy to Cloudflare Pages production
  - [ ] Deploy Worker to production
  - [ ] Run migrations on production D1
  - [ ] Create GitHub release

### 11.3 Database Migrations

- [ ] Create migration versioning system
- [ ] Test migrations on local D1
- [ ] Apply migrations to staging
- [ ] Create rollback scripts
- [ ] Document migration process

### 11.4 Secrets & Environment Variables

- [ ] Set up GitHub Secrets
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] Configure environment variables in Cloudflare
  - [ ] Feature flags
  - [ ] API endpoints
  - [ ] Cron schedules
- [ ] Document all required secrets

### 11.5 Monitoring & Health Checks

- [ ] Create `/api/health` endpoint
  - [ ] Check D1 connection
  - [ ] Check KV connection
  - [ ] Report last price update time
- [ ] Set up Cloudflare Worker logs
- [ ] Create synthetic check (GitHub Action)
  - [ ] Ping `/api/health` every 10 minutes
  - [ ] Alert on failures
- [ ] Set up error tracking (optional: Sentry)

### 11.6 Cron Jobs

- [ ] Configure cron in wrangler.toml
  - [ ] Daily AMFI price fetch (23:00 IST)
  - [ ] Daily goal recomputation
  - [ ] Weekly backup to R2 (optional)
- [ ] Test cron locally with `wrangler dev --test-scheduled`
- [ ] Monitor cron execution via Worker logs

---

## Phase 12: Documentation & Polish

### 12.1 User Documentation

- [ ] Update README.md
  - [ ] Project overview
  - [ ] Features list
  - [ ] Screenshots/demo
  - [ ] Installation instructions
  - [ ] Development setup
- [ ] Create CONTRIBUTING.md
- [ ] Create CHANGELOG.md
- [ ] Add inline help text in UI
- [ ] Create onboarding tutorial (first-time users)

### 12.2 Code Documentation

- [ ] Add JSDoc comments to public functions
- [ ] Document sync protocol in detail
- [ ] Document encryption scheme
- [ ] Document API endpoints (OpenAPI spec optional)
- [ ] Create architecture diagrams

### 12.3 UI Polish

- [ ] Add loading states everywhere
- [ ] Add empty states (no data yet)
- [ ] Add error states with retry actions
- [ ] Improve mobile responsiveness
- [ ] Add haptic feedback (mobile)
- [ ] Add animations/transitions (subtle)
- [ ] Test accessibility (keyboard nav, screen readers)

### 12.4 Settings & Preferences

- [ ] Create `/app/settings/page.tsx`
  - [ ] Dark mode toggle
  - [ ] Currency selection
  - [ ] Default categories
  - [ ] Sync preferences
  - [ ] Export data (CSV/JSON)
  - [ ] Delete all data
  - [ ] About/version info
- [ ] Implement data export functionality
- [ ] Implement data import from backup

---

## Phase 13: Launch Preparation

### 13.1 Security Audit

- [ ] Review encryption implementation
- [ ] Test passkey authentication thoroughly
- [ ] Verify HTTPS enforcement
- [ ] Review CORS settings
- [ ] Check for XSS vulnerabilities
- [ ] Test rate limiting effectiveness
- [ ] Verify sensitive data is never logged

### 13.2 Performance Testing

- [ ] Test with large datasets (1000+ transactions)
- [ ] Test sync performance with slow networks
- [ ] Measure cold start time
- [ ] Optimize if needed
- [ ] Test memory usage
- [ ] Test battery consumption (mobile)

### 13.3 Cross-Browser Testing

- [ ] Test on Chrome (desktop & mobile)
- [ ] Test on Firefox (desktop & mobile)
- [ ] Test on Safari (desktop & iOS)
- [ ] Test on Edge
- [ ] Document browser compatibility
- [ ] Fix browser-specific issues

### 13.4 Acceptance Criteria Validation

- [ ] PWA installable on all platforms
- [ ] Works offline (add/view transactions)
- [ ] Cold-start < 2s on mid-range Android
- [ ] Add expense in < 3 taps
- [ ] Import MF CSV successfully
- [ ] NAVs refresh nightly
- [ ] Net worth calculation accurate
- [ ] Goals show correct SIP & tracking
- [ ] Encryption verified (server can't decrypt)
- [ ] Device restore with passkey works
- [ ] CI/CD deploys successfully

### 13.5 Beta Testing

- [ ] Deploy to beta URL
- [ ] Invite 5-10 beta testers
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Iterate on UX improvements

---

## Phase 14: Post-Launch (Backlog)

### 14.1 Advanced Analytics

- [ ] Transaction trends (spending by category over time)
- [ ] Budget tracking & alerts
- [ ] Expense forecasting
- [ ] Savings rate calculator
- [ ] Comparison with previous months

### 14.2 Tax Reporting (India-specific)

- [ ] Capital gains calculator (FIFO/LIFO)
- [ ] LTCG/STCG computation
- [ ] Dividend income report
- [ ] Interest income report
- [ ] Export for tax filing

### 14.3 Multi-User Features

- [ ] Shared view mode (read-only)
- [ ] Spouse/family accounts
- [ ] Encrypted share key
- [ ] Permissions management

### 14.4 Desktop App

- [ ] Tauri app wrapper
- [ ] Native file system backup
- [ ] System tray integration
- [ ] Build & distribute

### 14.5 Additional Integrations

- [ ] Bank statement auto-import (via email parsing)
- [ ] Credit card statement parsing
- [ ] Duplicate transaction detection
- [ ] Reconciliation tools
- [ ] Export to accounting software

---

## Notes & Reminders

- **Monetary Values**: Always use paise (integers) to avoid float precision issues
- **Encryption**: Never log or transmit plaintext sensitive data
- **Offline-First**: All operations must work without network
- **Performance**: Keep bundle size small, optimize for mobile
- **Privacy**: Minimize server-side data, maximize client-side processing
- **Testing**: Test each phase before moving to next
- **Documentation**: Document as you build, not after

---

## Progress Tracking

**Current Phase**: Phase 2 - Basic UI Layout & Navigation (COMPLETE ✅)
**Overall Completion**: 3/14 phases completed (21%)

**Phase 0 Progress**: ✅ Complete
- [x] 0.1 Repository & Structure Setup
- [x] 0.2 Next.js App Setup
- [x] 0.3 Cloudflare Worker Setup
- [x] 0.4 Development Environment

**Phase 1 Progress**: ✅ Complete
- [x] 1.1 TypeScript Type Definitions
- [x] 1.2 Dexie (IndexedDB) Schema
- [x] 1.3 D1 (SQLite) Schema & Migrations
- [x] 1.4 Constants & Configuration

**Phase 2 Progress**: ✅ Complete
- [x] 2.1 Design System Setup
- [x] 2.2 Layout Components
- [x] 2.3 Core Pages
- [x] 2.4 Loading & Error States

Last Updated: 2025-11-03
