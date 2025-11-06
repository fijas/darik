/**
 * Liabilities Database Operations
 *
 * CRUD operations for liabilities in IndexedDB (Dexie)
 */

import { db } from './schema';
import { Liability } from '@/types/database';
import { LiabilityType } from '@/types/enums';

/**
 * Add a new liability
 */
export async function addLiability(
  liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt' | 'clock'>
): Promise<string> {
  const now = Date.now();
  const clock = await db.getNextClock();

  const newLiability: Liability = {
    ...liability,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    clock,
  };

  await db.liabilities.add(newLiability);
  return newLiability.id;
}

/**
 * Update an existing liability
 */
export async function updateLiability(
  id: string,
  updates: Partial<Omit<Liability, 'id' | 'createdAt' | 'updatedAt' | 'clock'>>
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.liabilities.update(id, {
    ...updates,
    updatedAt: now,
    clock,
  });
}

/**
 * Delete a liability (soft delete with tombstone)
 */
export async function deleteLiability(id: string): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.liabilities.update(id, {
    deletedAt: now,
    updatedAt: now,
    clock,
  });
}

/**
 * Get a single liability by ID
 */
export async function getLiabilityById(id: string): Promise<Liability | undefined> {
  const liability = await db.liabilities.get(id);
  // Filter out soft-deleted liabilities
  if (liability?.deletedAt) return undefined;
  return liability;
}

/**
 * Get all active liabilities (not deleted)
 */
export async function getAllLiabilities(): Promise<Liability[]> {
  return db.liabilities
    .filter(liability => !liability.deletedAt)
    .toArray();
}

/**
 * Get liabilities by type
 */
export async function getLiabilitiesByType(type: Liability['type']): Promise<Liability[]> {
  return db.liabilities
    .filter(liability => !liability.deletedAt && liability.type === type)
    .toArray();
}

/**
 * Get liabilities by multiple types
 */
export async function getLiabilitiesByTypes(types: Liability['type'][]): Promise<Liability[]> {
  return db.liabilities
    .filter(liability => !liability.deletedAt && types.includes(liability.type))
    .toArray();
}

/**
 * Get secured liabilities (home_loan, car_loan, gold_loan)
 */
export async function getSecuredLiabilities(): Promise<Liability[]> {
  return getLiabilitiesByTypes([
    LiabilityType.HOME_LOAN,
    LiabilityType.CAR_LOAN,
    LiabilityType.GOLD_LOAN,
  ]);
}

/**
 * Get unsecured liabilities (personal_loan, credit_card, student_loan)
 */
export async function getUnsecuredLiabilities(): Promise<Liability[]> {
  return getLiabilitiesByTypes([
    LiabilityType.PERSONAL_LOAN,
    LiabilityType.CREDIT_CARD,
    LiabilityType.STUDENT_LOAN,
    LiabilityType.OTHER_LOAN,
  ]);
}

/**
 * Calculate total liability value
 */
export async function getTotalLiabilityValue(): Promise<number> {
  const liabilities = await getAllLiabilities();
  return liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
}

/**
 * Calculate liability value by type
 */
export async function getLiabilityValueByType(type: Liability['type']): Promise<number> {
  const liabilities = await getLiabilitiesByType(type);
  return liabilities.reduce((sum, liability) => sum + liability.currentBalance, 0);
}

/**
 * Get liabilities grouped by category
 */
export async function getLiabilitiesGroupedByCategory(): Promise<Record<string, Liability[]>> {
  const liabilities = await getAllLiabilities();
  const grouped: Record<string, Liability[]> = {};

  liabilities.forEach(liability => {
    const category = liability.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(liability);
  });

  return grouped;
}

/**
 * Get liability allocation breakdown
 */
export async function getLiabilityAllocation(): Promise<{
  secured: number;
  unsecured: number;
  total: number;
}> {
  const [secured, unsecured] = await Promise.all([
    getSecuredLiabilities(),
    getUnsecuredLiabilities(),
  ]);

  const securedValue = secured.reduce((sum, l) => sum + l.currentBalance, 0);
  const unsecuredValue = unsecured.reduce((sum, l) => sum + l.currentBalance, 0);

  return {
    secured: securedValue,
    unsecured: unsecuredValue,
    total: securedValue + unsecuredValue,
  };
}

/**
 * Search liabilities by name or notes
 */
export async function searchLiabilities(query: string): Promise<Liability[]> {
  const lowerQuery = query.toLowerCase();

  return db.liabilities
    .filter(liability => {
      if (liability.deletedAt) return false;
      return (
        liability.name.toLowerCase().includes(lowerQuery) ||
        (liability.notes?.toLowerCase().includes(lowerQuery) ?? false) ||
        (liability.lender?.toLowerCase().includes(lowerQuery) ?? false)
      );
    })
    .toArray();
}

/**
 * Update liability balance (for payments)
 */
