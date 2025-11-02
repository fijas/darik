/**
 * Database schema interfaces
 * These mirror the D1 (SQLite) schema and are used in Dexie (IndexedDB)
 *
 * Key principles:
 * - All monetary values in PAISE (integers) to avoid float precision issues
 * - Timestamps in epoch milliseconds (INTEGER)
 * - IDs are UUIDs (TEXT)
 * - Encrypted data stored as BLOB (Uint8Array in TypeScript)
 */

import type {
  TransactionCategory,
  PaymentMethod,
  TransactionSource,
  SecurityType,
  PriceSource,
  AssetType,
  RepriceRule,
  LiabilityType,
  GoalStrategy,
  Currency,
} from './enums';

/**
 * Transaction - Individual income/expense entries
 * Core table for all financial transactions
 */
export interface Transaction {
  id: string; // UUID
  userId: string; // For multi-user support
  createdTs: number; // Device timestamp (epoch ms)
  postedTs: number; // Server timestamp or trusted client
  amountPaise: number; // Amount in paise (₹100.50 = 10050)
  currency: Currency;
  merchant: string; // Merchant name or payee
  category: TransactionCategory;
  method: PaymentMethod;
  note?: string; // User notes
  rawText?: string; // Original input text for reference
  tags?: string; // JSON string array of tags
  source: TransactionSource; // How this transaction was created
  enc?: Uint8Array; // Encrypted payload (if using server-side encryption)

  // Client-side only fields (not synced)
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * Security - Tradeable financial instruments
 * Represents mutual funds, stocks, ETFs, bonds, etc.
 */
export interface Security {
  id: string; // UUID or stable code (e.g., AMFI code)
  symbol: string; // AMFI code, NSE ticker, ISIN, or custom
  name: string; // Full name of the security
  type: SecurityType; // mf, equity, gold, crypto, etc.
  priceSource: PriceSource; // Where we get prices from
  decimals: number; // Decimal places for units (usually 2)

  // Optional metadata
  isin?: string;
  category?: string; // For MF: equity/debt/hybrid
  amc?: string; // Asset Management Company
  riskLevel?: 'low' | 'medium' | 'high';

  // Client-side
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * Lot - Individual purchase of a security
 * Used for lot-level tracking (FIFO/LIFO for tax calculations)
 */
export interface Lot {
  units: string; // Decimal as string to preserve precision
  costPaise: number; // Purchase cost per unit in paise
  ts: number; // Purchase timestamp (epoch ms)
  broker?: string; // Platform/broker used
}

/**
 * Holding - Current holdings of securities
 * Represents ownership of financial instruments
 */
export interface Holding {
  id: string; // UUID
  securityId: string; // References Security.id
  units: string; // Total units as decimal string
  avgCostPaise: number; // Average cost per unit in paise
  account: string; // Broker/platform/bank identifier
  lots: string; // JSON string of Lot[]

  // Client-side
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * Price - Historical prices for securities
 * Daily price data for portfolio valuation
 */
export interface Price {
  securityId: string; // References Security.id
  date: string; // YYYY-MM-DD
  pricePaise: number; // Price in paise
  volume?: number; // Trading volume (optional)
  source?: PriceSource; // Source of this price

  // Composite primary key: (securityId, date)
}

/**
 * Asset - Non-market assets
 * Bank accounts, FDs, property, cash, etc.
 */
export interface Asset {
  id: string; // UUID
  type: AssetType;
  name: string; // User-friendly name
  valuePaise: number; // Current value in paise
  repriceRule: RepriceRule; // How to update value
  linkedSecurityId?: string; // If repriceRule is 'link'

  // Additional metadata
  account?: string; // Account number (masked)
  maturityDate?: string; // For FDs, bonds
  interestRateBps?: number; // Interest rate in basis points (7.5% = 750)
  notes?: string;

  // Client-side
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * Liability - Loans and debts
 * Credit cards, home loans, car loans, etc.
 */
export interface Liability {
  id: string; // UUID
  type: LiabilityType;
  name: string; // User-friendly name
  outstandingPaise: number; // Current outstanding amount
  rateBps: number; // Interest rate in basis points (7.4% = 740)
  emiPaise?: number; // EMI amount if applicable
  nextDueDate?: string; // ISO date string

  // Additional metadata
  account?: string; // Account/loan number (masked)
  startDate?: string;
  maturityDate?: string;
  lender?: string;
  notes?: string;

  // Client-side
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * Goal - Financial goals with target tracking
 * Retirement, house purchase, child education, etc.
 */
export interface Goal {
  id: string; // UUID
  name: string; // User-friendly name
  targetValuePaise: number; // Goal amount in paise
  targetDate: string; // ISO date string
  priority: number; // 1-5, higher = more important
  strategy: GoalStrategy; // sip, lumpsum, hybrid
  currentCorpusPaise: number; // Current amount allocated
  assignedAccounts?: string; // JSON: mapping of accounts/holdings to %

  // Calculated fields (computed client-side)
  requiredSipPaise?: number; // Calculated required monthly SIP
  onTrack?: boolean; // Is goal on track?
  probabilitySuccess?: number; // Monte Carlo probability (0-1)

  // Metadata
  description?: string;
  icon?: string; // Icon name or emoji
  color?: string;

  // Client-side
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
}

/**
 * SyncLog - Server-side sync tracking
 * Used for conflict resolution and delta sync
 */
export interface SyncLog {
  id: string; // UUID
  userId: string;
  tableName: string; // Which table was synced
  recordId: string; // ID of the record
  clock: number; // Lamport or vector clock
  operation: 'insert' | 'update' | 'delete';
  timestamp: number; // Server timestamp
  deviceId?: string; // Client device identifier
  tombstone?: boolean; // Soft delete flag
}

/**
 * Clock - Client-side vector clock for sync
 * Stored in IndexedDB, tracks last known server state
 */
export interface Clock {
  tableName: string; // Table being tracked
  lastServerClock: number; // Last known server clock value
  lastSyncTs: number; // Last successful sync timestamp
  pendingOps: number; // Number of pending operations
}

/**
 * User - User profile and preferences
 * Minimal user data, mostly for client-side settings
 */
export interface User {
  id: string; // UUID
  email?: string;
  displayName?: string;
  createdAt: number;
  lastLoginAt: number;

  // Preferences
  defaultCurrency: Currency;
  baseCurrency: Currency; // For multi-currency conversion
  theme?: 'light' | 'dark' | 'auto';
  language?: string;

  // Encryption
  encryptionEnabled: boolean;
  keyWrapped?: Uint8Array; // WebAuthn-wrapped encryption key
}

/**
 * DeviceInfo - Device registration for sync
 */
export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  lastSeenAt: number;
  userAgent: string;
  publicKey?: string; // For device-to-device sync
}

/**
 * Helper type for encrypted row
 * When sync is enabled, we store both plaintext (local) and encrypted (for sync)
 */
export interface EncryptedRow<T> {
  plain: T; // Plaintext data (IndexedDB only)
  enc: Uint8Array; // Encrypted payload (for sync)
  nonce: Uint8Array; // Encryption nonce (unique per encryption)
}

/**
 * Timestamp helper for common timestamp fields
 */
export interface Timestamps {
  createdAt: number;
  updatedAt: number;
  deletedAt?: number; // For soft deletes
}

/**
 * Sync metadata attached to synced records
 */
export interface SyncMetadata {
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncedTs?: number;
  lastSyncError?: string;
  syncRetries: number;
}
