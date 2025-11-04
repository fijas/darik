/**
 * Capture Page (Home)
 * Quick expense capture with natural language input
 */

'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { CaptureInput } from '@/components/capture/CaptureInput';
import { PreviewCard } from '@/components/capture/PreviewCard';
import { RecentTransactions } from '@/components/capture/RecentTransactions';
import { db } from '@/lib/db/schema';
import type { ParsedExpense, Transaction } from '@/types';
import { TransactionSource, Currency, TransactionCategory, PaymentMethod } from '@/types';

export default function CapturePage() {
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleParsed = (parsed: ParsedExpense) => {
    setParsedExpense(parsed);
  };

  const handleSave = async (expense: ParsedExpense) => {
    if (!expense.amount || expense.amount <= 0) return;

    try {
      // Create transaction object
      const now = Date.now();
      const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId: 'local', // Will be set during first sync
        type: 'expense', // Default to expense
        createdTs: now,
        postedTs: now,
        amountPaise: Math.round(expense.amount * 100), // Convert to paise
        currency: expense.currency || Currency.INR,
        merchant: expense.merchant || 'Unknown',
        category: expense.category || TransactionCategory.OTHER,
        method: expense.method || PaymentMethod.CASH,
        note: expense.note,
        rawText: expense.raw,
        isRecurring: false, // Default to non-recurring
        source: TransactionSource.MANUAL,
      };

      // Save to IndexedDB
      await db.transactions.add(transaction);

      // Clear the form and refresh the list
      setParsedExpense(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      // TODO: Show error toast in Phase 4
    }
  };

  const handleCancel = () => {
    setParsedExpense(null);
  };

  const handleEdit = (_transaction: Transaction) => {
    // TODO: Implement edit functionality in Phase 3.5
    console.log('Edit not yet implemented');
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete transaction
      await db.transactions.delete(id);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      // TODO: Show error toast in Phase 4
    }
  };

  return (
    <Layout title="Capture">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Capture Input */}
        <div className="space-y-4">
          <CaptureInput onParsed={handleParsed} />

          {/* Preview Card - only show if we have parsed data */}
          {parsedExpense && (parsedExpense.amount || parsedExpense.merchant) && (
            <PreviewCard
              parsed={parsedExpense}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Recent Transactions */}
        <RecentTransactions
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </Layout>
  );
}
