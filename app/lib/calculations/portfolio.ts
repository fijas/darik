/**
 * Portfolio Valuation and Calculations
 *
 * Financial calculations for portfolio management:
 * - Market value and P&L calculations
 * - XIRR (Internal Rate of Return)
 * - Asset allocation
 * - Day change tracking
 */

import type { Holding } from '@/types/database';
import { parseLots } from '../db/holdings';

/**
 * Portfolio holding with valuation
 */
export interface PortfolioHolding {
  holding: Holding;
  security: {
    id: string;
    name: string;
    symbol: string;
    type: string;
  };
  currentPricePaise: number;
  priceDate: string;
  units: number;
  investedPaise: number;
  currentValuePaise: number;
  unrealizedPnLPaise: number;
  unrealizedPnLPercent: number;
  dayChangePaise?: number;
  dayChangePercent?: number;
}

/**
 * Portfolio summary statistics
 */
export interface PortfolioSummary {
  totalInvestedPaise: number;
  totalCurrentValuePaise: number;
  totalUnrealizedPnLPaise: number;
  totalUnrealizedPnLPercent: number;
  totalDayChangePaise: number;
  totalDayChangePercent: number;
  holdings: PortfolioHolding[];
  assetAllocation: Record<string, number>; // Asset type -> value in paise
  xirr?: number; // Overall portfolio XIRR
}

/**
 * Calculate market value of a holding
 */
export function calculateMarketValue(
  holding: Holding,
  currentPricePaise: number
): number {
  const units = parseFloat(holding.units);
  return Math.round(units * currentPricePaise);
}

/**
 * Calculate invested amount for a holding
 */
export function calculateInvestedAmount(holding: Holding): number {
  const units = parseFloat(holding.units);
  return Math.round(units * holding.avgCostPaise);
}

/**
 * Calculate unrealized P&L for a holding
 */
export function calculateUnrealizedPnL(
  holding: Holding,
  currentPricePaise: number
): {
  pnlPaise: number;
  pnlPercent: number;
} {
  const invested = calculateInvestedAmount(holding);
  const current = calculateMarketValue(holding, currentPricePaise);
  const pnlPaise = current - invested;
  const pnlPercent = invested > 0 ? (pnlPaise / invested) * 100 : 0;

  return { pnlPaise, pnlPercent };
}

/**
 * Calculate day change for a holding
 */
export function calculateDayChange(
  holding: Holding,
  currentPricePaise: number,
  previousPricePaise: number
): {
  dayChangePaise: number;
  dayChangePercent: number;
} {
  const units = parseFloat(holding.units);
  const currentValue = units * currentPricePaise;
  const previousValue = units * previousPricePaise;
  const dayChangePaise = Math.round(currentValue - previousValue);
  const dayChangePercent = previousValue > 0 ? (dayChangePaise / previousValue) * 100 : 0;

  return { dayChangePaise, dayChangePercent };
}

/**
 * XIRR Calculation (Internal Rate of Return)
 *
 * Uses Newton-Raphson method to find the rate that satisfies:
 * Sum of (cashFlow / (1 + rate) ^ yearFraction) = 0
 *
 * @param cashFlows Array of { date: timestamp, amount: paise }
 * @returns XIRR as a percentage (e.g., 12.5 for 12.5% annual return)
 */
export function calculateXIRR(
  cashFlows: Array<{ date: number; amountPaise: number }>
): number | null {
  if (cashFlows.length < 2) {
    return null;
  }

  // Sort by date
  const sorted = [...cashFlows].sort((a, b) => a.date - b.date);
  const startDate = sorted[0]?.date;

  if (!startDate) {
    return null;
  }

  // Convert to days from start
  const flows = sorted.map((cf) => ({
    days: (cf.date - startDate) / (1000 * 60 * 60 * 24),
    amount: cf.amountPaise,
  }));

  // Newton-Raphson method to find rate
  let rate = 0.1; // Initial guess: 10%
  const maxIterations = 100;
  const precision = 0.0000001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const flow of flows) {
      const yearFraction = flow.days / 365;
      const factor = Math.pow(1 + rate, yearFraction);
      npv += flow.amount / factor;
      dnpv -= (flow.amount * yearFraction) / (factor * (1 + rate));
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < precision) {
      return newRate * 100; // Convert to percentage
    }

    rate = newRate;

    // Bail out if rate goes out of reasonable bounds
    if (rate < -0.99 || rate > 10) {
      return null;
    }
  }

  return null; // Did not converge
}

