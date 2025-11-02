# Darik - Personal Finance Tracker

A **local-first** personal finance tracker for budgeting, expenses, investments, and net worth tracking. Built as a Progressive Web App (PWA) with client-side encryption and offline-first functionality.

## Features

### Core Functionality

- **Expense Tracking** - Natural language input with voice support
- **Investment Portfolio** - Mutual funds, equities, gold, crypto tracking
- **Net Worth Monitoring** - Assets and liabilities management
- **Goals & Planning** - SIP calculators and goal tracking
- **Offline-First** - Works without internet, syncs when online
- **Privacy-Focused** - Client-side encryption, server stores only ciphertext

### Key Highlights

- 💬 Natural language expense entry (text or voice)
- 📸 Receipt OCR (optional)
- 📊 Automatic mutual fund NAV updates via AMFI
- 🎯 Financial goal tracking with required SIP calculations
- 🔐 End-to-end encryption with WebAuthn passkeys
- 📱 Installable PWA with offline support
- 🌙 Dark mode support
- 📥 CSV import from CAMS, KFintech, Kuvera, Zerodha
- 💰 All calculations in paise (no float precision issues)

## Architecture

```
┌─────────────────────────────────────────┐
│  User (Browser/PWA)                     │
│  ├─ Next.js App Router + Tailwind      │
│  ├─ Dexie (IndexedDB) - Local DB       │
│  ├─ WebCrypto (AES-GCM Encryption)     │
│  └─ Service Worker (Offline + Sync)    │
└─────────────┬───────────────────────────┘
              │ Encrypted Sync
              ▼
┌─────────────────────────────────────────┐
│  Cloudflare Edge                        │
│  ├─ Workers (API + Cron)                │
│  ├─ D1 (SQLite) - Encrypted Data        │
│  ├─ KV (Price Cache)                    │
│  └─ R2 (Backups, Optional)              │
└─────────────────────────────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, PWA
- **Local Storage**: Dexie (IndexedDB wrapper)
- **Backend**: Cloudflare Workers, D1 (SQLite), KV, R2
- **Encryption**: WebCrypto API (AES-GCM 256)
- **Auth**: WebAuthn (Passkeys)
- **Pricing**: AMFI for Indian Mutual Funds

## Project Structure

```
darik/
├── app/                    # Next.js application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities, DB, sync engine
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   └── constants/        # Enums, categories, config
│
├── worker/               # Cloudflare Worker
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── db/          # D1 migrations and queries
│   │   ├── auth/        # WebAuthn implementation
│   │   ├── sync/        # Sync protocol
│   │   └── prices/      # Price fetchers
│   └── migrations/      # Database migrations
│
├── PROJECT.md           # Detailed implementation plan
├── TODO.md             # Step-by-step checklist
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Cloudflare account (free tier works)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/darik.git
   cd darik
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Cloudflare Worker**

   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler login

   # Create D1 database
   wrangler d1 create darik-finance

   # Create KV namespace
   wrangler kv:namespace create "darik-kv"

   # Apply migrations
   cd worker
   wrangler d1 migrations apply darik-finance --local
   ```

4. **Configure environment**

   ```bash
   # Copy example env files
   cp app/.env.example app/.env.local
   cp worker/.dev.vars.example worker/.dev.vars

   # Edit with your Cloudflare credentials
   ```

5. **Start development servers**

   ```bash
   # In one terminal - Next.js app
   npm run dev:app

   # In another terminal - Cloudflare Worker
   npm run dev:worker
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Development

### Scripts

```bash
# Development
npm run dev              # Start both app and worker
npm run dev:app          # Start Next.js dev server
npm run dev:worker       # Start Wrangler dev server

# Build
npm run build            # Build both app and worker
npm run build:app        # Build Next.js app
npm run build:worker     # Build Worker

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests with Playwright

# Linting
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed with test data
```

### Key Directories

#### `/app` - Next.js Application

- `/app` - App Router pages and layouts
- `/components` - Reusable React components
  - `/ui` - Base UI components (Button, Input, Card, etc.)
  - `/capture` - Expense capture components
  - `/portfolio` - Portfolio views
  - `/goals` - Goal tracking components
- `/lib` - Business logic
  - `/db` - Dexie database and CRUD operations
  - `/parsers` - Natural language parsing
  - `/sync` - Sync engine
  - `/crypto` - Encryption helpers
  - `/calculations` - Financial math

#### `/worker` - Cloudflare Worker

- `/src/routes` - API endpoints
- `/src/auth` - WebAuthn authentication
- `/src/sync` - Sync protocol implementation
- `/src/prices` - AMFI and other price fetchers
- `/migrations` - SQL migration files

## Features in Detail

### Expense Capture

- Type or speak: "Fuel 900 cash 7:30pm"
- Auto-parses amount, merchant, category, payment method, time
- Learns from corrections
- Optional receipt scanning with OCR

### Portfolio Management

- Import holdings from CSV (CAMS, KFintech, Kuvera, Zerodha)
- Automatic daily NAV updates for mutual funds
- Manual price entry for other assets
- Lot-level tracking for tax calculations
- XIRR calculation for returns

### Goals & Planning

- Define financial goals with target amount and date
- Calculate required SIP amount
- Monte Carlo simulation for probability
- Track progress with on-track indicators

### Net Worth Tracking

- Track all assets (bank, FD, property, PF, etc.)
- Track liabilities (loans, credit cards)
- Historical snapshots
- Rebalancing suggestions

### Privacy & Security

- All data encrypted client-side before sync
- Server never sees plaintext
- WebAuthn passkeys for authentication
- Local-only mode available (no sync)

## Deployment

### Production Deployment

1. **Deploy Next.js to Cloudflare Pages**

   ```bash
   cd app
   npm run build
   wrangler pages deploy out
   ```

2. **Deploy Worker**

   ```bash
   cd worker
   wrangler deploy
   ```

3. **Run production migrations**
   ```bash
   wrangler d1 migrations apply darik-finance
   ```

### CI/CD with GitHub Actions

The project includes GitHub Actions workflows for:

- **CI** - Lint, test, and build on PR
- **Preview** - Deploy preview on PR
- **Production** - Deploy on tag `v*`

See `.github/workflows/` for details.

## Configuration

### Environment Variables

#### App (Next.js)

```env
NEXT_PUBLIC_WORKER_URL=https://your-worker.workers.dev
NEXT_PUBLIC_ENABLE_SYNC=true
```

#### Worker (Cloudflare)

```env
# Set in wrangler.toml or Cloudflare dashboard
D1_DATABASE_ID=your-d1-id
KV_NAMESPACE_ID=your-kv-id
```

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

See [TODO.md](TODO.md) for detailed implementation checklist.

### Completed

- ✅ Project setup and scaffolding
- ✅ Repository structure

### In Progress

- 🔄 Next.js app setup
- 🔄 Cloudflare Worker setup

### Planned

- Data models and database schema
- Expense capture and parsing
- Sync engine and encryption
- Portfolio management
- Goals and net worth tracking
- PWA and offline functionality
- Testing and deployment

## License

See [LICENSE](LICENSE) for details.

## Acknowledgments

- AMFI for mutual fund NAV data
- Cloudflare for excellent edge infrastructure
- The open-source community

## Support

For bugs and feature requests, please open an issue on GitHub.

---

**Built with ❤️ for privacy-conscious personal finance tracking**
