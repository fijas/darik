/**
 * React hook for sync engine
 * Provides sync status and control functions
 */

import { useState, useEffect, useCallback } from 'react';
import { getSyncEngine } from '@/lib/sync/engine';
import type { SyncStatus } from '@/lib/sync/types';

export function useSync() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncEngine = getSyncEngine();

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  // Auto-refresh status every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const newStatus = await syncEngine.getStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    }
  }, [syncEngine]);

  const sync = useCallback(async () => {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      await syncEngine.sync();
      await loadStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncEngine, isSyncing, loadStatus]);

  const startAutoSync = useCallback(() => {
    syncEngine.start();
  }, [syncEngine]);

  const stopAutoSync = useCallback(() => {
    syncEngine.stop();
  }, [syncEngine]);

  return {
    status,
    error,
    isSyncing,
    sync,
    startAutoSync,
    stopAutoSync,
    isEnabled: syncEngine.isEnabled(),
  };
}
