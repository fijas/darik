/**
 * Plan Page
 * Financial goals and planning
 */

import { Layout } from '@/components/layout';
import { Card, Button } from '@/components/ui';

export default function PlanPage() {
  return (
    <Layout title="Plan">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <p className="text-muted">Track your progress towards your goals</p>
          </div>
          <Button>Add Goal</Button>
        </div>

        {/* Goals List */}
        <Card>
          <p className="text-center text-muted py-12">
            No goals yet. Set your first financial goal!
          </p>
        </Card>

        {/* Net Worth Card */}
        <Card variant="elevated" padding="lg">
          <h3 className="mb-2 text-sm font-medium text-muted">Net Worth</h3>
          <p className="text-3xl font-bold">₹0.00</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted">Assets</p>
              <p className="text-lg font-semibold">₹0.00</p>
            </div>
            <div>
              <p className="text-sm text-muted">Liabilities</p>
              <p className="text-lg font-semibold">₹0.00</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
