/**
 * PreviewCard Component
 * Shows parsed expense fields with inline editing
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import type { ParsedExpense } from '@/types';
import { getCategoryLabel, getPaymentMethodLabel } from '@/types';

interface PreviewCardProps {
  parsed: ParsedExpense;
  onSave: (expense: ParsedExpense) => void;
  onCancel: () => void;
}

export function PreviewCard({ parsed, onSave, onCancel }: PreviewCardProps) {
  const [editedExpense, setEditedExpense] = useState(parsed);
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'transfer'>(
    parsed.type || 'expense'
  );

  // Update when parsed changes
  useEffect(() => {
    setEditedExpense(parsed);
    setSelectedType(parsed.type || 'expense');
  }, [parsed]);

  const hasContent = parsed.amount || parsed.merchant || parsed.method;

  if (!hasContent) {
    return null;
  }

  const handleSave = () => {
    if (editedExpense.amount && editedExpense.amount > 0) {
      onSave({ ...editedExpense, type: selectedType });
    }
  };

  const handleTypeChange = (type: 'income' | 'expense' | 'transfer') => {
    setSelectedType(type);
    setEditedExpense({ ...editedExpense, type });
  };

  const isValid = editedExpense.amount && editedExpense.amount > 0;
  const confidenceColor =
    parsed.confidence.overall >= 0.7
      ? 'success'
      : parsed.confidence.overall >= 0.5
        ? 'warning'
        : 'danger';

  return (
    <Card variant="elevated" padding="lg" className="space-y-4">
      {/* Confidence Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Parsed Fields</h3>
        <Badge variant={confidenceColor} size="sm">
          {Math.round(parsed.confidence.overall * 100)}% confidence
        </Badge>
      </div>

      {/* Transaction Type Selector */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
        <button
          onClick={() => handleTypeChange('income')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            selectedType === 'income'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Income
        </button>
        <button
          onClick={() => handleTypeChange('expense')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            selectedType === 'expense'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Expense
        </button>
        <button
          onClick={() => handleTypeChange('transfer')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            selectedType === 'transfer'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Transfer
        </button>
      </div>

      {/* Amount */}
      {parsed.amount && (
        <div>
          <label className="text-sm font-medium text-muted">Amount</label>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                'text-2xl font-bold',
                selectedType === 'income' && 'text-green-600 dark:text-green-400',
                selectedType === 'expense' && 'text-red-600 dark:text-red-400',
                selectedType === 'transfer' && 'text-blue-600 dark:text-blue-400'
              )}
            >
              {selectedType === 'income' && '+'}
              {selectedType === 'expense' && '-'}
              {formatCurrency(Math.round(parsed.amount * 100))}
            </span>
            <Badge variant={parsed.confidence.amount >= 0.8 ? 'success' : 'warning'} size="sm">
              {Math.round(parsed.confidence.amount * 100)}%
            </Badge>
          </div>
        </div>
      )}

      {/* Merchant */}
      {parsed.merchant && (
        <div>
          <label className="text-sm font-medium text-muted">Merchant</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-medium">{parsed.merchant}</span>
            <Badge variant={parsed.confidence.merchant >= 0.7 ? 'success' : 'warning'} size="sm">
              {Math.round(parsed.confidence.merchant * 100)}%
            </Badge>
          </div>
        </div>
      )}

      {/* Category */}
      {parsed.category && (
        <div>
          <label className="text-sm font-medium text-muted">Category</label>
          <div className="mt-1">
            <Badge variant="outline">{getCategoryLabel(parsed.category)}</Badge>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {parsed.method && (
        <div>
          <label className="text-sm font-medium text-muted">Payment Method</label>
          <div className="mt-1">
            <Badge variant="outline">{getPaymentMethodLabel(parsed.method)}</Badge>
          </div>
        </div>
      )}

      {/* Date/Time */}
      {parsed.date && (
        <div>
          <label className="text-sm font-medium text-muted">Date & Time</label>
          <div className="mt-1 text-sm">
            {parsed.date.toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button fullWidth variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button fullWidth onClick={handleSave} disabled={!isValid}>
          Save Transaction
        </Button>
      </div>

      {/* Validation Warning */}
      {!isValid && (
        <p className="text-sm text-danger text-center">
          Please ensure amount is provided and valid
        </p>
      )}
    </Card>
  );
}
