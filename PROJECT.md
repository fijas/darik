# Personal Finance Tracker (Local‑First PWA) — Step‑by‑Step Implementation Plan

A detailed plan to build a **local‑first** personal budgeting, expense, investments, net‑worth, and goals tracker with **Next.js PWA + Cloudflare Workers + D1 (SQLite) + KV**, encrypted client‑side sync, offline‑first UX, and near‑zero running cost. Suitable for handing to an AI/codegen tool.

---

## 0) Guiding Principles
- **Local‑first**: all interactions are instant; IndexedDB (Dexie) is the source of truth while offline, then background‑syncs when online.
- **Privacy by design**: client‑side encryption (WebCrypto AES‑GCM); server stores only ciphertext.
- **Simplicity**: thin API surface, deterministic calculations on client, low/zero external dependencies for prices.
- **Low friction**: one capture box, voice input, share‑to‑app, OCR optional.
- **Cost‑aware**: free tiers (Cloudflare Pages/Workers/D1/KV), AMFI for MF prices; manual fallback for everything.

---

## 1) Feature Scope

### MVP (Weeks 1–2)
- Add expense with natural language (text/voice), auto‑parse, categorize; attach receipt photo (optional OCR).
- Transactions list, daily/weekly/monthly summaries.
- Mutual fund holdings import (CSV) and daily valuation via AMFI NAV; manual price editor for others.
- Net worth snapshot (assets – liabilities – loans).
- Goals module: define target amount & date → required SIP calculator; on‑track indicator.
- Offline‑first PWA (installable) with background sync.
- Encrypted sync to Worker/D1; passkey login (WebAuthn).

### Nice‑to‑Have (Weeks 3–4)
- Equities, gold, crypto optional; rebalancing helper vs target bands.
- Telegram bot & Android Web Share Target ingestion (SMS/email text → app).
- Cron jobs for nightly prices, goal recomputation snapshots.
- CSV/PDF importers: CAMS/KFin CAS (basic parsing), Kuvera exports.
- Basic Monte‑Carlo (3‑path) goal probability.

---

## 2) High‑Level Architecture

```
User (Web/PWA)
  └─ Next.js (App Router) + Tailwind + Dexie (IndexedDB) + Serwist (PWA)
        ├─ Local parsers (regex/chrono)
        ├─ Optional AI calls (ambiguity only)
        ├─ WebCrypto (AES‑GCM) encrypt/decrypt
        ├─ Sync engine (pull/push deltas)
        └─ UI: Capture • Portfolio • Plan

Cloudflare
  ├─ Worker API (wrangler) → D1 (SQLite) + KV (price cache) + R2 (backups, optional)
  │     ├─ /api/auth (passkey bootstrap, key wrapping)
  │     ├─ /api/sync/transactions, holdings, prices, assets, liabilities, goals
  │     ├─ /api/prices/fetch (cron)
  │     └─ /api/backup/snapshot (cron → R2)
  ├─ Pages (static Next build)
  └─ Cron Triggers (23:00 local): prices + recomputations
```

**Trust model:** plaintext lives only in the browser. Server receives encrypted blobs + minimal metadata (ids, timestamps, content hashes) for conflict resolution and rate limiting.

---

## 3) Data Model (SQLite/D1) & Client Mirrors

> Store identical (or migratable) schemas in Dexie & D1; all monetary values in **paise** to avoid floats.

### 3.1 Tables

**transactions**
```
id TEXT PRIMARY KEY,                 -- uuid
user_id TEXT,                        -- single user; still keep for portability
created_ts INTEGER,                  -- epoch ms (device timestamp)
posted_ts INTEGER,                   -- server assigned or trusted client
amount_paise INTEGER,
currency TEXT,                       -- 'INR'
merchant TEXT,
category TEXT,                       -- enum string
method TEXT,                         -- upi/card/cash/netbanking
note TEXT,
raw_text TEXT,
tags TEXT,                           -- JSON string array
source TEXT,                         -- manual/telegram/ocr/sms
enc BLOB                             -- encrypted payload (if storing only ciphertext on server)
```

**securities**
```
id TEXT PRIMARY KEY,                 -- uuid or stable code
symbol TEXT,                         -- AMFI code / NSE ticker / ISIN / synthetic
name TEXT,
type TEXT,                           -- 'mf'|'equity'|'gold'|'crypto'
price_src TEXT,                      -- 'amfi'|'manual'|'nse'|'custom'
decimals INTEGER DEFAULT 2
```

