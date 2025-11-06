/**
 * Assets Database Operations
 *
 * CRUD operations for assets in IndexedDB (Dexie)
 */

import { db } from './schema';
import { Asset } from '@/types/database';
import { AssetType, RepriceRule } from '@/types/enums';

/**
 * Add a new asset
 */
export async function addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'clock'>): Promise<string> {
  const now = Date.now();
  const clock = await db.getNextClock();

  const newAsset: Asset = {
    ...asset,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    clock,
  };

  await db.assets.add(newAsset);
  return newAsset.id;
}

/**
 * Update an existing asset
 */
export async function updateAsset(
  id: string,
  updates: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'clock'>>
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.assets.update(id, {
    ...updates,
    updatedAt: now,
    clock,
  });
}

/**
 * Delete an asset (soft delete with tombstone)
 */
export async function deleteAsset(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.assets.update(id, {
    deletedAt: now,
    updatedAt: now,
    clock,
  });
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: string): Promise<Asset | undefined> {
  const asset = await db.assets.get(id);
  // Filter out soft-deleted assets
  if (asset?.deletedAt) return undefined;
  return asset;
}

/**
 * Get all active assets (not deleted)
 */
export async function getAllAssets(): Promise<Asset[]> {
  return db.assets
    .filter(asset => !asset.deletedAt)
    .toArray();
}

/**
 * Get assets by type
 */
export async function getAssetsByType(type: Asset['type']): Promise<Asset[]> {
  return db.assets
    .filter(asset => !asset.deletedAt && asset.type === type)
    .toArray();
}

/**
 * Get assets by multiple types
 */
export async function getAssetsByTypes(types: Asset['type'][]): Promise<Asset[]> {
  return db.assets
    .filter(asset => !asset.deletedAt && types.includes(asset.type))
    .toArray();
}

/**
 * Get liquid assets (bank, cash, emergency_fund)
 */
export async function getLiquidAssets(): Promise<Asset[]> {
  return getAssetsByTypes([AssetType.BANK, AssetType.CASH, AssetType.EMERGENCY_FUND]);
}

/**
 * Get investment assets (ppf, epf, nps, fd, etc.)
 */
export async function getInvestmentAssets(): Promise<Asset[]> {
  return getAssetsByTypes([
    AssetType.PPF,
    AssetType.EPF,
    AssetType.NPS,
    AssetType.FIXED_DEPOSIT,
    AssetType.BONDS,
    AssetType.CRYPTO,
    AssetType.OTHER_INVESTMENT,
  ]);
}

/**
 * Get physical assets (property, vehicle, gold, etc.)
 */
export async function getPhysicalAssets(): Promise<Asset[]> {
  return getAssetsByTypes([
    AssetType.PROPERTY,
    AssetType.VEHICLE,
    AssetType.GOLD_PHYSICAL,
    AssetType.JEWELRY,
    AssetType.OTHER_PHYSICAL,
  ]);
}

/**
 * Calculate total asset value
 */
export async function getTotalAssetValue(): Promise<number> {
  const assets = await getAllAssets();
  return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
}

/**
 * Calculate asset value by type
 */
export async function getAssetValueByType(type: Asset['type']): Promise<number> {
  const assets = await getAssetsByType(type);
  return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
}

/**
 * Get assets grouped by category
 */
export async function getAssetsGroupedByCategory(): Promise<Record<string, Asset[]>> {
  const assets = await getAllAssets();
  const grouped: Record<string, Asset[]> = {};

  assets.forEach(asset => {
    const category = asset.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(asset);
  });

  return grouped;
}

/**
 * Get asset allocation breakdown
 */