/**
 * Calculate XIRR for a holding
 * Includes all buy transactions and current value as final cash flow
 */
export function calculateHoldingXIRR(
  holding: Holding,
  currentPricePaise: number
): number | null {
  const lots = parseLots(holding.lots);

  if (lots.length === 0) {
    return null;
  }

  // Create cash flows: negative for buys, positive for current value
  const cashFlows: Array<{ date: number; amountPaise: number }> = [];

  // Add all purchase transactions (negative cash flows)
  for (const lot of lots) {
    const units = parseFloat(lot.units);
    const cost = units * lot.costPaise;
    cashFlows.push({
      date: lot.ts,
      amountPaise: -cost,
    });
  }

  // Add current value as a positive cash flow (selling today)
  const currentValue = parseFloat(holding.units) * currentPricePaise;
  cashFlows.push({
    date: Date.now(),
    amountPaise: currentValue,
  });

  return calculateXIRR(cashFlows);
}

/**
 * Calculate portfolio XIRR
 * Includes all transactions across all holdings
 */
export function calculatePortfolioXIRR(
  holdings: Array<{ holding: Holding; currentPricePaise: number }>
): number | null {
  const cashFlows: Array<{ date: number; amountPaise: number }> = [];

  for (const { holding, currentPricePaise } of holdings) {
    const lots = parseLots(holding.lots);

    // Add all purchase transactions
    for (const lot of lots) {
      const units = parseFloat(lot.units);
      const cost = units * lot.costPaise;
      cashFlows.push({
        date: lot.ts,
        amountPaise: -cost,
      });
    }

    // Add current value
    const currentValue = parseFloat(holding.units) * currentPricePaise;
    if (currentValue > 0) {
      cashFlows.push({
        date: Date.now(),
        amountPaise: currentValue,
      });
    }
  }

  if (cashFlows.length < 2) {
    return null;
  }

  return calculateXIRR(cashFlows);
}

/**
 * Calculate asset allocation by security type
 */
export function calculateAssetAllocation(
  holdings: Array<{ security: { type: string }; currentValuePaise: number }>
): Record<string, number> {
  const allocation: Record<string, number> = {};

  for (const holding of holdings) {
    const type = holding.security.type;
    allocation[type] = (allocation[type] || 0) + holding.currentValuePaise;
  }

  return allocation;
}

/**
 * Calculate asset allocation percentages
 */
export function calculateAssetAllocationPercentages(
  allocation: Record<string, number>
): Record<string, number> {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return {};
  }

  const percentages: Record<string, number> = {};
  for (const [type, value] of Object.entries(allocation)) {
    percentages[type] = (value / total) * 100;
  }

  return percentages;
}

/**
 * Format paise to rupees string
 */
export function formatPaiseToRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Calculate simple returns (not annualized)
 */
export function calculateSimpleReturn(investedPaise: number, currentValuePaise: number): number {
  if (investedPaise === 0) return 0;
  return ((currentValuePaise - investedPaise) / investedPaise) * 100;
}

/**
 * Calculate annualized return (CAGR)
 * @param investedPaise Initial investment
 * @param currentValuePaise Current value
 * @param days Number of days invested
 */
export function calculateCAGR(
  investedPaise: number,
  currentValuePaise: number,
  days: number
): number {
  if (investedPaise === 0 || days === 0) return 0;

  const years = days / 365;
  const ratio = currentValuePaise / investedPaise;
  const cagr = (Math.pow(ratio, 1 / years) - 1) * 100;

  return cagr;
}

/**
 * Get the oldest lot date for a holding (investment start date)
 */
export function getOldestLotDate(holding: Holding): number | null {
  const lots = parseLots(holding.lots);

  if (lots.length === 0) {
    return null;
  }

  return Math.min(...lots.map((lot) => lot.ts));
}

/**
 * Calculate days invested for a holding
 */
export function getDaysInvested(holding: Holding): number {
  const oldestDate = getOldestLotDate(holding);

  if (!oldestDate) {
    return 0;
  }

  return Math.floor((Date.now() - oldestDate) / (1000 * 60 * 60 * 24));
}
