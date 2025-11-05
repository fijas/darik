/**
 * Securities Management
 *
 * CRUD operations for Security entities (mutual funds, stocks, ETFs, etc.)
 */

import { db } from './schema';
import type { Security } from '@/types/database';
import type { SecurityType, PriceSource } from '@/types/enums';

/**
 * Add a new security
 */
export async function addSecurity(
  security: Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'>
): Promise<Security> {
  const newSecurity: Security = {
    id: crypto.randomUUID(),
    syncStatus: 'pending',
    ...security,
  };

  await db.securities.add(newSecurity);

  // Mark for sync (increment pending ops)
  const clock = await db._clock.get('securities');
  if (clock) {
    await db._clock.update('securities', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }

  return newSecurity;
}

/**
 * Update an existing security
 */
export async function updateSecurity(
  id: string,
  updates: Partial<Omit<Security, 'id' | 'syncStatus' | 'lastSyncedTs'>>
): Promise<void> {
  await db.securities.update(id, {
    ...updates,
    syncStatus: 'pending',
  });

  // Mark for sync (increment pending ops)
  const clock = await db._clock.get('securities');
  if (clock) {
    await db._clock.update('securities', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }
}

/**
 * Delete a security (soft delete with tombstone)
 */
export async function deleteSecurity(id: string): Promise<void> {
  await db.securities.delete(id);

  // Mark as deleted for sync (increment pending ops)
  const clock = await db._clock.get('securities');
  if (clock) {
    await db._clock.update('securities', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }
}

/**
 * Get a security by ID
 */
export async function getSecurityById(id: string): Promise<Security | undefined> {
  return await db.securities.get(id);
}

/**
 * Get a security by symbol or code
 */
export async function getSecurityBySymbol(symbol: string): Promise<Security | undefined> {
  return await db.securities.where('symbol').equals(symbol).first();
}

/**
 * Search securities by name or symbol (fuzzy search)
 */
export async function searchSecurities(query: string, limit = 20): Promise<Security[]> {
  const lowerQuery = query.toLowerCase();

  // Search by both name and symbol
  const results = await db.securities
    .filter(
      (security) =>
        security.name.toLowerCase().includes(lowerQuery) ||
        security.symbol.toLowerCase().includes(lowerQuery)
    )
    .limit(limit)
    .toArray();

  return results;
}

/**
 * Get all securities of a specific type
 */
export async function getSecuritiesByType(type: SecurityType): Promise<Security[]> {
  return await db.securities.where('type').equals(type).toArray();
}

/**
 * Get all securities
 */
export async function getAllSecurities(): Promise<Security[]> {
  return await db.securities.toArray();
}

/**
 * Bulk add securities (for import/sync)
 */
export async function bulkAddSecurities(securities: Omit<Security, 'syncStatus' | 'lastSyncedTs'>[]): Promise<void> {
  const newSecurities: Security[] = securities.map((sec) => ({
    ...sec,
    syncStatus: 'synced', // Assume bulk imports are synced
  }));

  await db.securities.bulkPut(newSecurities);
}

/**
 * Get securities with their latest prices
 */
export async function getSecuritiesWithPrices(): Promise<
  Array<Security & { latestPrice?: number; priceDate?: string }>
> {
  const securities = await db.securities.toArray();

  // Get latest price for each security
  const securitiesWithPrices = await Promise.all(
    securities.map(async (security) => {
      const latestPrice = await db.prices
        .where('[securityId+date]')
        .between([security.id, '0000-00-00'], [security.id, '9999-99-99'], true, true)
        .reverse()
        .first();

      return {
        ...security,
        latestPrice: latestPrice?.pricePaise,
        priceDate: latestPrice?.date,
      };
    })
  );

  return securitiesWithPrices;
}

/**
 * Get or create a security by symbol
 * Useful when importing holdings - creates security if it doesn't exist
 */
export async function getOrCreateSecurity(
  symbol: string,
  defaults: Omit<Security, 'id' | 'symbol' | 'syncStatus' | 'lastSyncedTs'>
): Promise<Security> {
  let security = await getSecurityBySymbol(symbol);

  if (!security) {
    security = await addSecurity({
      symbol,
      ...defaults,
    });
  }

  return security;
}

/**
 * Get security statistics
 */
export async function getSecurityStats(): Promise<{
  totalSecurities: number;
  byType: Record<SecurityType, number>;
  withPrices: number;
}> {
  const securities = await db.securities.toArray();

  const byType: Record<string, number> = {};
  for (const sec of securities) {
    byType[sec.type] = (byType[sec.type] || 0) + 1;
  }

  // Count securities with at least one price
  const withPrices = await db.prices
    .orderBy('securityId')
    .uniqueKeys()
    .then((keys) => keys.length);

  return {
    totalSecurities: securities.length,
    byType: byType as Record<SecurityType, number>,
    withPrices,
  };
}

/**
 * Import securities from AMFI (mutual funds)
 * This would typically be called after fetching AMFI data
 */
export async function importAMFISecurities(
  schemes: Array<{
    schemeCode: string;
    schemeName: string;
    fundHouse: string;
    isin?: string;
  }>
): Promise<number> {
  const securities: Omit<Security, 'syncStatus' | 'lastSyncedTs'>[] = schemes.map((scheme) => ({
    id: `amfi_${scheme.schemeCode}`, // Stable ID based on AMFI code
    symbol: scheme.schemeCode,
    name: scheme.schemeName,
    type: 'mutual_fund' as SecurityType,
    priceSource: 'amfi' as PriceSource,
    decimals: 3, // MF units typically have 3 decimal places
    isin: scheme.isin,
    amc: scheme.fundHouse,
  }));

  await bulkAddSecurities(securities);
  return securities.length;
}