**holdings**
```
id TEXT PRIMARY KEY,
security_id TEXT REFERENCES securities(id),
units TEXT,                          -- store as string decimal to preserve precision
avg_cost_paise INTEGER,
account TEXT,                        -- broker/platform/bank tag
lots TEXT                            -- JSON [{units:"10.25", cost_paise:12345, ts:...}]
```

**prices**
```
security_id TEXT,
date TEXT,                           -- 'YYYY-MM-DD'
price_paise INTEGER,
PRIMARY KEY (security_id, date)
```

**assets** (non‑market assets)
```
id TEXT PRIMARY KEY,
type TEXT,                           -- 'bank'|'fd'|'property'|'pf'|'cash'|'other'
name TEXT,
value_paise INTEGER,
reprice_rule TEXT,                   -- 'manual'|'indexed'|'link:<security_id>'
```

**liabilities**
```
id TEXT PRIMARY KEY,
type TEXT,                           -- 'home_loan'|'car_loan'|'cc'|'other'
name TEXT,
outstanding_paise INTEGER,
rate_bps INTEGER,                    -- e.g., 740 = 7.40%
emi_paise INTEGER,
next_due_date TEXT                   -- ISO
```

**goals**
```
id TEXT PRIMARY KEY,
name TEXT,
target_value_paise INTEGER,
target_date TEXT,
priority INTEGER,
strategy TEXT,                       -- 'sip'|'lumpsum'|'hybrid'
current_corpus_paise INTEGER DEFAULT 0,
assigned_accounts TEXT               -- JSON mapping from accounts/holdings → % or amount
```

**sync_log** (server) & **_clock** (client): vector clock/lamport timestamps for conflict resolution.

### 3.2 Indices (D1 & Dexie)
- transactions(created_ts), transactions(category), holdings(security_id), prices(security_id,date)

---

## 4) Client‑Side Encryption (WebCrypto)

- Generate a random 256‑bit AES‑GCM key per user device; wrap it with a passkey (WebAuthn) credential or a password‑derived key (PBKDF2/Argon2) if passkeys unavailable.
- Encrypt row payloads: `enc = AES_GCM(JSON(row_plain))`; store minimal plaintext columns only if needed for querying **locally**; server stores **only enc** and the opaque metadata (`id`, `created_ts`).
- Key rotation endpoint: upload new wrapped key; re‑encrypt in background (client‑only) if you choose full ciphertext storage locally too.

---

## 5) Sync Protocol

- **Delta‑pull**: client sends last known server clock; server returns changed rows (id, enc, tombstone).
- **Delta‑push**: client sends new/updated rows with enc + lamport; server upserts; conflicts resolved by `max(clock)` and merges by field for non‑exclusive fields.
- **Batching**: limit 500 rows per page.
- **Compression**: gzip/deflate.

---

## 6) API Surface (Worker)

Base: `/api/*` (authenticated via session token tied to WebAuthn + same‑site cookies)

- `POST /auth/passkey/register` → begin + finish flows
- `POST /auth/passkey/login`
- `POST /key/wrap` / `POST /key/unwrap` (optional, if doing server‑assisted wrap)
- `POST /sync/:table/pull` { since_clock }
- `POST /sync/:table/push` { rows:[{id, enc, clock, tombstone?}] }
- `POST /prices/fetch` (cron only) — fetch AMFI NAV JSON, cache in KV, write D1
- `POST /backup/snapshot` (cron only) — dump D1 to R2 (encrypted)

Rate limiting per IP + user (KV counters) to prevent abuse.

---

## 7) Pricing Data Strategy

- **Mutual Funds (India)**: AMFI daily NAV JSON. Cache raw in KV with `ETag` & `If‑Modified‑Since` handling. Normalize to paise and insert into `prices`.
- **Equities/Gold/Crypto**: start manual (price_src='manual'), allow user to edit; add optional free source adapters later. Everything is pluggable.

---

## 8) Algorithms & Financial Math

