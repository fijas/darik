/**
 * Settings Page
 * App settings and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { APP_META } from '@/lib/config';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useSync } from '@/hooks/useSync';
import {
  exportAllData,
  exportTransactionsCSV,
  getDatabaseStats,
  deleteAllData,
} from '@/lib/db/export';
import { formatDistanceToNow } from 'date-fns';

export default function SettingsPage() {
  const router = useRouter();
  const { status: syncStatus, sync: triggerSync, isSyncing: syncInProgress } = useSync();
  const [stats, setStats] = useState({
    transactions: 0,
    securities: 0,
    holdings: 0,
    prices: 0,
    assets: 0,
    liabilities: 0,
    goals: 0,
    total: 0,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const dbStats = await getDatabaseStats();
    setStats(dbStats);
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      await exportAllData();
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await exportTransactionsCSV();
      alert('Transactions exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export transactions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleSync = async () => {
    try {
      await triggerSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete ALL data? This action cannot be undone.\n\nThis will delete:\n- All transactions\n- All holdings and securities\n- All assets and liabilities\n- All goals\n- All sync data\n\nType "DELETE" to confirm.'
    );

    if (!confirmed) return;

    const secondConfirm = prompt('Type DELETE to confirm:');
    if (secondConfirm !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }

    try {
      await deleteAllData();
      await loadStats();
      alert('All data has been deleted.');
      router.push('/');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete data. Please try again.');
    }
  };

  const lastSyncText = syncStatus?.lastSyncTs
    ? formatDistanceToNow(syncStatus.lastSyncTs, { addSuffix: true })
    : 'Never';

  const pendingOps = syncStatus?.pendingPushOps || 0;
  const isSyncing = syncStatus?.isSyncing || syncInProgress;

  return (
    <Layout title="Settings">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Sync Settings */}
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Sync</h3>
              <p className="text-sm text-muted">
                Synchronize your data across devices
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Sync</p>
                <p className="text-sm text-muted">
                  Automatically sync changes every 5 minutes
                </p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sync Status</p>
                <p className="text-sm text-muted">
                  {isSyncing
                    ? 'Syncing...'
                    : pendingOps > 0
                    ? `${pendingOps} pending changes`
                    : 'All changes synced'}
                </p>
              </div>
              <Badge
                variant={
                  isSyncing
                    ? 'default'
                    : pendingOps > 0
                    ? 'warning'
                    : 'success'
                }
              >
                {isSyncing
                  ? 'Syncing'
                  : pendingOps > 0
                  ? 'Pending'
                  : 'Synced'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Last Synced</p>
                <p className="text-sm text-muted">{lastSyncText}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-muted">Customize the app appearance</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted">Choose light or dark mode</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted">Default currency for display</p>
              </div>
              <Badge>INR (₹)</Badge>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Data</h3>
              <p className="text-sm text-muted">Manage your data</p>
            </div>

            <div className="space-y-2 text-sm text-muted">
              <p>
                <strong>Database Statistics:</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• {stats.transactions} transactions</li>
                <li>• {stats.holdings} holdings ({stats.securities} securities)</li>
                <li>• {stats.assets} assets, {stats.liabilities} liabilities</li>
                <li>• {stats.goals} goals</li>
                <li>• {stats.prices} price records</li>
              </ul>
              <p className="font-medium">Total: {stats.total} records</p>
            </div>

            <Button variant="outline" fullWidth onClick={() => router.push('/import')}>
              Import Holdings (CSV)
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={handleExportJSON}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export All Data (JSON)'}
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export Transactions (CSV)'}
            </Button>

            <div className="border-t pt-4 mt-4">
              <Button
                variant="danger"
                fullWidth
                onClick={handleDeleteAllData}
              >
                Delete All Data
              </Button>
              <p className="text-xs text-muted text-center mt-2">
                This action cannot be undone
              </p>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">About</h3>
            <div className="text-sm text-muted space-y-1">
              <p>
                <strong>{APP_META.name}</strong> v{APP_META.version}
              </p>
              <p>{APP_META.description}</p>
              <p>License: {APP_META.license}</p>
              <p className="text-xs pt-2">
                Made with privacy and security in mind. All sensitive data is encrypted
                client-side before syncing.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}