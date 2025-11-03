/**
 * Application Configuration
 * Central configuration for sync intervals, cache strategies, feature flags, and API endpoints
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL for the Cloudflare Worker API
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',

  // API endpoints
  endpoints: {
    health: '/api/health',

    // Auth endpoints
    auth: {
      passkeyRegisterBegin: '/api/auth/passkey/register/begin',
      passkeyRegisterFinish: '/api/auth/passkey/register/finish',
      passkeyLoginBegin: '/api/auth/passkey/login/begin',
      passkeyLoginFinish: '/api/auth/passkey/login/finish',
      logout: '/api/auth/logout',
    },

    // Sync endpoints
    sync: {
      transactions: {
        pull: '/api/sync/transactions/pull',
        push: '/api/sync/transactions/push',
      },
      securities: {
        pull: '/api/sync/securities/pull',
        push: '/api/sync/securities/push',
      },
      holdings: {
        pull: '/api/sync/holdings/pull',
        push: '/api/sync/holdings/push',
      },
      prices: {
        pull: '/api/sync/prices/pull',
        push: '/api/sync/prices/push',
      },
      assets: {
        pull: '/api/sync/assets/pull',
        push: '/api/sync/assets/push',
      },
      liabilities: {
        pull: '/api/sync/liabilities/pull',
        push: '/api/sync/liabilities/push',
      },
      goals: {
        pull: '/api/sync/goals/pull',
        push: '/api/sync/goals/push',
      },
    },

    // Price data endpoints
    prices: {
      fetch: '/api/prices/fetch', // Trigger manual price fetch
      latest: '/api/prices/latest', // Get latest prices
    },
  },

  // Request timeouts (milliseconds)
  timeout: {
    default: 30000, // 30 seconds
    sync: 60000, // 60 seconds for sync operations
    upload: 120000, // 2 minutes for file uploads
  },
} as const;

/**
 * Sync Engine Configuration
 */
