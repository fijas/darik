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

### 3.3 Capture UI Component ✅

- [x] Create `/components/capture/CaptureInput.tsx`
  - [x] Large text input field
  - [x] Voice input button (Web Speech API)
  - [x] Camera/gallery button
  - [x] Parse on input change (debounced)
- [x] Create `/components/capture/PreviewCard.tsx`
  - [x] Show parsed fields
  - [x] Edit individual fields inline
  - [x] Category selector dropdown
  - [x] Save/Cancel actions
- [x] Create `/components/capture/RecentTransactions.tsx`
  - [x] List last 10 transactions
  - [x] Quick edit/delete actions
  - [ ] Swipe gestures (mobile) - deferred

### 3.4 Voice Input Integration

- [ ] Implement Web Speech API wrapper
- [ ] Handle browser compatibility
- [ ] Add voice recording indicator
- [ ] Process transcript through parser
- [ ] Error handling for speech recognition

### 3.5 Transaction Management ✅

- [x] Create `/lib/db/transactions.ts` with CRUD functions
  - [x] `addTransaction()`
  - [x] `updateTransaction()`
  - [x] `deleteTransaction()`
  - [x] `getTransactions()` with filters
  - [x] `getTransactionsByDateRange()`
  - [x] `getTransactionsByMonth()`
  - [x] `getRecentTransactions()`
  - [x] `getTransactionStats()`
  - [x] `bulkAddTransactions()`
- [x] Implement optimistic updates (sync status tracking)
- [x] Queue operations for sync (clock updates)
- [x] Wire up edit functionality in capture page
- [ ] Add undo functionality (deferred to Phase 4)

### 3.6 Income & Transfer Support ✅

- [x] Expand income categories in `/types/enums.ts`
  - [x] Add VARIABLE_PAY, FREELANCE, BUSINESS_INCOME
  - [x] Add INVESTMENT_INCOME, RENTAL_INCOME
  - [x] Add LOAN_REPAYMENT, GIFT_RECEIVED, INHERITANCE
  - [x] Create `/lib/constants/categories.ts` for type-based grouping
- [x] Update parser to detect income (`/lib/parsers/expense-parser.ts`)
  - [x] Add income keyword detection (salary, received, freelance, repaid, etc.)
  - [x] Default to 'income' type when income keywords detected
  - [x] Update merchant extraction to handle income keywords
  - [x] Add income category matching logic
  - [x] Add `type` field to ParsedExpense
- [x] Add transaction type selector to UI
  - [x] Update `/components/capture/PreviewCard.tsx` with type toggle
  - [x] Add segmented control: Income | Expense | Transfer
  - [x] Style income (green) vs expense (red) differently
- [x] Update `/app/page.tsx` to support transaction type
  - [x] Pass type from PreviewCard to handleSave
  - [x] Remove hardcoded `type: 'expense'`
- [x] Visual improvements in `/components/capture/RecentTransactions.tsx`
  - [x] Show income in green, expense in red with +/- prefix
  - [x] Add income/expense/transfer icons (up/down/swap arrows)
  - [x] Display net summary (income - expense) in header
- [ ] Add transfer type support (deferred - Phase 6)
  - [ ] Require source and destination account
  - [ ] Handle account-to-account transfers

---

## Phase 4: Cloudflare Worker API & Sync Engine ✅

### 4.1 Worker Authentication Setup (Simplified for Development)

- [x] Create `/worker/src/middleware/auth.ts` with simple token-based auth
- [x] Implement bearer token authentication middleware
- [x] Add user ID extraction from context
- [ ] Full WebAuthn/Passkeys implementation (deferred to Phase 5)
  - [ ] Registration challenge generation
  - [ ] Verification logic
  - [ ] Session token creation
  - [ ] Cookie-based authentication (SameSite=Lax)

### 4.2 Rate Limiting ✅

- [x] Create `/worker/src/middleware/rate-limit.ts` using KV
- [x] Implement per-IP rate limiting
- [x] Implement per-user rate limiting
- [x] Add rate limit headers in responses
- [x] Support multiple rate limit profiles (global, sync, auth)
- [x] Implement automatic cleanup with TTL

### 4.3 Sync Protocol Implementation ✅

- [x] Create `/worker/src/sync/protocol.ts`
  - [x] Clock/timestamp management (incremental clock)
  - [x] Conflict resolution logic (last-write-wins)
  - [x] Tombstone handling for deletes