export async function updateLiabilityBalance(
  id: string,
  newBalance: number
): Promise<void> {
  const now = Date.now();
  const clock = await db.getNextClock();

  await db.liabilities.update(id, {
    currentBalance: newBalance,
    updatedAt: now,
    clock,
  });
}

/**
 * Record a payment towards a liability
 */
export async function recordLiabilityPayment(
  id: string,
  paymentAmount: number
): Promise<void> {
  const liability = await getLiabilityById(id);
  if (!liability) throw new Error('Liability not found');

  const newBalance = Math.max(0, liability.currentBalance - paymentAmount);
  await updateLiabilityBalance(id, newBalance);
}

/**
 * Calculate EMI using reducing balance method
 *
 * Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * where:
 * - P = principal amount (in paise)
 * - r = monthly interest rate (annualRate / 12 / 100)
 * - n = number of months
 *
 * @param principal Principal amount in paise
 * @param annualInterestRate Annual interest rate as percentage (e.g., 8.5 for 8.5%)
 * @param tenureMonths Loan tenure in months
 * @returns Monthly EMI in paise
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): number {
  if (tenureMonths === 0) return principal;
  if (annualInterestRate === 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const n = tenureMonths;

  const emi = principal *
              monthlyRate *
              Math.pow(1 + monthlyRate, n) /
              (Math.pow(1 + monthlyRate, n) - 1);

  return Math.round(emi);
}

/**
 * Calculate remaining tenure from current balance and EMI
 */
export function calculateRemainingTenure(
  currentBalance: number,
  emiAmount: number,
  annualInterestRate: number
): number {
  if (emiAmount === 0 || currentBalance === 0) return 0;
  if (annualInterestRate === 0) return Math.ceil(currentBalance / emiAmount);

  const monthlyRate = annualInterestRate / 12 / 100;

  // Formula: n = log(EMI / (EMI - P×r)) / log(1 + r)
  const numerator = Math.log(emiAmount / (emiAmount - currentBalance * monthlyRate));
  const denominator = Math.log(1 + monthlyRate);

  return Math.ceil(numerator / denominator);
}

/**
 * Get liabilities with upcoming EMI dates
 */
export async function getLiabilitiesWithUpcomingEMI(days: number = 7): Promise<Liability[]> {
  const now = Date.now();
  const futureDate = now + days * 24 * 60 * 60 * 1000;

  return db.liabilities
    .filter(liability => {
      if (liability.deletedAt) return false;
      if (!liability.nextEmiDate) return false;
      return liability.nextEmiDate >= now && liability.nextEmiDate <= futureDate;
    })
    .sortBy('nextEmiDate');
}

/**
 * Get liabilities by status (active vs paid off)
 */
export async function getLiabilitiesByStatus(
  status: 'active' | 'paid_off'
): Promise<Liability[]> {
  return db.liabilities
    .filter(liability => {
      if (liability.deletedAt) return false;
      const isActive = liability.currentBalance > 0;
      return status === 'active' ? isActive : !isActive;
    })
    .toArray();
}

/**
 * Bulk add liabilities (useful for import/sync)
 */
export async function bulkAddLiabilities(liabilities: Liability[]): Promise<void> {
  await db.liabilities.bulkPut(liabilities);
}

/**
 * Get liability statistics
 */
export async function getLiabilityStats(): Promise<{
  total: number;
  totalBalance: number;
  totalMonthlyEMI: number;
  byType: Record<Liability['type'], { count: number; balance: number; emi: number }>;
}> {
  const liabilities = await getAllLiabilities();

  const byType: Record<string, { count: number; balance: number; emi: number }> = {};
  let totalBalance = 0;
  let totalMonthlyEMI = 0;

  liabilities.forEach(liability => {
    totalBalance += liability.currentBalance;
    totalMonthlyEMI += liability.emiAmount || 0;

    if (!byType[liability.type]) {
      byType[liability.type] = { count: 0, balance: 0, emi: 0 };
    }
    const typeStats = byType[liability.type];
    if (typeStats) {
      typeStats.count++;
      typeStats.balance += liability.currentBalance;
      typeStats.emi += liability.emiAmount || 0;
    }
  });

  return {
    total: liabilities.length,
    totalBalance,
    totalMonthlyEMI,
    byType,
  };
}

/**
 * Calculate debt-to-income ratio
 */
export async function calculateDebtToIncomeRatio(
  monthlyIncome: number
): Promise<number> {
  if (monthlyIncome === 0) return 0;

  const stats = await getLiabilityStats();
  return (stats.totalMonthlyEMI / monthlyIncome) * 100;
}

/**
 * Get high-interest liabilities (interest rate above threshold)
 */
export async function getHighInterestLiabilities(
  thresholdRate: number = 12
): Promise<Liability[]> {
  return db.liabilities
    .filter(liability => {
      if (liability.deletedAt) return false;
      return liability.interestRate > thresholdRate;
    })
    .sortBy('interestRate');
}