export const SYNC_CONFIG = {
  // Auto-sync settings
  enabled: true,
  autoSync: true, // Automatically sync on changes
  syncInterval: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Batch sizes
  batchSize: 500, // Max rows per sync request
  maxRetries: 3, // Max retry attempts for failed syncs

  // Retry backoff configuration
  retryBackoff: {
    initial: 1000, // 1 second initial delay
    max: 30000, // 30 seconds max delay
    multiplier: 2, // Exponential backoff multiplier
  },

  // Conflict resolution strategy
  conflictResolution: 'last_write_wins' as const, // 'last_write_wins' | 'merge' | 'manual'

  // Sync triggers
  syncOnFocus: true, // Sync when app gains focus
  syncOnNetwork: true, // Sync when network is restored
  syncOnVisibilityChange: true, // Sync when tab becomes visible

  // Compression
  compressPayloads: true, // Use gzip compression for sync

  // Encryption
  encryptionEnabled: true, // Encrypt data before syncing to server
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  // Cache strategies for service worker
  strategies: {
    static: 'CacheFirst', // Static assets (JS, CSS, images)
    api: 'NetworkFirst', // API calls
    images: 'CacheFirst', // User-uploaded images
  },

  // Cache expiration times (milliseconds)
  expiration: {
    static: 7 * 24 * 60 * 60 * 1000, // 7 days
    api: 5 * 60 * 1000, // 5 minutes
    images: 30 * 24 * 60 * 60 * 1000, // 30 days
    prices: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Max cache sizes
  maxEntries: {
    static: 60,
    api: 50,
    images: 100,
  },
} as const;

/**
 * Feature Flags
 * Toggle features on/off for development or gradual rollout
 */
export const FEATURES = {
  // Core features
  voiceInput: true,
  ocrScanning: false, // Not yet implemented
  telegramBot: false, // Not yet implemented
  smsImport: false, // Not yet implemented

  // Advanced features
  encryption: true,
  passkeys: true,
  biometricAuth: false, // Future: fingerprint/face ID

  // Portfolio features
  portfolioTracking: true,
  priceUpdates: true,
  csvImport: true,
  goalTracking: true,
  rebalancing: true,

  // Analytics
  analytics: false, // Privacy-first: no analytics by default
  errorTracking: false,

  // Development
  devMode: process.env.NODE_ENV === 'development',
  debugLogging: process.env.NODE_ENV === 'development',
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  // Pagination
  defaultPageSize: 50,
  transactionsPerPage: 50,
  securitiesPerPage: 20,

  // Debounce delays (milliseconds)
  debounce: {
    search: 300,
    input: 500,
    parser: 300, // Expense parser debounce
  },

  // Animation durations (milliseconds)
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Date formats
  dateFormats: {
    short: 'MMM d', // Jan 1
    medium: 'MMM d, yyyy', // Jan 1, 2024
    long: 'MMMM d, yyyy', // January 1, 2024
    time: 'h:mm a', // 3:30 PM
    datetime: 'MMM d, yyyy h:mm a', // Jan 1, 2024 3:30 PM
  },

  // Currency formatting
  currency: {
    locale: 'en-IN',
    defaultCurrency: 'INR',
    showDecimals: true,
  },

  // Theme
  defaultTheme: 'auto' as const, // 'light' | 'dark' | 'auto'
} as const;

/**
 * Parser Configuration
 */
export const PARSER_CONFIG = {
  // Minimum confidence threshold to auto-accept parsed values
  minConfidenceThreshold: 0.8,

  // Enable AI suggestions for ambiguous cases
  enableAISuggestions: false, // Not yet implemented

  // Strict mode: require all fields or allow partial matches
  strictMode: false,

  // Date parsing
  dateFormats: [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'dd.MM.yyyy',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
  ],

  // Currency symbols recognized
  currencySymbols: {
    '₹': 'INR',
    'Rs': 'INR',
    'Rs.': 'INR',
    INR: 'INR',
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
  },

  // Voice input corrections
  enableVoiceCorrection: true,
} as const;

/**
 * Database Configuration
 */
export const DB_CONFIG = {
  name: 'darik-finance',
  version: 1,

  // Transaction limits
  maxTransactionsToKeep: 10000, // Keep last 10k transactions locally

  // Cleanup intervals
  cleanupInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
  tombstoneRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  // Transaction limits
  transaction: {
    maxAmountPaise: 10_00_00_000, // ₹1 crore max
    minAmountPaise: 1, // ₹0.01 min (1 paisa)
    maxNoteLength: 500,
    maxMerchantLength: 200,
  },

  // Security limits
  security: {
    maxNameLength: 200,
    maxSymbolLength: 50,
  },

  // Asset/Liability limits
  asset: {
    maxValuePaise: 1000_00_00_000, // ₹100 crore max
    maxNameLength: 200,
  },

  // Goal limits
  goal: {
    maxTargetPaise: 1000_00_00_000, // ₹100 crore max
    maxNameLength: 200,
    minPriority: 1,
    maxPriority: 5,
  },
} as const;

/**
 * Storage Keys
 * Keys used for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  theme: 'darik:theme',
  user: 'darik:user',
  deviceId: 'darik:deviceId',
  lastSyncAt: 'darik:lastSyncAt',
  encryptionEnabled: 'darik:encryptionEnabled',
  onboardingCompleted: 'darik:onboardingCompleted',
} as const;

/**
 * App Metadata
 */
export const APP_META = {
  name: 'Darik',
  fullName: 'Darik - Personal Finance Tracker',
  version: '0.1.0',
  description: 'Local-first personal finance tracker with end-to-end encryption',
  author: 'Darik Team',
  repository: 'https://github.com/yourusername/darik',
  license: 'MIT',
} as const;

/**
 * Network Status Thresholds
 */
export const NETWORK_CONFIG = {
  // Sync policy based on connection type
  syncOnMetered: false, // Don't sync on mobile data by default
  syncOnSlow: true, // Sync even on slow connections

  // Connection quality thresholds
  slowConnectionRtt: 500, // Consider connection slow if RTT > 500ms
  maxPayloadSizeOnSlow: 100_000, // 100KB max payload on slow connections
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  network: {
    offline: 'You are offline. Changes will sync when you reconnect.',
    timeout: 'Request timed out. Please try again.',
    serverError: 'Server error. Please try again later.',
  },
  auth: {
    unauthorized: 'You are not authorized. Please log in.',
    sessionExpired: 'Your session has expired. Please log in again.',
    passkeyFailed: 'Passkey authentication failed.',
  },
  sync: {
    failed: 'Sync failed. Will retry automatically.',
    conflict: 'Sync conflict detected. Please resolve manually.',
  },
  validation: {
    required: 'This field is required.',
    invalidAmount: 'Please enter a valid amount.',
    invalidDate: 'Please enter a valid date.',
  },
} as const;
