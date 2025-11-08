/**
 * Settings Page
 * App settings and preferences
 */

'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { APP_META } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
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
                  Automatically sync changes
                </p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Last Synced</p>
                <p className="text-sm text-muted">Never</p>
              </div>
              <Button variant="outline" size="sm">
                Sync Now
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
              <Badge>Auto</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted">Default currency for display</p>
              </div>
              <Badge>INR</Badge>
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

            <Button variant="outline" fullWidth onClick={() => router.push('/import')}>
              Import Holdings
            </Button>

            <Button variant="outline" fullWidth>
              Export Data
            </Button>

            <Button variant="danger" fullWidth>
              Delete All Data
            </Button>
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
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
