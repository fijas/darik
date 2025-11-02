/**
 * Type definitions index
 * Central export point for all type definitions
 *
 * Usage:
 * import type { Transaction, TransactionCategory, ParsedExpense } from '@/types';
 */

// Enums
export * from './enums';

// Database schema
export * from './database';

// Parser types
export * from './parsed';

// Sync protocol
export * from './sync';

// Utility types
export type ID = string; // UUID type alias
export type Timestamp = number; // Epoch milliseconds
export type Paise = number; // Monetary value in paise (₹100 = 10000 paise)
export type Decimal = string; // Decimal as string for precision

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    timestamp: number;
    requestId?: string;
    version?: string;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Filter and sort options
 */
export interface QueryOptions {
  filter?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

/**
 * Date range for queries
 */
export interface DateRange {
  from: Date | string;
  to: Date | string;
}

/**
 * Money value with currency
 */
export interface Money {
  amountPaise: Paise;
  currency: string;
  formatted?: string; // ₹1,234.56
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Optional field helper
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make all properties of T required and non-nullable
 */
export type RequiredNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
