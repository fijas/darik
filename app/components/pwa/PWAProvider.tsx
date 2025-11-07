/**
 * PWA Provider
 * Wraps the app to provide PWA functionality (install prompt, update notifications, etc.)
 */

'use client';

import { useEffect } from 'react';
import InstallPrompt from './InstallPrompt';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const { updateAvailable, skipWaiting, isOnline, requestBackgroundSync } = useServiceWorker();

  useEffect(() => {
    // Show update notification if available
    if (updateAvailable) {
      const shouldUpdate = window.confirm(
        'A new version of Darik is available. Would you like to update now?'
      );
      if (shouldUpdate) {
        skipWaiting();
      }
    }
  }, [updateAvailable, skipWaiting]);

  // Register background sync when coming online
  useEffect(() => {
    if (isOnline) {
      console.log('[PWA] Online - triggering sync');
      requestBackgroundSync('sync-transactions');

      // Also trigger the app's sync engine
      window.dispatchEvent(new CustomEvent('online-sync'));
    }
  }, [isOnline, requestBackgroundSync]);

  // Listen for visibility changes to sync when app comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOnline) {
        console.log('[PWA] App visible - checking for sync');
        requestBackgroundSync('sync-transactions');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline, requestBackgroundSync]);

  return (
    <>
      {children}
      <InstallPrompt />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-white">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                clipRule="evenodd"
              />
            </svg>
            You&apos;re offline - Changes will sync when you reconnect
          </div>
        </div>
      )}
    </>
  );
}
