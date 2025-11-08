/**
 * AssetList Component
 * Displays list of assets with edit/delete actions
 */

'use client';

import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Asset } from '@/types/database';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

const assetTypeLabels: Record<string, string> = {
  bank: 'Bank Account',
  cash: 'Cash',
  emergency_fund: 'Emergency Fund',
  fd: 'Fixed Deposit',
  property: 'Property',
  pf: 'Provident Fund',
  ppf: 'PPF',
  epf: 'EPF',
  nps: 'NPS',
  bonds: 'Bonds',
  crypto: 'Cryptocurrency',
  other_investment: 'Other Investment',
  vehicle: 'Vehicle',
  gold_physical: 'Physical Gold',
  jewelry: 'Jewelry',
};

export function AssetList({ assets, onEdit, onDelete }: AssetListProps) {
  if (assets.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No assets yet. Add your first asset to track your net worth.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <Card key={asset.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{asset.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                  {assetTypeLabels[asset.type] || asset.type}
                </span>
              </div>

              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(asset.currentValue)}
              </p>

              {asset.account && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Account: •••• {asset.account.slice(-4)}
                </p>
              )}

              {asset.interestRate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interest: {asset.interestRate}% p.a.
                </p>
              )}

              {asset.maturityDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Matures: {new Date(asset.maturityDate).toLocaleDateString()}
                </p>
              )}

              {asset.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {asset.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(asset)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(asset.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
