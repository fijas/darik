'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { Goal } from '@/types/database';
import {
  getGoalsByPriority,
  addGoal,
  updateGoal,
  deleteGoal,
  markGoalAsAchieved,
  getGoalStats,
} from '@/lib/db/goals';
import { formatCurrency } from '@/lib/utils';

export default function PlanPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    achieved: 0,
    paused: 0,
    overdue: 0,
    totalTargetAmount: 0,
    totalCurrentValue: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'achieved' | 'paused'>('all');

  // Load goals on mount
  useEffect(() => {
    loadGoals();
  }, [filterStatus]);

  const loadGoals = async () => {
    try {
      const allGoals = await getGoalsByPriority();
      const goalStats = await getGoalStats();

      // Filter based on status
      const filtered = filterStatus === 'all'
        ? allGoals
        : allGoals.filter(g => g.status === filterStatus);

      setGoals(filtered);
      setStats(goalStats);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleAddGoal = () => {
    setEditingGoal(undefined);
    setIsFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const handleAchieveGoal = async (goalId: string) => {
    try {
      await markGoalAsAchieved(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Failed to mark goal as achieved:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleSubmitGoal = async (
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'clock'>
  ) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await addGoal(goalData);
      }
      await loadGoals();
      setIsFormOpen(false);
      setEditingGoal(undefined);
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  const progressPercentage = stats.totalTargetAmount > 0
    ? Math.round((stats.totalCurrentValue / stats.totalTargetAmount) * 100)
    : 0;

  return (
    <Layout title="Plan">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress towards your goals
            </p>
          </div>
          <Button onClick={handleAddGoal}>+ Add Goal</Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Goals</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Achieved</p>
            <p className="text-2xl font-bold text-green-600">{stats.achieved}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </Card>
        </div>

        {/* Overall Progress */}
        {stats.totalTargetAmount > 0 && (
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Overall Progress</h3>
              <span className="text-lg font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formatCurrency(stats.totalCurrentValue)}</span>
              <span>{formatCurrency(stats.totalTargetAmount)}</span>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(['all', 'active', 'achieved', 'paused'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filterStatus === status
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filterStatus === 'all'
                  ? 'No goals yet. Set your first financial goal!'
                  : `No ${filterStatus} goals.`}
              </p>
              {filterStatus === 'all' && (
                <Button onClick={handleAddGoal}>+ Add Your First Goal</Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onAchieve={handleAchieveGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal Form Sheet */}
      <Sheet
        isOpen={isFormOpen}
        onClose={handleCancelForm}
        title={editingGoal ? 'Edit Goal' : 'Add New Goal'}
      >
        <GoalForm
          goal={editingGoal}
          onSubmit={handleSubmitGoal}
          onCancel={handleCancelForm}
        />
      </Sheet>
    </Layout>
  );
}