- [x] Create `/worker/src/types/sync.ts` for protocol types
- [x] Create sync routes (`/worker/src/routes/sync.ts`)
  - [x] `POST /api/sync/pull`
  - [x] `POST /api/sync/push`
  - [x] `GET /api/sync/stats`
  - [x] `GET /api/sync/health`
- [x] Implement batching (500 rows per page default)
- [x] Add pagination support for large datasets
- [ ] Add compression support (gzip) - deferred

### 4.4 Client-Side Sync Engine ✅

- [x] Create `/lib/sync/engine.ts`
  - [x] Background sync scheduler
  - [x] Delta pull implementation
  - [x] Delta push with queued operations
  - [x] Automatic sync interval (5 minutes default)
  - [x] Manual sync trigger
- [x] Create `/lib/sync/types.ts` for client-side types
- [x] Implement sync status hooks
  - [x] `useSync()` - complete sync state management
  - [x] Status tracking (pending ops, last sync time, errors)
- [x] Create `/components/sync/SyncIndicator.tsx`
  - [x] Visual sync status indicator
  - [x] Manual sync trigger
  - [x] Pending changes counter
  - [x] Error display
- [ ] Add sync trigger on app focus/network regain - deferred

---

## Phase 5: Client-Side Encryption

### 5.1 WebCrypto Helpers ✅

- [x] Create `/lib/crypto/encryption.ts`
  - [x] `generateKey()` - AES-GCM 256 key generation
  - [x] `encryptRow(data)` - encrypt with random nonce
  - [x] `decryptRow(encData)` - decrypt and verify
  - [x] `exportKey()` / `importKey()`
  - [x] `encryptData()` / `decryptData()` - full object encryption
  - [x] `deriveKeyFromPassword()` - PBKDF2 fallback
- [x] Implement key storage in IndexedDB
  - [x] Create `/lib/crypto/key-storage.ts`
  - [x] Separate key database for security isolation
  - [x] `storeKey()` / `retrieveKey()` / `deleteKey()`
  - [x] `getMasterKey()` - get or create master key
  - [x] Key metadata tracking (created, last used)
- [x] Create nonce generation (cryptographically secure random)

### 5.2 Passkey Integration ✅

- [x] Create `/lib/crypto/passkey-wrapper.ts`
  - [x] Wrap encryption key with passkey credential
  - [x] Unwrap key on login
  - [x] Fallback to password-derived key (PBKDF2)
  - [x] `registerPasskey()` - create passkey and store key
  - [x] `authenticateWithPasskey()` - authenticate and retrieve key
  - [x] `registerWithPassword()` / `authenticateWithPassword()` - fallback
  - [x] `autoLogin()` - automatic authentication attempt
  - [x] Browser capability detection
- [ ] Implement key rotation logic (deferred - Phase 9)
- [ ] Test WebAuthn across browsers/devices (deferred - Phase 13)

### 5.3 Encryption Integration ✅

- [x] Update sync engine to encrypt before push
  - [x] Create `/lib/crypto/sync-encryption.ts` helper module
  - [x] Encrypt transactions before sending to server
  - [x] Selective field encryption (merchant, note, rawText)
- [x] Update sync engine to decrypt after pull
  - [x] Decrypt transactions after receiving from server
  - [x] Batch encryption/decryption for performance
- [x] Modify Dexie schema to optionally store encrypted data
  - [x] Encrypted fields stored in `_encrypted` field
  - [x] Metadata remains in plaintext for indexing
- [x] Create selective field encryption helpers
  - [x] `encryptForSync()` / `decryptFromSync()`
  - [x] `encryptBatch()` / `decryptBatch()`
  - [x] `isRowEncrypted()` checker
- [ ] Add encryption status indicator in UI (Phase 5.4)

### 5.4 Client-Side Auth UI ✅

- [x] Create `/app/auth/login/page.tsx`
- [x] Create `/components/auth/PasskeySetup.tsx`
- [x] Create `/components/auth/PasskeyLogin.tsx`
- [x] Implement first-time setup flow
- [x] Implement device registration flow
- [x] Add error handling and toast notifications
- [x] Add slide-down animation for error toast

---

## Phase 6: Pricing Data & Portfolio ✅

### 6.1 AMFI Price Fetcher ✅

