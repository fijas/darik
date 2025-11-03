/**
 * Loading State
 * Global loading skeleton for page transitions
 */

import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';

export default function Loading() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
        {/* Skeleton Card 1 */}
        <Card padding="lg">
          <div className="h-8 w-1/3 bg-secondary rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-secondary rounded"></div>
            <div className="h-10 bg-secondary rounded"></div>
            <div className="h-10 bg-secondary rounded"></div>
          </div>
        </Card>

        {/* Skeleton Card 2 */}
        <Card>
          <div className="h-6 w-1/4 bg-secondary rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-16 bg-secondary rounded"></div>
            <div className="h-16 bg-secondary rounded"></div>
            <div className="h-16 bg-secondary rounded"></div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
