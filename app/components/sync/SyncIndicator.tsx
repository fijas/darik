/**
 * Sync Status Indicator
 * Shows sync status in the UI with manual sync trigger
 */

'use client';

import { useSync } from '@/hooks/useSync';
import { useState } from 'react';

export function SyncIndicator() {
  const { status, error, isSyncing, sync, isEnabled } = useSync();
  const [showDetails, setShowDetails] = useState(false);

  if (!isEnabled) {
    return null;
  }

  const hasError = !!error;
  const hasPendingOps = (status?.pendingPushOps || 0) > 0;

  // Format last sync time
  const getLastSyncText = () => {
    if (!status?.lastSyncTs) {
      return 'Never synced';
    }

    const now = Date.now();
    const diff = now - status.lastSyncTs;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`rounded-full p-3 shadow-lg transition-all ${
          hasError
            ? 'bg-red-500 text-white'
            : isSyncing
              ? 'bg-blue-500 text-white animate-pulse'
              : hasPendingOps
                ? 'bg-yellow-500 text-white'
                : 'bg-green-500 text-white'
        }`}
        title={
          hasError
            ? error
            : isSyncing
              ? 'Syncing...'
              : hasPendingOps
                ? `${status?.pendingPushOps} pending changes`
                : 'Synced'
        }
      >
        {/* Sync icon */}
        <svg
          className={`h-6 w-6 ${isSyncing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Details panel */}
      {showDetails && (
        <div className="absolute bottom-16 right-0 w-64 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sync Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Last sync:</span>
                <span className="font-medium">{getLastSyncText()}</span>
              </div>

              {hasPendingOps && (
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {status?.pendingPushOps} changes
                  </span>
                </div>
              )}

              {hasError && (
                <div className="rounded bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={sync}
                disabled={isSyncing}
                className="mt-2 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
