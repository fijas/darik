/**
 * Net Worth Calculations
 *
 * Calculate net worth, asset allocation, and related metrics
 * All values are in paise (integers)
 */

import { getTotalAssetValue, getAssetAllocation, getAssetStats } from '../db/assets';
import {
  getTotalLiabilityValue,
  getLiabilityAllocation,
  getLiabilityStats,
} from '../db/liabilities';

/**
 * Calculate current net worth (assets - liabilities)
 */
export async function calculateNetWorth(): Promise<{
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}> {
  const [totalAssets, totalLiabilities] = await Promise.all([
    getTotalAssetValue(),
    getTotalLiabilityValue(),
  ]);

  return {
    netWorth: totalAssets - totalLiabilities,
    totalAssets,
    totalLiabilities,
  };
}

/**
 * Get comprehensive asset and liability breakdown
 */
export async function getNetWorthBreakdown(): Promise<{
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  assetAllocation: {
    liquid: number;
    investment: number;
    physical: number;
  };
  liabilityAllocation: {
    secured: number;
    unsecured: number;
  };
  assetsByType: Record<string, { count: number; value: number }>;
  liabilitiesByType: Record<string, { count: number; balance: number; emi: number }>;
}> {
  const [
    { netWorth, totalAssets, totalLiabilities },
    assetAllocation,
    liabilityAllocation,
    assetStats,
    liabilityStats,
  ] = await Promise.all([
    calculateNetWorth(),
    getAssetAllocation(),
    getLiabilityAllocation(),
    getAssetStats(),
    getLiabilityStats(),
  ]);

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    assetAllocation,
    liabilityAllocation,
    assetsByType: assetStats.byType,
    liabilitiesByType: liabilityStats.byType,
  };
}

/**
 * Calculate asset allocation percentages
 */
export async function calculateAssetAllocationPercentages(): Promise<{
  liquid: number;
  investment: number;
  physical: number;
}> {
  const allocation = await getAssetAllocation();

  if (allocation.total === 0) {
    return { liquid: 0, investment: 0, physical: 0 };
  }

  return {
    liquid: (allocation.liquid / allocation.total) * 100,
    investment: (allocation.investment / allocation.total) * 100,
    physical: (allocation.physical / allocation.total) * 100,
  };
}

/**
 * Calculate liability allocation percentages
 */
export async function calculateLiabilityAllocationPercentages(): Promise<{
  secured: number;
  unsecured: number;
}> {
  const allocation = await getLiabilityAllocation();

  if (allocation.total === 0) {
    return { secured: 0, unsecured: 0 };
  }

  return {
    secured: (allocation.secured / allocation.total) * 100,
    unsecured: (allocation.unsecured / allocation.total) * 100,
  };
}

/**
 * Calculate debt-to-asset ratio
 */
export async function calculateDebtToAssetRatio(): Promise<number> {
  const { totalAssets, totalLiabilities } = await calculateNetWorth();

  if (totalAssets === 0) return 0;

  return (totalLiabilities / totalAssets) * 100;
}

/**
 * Calculate emergency fund coverage (in months)
 *
 * Emergency fund coverage = liquid assets / average monthly expenses
 */
export async function calculateEmergencyFundCoverage(
  averageMonthlyExpenses: number
): Promise<number> {
  if (averageMonthlyExpenses === 0) return 0;

  const allocation = await getAssetAllocation();
  const liquidAssets = allocation.liquid;

  return liquidAssets / averageMonthlyExpenses;
}

/**
 * Calculate liquid asset ratio (liquid assets / total assets)
 */
export async function calculateLiquidAssetRatio(): Promise<number> {
  const allocation = await getAssetAllocation();

  if (allocation.total === 0) return 0;

  return (allocation.liquid / allocation.total) * 100;
}

/**
 * Calculate net worth growth rate
 *
 * @param previousNetWorth Net worth at previous snapshot
 * @param currentNetWorth Current net worth
 * @param monthsElapsed Months between snapshots
 * @returns Annualized growth rate as percentage
 */
export function calculateNetWorthGrowthRate(
  previousNetWorth: number,
  currentNetWorth: number,
  monthsElapsed: number
): number {
  if (previousNetWorth === 0 || monthsElapsed === 0) return 0;

  const growthRate = ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100;

  // Annualize if less than 12 months
  if (monthsElapsed < 12) {
    return (growthRate * 12) / monthsElapsed;
  }

  return growthRate;
}

/**
 * Financial health score (0-100)
 *
 * Based on multiple factors:
 * - Net worth (positive vs negative)
 * - Debt-to-asset ratio
 * - Emergency fund coverage
 * - Liquid asset ratio
 */
