/**
 * Layout Component
 * Main app layout structure with header and bottom navigation
 */

'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SyncIndicator } from '../sync/SyncIndicator';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function Layout({
  children,
  title,
  showHeader = true,
  showBottomNav = true,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      {showHeader && <Header title={title} />}

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-4">
        <div className="mx-auto max-w-screen-xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile only) */}
      {showBottomNav && <BottomNav />}

      {/* Sync indicator */}
      <SyncIndicator />
    </div>
  );
}
