/**
 * AssetForm Component
 * Form for adding/editing assets
 */

'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { Asset } from '@/types/database';
import { AssetType, RepriceRule } from '@/types/enums';

interface AssetFormProps {
  asset?: Asset;
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function AssetForm({ asset, onSubmit, onCancel }: AssetFormProps) {
  const [formData, setFormData] = useState({
    type: asset?.type || AssetType.BANK,
    name: asset?.name || '',
    currentValue: asset?.currentValue ? asset.currentValue / 100 : 0, // Convert from paise
    repriceRule: asset?.repriceRule || RepriceRule.MANUAL,
    account: asset?.account || '',
    maturityDate: asset?.maturityDate ? new Date(asset.maturityDate).toISOString().split('T')[0] : '',
    interestRate: asset?.interestRate || '',
    notes: asset?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.currentValue <= 0) newErrors.currentValue = 'Value must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      type: formData.type,
      name: formData.name.trim(),
      currentValue: Math.round(formData.currentValue * 100), // Convert to paise
      repriceRule: formData.repriceRule,
      account: formData.account.trim() || undefined,
      maturityDate: formData.maturityDate ? new Date(formData.maturityDate).getTime() : undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate as string) : undefined,
      notes: formData.notes.trim() || undefined,
      clock: asset?.clock || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Asset Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Asset Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={AssetType.BANK}>Bank Account</option>
          <option value={AssetType.CASH}>Cash</option>
          <option value={AssetType.EMERGENCY_FUND}>Emergency Fund</option>
          <option value={AssetType.FIXED_DEPOSIT}>Fixed Deposit</option>
          <option value={AssetType.PPF}>PPF</option>
          <option value={AssetType.EPF}>EPF</option>
          <option value={AssetType.PROVIDENT_FUND}>Provident Fund</option>
          <option value={AssetType.NPS}>NPS</option>
          <option value={AssetType.PROPERTY}>Property</option>
          <option value={AssetType.VEHICLE}>Vehicle</option>
          <option value={AssetType.GOLD_PHYSICAL}>Physical Gold</option>
          <option value={AssetType.JEWELRY}>Jewelry</option>
          <option value={AssetType.BONDS}>Bonds</option>
          <option value={AssetType.CRYPTO}>Cryptocurrency</option>
          <option value={AssetType.OTHER_INVESTMENT}>Other Investment</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., HDFC Savings Account"
          error={errors.name}
        />
      </div>

      {/* Current Value */}
      <div>
        <label className="block text-sm font-medium mb-1">Current Value (₹)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.currentValue}
          onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          error={errors.currentValue}
        />
      </div>

      {/* Reprice Rule */}
      <div>
        <label className="block text-sm font-medium mb-1">Update Method</label>
        <select
          value={formData.repriceRule}
          onChange={(e) => setFormData({ ...formData, repriceRule: e.target.value as RepriceRule })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={RepriceRule.MANUAL}>Manual Update</option>
          <option value={RepriceRule.DAILY}>Daily</option>
          <option value={RepriceRule.WEEKLY}>Weekly</option>
          <option value={RepriceRule.MONTHLY}>Monthly</option>
          <option value={RepriceRule.QUARTERLY}>Quarterly</option>
          <option value={RepriceRule.YEARLY}>Yearly</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          How often should this asset&apos;s value be updated?
        </p>
      </div>

      {/* Account Number (optional) */}
      {[AssetType.BANK, AssetType.FIXED_DEPOSIT, AssetType.PPF, AssetType.EPF].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium mb-1">Account Number (optional)</label>
          <Input
            value={formData.account}
            onChange={(e) => setFormData({ ...formData, account: e.target.value })}
            placeholder="Last 4 digits recommended"
          />
        </div>
      )}

      {/* Maturity Date (for FD, PPF, etc.) */}
      {[AssetType.FIXED_DEPOSIT, AssetType.PPF, AssetType.BONDS].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium mb-1">Maturity Date (optional)</label>
          <Input
            type="date"
            value={formData.maturityDate}
            onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
          />
        </div>
      )}

      {/* Interest Rate (for FD, PPF, etc.) */}
      {[AssetType.FIXED_DEPOSIT, AssetType.PPF, AssetType.EPF, AssetType.BONDS].includes(formData.type) && (
        <div>
          <label className="block text-sm font-medium mb-1">Interest Rate (% p.a., optional)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="7.5"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          {asset ? 'Update' : 'Add'} Asset
        </Button>
      </div>
    </form>
  );
}