### 8.1 Parsing Free‑Text Expense
- Regex for amount: first `₹?([0-9][0-9,]*\.?[0-9]{0,2})` → normalize paise.
- Merchant: capitalized tokens not in stopwords; fallback to raw.
- Method: detect tokens {upi, gpay, phonepe, card, cash}.
- Date: `chrono-node` parsing; default now.
- **Ambiguity < 0.8** → call tiny LLM (`gpt‑mini` style) with few‑shot prompt to produce structured JSON `{amount, merchant, category, method, date}`.

### 8.2 Category Auto‑Learning
- Maintain merchant→category dictionary; on edit, update.
- Simple Naive Bayes over recent tokens; fallback to rules.

### 8.3 Portfolio Valuation
- `market_value = Σ(units × latest_price)`
- `unrealized_pnl = market_value − Σ(lots.cost)`

### 8.4 Goals: Required SIP
- Monthly rate `r = (1+annual)^ (1/12) − 1`.
- `SIP = (Target − Current×(1+r)^n) × r / ((1+r)^n − 1)`
- 3‑path sanity Monte‑Carlo (bear/base/bull = 6/10/14% CAGR) → on‑track probability.

### 8.5 Rebalancing
- Target bands: Equity 75–85%, Debt 10–15%, Gold 3–7%, US 10–15% (of equity).
- Compute delta; show informational suggestions only.

---

## 9) UX / UI Flows

### 9.1 Navigation
- **Capture** (default): Big input + mic + camera; last 5 tx; quick filters.
- **Portfolio**: Total value, day change; chips by asset‑class; holdings table; lot drilldown.
- **Plan**: Goals list with “on‑track?”; sliders to adjust SIP/date → recompute instantly.

### 9.2 Add Expense (Happy Path)
1. User types/speaks: "Fuel 900 cash 7:30pm".
2. Parser extracts → preview card.
3. User taps Save; row added locally; background push to server.

### 9.3 Import Holdings
1. Choose CSV (MF or equity).
2. Client parses, normalizes; shows diff preview.
3. Confirm → write to Dexie; background sync.

### 9.4 Share Target (Android)
- Manifest `share_target` accepts `text/plain` and `image/*` → opens `/capture` prefilled.

### 9.5 Error & Offline States
- Optimistic UI; enqueue failed pushes; badge for unsynced count.
- Toasts kept minimal; undo action on destructive ops.

---

## 10) Security Model
- **Encryption**: AES‑GCM 256; per‑row nonce; key stored in WebAuthn‑wrapped form.
- **Auth**: Passkeys preferred; fallback to email link + device key.
- **Transport**: HTTPS only; SameSite=Lax cookies; CSRF token on form posts if needed.
- **PII minimization**: store only what’s necessary; allow local‑only mode (no sync).
- **Backups**: nightly encrypted D1 dump to R2; client‑side encrypted export (CSV/SQLite/Parquet) downloadable.

---

## 11) Telemetry & Privacy‑Safe Analytics (Optional)
- Local, opt‑in metrics: counts, perf timings. If remote, send only aggregates; never send expense texts or amounts.

---

## 12) Step‑By‑Step Build Plan

### Day 1–2: Scaffolding
- Create monorepo (optional) or single repo with `/app` (Next.js) and `/worker` (CF Worker).
- Next.js: Tailwind, Serwist (PWA), Dexie; basic layout and tabs.
- Dexie schema mirroring D1 tables (subset for MVP: transactions, securities, holdings, prices).

### Day 3–4: Capture & Parsing
- Implement capture input + parser (regex + chrono).
- Transactions list with edit/delete; category chips.
- Add voice input (Web Speech API) and share target skeleton.

### Day 5–6: Worker, D1, Sync
- Set up Worker with wrangler; create D1 schema migrations.
- Implement `/sync/*` endpoints; client delta push/pull with clocks.
- Add encryption wrapper (generate key, encrypt row, push enc).

### Day 7–8: Prices & Portfolio
- KV‑cached AMFI fetcher; cron to populate `prices`.
- Portfolio view: compute valuations client‑side.
- Manual price editor for non‑MF.

### Day 9–10: Goals & Net Worth
- Goals CRUD + required SIP calc + simple probability.
- Net worth page: assets/liabilities CRUD; snapshot sparkline.

### Day 11–12: PWA Polish & Offline
- Full installability; background sync; queued mutations; conflict handling.
- Error states, undo, optimistic updates.

