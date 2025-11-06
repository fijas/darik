'use client';

import { Goal } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import {
  calculateProgress,
  calculateMonthsRemaining,
  isGoalOnTrack,
  calculateRequiredSIP,
  calculateGoalShortfall,
} from '@/lib/calculations/goals';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onAchieve?: (goalId: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onAchieve }: GoalCardProps) {
  const progress = calculateProgress(goal.currentValue, goal.targetAmount);
  const monthsRemaining = calculateMonthsRemaining(new Date(goal.targetDate));
  const onTrack = isGoalOnTrack(
    goal.currentValue,
    goal.targetAmount,
    new Date(goal.startDate),
    new Date(goal.targetDate)
  );

  const requiredSip = calculateRequiredSIP(
    goal.targetAmount,
    goal.currentValue,
    goal.expectedReturnRate,
    monthsRemaining > 0 ? monthsRemaining : 0
  );

  const shortfall = calculateGoalShortfall(
    goal.currentValue,
    goal.targetAmount,
    goal.monthlySip || 0,
    goal.expectedReturnRate,
    monthsRemaining > 0 ? monthsRemaining : 0
  );

  const isOverdue = monthsRemaining < 0;
  const isAchieved = goal.status === 'achieved';
  const isPaused = goal.status === 'paused';
  const isNearlyDone = progress >= 95 && !isAchieved;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            {isAchieved && (
              <Badge variant="success">Achieved</Badge>
            )}
            {isPaused && (
              <Badge variant="warning">Paused</Badge>
            )}
            {isOverdue && !isAchieved && (
              <Badge variant="danger">Overdue</Badge>
            )}
            {onTrack && !isAchieved && !isOverdue && (
              <Badge variant="success">On Track</Badge>
            )}
            {!onTrack && !isAchieved && !isOverdue && !isPaused && (
              <Badge variant="warning">Behind</Badge>
            )}
          </div>
          {goal.category && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{goal.category}</p>
          )}
        </div>

        {/* Priority indicator */}
        {goal.priority > 1 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <span>★</span>
            <span>Priority {goal.priority}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetAmount)}
          </span>
          <span className="font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAchieved
                ? 'bg-green-500'
                : onTrack
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Target Date and Time Remaining */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Target Date</p>
          <p className="font-semibold">
            {new Date(goal.targetDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Time Remaining</p>
          <p className="font-semibold">
            {isOverdue ? (
              <span className="text-red-600">
                {Math.abs(monthsRemaining)} months overdue
              </span>
            ) : monthsRemaining === 0 ? (
              'This month'
            ) : monthsRemaining === 1 ? (
              '1 month'
            ) : (
              `${monthsRemaining} months`
            )}
          </p>
        </div>
      </div>

      {/* SIP Information */}
      {!isAchieved && monthsRemaining > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current SIP</p>
              <p className="font-semibold">
                {goal.monthlySip ? formatCurrency(goal.monthlySip) : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Required SIP</p>
              <p className="font-semibold">
                {formatCurrency(requiredSip)}
              </p>
            </div>
          </div>

          {/* Shortfall/Surplus */}
          {shortfall !== 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Projected {shortfall > 0 ? 'Surplus' : 'Shortfall'}
              </p>
              <p className={`text-sm font-semibold ${
                shortfall > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {shortfall > 0 ? '+' : ''}{formatCurrency(Math.abs(shortfall))}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {goal.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {goal.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        {onEdit && (
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            Edit
          </button>
        )}
        {onAchieve && !isAchieved && isNearlyDone && (
          <button
            onClick={() => onAchieve(goal.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
          >
            Mark Achieved
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}