- [x] Create `/worker/src/prices/amfi-fetcher.ts`
  - [x] Fetch AMFI NAV JSON (https://www.amfiindia.com/spages/NAVAll.txt)
  - [x] Parse NAV data to structured format
  - [x] Normalize prices to paise
  - [x] Cache raw data in KV with ETag headers
- [x] Create cron handler: `POST /api/prices/fetch`
- [x] Implement incremental updates
- [x] Insert/update prices in D1
- [x] Add error handling and retry logic

### 6.2 Securities Management

- [x] Create `/lib/db/securities.ts`
  - [x] `addSecurity()`
  - [x] `updateSecurity()`
  - [x] `getSecurityById()`
  - [x] `searchSecurities()` - fuzzy search by name/code
- [x] Create `/components/portfolio/SecurityPicker.tsx`
- [x] Implement manual price entry UI
- [x] Support multiple price sources (AMFI, manual, NSE)

### 6.3 Holdings Management

- [x] Create `/lib/db/holdings.ts`
  - [x] `addHolding()` with lot tracking
  - [x] `updateHolding()`
  - [x] `deleteHolding()`
  - [x] `getHoldingsBySecurity()`
  - [x] `getAllHoldings()`
- [x] Create `/components/portfolio/HoldingCard.tsx`
- [x] Implement lot drilldown view
- [x] Add buy/sell transaction recording

### 6.4 Portfolio Valuation

- [x] Create `/lib/calculations/portfolio.ts`
  - [x] `calculateMarketValue(holdings, prices)`
  - [x] `calculateUnrealizedPnL(holdings, prices)`
  - [x] `calculateDayChange(prices)`
  - [x] `calculateXIRR()` (internal rate of return)
- [x] Create `/components/portfolio/PortfolioSummary.tsx`
  - [x] Total value display
  - [x] Day change (₹ and %)
  - [x] Asset allocation chart
- [x] Create `/components/portfolio/HoldingsList.tsx`
- [x] Add asset class filters (MF, Equity, Gold, etc.)

### 6.5 CSV Import

- [x] Create `/lib/importers/csv-parser.ts`
  - [x] Generic CSV parser
  - [x] CAMS format parser
  - [x] KFintech format parser
  - [x] Kuvera format parser
  - [x] Zerodha format parser
- [x] Create `/components/import/CsvImporter.tsx`
  - [x] File upload
  - [x] Format detection
  - [x] Preview diff
  - [x] Confirm & import
- [x] Create `/app/import/page.tsx`

---

## Phase 7: Goals & Net Worth

### 7.1 Financial Calculations ✅

- [x] Create `/lib/calculations/goals.ts`
  - [x] `calculateRequiredSIP(target, current, rate, months)`
  - [x] `calculateFutureValue(principal, sip, rate, months)`
  - [x] `calculateProbability()` - 3-path Monte Carlo
  - [x] Goal tracking progress
- [ ] Create unit tests for financial formulas (deferred to Phase 10)
- [ ] Validate edge cases (negative returns, short periods) (deferred to Phase 10)

### 7.2 Goals Management ✅

- [x] Create `/lib/db/goals.ts` - CRUD operations
- [x] Create `/components/goals/GoalCard.tsx`
  - [x] Target amount and date
  - [x] Current corpus
  - [x] Required SIP amount
  - [x] On-track indicator
  - [x] Progress bar
- [x] Create `/components/goals/GoalForm.tsx`
  - [x] Name, target, date inputs
  - [x] Strategy selector (SIP/lumpsum/hybrid)
  - [x] Assign accounts/holdings
  - [x] Real-time SIP calculation
- [x] Create `/app/plan/page.tsx` with goals list

### 7.3 Assets & Liabilities ✅

- [x] Create `/lib/db/assets.ts` - CRUD operations
- [x] Create `/lib/db/liabilities.ts` - CRUD operations
- [ ] Create `/components/networth/AssetCard.tsx` (deferred - basic implementation in networth page)
- [ ] Create `/components/networth/LiabilityCard.tsx` (deferred - basic implementation in networth page)
- [ ] Create `/components/networth/AssetForm.tsx` (deferred to Phase 7.5 enhancement)
- [ ] Create `/components/networth/LiabilityForm.tsx` (deferred to Phase 7.5 enhancement)
- [x] Implement reprice rules for assets (included in assets.ts)

### 7.4 Net Worth Dashboard ✅

- [x] Create `/lib/calculations/networth.ts`
  - [x] Calculate total assets
  - [x] Calculate total liabilities
  - [x] Calculate net worth
  - [x] Track historical snapshots (logic included)
- [x] Create `/components/networth/NetWorthCard.tsx` (integrated into page)
  - [x] Current net worth
  - [x] Breakdown by type
  - [ ] Sparkline/chart (deferred - shows bars currently)
- [x] Create `/app/networth/page.tsx`

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

**Current Phase**: Phase 7 - IN PROGRESS (7.1-7.4 Complete, 7.5 Remaining) 🔄
**Overall Completion**: 6.8/14 phases completed (49%), Phase 7 nearly complete

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

**Phase 3 Progress**: ✅ Complete (with deferrals)
- [x] 3.1 Natural Language Parser
- [ ] 3.2 Category Auto-Learning (deferred to Phase 9)
- [x] 3.3 Capture UI Component
- [ ] 3.4 Voice Input Integration (deferred to Phase 9)
- [x] 3.5 Transaction Management
- [x] 3.6 Income & Transfer Support

**Phase 4 Progress**: ✅ Complete (85% - WebAuthn deferred)
- [x] 4.1 Worker Authentication Setup (simple token-based for development)
- [x] 4.2 Rate Limiting (KV-based with per-IP and per-user limits)
- [x] 4.3 Sync Protocol Implementation (clock-based delta sync)
- [x] 4.4 Client-Side Sync Engine (auto-sync + manual trigger)

**Phase 5 Progress**: ✅ Complete
- [x] 5.1 WebCrypto Helpers (AES-GCM 256-bit encryption)
- [x] 5.2 Passkey Integration (WebAuthn with password fallback)
- [x] 5.3 Encryption Integration (selective field encryption in sync)
- [x] 5.4 Client-Side Auth UI (setup and login flows)

**Phase 6 Progress**: ✅ Complete
- [x] 6.1 AMFI Price Fetcher (NAV data from AMFI India)
- [x] 6.2 Securities Management (CRUD operations for mutual funds, stocks, ETFs)
- [x] 6.3 Holdings Management (lot-level tracking for tax calculations)
- [x] 6.4 Portfolio Valuation (XIRR, P&L, asset allocation)
- [x] 6.5 CSV Import (CAMS, KFintech, Kuvera, Zerodha)

**Phase 7 Progress**: 🔄 In Progress (80% complete)
- [x] 7.1 Financial Calculations (SIP, future value, Monte Carlo probability)
- [x] 7.2 Goals Management (CRUD, GoalCard, GoalForm, plan page)
- [x] 7.3 Assets & Liabilities (CRUD operations, repricing logic)
- [x] 7.4 Net Worth Dashboard (calculations, health score, allocation breakdown)
- [ ] 7.5 Rebalancing Helper (deferred - basic suggestions in networth.ts)

**Current Status Summary**:
- ✅ Natural language parser with income/expense detection
- ✅ Income & expense tracking with visual differentiation
- ✅ Transaction type selector (Income/Expense/Transfer)
- ✅ Color-coded UI (green for income, red for expense)
- ✅ Net summary display in transaction list
- ✅ Cloudflare Worker with Hono framework, CORS, health checks
- ✅ Simple bearer token authentication (UUID-based for development)
- ✅ Rate limiting middleware with configurable limits per endpoint
- ✅ Sync protocol with clock-based delta sync
- ✅ Transaction sync endpoints (pull/push/stats/health)
- ✅ Client-side sync engine with auto-sync and manual trigger
- ✅ Sync status UI indicator with floating button
- ✅ End-to-end encryption with AES-GCM 256-bit
- ✅ Passkey (WebAuthn) authentication with password fallback
- ✅ Selective field encryption (merchant, note, rawText)
- ✅ Auth UI with setup and login flows
- ✅ AMFI price fetcher for mutual fund NAV data
- ✅ Securities and holdings management with lot tracking
- ✅ Portfolio valuation with XIRR, P&L calculations
- ✅ Portfolio UI with summary, holdings list, and filters
- ✅ CSV import for CAMS, KFintech, Kuvera, Zerodha
- ✅ Desktop navigation in Header, mobile nav in BottomNav
- ✅ Worker builds successfully (TypeScript validation passes)
- ✅ Financial goal tracking with SIP calculations and progress monitoring
- ✅ Goal management UI with real-time projections
- ✅ Assets and liabilities database with repricing logic
- ✅ Net worth dashboard with financial health scoring
- ✅ Asset allocation breakdown and visualization
- 📝 Note: App build requires network access for Google Fonts
- 📝 Note: Voice input & ML categorization deferred to Phase 9
- 📝 Note: Key rotation logic deferred to Phase 9
- 📝 Note: Rebalancing helper partially implemented (suggestions logic exists)

**Next Steps**: Complete Phase 7.5 (Rebalancing Helper UI) or move to Phase 8 (PWA & Offline Functionality)

Last Updated: 2025-11-06
