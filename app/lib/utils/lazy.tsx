/**
 * Lazy Loading Utilities
 * Helpers for code splitting and performance optimization
 */

import React from 'react';
import dynamic from 'next/dynamic';

/**
 * Lazy load a component with a loading fallback
 */
export function lazyLoad<T>(
  importer: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: () => React.ReactNode
) {
  return dynamic(importer, {
    loading: loadingComponent ||  (() => (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )),
    ssr: false, // Most components don't need SSR for better performance
  });
}

/**
 * Loading skeleton for cards
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 h-4 w-1/3 rounded bg-gray-200"></div>
      <div className="mb-2 h-6 w-2/3 rounded bg-gray-200"></div>
      <div className="h-4 w-1/2 rounded bg-gray-200"></div>
    </div>
  );
}

/**
 * Loading skeleton for lists
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </div>
            <div className="h-5 w-16 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for tables
 */
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50 p-3">
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-gray-200 bg-white p-3">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        </div>
      ))}
    </div>
  );
}
