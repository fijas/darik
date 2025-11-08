'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { formatCurrency } from '@/lib/utils';
import {
  calculateNetWorth,
  getNetWorthBreakdown,
  calculateFinancialHealthScore,
  getFinancialHealthStatus,
} from '@/lib/calculations/networth';
import { AssetForm } from '@/components/assets/AssetForm';
import { LiabilityForm } from '@/components/liabilities/LiabilityForm';
import { AssetList } from '@/components/assets/AssetList';
import { LiabilityList } from '@/components/liabilities/LiabilityList';
import { addAsset, updateAsset, deleteAsset, getAllAssets } from '@/lib/db/assets';
import { addLiability, updateLiability, deleteLiability, getAllLiabilities } from '@/lib/db/liabilities';
import type { Asset, Liability } from '@/types/database';

export default function NetWorthPage() {
  const [netWorthData, setNetWorthData] = useState({
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
  });

  const [breakdown, setBreakdown] = useState<Awaited<
    ReturnType<typeof getNetWorthBreakdown>
  > | null>(null);
  const [healthScore, setHealthScore] = useState<Awaited<
    ReturnType<typeof calculateFinancialHealthScore>
  > | null>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [isLiabilityFormOpen, setIsLiabilityFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
  const [editingLiability, setEditingLiability] = useState<Liability | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nw, bd, hs, assetsList, liabilitiesList] = await Promise.all([
        calculateNetWorth(),
        getNetWorthBreakdown(),
        calculateFinancialHealthScore(0), // TODO: Get actual monthly expenses
        getAllAssets(),
        getAllLiabilities(),
      ]);

      setNetWorthData(nw);
      setBreakdown(bd);
      setHealthScore(hs);
      setAssets(assetsList);
      setLiabilities(liabilitiesList);
    } catch (error) {
      console.error('Failed to load net worth data:', error);
    }
  };

  // Asset handlers
  const handleAddAsset = () => {
    setEditingAsset(undefined);
    setIsAssetFormOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetFormOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(assetId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  const handleSubmitAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, assetData);
      } else {
        await addAsset(assetData);
      }
      await loadData();
      setIsAssetFormOpen(false);
      setEditingAsset(undefined);
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset. Please try again.');
    }
  };

  // Liability handlers
  const handleAddLiability = () => {
    setEditingLiability(undefined);
    setIsLiabilityFormOpen(true);
  };

  const handleEditLiability = (liability: Liability) => {
    setEditingLiability(liability);
    setIsLiabilityFormOpen(true);
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;
    try {
      await deleteLiability(liabilityId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete liability:', error);
      alert('Failed to delete liability. Please try again.');
    }
  };

  const handleSubmitLiability = async (liabilityData: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingLiability) {
        await updateLiability(editingLiability.id, liabilityData);
      } else {
        await addLiability(liabilityData);
      }
      await loadData();
      setIsLiabilityFormOpen(false);
      setEditingLiability(undefined);
    } catch (error) {
      console.error('Failed to save liability:', error);
      alert('Failed to save liability. Please try again.');
    }
  };

  const healthStatus = healthScore ? getFinancialHealthStatus(healthScore.score) : null;

  return (
    <Layout title="Net Worth">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Net Worth</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your assets and liabilities
            </p>
          </div>
        </div>

        {/* Net Worth Summary */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Net Worth
          </h3>
          <p className="text-4xl font-bold mb-4">
            {formatCurrency(netWorthData.netWorth)}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(netWorthData.totalAssets)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Liabilities</p>
              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(netWorthData.totalLiabilities)}
              </p>
            </div>
          </div>
        </Card>

        {/* Financial Health Score */}
        {healthScore && healthStatus && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Financial Health Score</h3>
              <div className="text-right">
                <p className="text-3xl font-bold">{healthScore.score}/100</p>
                <p className={`text-sm font-medium text-${healthStatus.color}-600`}>
                  {healthStatus.label}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
              <div
                className={`h-full bg-${healthStatus.color}-500 transition-all`}
                style={{ width: `${healthScore.score}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Net Worth</p>
                <p className="font-semibold">{healthScore.breakdown.netWorthScore}/30</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Debt Management</p>
                <p className="font-semibold">{healthScore.breakdown.debtScore}/25</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Emergency Fund</p>
                <p className="font-semibold">{healthScore.breakdown.emergencyFundScore}/25</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Liquidity</p>
                <p className="font-semibold">{healthScore.breakdown.liquidityScore}/20</p>
              </div>
            </div>
          </Card>
        )}

        {/* Asset Allocation */}
        {breakdown && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Liquid Assets</span>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.assetAllocation.liquid)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          breakdown.totalAssets > 0
                            ? (breakdown.assetAllocation.liquid / breakdown.totalAssets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Investments</span>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.assetAllocation.investment)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          breakdown.totalAssets > 0
                            ? (breakdown.assetAllocation.investment / breakdown.totalAssets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Physical Assets</span>
                    <span className="font-semibold">
                      {formatCurrency(breakdown.assetAllocation.physical)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          breakdown.totalAssets > 0
                            ? (breakdown.assetAllocation.physical / breakdown.totalAssets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Liability Breakdown</h3>
              {breakdown.totalLiabilities > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Secured Loans</span>
                      <span className="font-semibold">
                        {formatCurrency(breakdown.liabilityAllocation.secured)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${
                            breakdown.totalLiabilities > 0
                              ? (breakdown.liabilityAllocation.secured / breakdown.totalLiabilities) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Unsecured Loans</span>
                      <span className="font-semibold">
                        {formatCurrency(breakdown.liabilityAllocation.unsecured)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${
                            breakdown.totalLiabilities > 0
                              ? (breakdown.liabilityAllocation.unsecured /
                                  breakdown.totalLiabilities) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No liabilities recorded
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" className="w-full" onClick={handleAddAsset}>
            + Add Asset
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleAddLiability}>
            + Add Liability
          </Button>
        </div>

        {/* Assets List */}
        {assets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Assets</h3>
            <AssetList
              assets={assets}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
            />
          </div>
        )}

        {/* Liabilities List */}
        {liabilities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Liabilities</h3>
            <LiabilityList
              liabilities={liabilities}
              onEdit={handleEditLiability}
              onDelete={handleDeleteLiability}
            />
          </div>
        )}
      </div>

      {/* Asset Form Sheet */}
      <Sheet
        isOpen={isAssetFormOpen}
        onClose={() => setIsAssetFormOpen(false)}
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
      >
        <AssetForm
          asset={editingAsset}
          onSubmit={handleSubmitAsset}
          onCancel={() => setIsAssetFormOpen(false)}
        />
      </Sheet>

      {/* Liability Form Sheet */}
      <Sheet
        isOpen={isLiabilityFormOpen}
        onClose={() => setIsLiabilityFormOpen(false)}
        title={editingLiability ? 'Edit Liability' : 'Add New Liability'}
      >
        <LiabilityForm
          liability={editingLiability}
          onSubmit={handleSubmitLiability}
          onCancel={() => setIsLiabilityFormOpen(false)}
        />
      </Sheet>
    </Layout>
  );
}
