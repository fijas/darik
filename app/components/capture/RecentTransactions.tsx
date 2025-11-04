/**
 * RecentTransactions Component
 * Shows last 10 transactions with quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
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

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted">Recent</h3>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card
            key={transaction.id}
            variant="outlined"
            padding="md"
            className="transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              {/* Left: Merchant & Category */}
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

              {/* Right: Amount & Actions */}
              <div className="flex items-center gap-3 ml-4">
                <p className="text-sm font-semibold whitespace-nowrap">
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