### Day 13–14: Imports & Extras
- CSV importers (MF holdings; equity); preview + commit.
- Optional: Telegram bot webhook handler (same parser), receipt OCR (Tesseract.js) hook.

---

## 13) Testing Strategy
- **Unit**: parsers, math (SIP, rebalancing), encryption helpers.
- **Integration**: sync protocol (happy path + conflicts), price fetcher.
- **E2E**: Playwright across offline/online toggles and mobile viewport.
- **Fixtures**: sample CSVs (CAMS/KFin/Kuvera), sample receipts.

---

## 14) Deployment Pipeline (CI/CD)

### Branching
- `main` → production; `dev` → preview.

### GitHub Actions (example)
- **App build**: lint → typecheck → unit tests → Next.js build → upload artifact.
- **Worker build**: unit tests → wrangler publish to **staging** D1 binding.
- **Preview Deploy**: on PR to `main`, deploy Pages preview + Worker to preview env (separate D1).
- **Prod Deploy**: on tag `v*`, deploy Pages to prod + Worker to prod; run D1 migrations; rotate cron if changed.

### Secrets & Env
- Cloudflare API token; KV/D1/R2 bindings per‑env; feature flags.
- No sensitive user data in build logs; encryption keys live only on client.

### Database Migrations
- Versioned SQL files; wrangler `d1 migrations apply --env <env>` in pipeline.

### Rollback
- Pages supports instant rollback to previous deployment.
- Keep last N D1 snapshots in R2; manual restore script.

---

## 15) Monitoring & Ops
- Worker logs via `wrangler tail`; alert on 5xx spikes.
- Cron job status logged to KV; simple health page shows last price update time and counts.
- Synthetic check (GitHub Action on schedule) pings `/health` and validates nav cache freshness.

---

## 16) Configuration & Tuning
- PWA cache strategies: static assets → CacheFirst; API → StaleWhileRevalidate with short TTL.
- Dexie stores encrypted or plaintext? For speed, store plaintext locally; encrypt before push.
- Sync frequency: on app focus, on network regain, and every 10 min when active.
- Price history retention: 3–5 years daily; older → monthly aggregates.

---

## 17) Extensibility Hooks
- **Adapters**: additional price sources; broker importers; alternate storage (DuckDB/Parquet export).
- **AI**: replace categorizer with local model later; add Q&A over local data.
- **Multi‑user**: the schema already supports user_id; add org/team later if needed.

---

## 18) Acceptance Criteria (Definition of Done)
- PWA installable; works offline; cold‑start < 2s on mid‑range Android.
- Add expense in <3 taps (typing or voice); shows in list instantly; syncs when online.
- Import MF CSV; portfolio value visible; NAVs refresh nightly.
- Net worth card accurate; goals show required SIP & on‑track status.
- Encryption verified: server cannot decrypt rows; restoring on new device via passkey works.
- CI/CD deploys preview per PR; prod on tag; D1 migrations are idempotent.

---

## 19) Backlog (Post‑Launch)
- SMS auto‑forward (Tasker) → webhook → ingestion.
- Reconciliation rules (duplicate detection within 5‑min window).
- Tax reports (capital gains FIFO/LTCG/STCG) — India specific.
- Shared view mode for spouse (read‑only, encrypted share key).
- Desktop Tauri app bundling the PWA for local DB + native FS backups.

---

## 20) Quick Prompts for Codegen (Examples)

**Next.js component for Capture input**
- Prompt: "Build a React component with a text field, mic button (Web Speech API), and camera button; parse input via provided `parseExpense()`; show a preview card; on Save write to Dexie `transactions` and enqueue sync; provide hooks for error/undo."

**Worker sync endpoint**
- Prompt: "Implement Cloudflare Worker route `POST /sync/transactions` that accepts `{since_clock}` for pull and `{rows}` for push; uses D1 for storage, KV for rate limiting; stores `enc` blob; returns new `clock`."

**AMFI fetcher**
- Prompt: "Write a Worker cron handler that fetches AMFI NAV JSON, normalizes to paise, caches raw in KV with ETag headers, and upserts D1 `prices(security_id,date,price_paise)`."

**Encryption helpers**
- Prompt: "Implement `generateKey()`, `wrapKeyWithPasskey()`, `encryptRow(obj)`, `decryptRow(enc)` using WebCrypto AES‑GCM 256 and WebAuthn."

