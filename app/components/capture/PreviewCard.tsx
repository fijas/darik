/**
 * PreviewCard Component
 * Shows parsed expense fields with inline editing
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { ParsedExpense } from '@/types';
import { getCategoryLabel, getPaymentMethodLabel } from '@/types';

interface PreviewCardProps {
  parsed: ParsedExpense;
  onSave: (expense: ParsedExpense) => void;
  onCancel: () => void;
}

export function PreviewCard({ parsed, onSave, onCancel }: PreviewCardProps) {
  const [editedExpense, setEditedExpense] = useState(parsed);

  // Update when parsed changes
  useEffect(() => {
    setEditedExpense(parsed);
  }, [parsed]);

  const hasContent = parsed.amount || parsed.merchant || parsed.method;

  if (!hasContent) {
    return null;
  }

  const handleSave = () => {
    if (editedExpense.amount && editedExpense.amount > 0) {
      onSave(editedExpense);
    }
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

      {/* Amount */}
      {parsed.amount && (
        <div>
          <label className="text-sm font-medium text-muted">Amount</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-bold">
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
