/**
 * CSV Import Parsers
 *
 * Support for importing holdings from various sources:
 * - CAMS (Computer Age Management Services)
 * - KFintech (KFin Technologies)
 * - Kuvera
 * - Zerodha
 */

import type { Holding, Security, Lot } from '@/types/database';
import { stringifyLots } from '../db/holdings';

/**
 * CSV Import Result
 */
export interface CSVImportResult {
  success: boolean;
  holdings: Array<{
    security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'>;
    holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'>;
  }>;
  errors: string[];
  summary: {
    totalRows: number;
    successfulImports: number;
    failedImports: number;
  };
}

/**
 * Detected CSV format
 */
export type CSVFormat = 'cams' | 'kfintech' | 'kuvera' | 'zerodha' | 'generic' | 'unknown';

/**
 * Parse CSV text into rows
 */
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    // Simple CSV parsing (doesn't handle complex cases like quoted commas)
    const row = line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''));
    rows.push(row);
  }

  return rows;
}

/**
 * Detect CSV format from headers
 */
export function detectCSVFormat(rows: string[][]): CSVFormat {
  if (rows.length === 0 || !rows[0]) return 'unknown';

  const headers = rows[0].map((h) => h.toLowerCase());

  // CAMS format detection
  if (
    headers.includes('scheme') &&
    headers.includes('folio no') &&
    headers.includes('closing unit balance')
  ) {
    return 'cams';
  }

  // KFintech format detection
  if (
    headers.includes('fund') &&
    headers.includes('scheme name') &&
    headers.includes('balance units')
  ) {
    return 'kfintech';
  }

  // Kuvera format detection
  if (headers.includes('fund house') && headers.includes('scheme') && headers.includes('units')) {
    return 'kuvera';
  }

  // Zerodha format detection
  if (headers.includes('symbol') && headers.includes('quantity') && headers.includes('average')) {
    return 'zerodha';
  }

  return 'generic';
}

/**
 * Parse CAMS statement CSV
 *
 * Expected columns:
 * - Scheme, Folio No, Closing Unit Balance, Closing Unit Balance Valuation, Cost Value, Average NAV
 */
export function parseCAMSCSV(rows: string[][]): CSVImportResult {
  const result: CSVImportResult = {
    success: true,
    holdings: [],
    errors: [],
    summary: {
      totalRows: rows.length - 1, // Exclude header
      successfulImports: 0,
      failedImports: 0,
    },
  };

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    try {
      const schemeName = row[0] || '';
      const folioNo = row[1] || '';
      const units = parseFloat(row[2] || '0');
      const costValue = parseFloat(row[4] || '0');

      if (!schemeName || units === 0) {
        result.errors.push(`Row ${i + 1}: Missing scheme name or zero units`);
        result.summary.failedImports++;
        continue;
      }

      // Convert rupees to paise
      const costValuePaise = Math.round(costValue * 100);
      const avgCostPaise = Math.round((costValuePaise / units) * 100) / 100;

      // Create security
      const security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        symbol: schemeName.substring(0, 50), // Use scheme name as symbol for now
        name: schemeName,
        type: 'mf',
        priceSource: 'amfi',
        decimals: 3,
      };

      // Create holding with a single lot
      const lot: Lot = {
        units: units.toFixed(3),
        costPaise: avgCostPaise,
        ts: Date.now(), // Unknown purchase date, use current time
      };

      const holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        securityId: '', // Will be set during import
        units: units.toFixed(3),
        avgCostPaise,
        account: `CAMS_${folioNo}`,
        lots: stringifyLots([lot]),
      };

      result.holdings.push({ security, holding });
      result.summary.successfulImports++;
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      result.summary.failedImports++;
    }
  }

  return result;
}

/**
 * Parse KFintech statement CSV
 */
export function parseKFinTechCSV(rows: string[][]): CSVImportResult {
  const result: CSVImportResult = {
    success: true,
    holdings: [],
    errors: [],
    summary: {
      totalRows: rows.length - 1,
      successfulImports: 0,
      failedImports: 0,
    },
  };

  // Similar to CAMS but with different column names
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    try {
      const fundHouse = row[0] || '';
      const schemeName = row[1] || '';
      const folioNo = row[2] || '';
      const units = parseFloat(row[3] || '0');
      const nav = parseFloat(row[4] || '0');
      const currentValue = parseFloat(row[5] || '0');

      if (!schemeName || units === 0) {
        result.errors.push(`Row ${i + 1}: Missing scheme name or zero units`);
        result.summary.failedImports++;
        continue;
      }

      const navPaise = Math.round(nav * 100);
      const currentValuePaise = Math.round(currentValue * 100);
      const avgCostPaise = Math.round((currentValuePaise / units) * 100) / 100;

      const security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        symbol: schemeName.substring(0, 50),
        name: schemeName,
        type: 'mf',
        priceSource: 'amfi',
        decimals: 3,
        amc: fundHouse,
      };

      const lot: Lot = {
        units: units.toFixed(3),
        costPaise: avgCostPaise,
        ts: Date.now(),
      };

      const holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        securityId: '',
        units: units.toFixed(3),
        avgCostPaise,
        account: `KFIN_${folioNo}`,
        lots: stringifyLots([lot]),
      };

      result.holdings.push({ security, holding });
      result.summary.successfulImports++;
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      result.summary.failedImports++;
    }
  }

  return result;
}

