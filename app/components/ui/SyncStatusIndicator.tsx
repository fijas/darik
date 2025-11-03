/**
 * Sync Status Indicator
 * Shows sync status and pending operations
 */

'use client';

import { Badge } from './Badge';

export interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'error';
  pendingOps?: number;
  lastSyncAt?: number;
}

export function SyncStatusIndicator({
  status,
  pendingOps = 0,
  lastSyncAt,
}: SyncStatusIndicatorProps) {
  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Syncing...</span>
      </div>
    );
  }

  if (status === 'error') {
    return <Badge variant="danger" size="sm">Sync Error</Badge>;
  }

  if (pendingOps > 0) {
    return (
      <Badge variant="warning" size="sm">
        {pendingOps} pending
      </Badge>
    );
  }

  // Show last sync time if available
  if (lastSyncAt) {
    const timeSince = Date.now() - lastSyncAt;
    const minutes = Math.floor(timeSince / 60000);

    if (minutes < 1) {
      return <span className="text-xs text-muted">Synced just now</span>;
    } else if (minutes < 60) {
      return <span className="text-xs text-muted">Synced {minutes}m ago</span>;
    }
  }

  return null;
}
