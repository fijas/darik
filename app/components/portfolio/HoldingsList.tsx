'use client';

/**
 * Holdings List Component
 *
 * Displays a list of portfolio holdings with filtering and sorting
 */

import { useState } from 'react';
import HoldingCard from './HoldingCard';
import type { PortfolioHolding } from '@/lib/calculations/portfolio';

interface HoldingsListProps {
  holdings: PortfolioHolding[];
  onHoldingClick?: (holding: PortfolioHolding) => void;
}

type SortBy = 'value' | 'pnl' | 'name' | 'returns';
type FilterBy = 'all' | 'mutual_fund' | 'equity' | 'gold' | 'crypto' | 'other';

export default function HoldingsList({ holdings, onHoldingClick }: HoldingsListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('value');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  // Filter holdings
  const filteredHoldings = holdings.filter((holding) => {
    if (filterBy === 'all') return true;
    return holding.security.type === filterBy;
  });

  // Sort holdings
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.currentValuePaise - a.currentValuePaise;
      case 'pnl':
        return b.unrealizedPnLPaise - a.unrealizedPnLPaise;
      case 'returns':
        return b.unrealizedPnLPercent - a.unrealizedPnLPercent;
      case 'name':
        return a.security.name.localeCompare(b.security.name);
      default:
        return 0;
    }
  });

  // Get unique asset types for filter
  const assetTypes = Array.from(new Set(holdings.map((h) => h.security.type)));

  return (
    <div>
      {/* Filters and Sort */}
      <div className="mb-4 flex flex-wrap gap-2">
        {/* Filter Buttons */}
        <button
          onClick={() => setFilterBy('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filterBy === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({holdings.length})
        </button>

        {assetTypes.map((type) => {
          const count = holdings.filter((h) => h.security.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilterBy(type as FilterBy)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filterBy === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.replace('_', ' ').toUpperCase()} ({count})
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="value">Sort by Value</option>
          <option value="pnl">Sort by P&L</option>
          <option value="returns">Sort by Returns %</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Holdings Grid */}
      {sortedHoldings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedHoldings.map((holding) => (
            <HoldingCard
              key={holding.holding.id}
              holding={holding}
              onClick={() => onHoldingClick?.(holding)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No holdings found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
