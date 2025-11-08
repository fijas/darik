/**
 * LiabilityForm Component
 * Form for adding/editing liabilities
 */

'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import type { Liability } from '@/types/database';
import { LiabilityType } from '@/types/enums';

interface LiabilityFormProps {
  liability?: Liability;
  onSubmit: (data: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function LiabilityForm({ liability, onSubmit, onCancel }: LiabilityFormProps) {
  const [formData, setFormData] = useState({
    type: liability?.type || LiabilityType.PERSONAL_LOAN,
    name: liability?.name || '',
    currentBalance: liability?.currentBalance ? liability.currentBalance / 100 : 0,
    interestRate: liability?.interestRate || 0,
    emiAmount: liability?.emiAmount ? liability.emiAmount / 100 : '',
    nextEmiDate: liability?.nextEmiDate ? new Date(liability.nextEmiDate).toISOString().split('T')[0] : '',
    account: liability?.account || '',
    startDate: liability?.startDate ? new Date(liability.startDate).toISOString().split('T')[0] : '',
    maturityDate: liability?.maturityDate ? new Date(liability.maturityDate).toISOString().split('T')[0] : '',
    lender: liability?.lender || '',
    notes: liability?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.currentBalance <= 0) newErrors.currentBalance = 'Balance must be greater than 0';
    if (formData.interestRate < 0) newErrors.interestRate = 'Interest rate must be 0 or greater';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      type: formData.type,
      name: formData.name.trim(),
      currentBalance: Math.round(formData.currentBalance * 100),
      interestRate: formData.interestRate,
      emiAmount: formData.emiAmount ? Math.round(parseFloat(formData.emiAmount as string) * 100) : undefined,
      nextEmiDate: formData.nextEmiDate ? new Date(formData.nextEmiDate).getTime() : undefined,
      account: formData.account.trim() || undefined,
      startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
      maturityDate: formData.maturityDate ? new Date(formData.maturityDate).getTime() : undefined,
      lender: formData.lender.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      clock: liability?.clock || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Liability Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Liability Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as LiabilityType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={LiabilityType.HOME_LOAN}>Home Loan</option>
          <option value={LiabilityType.CAR_LOAN}>Car Loan</option>
          <option value={LiabilityType.GOLD_LOAN}>Gold Loan</option>
          <option value={LiabilityType.PERSONAL_LOAN}>Personal Loan</option>
          <option value={LiabilityType.EDUCATION_LOAN}>Education Loan</option>
          <option value={LiabilityType.STUDENT_LOAN}>Student Loan</option>
          <option value={LiabilityType.CREDIT_CARD}>Credit Card</option>
          <option value={LiabilityType.OVERDRAFT}>Overdraft</option>
          <option value={LiabilityType.OTHER_LOAN}>Other Loan</option>
          <option value={LiabilityType.OTHER}>Other</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., HDFC Home Loan"
          error={errors.name}
        />
      </div>

      {/* Current Balance */}
      <div>
        <label className="block text-sm font-medium mb-1">Outstanding Balance (₹)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.currentBalance}
          onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          error={errors.currentBalance}
        />
      </div>

      {/* Interest Rate */}
      <div>
        <label className="block text-sm font-medium mb-1">Interest Rate (% p.a.)</label>
        <Input
          type="number"
          step="0.01"
          value={formData.interestRate}
          onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
          placeholder="7.5"
          error={errors.interestRate}
        />
      </div>

      {/* EMI Amount */}
      {formData.type !== LiabilityType.CREDIT_CARD && formData.type !== LiabilityType.OVERDRAFT && (
        <div>
          <label className="block text-sm font-medium mb-1">EMI Amount (₹, optional)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.emiAmount}
            onChange={(e) => setFormData({ ...formData, emiAmount: e.target.value })}
            placeholder="0.00"
          />
        </div>
      )}

      {/* Next EMI Date */}
      {formData.emiAmount && (
        <div>
          <label className="block text-sm font-medium mb-1">Next EMI Date (optional)</label>
          <Input
            type="date"
            value={formData.nextEmiDate}
            onChange={(e) => setFormData({ ...formData, nextEmiDate: e.target.value })}
          />
        </div>
      )}

      {/* Lender */}
      <div>
        <label className="block text-sm font-medium mb-1">Lender (optional)</label>
        <Input
          value={formData.lender}
          onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
          placeholder="e.g., HDFC Bank"
        />
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-medium mb-1">Account/Loan Number (optional)</label>
        <Input
          value={formData.account}
          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
          placeholder="Last 4 digits recommended"
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Start Date (optional)</label>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
      </div>

      {/* Maturity Date */}
      {formData.type !== LiabilityType.CREDIT_CARD && formData.type !== LiabilityType.OVERDRAFT && (
        <div>
          <label className="block text-sm font-medium mb-1">Maturity Date (optional)</label>
          <Input
            type="date"
            value={formData.maturityDate}
            onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
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
          {liability ? 'Update' : 'Add'} Liability
        </Button>
      </div>
    </form>
  );
}
