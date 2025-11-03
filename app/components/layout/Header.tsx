/**
 * Header Component
 * Top navigation bar with app title and actions
 */

'use client';

import { Badge } from '@/components/ui';

interface HeaderProps {
  title?: string;
  showSync?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error';
  pendingOps?: number;
}

export function Header({
  title = 'Darik',
  showSync = true,
  syncStatus = 'idle',
  pendingOps = 0
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        {/* App Title */}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>

        {/* Sync Status */}
        {showSync && (
          <div className="flex items-center gap-3">
            {syncStatus === 'syncing' && (
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
            )}

            {syncStatus === 'error' && (
              <Badge variant="danger" size="sm">
                Sync Error
              </Badge>
            )}

            {pendingOps > 0 && syncStatus === 'idle' && (
              <Badge variant="warning" size="sm">
                {pendingOps} pending
              </Badge>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