export async function getAssetAllocation(): Promise<{
  liquid: number;
  investment: number;
  physical: number;
  total: number;
}> {
  const [liquid, investment, physical] = await Promise.all([
    getLiquidAssets(),
    getInvestmentAssets(),
    getPhysicalAssets(),
  ]);

  const liquidValue = liquid.reduce((sum, a) => sum + a.currentValue, 0);
  const investmentValue = investment.reduce((sum, a) => sum + a.currentValue, 0);
  const physicalValue = physical.reduce((sum, a) => sum + a.currentValue, 0);

  return {
    liquid: liquidValue,
    investment: investmentValue,
    physical: physicalValue,
    total: liquidValue + investmentValue + physicalValue,
  };
}

/**
 * Search assets by name or notes
 */
export async function searchAssets(query: string): Promise<Asset[]> {
  const lowerQuery = query.toLowerCase();

  return db.assets
    .filter(asset => {
      if (asset.deletedAt) return false;
      return (
        asset.name.toLowerCase().includes(lowerQuery) ||
        (asset.notes?.toLowerCase().includes(lowerQuery) ?? false)
      );
    })
    .toArray();
}

/**
 * Update asset value (for repricing)
 */
export async function updateAssetValue(
  id: string,
  newValue: number
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.assets.update(id, {
    currentValue: newValue,
    lastRepriced: now,
    updatedAt: now,
    clock,
  });
}

/**
 * Bulk update asset values (for automated repricing)
 */
export async function bulkUpdateAssetValues(
  updates: Array<{ id: string; value: number }>
): Promise<void> {
  const now = Date.now();

  await db.transaction('rw', db.assets, db._clock, async () => {
    const clock = await db.getNextClock();

    for (const { id, value } of updates) {
      await db.assets.update(id, {
        currentValue: value,
        lastRepriced: now,
        updatedAt: now,
        clock,
      });
    }
  });
}

/**
 * Get assets that need repricing
 */
export async function getAssetsDueForRepricing(): Promise<Asset[]> {
  const now = Date.now();
  const assets = await getAllAssets();

  return assets.filter(asset => {
    if (!asset.repriceRule) return false;
    if (!asset.lastRepriced) return true; // Never repriced

    const daysSinceRepricing = (now - asset.lastRepriced) / (1000 * 60 * 60 * 24);

    switch (asset.repriceRule) {
      case RepriceRule.MANUAL:
        return false;
      case RepriceRule.DAILY:
        return daysSinceRepricing >= 1;
      case RepriceRule.WEEKLY:
        return daysSinceRepricing >= 7;
      case RepriceRule.MONTHLY:
        return daysSinceRepricing >= 30;
      case RepriceRule.QUARTERLY:
        return daysSinceRepricing >= 90;
      case RepriceRule.YEARLY:
        return daysSinceRepricing >= 365;
      case RepriceRule.INDEXED:
      case RepriceRule.LINKED:
      default:
        return false;
    }
  });
}

/**
 * Bulk add assets (useful for import/sync)
 */
export async function bulkAddAssets(assets: Asset[]): Promise<void> {
  await db.assets.bulkPut(assets);
}

/**
 * Get asset statistics
 */
export async function getAssetStats(): Promise<{
  total: number;
  totalValue: number;
  byType: Record<Asset['type'], { count: number; value: number }>;
}> {
  const assets = await getAllAssets();

  const byType: Record<string, { count: number; value: number }> = {};
  let totalValue = 0;

  assets.forEach(asset => {
    totalValue += asset.currentValue;

    if (!byType[asset.type]) {
      byType[asset.type] = { count: 0, value: 0 };
    }
    const typeStats = byType[asset.type];
    if (typeStats) {
      typeStats.count++;
      typeStats.value += asset.currentValue;
    }
  });

  return {
    total: assets.length,
    totalValue,
    byType,
  };
}

/**
 * Get assets with maturity dates within next N months
 */
export async function getAssetsWithUpcomingMaturity(months: number = 3): Promise<Asset[]> {
  const now = Date.now();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + months);
  const futureTs = futureDate.getTime();

  return db.assets
    .filter(asset => {
      if (asset.deletedAt) return false;
      if (!asset.maturityDate) return false;
      return asset.maturityDate >= now && asset.maturityDate <= futureTs;
    })
    .sortBy('maturityDate');
}