/**
 * Parse Kuvera export CSV
 */
export function parseKuveraCSV(rows: string[][]): CSVImportResult {
  const result: CSVImportResult = {
    success: true,
    holdings: [],
    errors: [],
    summary: {
      totalRows: rows.length - 1,
      successfulImports: 0,
      failedImports: 0,
    },
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    try {
      const fundHouse = row[0] || '';
      const scheme = row[1] || '';
      const units = parseFloat(row[2] || '0');
      const avgNav = parseFloat(row[3] || '0');
      const invested = parseFloat(row[4] || '0');
      const currentValue = parseFloat(row[5] || '0');

      if (!scheme || units === 0) {
        result.errors.push(`Row ${i + 1}: Missing scheme or zero units`);
        result.summary.failedImports++;
        continue;
      }

      const avgNavPaise = Math.round(avgNav * 100);
      const investedPaise = Math.round(invested * 100);
      const avgCostPaise = Math.round((investedPaise / units) * 100) / 100;

      const security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        symbol: scheme.substring(0, 50),
        name: scheme,
        type: 'mf',
        priceSource: 'amfi',
        decimals: 3,
        amc: fundHouse,
      };

      const lot: Lot = {
        units: units.toFixed(3),
        costPaise: avgCostPaise,
        ts: Date.now(),
      };

      const holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        securityId: '',
        units: units.toFixed(3),
        avgCostPaise,
        account: 'Kuvera',
        lots: stringifyLots([lot]),
      };

      result.holdings.push({ security, holding });
      result.summary.successfulImports++;
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      result.summary.failedImports++;
    }
  }

  return result;
}

/**
 * Parse Zerodha holdings CSV
 */
export function parseZerodhaCSV(rows: string[][]): CSVImportResult {
  const result: CSVImportResult = {
    success: true,
    holdings: [],
    errors: [],
    summary: {
      totalRows: rows.length - 1,
      successfulImports: 0,
      failedImports: 0,
    },
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    try {
      const symbol = row[0] || '';
      const quantity = parseFloat(row[1] || '0');
      const avgPrice = parseFloat(row[2] || '0');
      const ltp = parseFloat(row[3] || '0');

      if (!symbol || quantity === 0) {
        result.errors.push(`Row ${i + 1}: Missing symbol or zero quantity`);
        result.summary.failedImports++;
        continue;
      }

      const avgPricePaise = Math.round(avgPrice * 100);
      const ltpPaise = Math.round(ltp * 100);

      const security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        symbol,
        name: symbol, // Zerodha uses symbol as name
        type: 'equity',
        priceSource: 'manual',
        decimals: 2,
        exchange: 'NSE',
      };

      const lot: Lot = {
        units: quantity.toString(),
        costPaise: avgPricePaise,
        ts: Date.now(),
      };

      const holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'> = {
        securityId: '',
        units: quantity.toString(),
        avgCostPaise: avgPricePaise,
        account: 'Zerodha',
        lots: stringifyLots([lot]),
      };

      result.holdings.push({ security, holding });
      result.summary.successfulImports++;
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      result.summary.failedImports++;
    }
  }

  return result;
}

/**
 * Import CSV based on detected format
 */
export function importCSV(csvText: string): CSVImportResult {
  const rows = parseCSV(csvText);

  if (rows.length === 0) {
    return {
      success: false,
      holdings: [],
      errors: ['Empty CSV file'],
      summary: {
        totalRows: 0,
        successfulImports: 0,
        failedImports: 0,
      },
    };
  }

  const format = detectCSVFormat(rows);

  switch (format) {
    case 'cams':
      return parseCAMSCSV(rows);
    case 'kfintech':
      return parseKFinTechCSV(rows);
    case 'kuvera':
      return parseKuveraCSV(rows);
    case 'zerodha':
      return parseZerodhaCSV(rows);
    default:
      return {
        success: false,
        holdings: [],
        errors: ['Unknown CSV format. Supported formats: CAMS, KFintech, Kuvera, Zerodha'],
        summary: {
          totalRows: rows.length - 1,
          successfulImports: 0,
          failedImports: rows.length - 1,
        },
      };
  }
}
