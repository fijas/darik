/**
 * Utility Functions
 * Common helper functions used across the app
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in paise to rupees string
 * @param amountPaise - Amount in paise (100 paise = ₹1)
 * @param showSymbol - Whether to show ₹ symbol
 * @returns Formatted string like "₹1,234.56"
 */
export function formatCurrency(amountPaise: number, showSymbol = true): string {
  const rupees = amountPaise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Parse rupees string to paise
 * @param input - String like "100.50" or "₹100.50"
 * @returns Amount in paise
 */
export function parseCurrency(input: string): number {
  const cleaned = input.replace(/[₹,\s]/g, '');
  const rupees = parseFloat(cleaned);
  return Math.round(rupees * 100);
}

/**
 * Format date using date-fns
 * @param date - Date object or timestamp
 * @param _formatStr - Format string (unused for now, will be used with date-fns)
 */
export function formatDate(date: Date | number, _formatStr = 'MMM d, yyyy'): string {
  // Will use date-fns when we integrate it
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN');
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if code is running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (!isBrowser) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get device ID from localStorage or create new one
 */
export function getDeviceId(): string {
  if (!isBrowser) return 'server';

  let deviceId = localStorage.getItem('darik:deviceId');
  if (!deviceId) {
    deviceId = generateId();
    localStorage.setItem('darik:deviceId', deviceId);
  }
  return deviceId;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
