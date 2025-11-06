/**
 * Goals Database Operations
 *
 * CRUD operations for financial goals in IndexedDB (Dexie)
 */

import { db } from './schema';
import { Goal } from '@/types/database';

/**
 * Add a new goal
 */
export async function addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'clock'>): Promise<string> {
  const now = Date.now();
  const clock = await db.getNextClock();

  const newGoal: Goal = {
    ...goal,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    clock,
  };

  await db.goals.add(newGoal);
  return newGoal.id;
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'clock'>>
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(id, {
    ...updates,
    updatedAt: now,
    clock,
  });
}

/**
 * Delete a goal (soft delete with tombstone)
 */
export async function deleteGoal(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(id, {
    deletedAt: now,
    updatedAt: now,
    clock,
  });
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(id: string): Promise<Goal | undefined> {
  const goal = await db.goals.get(id);
  // Filter out soft-deleted goals
  if (goal?.deletedAt) return undefined;
  return goal;
}

/**
 * Get all active goals (not deleted)
 */
export async function getAllGoals(): Promise<Goal[]> {
  return db.goals
    .filter(goal => !goal.deletedAt)
    .toArray();
}

/**
 * Get goals by status
 */
export async function getGoalsByStatus(status: 'active' | 'achieved' | 'paused'): Promise<Goal[]> {
  return db.goals
    .filter(goal => !goal.deletedAt && goal.status === status)
    .toArray();
}

/**
 * Get active goals sorted by priority
 */
export async function getGoalsByPriority(): Promise<Goal[]> {
  const goals = await db.goals
    .filter(goal => !goal.deletedAt && goal.status === 'active')
    .toArray();

  // Sort by priority (higher priority first), then by target date (sooner first)
  return goals.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.targetDate - b.targetDate;
  });
}

/**
 * Get goals by target date range
 */
export async function getGoalsByDateRange(startDate: number, endDate: number): Promise<Goal[]> {
  return db.goals
    .filter(goal =>
      !goal.deletedAt &&
      goal.targetDate >= startDate &&
      goal.targetDate <= endDate
    )
    .toArray();
}

/**
 * Get upcoming goals (target date within next N months)
 */
export async function getUpcomingGoals(months: number = 12): Promise<Goal[]> {
  const now = Date.now();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + months);

  return db.goals
    .filter(goal =>
      !goal.deletedAt &&
      goal.status === 'active' &&
      goal.targetDate >= now &&
      goal.targetDate <= futureDate.getTime()
    )
    .sortBy('targetDate');
}

/**
 * Get overdue goals (target date in the past, not achieved)
 */
export async function getOverdueGoals(): Promise<Goal[]> {
  const now = Date.now();

  return db.goals
    .filter(goal =>
      !goal.deletedAt &&
      goal.status === 'active' &&
      goal.targetDate < now
    )
    .sortBy('targetDate');
}

/**
 * Mark a goal as achieved
 */
export async function markGoalAsAchieved(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(id, {
    status: 'achieved',
    updatedAt: now,
    clock,
  });
}

/**
 * Pause a goal
 */
export async function pauseGoal(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(id, {
    status: 'paused',
    updatedAt: now,
    clock,
  });
}

/**
 * Resume a paused goal
 */
export async function resumeGoal(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(id, {
    status: 'active',
    updatedAt: now,
    clock,
  });
}

/**
 * Get goal statistics
 */
export async function getGoalStats(): Promise<{
  total: number;
  active: number;
  achieved: number;
  paused: number;
  overdue: number;
  totalTargetAmount: number;
  totalCurrentValue: number;
}> {
  const allGoals = await db.goals
    .filter(goal => !goal.deletedAt)
    .toArray();

  const now = Date.now();

  return {
    total: allGoals.length,
    active: allGoals.filter(g => g.status === 'active').length,
    achieved: allGoals.filter(g => g.status === 'achieved').length,
    paused: allGoals.filter(g => g.status === 'paused').length,
    overdue: allGoals.filter(g => g.status === 'active' && g.targetDate < now).length,
    totalTargetAmount: allGoals.reduce((sum, g) => sum + g.targetAmount, 0),
    totalCurrentValue: allGoals.reduce((sum, g) => sum + g.currentValue, 0),
  };
}

/**
 * Bulk add goals (useful for import/sync)
 */
export async function bulkAddGoals(goals: Goal[]): Promise<void> {
  await db.goals.bulkPut(goals);
}

/**
 * Search goals by name or notes
 */
export async function searchGoals(query: string): Promise<Goal[]> {
  const lowerQuery = query.toLowerCase();

  return db.goals
    .filter(goal => {
      if (goal.deletedAt) return false;
      return (
        goal.name.toLowerCase().includes(lowerQuery) ||
        (goal.notes?.toLowerCase().includes(lowerQuery) ?? false)
      );
    })
    .toArray();
}

/**
 * Get goals linked to specific accounts
 */
export async function getGoalsByAccount(accountIds: string[]): Promise<Goal[]> {
  return db.goals
    .filter(goal => {
      if (goal.deletedAt) return false;
      if (!goal.linkedAccountIds || goal.linkedAccountIds.length === 0) return false;
      return goal.linkedAccountIds.some(id => accountIds.includes(id));
    })
    .toArray();
}

/**
 * Update goal's current value based on linked holdings
 */
export async function updateGoalCurrentValue(
  goalId: string,
  newValue: number
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.goals.update(goalId, {
    currentValue: newValue,
    updatedAt: now,
    clock,
  });
}
