/**
 * Portfolio Page
 * View investment portfolio, holdings, and net worth
 */

import { Layout } from '@/components/layout';
import { Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

export default function PortfolioPage() {
  return (
    <Layout title="Portfolio">
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <Card variant="elevated" padding="lg">
          <h2 className="mb-2 text-sm font-medium text-muted">Total Portfolio Value</h2>
          <p className="text-4xl font-bold">₹0.00</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="success" size="sm">
              +0.00%
            </Badge>
            <span className="text-sm text-muted">Today</span>
          </div>
        </Card>

        {/* Holdings Tabs */}
        <Tabs defaultValue="holdings">
          <TabsList className="w-full">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <Card>
              <p className="text-center text-muted py-12">
                No holdings yet. Start adding your investments!
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card>
              <p className="text-center text-muted py-12">
                No assets yet. Track your bank accounts, FDs, and property here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="liabilities">
            <Card>
              <p className="text-center text-muted py-12">
                No liabilities yet. Track loans and credit cards here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
