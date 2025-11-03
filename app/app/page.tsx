/**
 * Capture Page (Home)
 * Quick expense capture with natural language input
 */

import { Layout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';

export default function CapturePage() {
  return (
    <Layout title="Capture">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Quick Capture Card */}
        <Card variant="elevated" padding="lg">
          <h2 className="mb-4 text-2xl font-bold">Add Expense</h2>

          <div className="space-y-4">
            <Input
              placeholder="e.g., Fuel 900 cash 7:30pm"
              className="text-lg"
            />

            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Voice
              </Button>
              <Button variant="ghost" size="sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Receipt
              </Button>
            </div>

            <Button fullWidth size="lg">
              Save Transaction
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
          <p className="text-center text-muted py-8">
            No transactions yet. Add your first expense above!
          </p>
        </Card>
      </div>
    </Layout>
  );
}
