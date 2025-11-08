/**
 * Holdings Management
 *
 * CRUD operations for Holding entities (ownership of securities)
 * Includes lot-level tracking for tax calculations (FIFO/LIFO)
 */

import { db } from './schema';
import type { Holding, Lot } from '@/types/database';
import { getSecurityById } from './securities';

/**
 * Add a new holding
 */
export async function addHolding(
  holding: Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'>
): Promise<Holding> {
  const newHolding: Holding = {
    id: crypto.randomUUID(),
    syncStatus: 'pending',
    ...holding,
  };

  await db.holdings.add(newHolding);

  // Mark for sync (increment pending ops)
  const clock = await db._clock.get('holdings');
  if (clock) {
    await db._clock.update('holdings', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }

  return newHolding;
}

/**
 * Update an existing holding
 */
export async function updateHolding(
  id: string,
  updates: Partial<Omit<Holding, 'id' | 'syncStatus' | 'lastSyncedTs'>>
): Promise<void> {
  await db.holdings.update(id, {
    ...updates,
    syncStatus: 'pending',
  });

  // Mark for sync (increment pending ops)
  const clock = await db._clock.get('holdings');
  if (clock) {
    await db._clock.update('holdings', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }
}

/**
 * Delete a holding (soft delete with tombstone)
 */
export async function deleteHolding(id: string): Promise<void> {
  await db.holdings.delete(id);

  // Mark as deleted for sync (increment pending ops)
  const clock = await db._clock.get('holdings');
  if (clock) {
    await db._clock.update('holdings', {
      pendingOps: (clock.pendingOps || 0) + 1,
    });
  }
}

/**
 * Get a holding by ID
 */
export async function getHoldingById(id: string): Promise<Holding | undefined> {
  return await db.holdings.get(id);
}

/**
 * Get all holdings for a specific security
 */
export async function getHoldingsBySecurity(securityId: string): Promise<Holding[]> {
  return await db.holdings.where('securityId').equals(securityId).toArray();
}

/**
 * Get all holdings for a specific account/broker
 */
export async function getHoldingsByAccount(account: string): Promise<Holding[]> {
  return await db.holdings.where('account').equals(account).toArray();
}

/**
 * Get all holdings
 */
export async function getAllHoldings(): Promise<Holding[]> {
  return await db.holdings.toArray();
}

/**
 * Get holdings with security details
 */
export async function getHoldingsWithSecurities(): Promise<
  Array<Holding & { security?: any }>
> {
  const holdings = await db.holdings.toArray();

  const holdingsWithSecurities = await Promise.all(
    holdings.map(async (holding) => {
      const security = await getSecurityById(holding.securityId);
      return {
        ...holding,
        security,
      };
    })
  );

  return holdingsWithSecurities;
}

/**
 * Parse lots from JSON string
 */
export function parseLots(lotsJson: string): Lot[] {
  try {
    return JSON.parse(lotsJson);
  } catch (error) {
    console.error('Failed to parse lots:', error);
    return [];
  }
}

/**
 * Stringify lots to JSON
 */
export function stringifyLots(lots: Lot[]): string {
  return JSON.stringify(lots);
}

/**
 * Add a new lot to an existing holding (buy transaction)
 */
export async function addLotToHolding(
  holdingId: string,
  lot: Lot
): Promise<void> {
  const holding = await getHoldingById(holdingId);
  if (!holding) {
    throw new Error(`Holding not found: ${holdingId}`);
  }

  const lots = parseLots(holding.lots);
  lots.push(lot);

  // Recalculate total units and average cost
  const totalUnits = lots.reduce((sum, l) => sum + parseFloat(l.units), 0);
  const totalCost = lots.reduce((sum, l) => sum + parseFloat(l.units) * l.costPaise, 0);
  const avgCostPaise = Math.round(totalCost / totalUnits);

  await updateHolding(holdingId, {
    units: totalUnits.toFixed(3),
    avgCostPaise,
    lots: stringifyLots(lots),
  });
}

/**
 * Sell units from a holding (FIFO method)
 * Returns the lots sold and their costs
 */
export async function sellUnitsFromHolding(
  holdingId: string,
  unitsToSell: number,
  method: 'fifo' | 'lifo' = 'fifo'
): Promise<{ soldLots: Lot[]; remainingLots: Lot[]; totalCost: number }> {
  const holding = await getHoldingById(holdingId);
  if (!holding) {
    throw new Error(`Holding not found: ${holdingId}`);
  }

  const lots = parseLots(holding.lots);

  // Sort lots by date
  if (method === 'fifo') {
    lots.sort((a, b) => a.ts - b.ts); // Oldest first
  } else {
    lots.sort((a, b) => b.ts - a.ts); // Newest first
  }

  let remainingUnitsToSell = unitsToSell;
  const soldLots: Lot[] = [];
  const remainingLots: Lot[] = [];
  let totalCost = 0;

  for (const lot of lots) {
    const lotUnits = parseFloat(lot.units);

    if (remainingUnitsToSell <= 0) {
      // No more units to sell, keep this lot
      remainingLots.push(lot);
      continue;
    }

    if (lotUnits <= remainingUnitsToSell) {
      // Sell the entire lot
      soldLots.push(lot);
      totalCost += lotUnits * lot.costPaise;
      remainingUnitsToSell -= lotUnits;
    } else {
      // Partially sell this lot
      const unitsSold = remainingUnitsToSell;
      const unitsRemaining = lotUnits - unitsSold;

      soldLots.push({
        ...lot,
        units: unitsSold.toFixed(3),
      });

      remainingLots.push({
        ...lot,
        units: unitsRemaining.toFixed(3),
      });

      totalCost += unitsSold * lot.costPaise;
      remainingUnitsToSell = 0;
    }
  }

  if (remainingUnitsToSell > 0) {
    throw new Error(
      `Insufficient units to sell. Required: ${unitsToSell}, Available: ${parseFloat(holding.units)}`
    );
  }

  // Update holding with remaining lots
  const totalUnits = remainingLots.reduce((sum, l) => sum + parseFloat(l.units), 0);
  const avgCostPaise =
    totalUnits > 0
      ? Math.round(
          remainingLots.reduce((sum, l) => sum + parseFloat(l.units) * l.costPaise, 0) / totalUnits
        )
      : 0;

  if (totalUnits === 0) {
    // No units left, delete the holding
    await deleteHolding(holdingId);
  } else {
    await updateHolding(holdingId, {
      units: totalUnits.toFixed(3),
      avgCostPaise,
      lots: stringifyLots(remainingLots),
    });
  }

  return { soldLots, remainingLots, totalCost };
}

/**
 * Get or create a holding for a security and account
 * Useful when importing holdings - creates holding if it doesn't exist
 */
export async function getOrCreateHolding(
  securityId: string,
  account: string
): Promise<Holding> {
  // Check if holding already exists
  const existingHolding = await db.holdings
    .where('[securityId+account]')
    .equals([securityId, account])
    .first();

  if (existingHolding) {
    return existingHolding;
  }

  // Create new holding
  return await addHolding({
    securityId,
    account,
    units: '0',
    avgCostPaise: 0,
    lots: stringifyLots([]),
  });
}

/**
 * Bulk add holdings (for import/sync)
 */
export async function bulkAddHoldings(
  holdings: Omit<Holding, 'syncStatus' | 'lastSyncedTs'>[]
): Promise<void> {
  const newHoldings: Holding[] = holdings.map((holding) => ({
    ...holding,
    syncStatus: 'synced', // Assume bulk imports are synced
  }));

  await db.holdings.bulkPut(newHoldings);
}

/**
 * Get portfolio summary
 */
export async function getPortfolioSummary(): Promise<{
  totalHoldings: number;
  totalSecurities: number;
  accounts: string[];
}> {
  const holdings = await db.holdings.toArray();

  const uniqueSecurities = new Set(holdings.map((h) => h.securityId));
  const uniqueAccounts = new Set(holdings.map((h) => h.account));

  return {
    totalHoldings: holdings.length,
    totalSecurities: uniqueSecurities.size,
    accounts: Array.from(uniqueAccounts),
  };
}

/**
 * Calculate total invested amount for a holding
 */
export function calculateInvestedAmount(holding: Holding): number {
  const units = parseFloat(holding.units);
  return Math.round(units * holding.avgCostPaise);
}

/**
 * Calculate current value of a holding given current price
 */
export function calculateCurrentValue(holding: Holding, currentPricePaise: number): number {
  const units = parseFloat(holding.units);
  return Math.round(units * currentPricePaise);
}

/**
 * Calculate unrealized P&L for a holding
 */
export function calculateUnrealizedPnL(holding: Holding, currentPricePaise: number): {
  pnlPaise: number;
  pnlPercent: number;
} {
  const invested = calculateInvestedAmount(holding);
  const current = calculateCurrentValue(holding, currentPricePaise);
  const pnlPaise = current - invested;
  const pnlPercent = invested > 0 ? (pnlPaise / invested) * 100 : 0;

  return { pnlPaise, pnlPercent };
}