export async function calculateFinancialHealthScore(
  averageMonthlyExpenses: number
): Promise<{
  score: number;
  breakdown: {
    netWorthScore: number;
    debtScore: number;
    emergencyFundScore: number;
    liquidityScore: number;
  };
}> {
  const [
    { netWorth, totalAssets },
    debtToAssetRatio,
    emergencyFundCoverage,
    liquidAssetRatio,
  ] = await Promise.all([
    calculateNetWorth(),
    calculateDebtToAssetRatio(),
    calculateEmergencyFundCoverage(averageMonthlyExpenses),
    calculateLiquidAssetRatio(),
  ]);

  // Net worth score (0-30 points)
  // Positive net worth gets full points, scaled by asset value
  let netWorthScore = 0;
  if (netWorth > 0) {
    netWorthScore = Math.min(30, 15 + (netWorth / totalAssets) * 15);
  }

  // Debt score (0-25 points)
  // Lower debt-to-asset ratio is better
  let debtScore = 25;
  if (debtToAssetRatio > 0) {
    debtScore = Math.max(0, 25 - debtToAssetRatio / 2);
  }

  // Emergency fund score (0-25 points)
  // 6+ months coverage = full points
  let emergencyFundScore = 0;
  if (emergencyFundCoverage >= 6) {
    emergencyFundScore = 25;
  } else {
    emergencyFundScore = (emergencyFundCoverage / 6) * 25;
  }

  // Liquidity score (0-20 points)
  // 20-40% liquid assets is ideal
  let liquidityScore = 0;
  if (liquidAssetRatio >= 20 && liquidAssetRatio <= 40) {
    liquidityScore = 20;
  } else if (liquidAssetRatio < 20) {
    liquidityScore = (liquidAssetRatio / 20) * 20;
  } else {
    // Penalize over-liquidity (>40%)
    liquidityScore = Math.max(10, 20 - (liquidAssetRatio - 40) / 3);
  }

  const totalScore = Math.round(
    netWorthScore + debtScore + emergencyFundScore + liquidityScore
  );

  return {
    score: totalScore,
    breakdown: {
      netWorthScore: Math.round(netWorthScore),
      debtScore: Math.round(debtScore),
      emergencyFundScore: Math.round(emergencyFundScore),
      liquidityScore: Math.round(liquidityScore),
    },
  };
}

/**
 * Get financial health status based on score
 */
export function getFinancialHealthStatus(score: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
} {
  if (score >= 80) {
    return { status: 'excellent', label: 'Excellent', color: 'green' };
  } else if (score >= 60) {
    return { status: 'good', label: 'Good', color: 'blue' };
  } else if (score >= 40) {
    return { status: 'fair', label: 'Fair', color: 'amber' };
  } else {
    return { status: 'poor', label: 'Needs Attention', color: 'red' };
  }
}

/**
 * Calculate monthly savings rate
 *
 * Savings rate = (monthly income - monthly expenses) / monthly income * 100
 */
export function calculateSavingsRate(
  monthlyIncome: number,
  monthlyExpenses: number
): number {
  if (monthlyIncome === 0) return 0;

  const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
  return Math.max(0, Math.min(100, savingsRate)); // Clamp between 0-100
}

/**
 * Calculate investment rate (investments / total assets)
 */
export async function calculateInvestmentRate(): Promise<number> {
  const allocation = await getAssetAllocation();

  if (allocation.total === 0) return 0;

  return (allocation.investment / allocation.total) * 100;
}

/**
 * Suggest rebalancing actions based on asset allocation
 */
export async function suggestRebalancing(): Promise<{
  suggestions: Array<{
    category: 'liquid' | 'investment' | 'physical';
    action: 'increase' | 'decrease';
    reason: string;
    targetPercentage: number;
    currentPercentage: number;
  }>;
}> {
  const allocation = await calculateAssetAllocationPercentages();
  const suggestions: Array<{
    category: 'liquid' | 'investment' | 'physical';
    action: 'increase' | 'decrease';
    reason: string;
    targetPercentage: number;
    currentPercentage: number;
  }> = [];

  // Ideal allocation ranges (adjustable based on goals)
  const idealRanges = {
    liquid: { min: 10, max: 30 },
    investment: { min: 50, max: 70 },
    physical: { min: 10, max: 30 },
  };

  // Check liquid assets
  if (allocation.liquid < idealRanges.liquid.min) {
    suggestions.push({
      category: 'liquid',
      action: 'increase',
      reason: 'Emergency fund and cash reserves are below recommended levels',
      targetPercentage: idealRanges.liquid.min,
      currentPercentage: allocation.liquid,
    });
  } else if (allocation.liquid > idealRanges.liquid.max) {
    suggestions.push({
      category: 'liquid',
      action: 'decrease',
      reason: 'Excess cash that could be invested for better returns',
      targetPercentage: idealRanges.liquid.max,
      currentPercentage: allocation.liquid,
    });
  }

  // Check investments
  if (allocation.investment < idealRanges.investment.min) {
    suggestions.push({
      category: 'investment',
      action: 'increase',
      reason: 'Investment allocation is below target for long-term wealth creation',
      targetPercentage: idealRanges.investment.min,
      currentPercentage: allocation.investment,
    });
  }

  // Check physical assets
  if (allocation.physical > idealRanges.physical.max) {
    suggestions.push({
      category: 'physical',
      action: 'decrease',
      reason: 'Physical assets are over-allocated and less liquid',
      targetPercentage: idealRanges.physical.max,
      currentPercentage: allocation.physical,
    });
  }

  return { suggestions };
}
