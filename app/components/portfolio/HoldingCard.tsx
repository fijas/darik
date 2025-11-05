'use client';

/**
 * Holding Card Component
 *
 * Displays a single holding with:
 * - Security name and symbol
 * - Units held
 * - Current value
 * - P&L (amount and percentage)
 * - XIRR (if available)
 */

import { formatPaiseToRupees, formatPercent } from '@/lib/calculations/portfolio';
import type { PortfolioHolding } from '@/lib/calculations/portfolio';

interface HoldingCardProps {
  holding: PortfolioHolding;
  onClick?: () => void;
}

export default function HoldingCard({ holding, onClick }: HoldingCardProps) {
  const isPositivePnL = holding.unrealizedPnLPaise >= 0;
  const isPositiveDayChange = (holding.dayChangePaise || 0) >= 0;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {holding.security.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {holding.security.symbol} • {holding.units.toFixed(3)} units
          </p>
        </div>

        {/* Asset Type Badge */}
        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
          {holding.security.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Current Value */}
      <div className="mb-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {formatPaiseToRupees(holding.currentValuePaise)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          @ {formatPaiseToRupees(holding.currentPricePaise)} • {holding.priceDate}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {/* Invested */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invested</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPaiseToRupees(holding.investedPaise)}
          </p>
        </div>

        {/* P&L */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">P&L</p>
          <p
            className={`text-sm font-semibold ${
              isPositivePnL ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatPaiseToRupees(holding.unrealizedPnLPaise)}
          </p>
          <p
            className={`text-xs ${
              isPositivePnL ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatPercent(holding.unrealizedPnLPercent)}
          </p>
        </div>

        {/* Day Change or XIRR */}
        {holding.dayChangePaise !== undefined && holding.dayChangePaise !== 0 ? (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today</p>
            <p
              className={`text-sm font-semibold ${
                isPositiveDayChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPaiseToRupees(holding.dayChangePaise)}
            </p>
            <p
              className={`text-xs ${
                isPositiveDayChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatPercent(holding.dayChangePercent || 0)}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Returns</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPercent(holding.unrealizedPnLPercent)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
