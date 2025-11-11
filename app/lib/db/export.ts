/**
 * Data Export Utilities
 * Functions to export app data in various formats
 */

import { db } from './schema';
import type {
  Transaction,
  Security,
  Holding,
  Price,
  Asset,
  Liability,
  Goal,
} from '@/types/database';

export interface ExportData {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  securities: Security[];
  holdings: Holding[];
  prices: Price[];
  assets: Asset[];
  liabilities: Liability[];
  goals: Goal[];
}

/**
 * Export all data as JSON
 */
export async function exportDataAsJSON(): Promise<string> {
  const [
    transactions,
    securities,
    holdings,
    prices,
    assets,
    liabilities,
    goals,
  ] = await Promise.all([
    db.transactions.toArray(),
    db.securities.toArray(),
    db.holdings.toArray(),
    db.prices.toArray(),
    db.assets.toArray(),
    db.liabilities.toArray(),
    db.goals.toArray(),
  ]);

  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    transactions,
    securities,
    holdings,
    prices,
    assets,
    liabilities,
    goals,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export transactions as CSV
 */
export async function exportTransactionsAsCSV(): Promise<string> {
  const transactions = await db.transactions.orderBy('createdTs').reverse().toArray();

  const headers = [
    'Date',
    'Type',
    'Merchant',
    'Amount (₹)',
    'Category',
    'Payment Method',
    'Note',
  ];

  const rows = transactions.map((t) => [
    new Date(t.createdTs).toISOString().split('T')[0],
    t.type,
    t.merchant || '',
    (t.amountPaise / 100).toFixed(2),
    t.category || '',
    t.method || '',
    t.note || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all data as JSON file
 */
export async function exportAllData() {
  const json = await exportDataAsJSON();
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `darik-export-${timestamp}.json`, 'application/json');
}

/**
 * Export transactions as CSV file
 */
export async function exportTransactionsCSV() {
  const csv = await exportTransactionsAsCSV();
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `darik-transactions-${timestamp}.csv`, 'text/csv');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [
    transactionCount,
    securityCount,
    holdingCount,
    priceCount,
    assetCount,
    liabilityCount,
    goalCount,
  ] = await Promise.all([
    db.transactions.count(),
    db.securities.count(),
    db.holdings.count(),
    db.prices.count(),
    db.assets.count(),
    db.liabilities.count(),
    db.goals.count(),
  ]);

  return {
    transactions: transactionCount,
    securities: securityCount,
    holdings: holdingCount,
    prices: priceCount,
    assets: assetCount,
    liabilities: liabilityCount,
    goals: goalCount,
    total:
      transactionCount +
      securityCount +
      holdingCount +
      priceCount +
      assetCount +
      liabilityCount +
      goalCount,
  };
}

/**
 * Delete all data from database (use with caution!)
 */
export async function deleteAllData() {
  await Promise.all([
    db.transactions.clear(),
    db.securities.clear(),
    db.holdings.clear(),
    db.prices.clear(),
    db.assets.clear(),
    db.liabilities.clear(),
    db.goals.clear(),
    db._clock.clear(),
  ]);
}
