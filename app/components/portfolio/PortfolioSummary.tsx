'use client';

/**
 * Portfolio Summary Component
 *
 * Displays high-level portfolio statistics:
 * - Total invested amount
 * - Current portfolio value
 * - Overall P&L (amount and percentage)
 * - Day change (amount and percentage)
 */

import { formatPaiseToRupees, formatPercent } from '@/lib/calculations/portfolio';

interface PortfolioSummaryProps {
  totalInvestedPaise: number;
  totalCurrentValuePaise: number;
  totalUnrealizedPnLPaise: number;
  totalUnrealizedPnLPercent: number;
  totalDayChangePaise?: number;
  totalDayChangePercent?: number;
  xirr?: number;
}

export default function PortfolioSummary({
  totalInvestedPaise,
  totalCurrentValuePaise,
  totalUnrealizedPnLPaise,
  totalUnrealizedPnLPercent,
  totalDayChangePaise = 0,
  totalDayChangePercent = 0,
  xirr,
}: PortfolioSummaryProps) {
  const isPositivePnL = totalUnrealizedPnLPaise >= 0;
  const isPositiveDayChange = totalDayChangePaise >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Current Value */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {formatPaiseToRupees(totalCurrentValuePaise)}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Invested */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invested</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPaiseToRupees(totalInvestedPaise)}
          </p>
        </div>

        {/* Total P&L */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total P&L</p>
          <p
            className={`text-lg font-semibold ${
              isPositivePnL ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatPaiseToRupees(totalUnrealizedPnLPaise)}
          </p>
          <p
            className={`text-xs ${
              isPositivePnL ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatPercent(totalUnrealizedPnLPercent)}
          </p>
        </div>

        {/* Day Change */}
        {totalDayChangePaise !== 0 && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today</p>
            <p
              className={`text-lg font-semibold ${
                isPositiveDayChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPaiseToRupees(totalDayChangePaise)}
            </p>
            <p
              className={`text-xs ${
                isPositiveDayChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPercent(totalDayChangePercent)}
            </p>
          </div>
        )}

        {/* XIRR */}
        {xirr !== undefined && xirr !== null && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">XIRR</p>
            <p
              className={`text-lg font-semibold ${
                xirr >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPercent(xirr)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Annualized</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isPositivePnL ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min(Math.abs(totalUnrealizedPnLPercent), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
