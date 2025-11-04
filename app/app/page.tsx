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
import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/db';
import type { ParsedExpense, Transaction } from '@/types';
import { TransactionSource, Currency, TransactionCategory, PaymentMethod } from '@/types';

export default function CapturePage() {
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleParsed = (parsed: ParsedExpense) => {
    setParsedExpense(parsed);
  };

  // Convert Transaction to ParsedExpense for editing
  const transactionToParsed = (transaction: Transaction): ParsedExpense => {
    return {
      amount: transaction.amountPaise / 100, // Convert paise to rupees
      merchant: transaction.merchant,
      category: transaction.category,
      method: transaction.method,
      date: new Date(transaction.createdTs),
      note: transaction.note,
      currency: transaction.currency,
      type: transaction.type, // Include transaction type
      raw: transaction.rawText || '',
      tokens: transaction.rawText?.split(/\s+/) || [],
      confidence: {
        amount: 1.0,
        merchant: 1.0,
        category: 1.0,
        method: 1.0,
        date: 1.0,
        overall: 1.0,
      },
      ambiguities: [],
      suggestions: [],
    };
  };

  const handleSave = async (expense: ParsedExpense) => {
    if (!expense.amount || expense.amount <= 0) return;

    try {
      if (editingTransaction) {
        // Update existing transaction
        await updateTransaction(editingTransaction.id, {
          type: expense.type || 'expense', // Update transaction type
          amountPaise: Math.round(expense.amount * 100), // Convert to paise
          currency: expense.currency || Currency.INR,
          merchant: expense.merchant || 'Unknown',
          category: expense.category || TransactionCategory.OTHER,
          method: expense.method || PaymentMethod.CASH,
          note: expense.note,
          rawText: expense.raw,
        });
      } else {
        // Create new transaction
        const now = Date.now();
        await addTransaction({
          userId: 'local', // Will be set during first sync
          type: expense.type || 'expense', // Use parsed type, default to expense
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
        });
      }

      // Clear the form and refresh the list
      setParsedExpense(null);
      setEditingTransaction(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      // TODO: Show error toast in Phase 4
    }
  };

  const handleCancel = () => {
    setParsedExpense(null);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    // Convert transaction to parsed expense format
    const parsed = transactionToParsed(transaction);
    setParsedExpense(parsed);
    setEditingTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete transaction
      await deleteTransaction(id);
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
