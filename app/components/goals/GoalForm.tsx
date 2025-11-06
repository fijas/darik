'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  calculateRequiredSIP,
  calculateFutureValue,
  calculateProbability,
} from '@/lib/calculations/goals';
import { formatCurrency } from '@/lib/utils';

interface GoalFormProps {
  goal?: Goal; // If provided, form is in edit mode
  onSubmit: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'clock'>) => void;
  onCancel: () => void;
}

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'House/Property',
  'Car/Vehicle',
  'Education',
  'Retirement',
  'Vacation',
  'Wedding',
  'Business',
  'Other',
];

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    category: goal?.category || '',
    targetAmount: goal?.targetAmount ? (goal.targetAmount / 100).toString() : '',
    currentValue: goal?.currentValue ? (goal.currentValue / 100).toString() : '0',
    targetDate: goal?.targetDate
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : '',
    startDate: goal?.startDate
      ? new Date(goal.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    monthlySip: goal?.monthlySip ? (goal.monthlySip / 100).toString() : '',
    expectedReturnRate: goal?.expectedReturnRate?.toString() || '12',
    strategy: goal?.strategy || 'sip',
    priority: goal?.priority?.toString() || '1',
    notes: goal?.notes || '',
    status: goal?.status || 'active',
  });

  const [calculations, setCalculations] = useState({
    requiredSip: 0,
    projectedValue: 0,
    probability: 0,
    monthsRemaining: 0,
  });

  // Calculate metrics whenever form data changes
  useEffect(() => {
    const targetAmountPaise = parseFloat(formData.targetAmount || '0') * 100;
    const currentValuePaise = parseFloat(formData.currentValue || '0') * 100;
    const monthlySipPaise = parseFloat(formData.monthlySip || '0') * 100;
    const returnRate = parseFloat(formData.expectedReturnRate || '12');

    if (formData.targetDate && formData.startDate) {
      const targetDate = new Date(formData.targetDate);
      const now = new Date();

      const monthsTotal = Math.max(
        0,
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
          (targetDate.getMonth() - now.getMonth())
      );

      const requiredSip = calculateRequiredSIP(
        targetAmountPaise,
        currentValuePaise,
        returnRate,
        monthsTotal
      );

      const projectedValue = calculateFutureValue(
        currentValuePaise,
        monthlySipPaise,
        returnRate,
        monthsTotal
      );

      const probability = calculateProbability(
        currentValuePaise,
        monthlySipPaise,
        targetAmountPaise,
        returnRate,
        monthsTotal,
        5 // 5% volatility
      );

      setCalculations({
        requiredSip,
        projectedValue,
        probability,
        monthsRemaining: monthsTotal,
      });
    }
  }, [
    formData.targetAmount,
    formData.currentValue,
    formData.monthlySip,
    formData.expectedReturnRate,
    formData.targetDate,
    formData.startDate,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetDate || !formData.startDate) {
      alert('Please provide both target date and start date');
      return;
    }

    const targetAmountPaise = Math.round(parseFloat(formData.targetAmount || '0') * 100);
    const currentValuePaise = Math.round(parseFloat(formData.currentValue || '0') * 100);
    const monthlySipPaise = formData.monthlySip
      ? Math.round(parseFloat(formData.monthlySip) * 100)
      : undefined;

    const goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'clock'> = {
      name: formData.name,
      category: formData.category || undefined,
      targetAmount: targetAmountPaise,
      currentValue: currentValuePaise,
      targetDate: new Date(formData.targetDate).getTime(),
      startDate: new Date(formData.startDate).getTime(),
      monthlySip: monthlySipPaise,
      expectedReturnRate: parseFloat(formData.expectedReturnRate),
      strategy: formData.strategy as 'sip' | 'lumpsum' | 'hybrid',
      priority: parseInt(formData.priority),
      notes: formData.notes || undefined,
      status: formData.status as 'active' | 'achieved' | 'paused',
      linkedAccountIds: goal?.linkedAccountIds,
      linkedHoldingIds: goal?.linkedHoldingIds,
      deletedAt: goal?.deletedAt,
    };

    onSubmit(goalData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Goal Details</h3>

        <Input
          label="Goal Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., House Down Payment"
        />

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">Select category...</option>
            {GOAL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Amount (₹)"
            name="targetAmount"
            type="number"
            step="0.01"
            value={formData.targetAmount}
            onChange={handleChange}
            required
            placeholder="0.00"
          />

          <Input
            label="Current Value (₹)"
            name="currentValue"
            type="number"
            step="0.01"
            value={formData.currentValue}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Target Date"
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Investment Strategy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Investment Strategy</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <select
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="sip">SIP (Systematic Investment Plan)</option>
            <option value="lumpsum">Lumpsum</option>
            <option value="hybrid">Hybrid (SIP + Lumpsum)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Monthly SIP (₹)"
            name="monthlySip"
            type="number"
            step="0.01"
            value={formData.monthlySip}
            onChange={handleChange}
            placeholder="0.00"
          />

          <Input
            label="Expected Return Rate (%)"
            name="expectedReturnRate"
            type="number"
            step="0.1"
            value={formData.expectedReturnRate}
            onChange={handleChange}
            required
            placeholder="12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="1">Normal</option>
              <option value="2">High</option>
              <option value="3">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="achieved">Achieved</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Add any notes about this goal..."
          />
        </div>
      </div>

      {/* Calculations Display */}
      {calculations.monthsRemaining > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold">Projections</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Time Remaining</p>
              <p className="font-semibold text-lg">
                {calculations.monthsRemaining} months
              </p>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-400">Required Monthly SIP</p>
              <p className="font-semibold text-lg text-blue-600">
                {formatCurrency(calculations.requiredSip)}
              </p>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-400">Projected Value</p>
              <p className="font-semibold text-lg">
                {formatCurrency(calculations.projectedValue)}
              </p>
            </div>

            <div>
              <p className="text-gray-600 dark:text-gray-400">Success Probability</p>
              <p className="font-semibold text-lg">
                <span
                  className={
                    calculations.probability >= 80
                      ? 'text-green-600'
                      : calculations.probability >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }
                >
                  {calculations.probability}%
                </span>
              </p>
            </div>
          </div>

          {calculations.projectedValue < parseFloat(formData.targetAmount || '0') * 100 && (
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-amber-600">
                ⚠️ Current plan may not meet the target. Consider increasing your SIP or
                extending the timeline.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" variant="primary" className="flex-1">
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
