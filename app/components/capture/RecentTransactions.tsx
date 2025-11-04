/**
 * RecentTransactions Component
 * Shows last 10 transactions with quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { db } from '@/lib/db/schema';
import type { Transaction } from '@/types';
import { getCategoryLabel, getPaymentMethodLabel } from '@/types';

interface RecentTransactionsProps {
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  refreshTrigger?: number;
}

export function RecentTransactions({ onEdit, onDelete, refreshTrigger = 0 }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const recent = await db.transactions
        .orderBy('createdTs')
        .reverse()
        .limit(10)
        .toArray();
      setTransactions(recent);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted">Recent</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted">Recent</h3>
        <Card variant="outlined" padding="lg" className="text-center">
          <p className="text-sm text-muted">No transactions yet</p>
          <p className="text-xs text-muted mt-1">Start by adding your first expense above</p>
        </Card>
      </div>
    );
  }

  // Calculate net income/expense
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountPaise, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountPaise, 0);
  const netAmount = totalIncome - totalExpense;

  return (
    <div className="space-y-2">
      {/* Header with Net Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted">Recent</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-green-600 dark:text-green-400">
            +{formatCurrency(totalIncome)}
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{formatCurrency(totalExpense)}
          </span>
          <span
            className={cn(
              'font-semibold',
              netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {netAmount >= 0 ? '+' : ''}
            {formatCurrency(netAmount)}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            variant="outlined"
            padding="md"
            className="transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              {/* Left: Icon, Merchant & Category */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {/* Income/Expense Icon */}
                {transaction.type === 'income' ? (
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                ) : transaction.type === 'transfer' ? (
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {transaction.merchant || 'Unknown Merchant'}
                    </p>
                    {transaction.category && (
                      <Badge variant="outline" size="sm">
                        {getCategoryLabel(transaction.category)}
                      </Badge>
                    )}
                  </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted">
                    {new Date(transaction.createdTs).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {transaction.method && (
                    <>
                      <span className="text-xs text-muted">•</span>
                      <p className="text-xs text-muted">
                        {getPaymentMethodLabel(transaction.method)}
                      </p>
                    </>
                  )}
                </div>
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center gap-3 ml-4">
                <p
                  className={cn(
                    'text-sm font-semibold whitespace-nowrap',
                    transaction.type === 'income' && 'text-green-600 dark:text-green-400',
                    transaction.type === 'expense' && 'text-red-600 dark:text-red-400',
                    transaction.type === 'transfer' && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {transaction.type === 'income' && '+'}
                  {transaction.type === 'expense' && '-'}
                  {formatCurrency(transaction.amountPaise)}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-1.5 rounded hover:bg-surface-hover transition-colors"
                      aria-label="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-1.5 rounded hover:bg-danger/10 transition-colors"
                      aria-label="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-danger"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
