'use client';

/**
 * Portfolio Page
 * View investment portfolio, holdings, and net worth
 */

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import HoldingsList from '@/components/portfolio/HoldingsList';
import type { PortfolioHolding } from '@/lib/calculations/portfolio';
import { getAllHoldings } from '@/lib/db/holdings';
import { getSecurityById } from '@/lib/db/securities';
import { db } from '@/lib/db/schema';
import {
  calculateMarketValue,
  calculateInvestedAmount,
  calculateUnrealizedPnL,
  calculatePortfolioXIRR,
} from '@/lib/calculations/portfolio';

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      const allHoldings = await getAllHoldings();

      // Build portfolio holdings with prices
      const portfolioHoldings: PortfolioHolding[] = [];

      for (const holding of allHoldings) {
        const security = await getSecurityById(holding.securityId);
        if (!security) continue;

        // Get latest price
        const latestPrice = await db.prices
          .where('[securityId+date]')
          .between([security.id, '0000-00-00'], [security.id, '9999-99-99'], true, true)
          .reverse()
          .first();

        if (!latestPrice) continue;

        const currentPricePaise = latestPrice.pricePaise;
        const units = parseFloat(holding.units);
        const investedPaise = calculateInvestedAmount(holding);
        const currentValuePaise = calculateMarketValue(holding, currentPricePaise);
        const { pnlPaise, pnlPercent } = calculateUnrealizedPnL(holding, currentPricePaise);

        portfolioHoldings.push({
          holding,
          security: {
            id: security.id,
            name: security.name,
            symbol: security.symbol,
            type: security.type,
          },
          currentPricePaise,
          priceDate: latestPrice.date,
          units,
          investedPaise,
          currentValuePaise,
          unrealizedPnLPaise: pnlPaise,
          unrealizedPnLPercent: pnlPercent,
        });
      }

      setHoldings(portfolioHoldings);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate portfolio totals
  const totalInvestedPaise = holdings.reduce((sum, h) => sum + h.investedPaise, 0);
  const totalCurrentValuePaise = holdings.reduce((sum, h) => sum + h.currentValuePaise, 0);
  const totalUnrealizedPnLPaise = holdings.reduce((sum, h) => sum + h.unrealizedPnLPaise, 0);
  const totalUnrealizedPnLPercent =
    totalInvestedPaise > 0 ? (totalUnrealizedPnLPaise / totalInvestedPaise) * 100 : 0;

  // Calculate portfolio XIRR
  const xirr = calculatePortfolioXIRR(
    holdings.map((h) => ({
      holding: h.holding,
      currentPricePaise: h.currentPricePaise,
    }))
  );

  return (
    <Layout title="Portfolio">
      <div className="space-y-6">
        {/* Portfolio Summary */}
        {loading ? (
          <Card variant="elevated" padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </Card>
        ) : holdings.length > 0 ? (
          <PortfolioSummary
            totalInvestedPaise={totalInvestedPaise}
            totalCurrentValuePaise={totalCurrentValuePaise}
            totalUnrealizedPnLPaise={totalUnrealizedPnLPaise}
            totalUnrealizedPnLPercent={totalUnrealizedPnLPercent}
            xirr={xirr || undefined}
          />
        ) : (
          <Card variant="elevated" padding="lg">
            <h2 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Portfolio Value
            </h2>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">₹0.00</p>
          </Card>
        )}

        {/* Holdings Tabs */}
        <Tabs defaultValue="holdings">
          <TabsList className="w-full">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            {loading ? (
              <Card>
                <div className="animate-pulse space-y-4 py-12">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </Card>
            ) : holdings.length > 0 ? (
              <HoldingsList holdings={holdings} />
            ) : (
              <Card>
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                  No holdings yet. Start adding your investments!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assets">
            <Card>
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                No assets yet. Track your bank accounts, FDs, and property here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="liabilities">
            <Card>
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                No liabilities yet. Track loans and credit cards here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
