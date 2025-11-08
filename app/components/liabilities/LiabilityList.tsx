/**
 * LiabilityList Component
 * Displays list of liabilities with edit/delete actions
 */

'use client';

import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Liability } from '@/types/database';

interface LiabilityListProps {
  liabilities: Liability[];
  onEdit: (liability: Liability) => void;
  onDelete: (liabilityId: string) => void;
}

const liabilityTypeLabels: Record<string, string> = {
  home_loan: 'Home Loan',
  car_loan: 'Car Loan',
  gold_loan: 'Gold Loan',
  personal_loan: 'Personal Loan',
  education_loan: 'Education Loan',
  student_loan: 'Student Loan',
  cc: 'Credit Card',
  overdraft: 'Overdraft',
  other_loan: 'Other Loan',
  other: 'Other',
};

export function LiabilityList({ liabilities, onEdit, onDelete }: LiabilityListProps) {
  if (liabilities.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No liabilities yet. Track your loans and debts here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {liabilities.map((liability) => (
        <Card key={liability.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{liability.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                  {liabilityTypeLabels[liability.type] || liability.type}
                </span>
              </div>

              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(liability.currentBalance)}
              </p>

              {liability.lender && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Lender: {liability.lender}
                </p>
              )}

              {liability.account && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Account: •••• {liability.account.slice(-4)}
                </p>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interest: {liability.interestRate}% p.a.
              </p>

              {liability.emiAmount && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  EMI: {formatCurrency(liability.emiAmount)}
                  {liability.nextEmiDate && (
                    <span> • Next: {new Date(liability.nextEmiDate).toLocaleDateString()}</span>
                  )}
                </p>
              )}

              {liability.maturityDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Matures: {new Date(liability.maturityDate).toLocaleDateString()}
                </p>
              )}

              {liability.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {liability.notes}
                </p>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(liability)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(liability.id)}
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
