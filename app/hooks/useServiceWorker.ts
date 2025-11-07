/**
 * Service Worker Hook
 * Manages service worker registration, updates, and background sync
 */

'use client';

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker
    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setRegistration(reg);
        console.log('[SW] Service Worker registered');

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setUpdateAvailable(true);
              console.log('[SW] Update available');
            }
          });
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    registerSW();

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        console.log('[SW] Background sync triggered:', event.data.tag);
        // Trigger sync in the app
        window.dispatchEvent(new CustomEvent('background-sync', { detail: event.data }));
      }
    });

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const skipWaiting = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestBackgroundSync = async (tag: string) => {
    if (!registration) {
      console.warn('[SW] No service worker registration');
      return false;
    }

    try {
      await registration.sync.register(tag);
      console.log('[SW] Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('[SW] Background sync registration failed:', error);
      return false;
    }
  };

  return {
    registration,
    updateAvailable,
    skipWaiting,
    isOnline,
    requestBackgroundSync,
  };
}
