/**
 * Financial Calculations for Goals
 *
 * All calculations use paise (integers) to avoid floating-point precision issues.
 * Interest rates are passed as percentages (e.g., 12 for 12% annual return).
 */

/**
 * Calculate the future value of an investment with SIP (Systematic Investment Plan)
 *
 * Formula: FV = P × [((1 + r)^n - 1) / r] × (1 + r) + PV × (1 + r)^n
 * where:
 * - P = monthly SIP amount (in paise)
 * - r = monthly interest rate (annualRate / 12 / 100)
 * - n = number of months
 * - PV = present value/current corpus (in paise)
 *
 * @param principal Current corpus in paise
 * @param monthlySip Monthly SIP amount in paise
 * @param annualRate Expected annual return rate (as percentage, e.g., 12 for 12%)
 * @param months Investment period in months
 * @returns Future value in paise
 */
export function calculateFutureValue(
  principal: number,
  monthlySip: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return principal;
  if (annualRate === 0) return principal + monthlySip * months;

  const monthlyRate = annualRate / 12 / 100;
  const n = months;

  // Future value of current corpus
  const fvPrincipal = principal * Math.pow(1 + monthlyRate, n);

  // Future value of SIP contributions
  let fvSip = 0;
  if (monthlySip > 0) {
    fvSip = monthlySip *
            (Math.pow(1 + monthlyRate, n) - 1) /
            monthlyRate *
            (1 + monthlyRate);
  }

  return Math.round(fvPrincipal + fvSip);
}

/**
 * Calculate required monthly SIP to reach a target amount
 *
 * Rearranged FV formula to solve for P:
 * P = (FV - PV × (1 + r)^n) × r / [((1 + r)^n - 1) × (1 + r)]
 *
 * @param targetAmount Target amount in paise
 * @param currentCorpus Current corpus in paise
 * @param annualRate Expected annual return rate (as percentage)
 * @param months Investment period in months
 * @returns Required monthly SIP amount in paise
 */
export function calculateRequiredSIP(
  targetAmount: number,
  currentCorpus: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;
  const n = months;

  // Future value of current corpus
  const fvPrincipal = currentCorpus * Math.pow(1 + monthlyRate, n);

  // Remaining amount needed from SIP
  const remainingAmount = targetAmount - fvPrincipal;

  if (remainingAmount <= 0) return 0; // Already have enough

  if (annualRate === 0) {
    // Without interest, simply divide remaining by months
    return Math.round(remainingAmount / months);
  }

  // Calculate required SIP
  const requiredSip = remainingAmount * monthlyRate /
                      ((Math.pow(1 + monthlyRate, n) - 1) * (1 + monthlyRate));

  return Math.round(requiredSip);
}

/**
 * Calculate goal progress as a percentage
 *
 * @param currentValue Current value in paise
 * @param targetValue Target value in paise
 * @returns Progress percentage (0-100+)
 */
export function calculateProgress(
  currentValue: number,
  targetValue: number
): number {
  if (targetValue <= 0) return 100;
  const progress = (currentValue / targetValue) * 100;
  return Math.round(progress * 100) / 100;
}

// Alias for consistency
export const calculateGoalProgress = calculateProgress;

/**
 * Calculate months remaining until target date
 *
 * @param targetDate Target date
 * @param fromDate Starting date (defaults to today)
 * @returns Number of months remaining (can be negative if past due)
 */
export function calculateMonthsRemaining(
  targetDate: Date,
  fromDate: Date = new Date()
): number {
  const yearDiff = targetDate.getFullYear() - fromDate.getFullYear();
  const monthDiff = targetDate.getMonth() - fromDate.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Check if a goal is on track
 *
 * A goal is considered "on track" if the current progress percentage
 * is greater than or equal to the time elapsed percentage.
 *
 * @param currentValue Current value in paise
 * @param targetValue Target value in paise
 * @param startDate Goal start date
 * @param targetDate Goal target date
 * @param fromDate Current date (defaults to today)
 * @returns true if on track, false otherwise
 */
export function isGoalOnTrack(
  currentValue: number,
  targetValue: number,
  startDate: Date,
  targetDate: Date,
  fromDate: Date = new Date()
): boolean {
  const totalMonths = calculateMonthsRemaining(targetDate, startDate);
  const elapsedMonths = totalMonths - calculateMonthsRemaining(targetDate, fromDate);

  if (totalMonths <= 0) return false; // Invalid date range

  const timeProgress = (elapsedMonths / totalMonths) * 100;
  const valueProgress = calculateProgress(currentValue, targetValue);

  return valueProgress >= timeProgress;
}

/**
 * Monte Carlo simulation for goal probability
 *
 * Uses a simplified 3-path approach:
 * - Best case: annualRate + volatility
 * - Expected case: annualRate
 * - Worst case: annualRate - volatility
 *
 * @param currentCorpus Current corpus in paise
 * @param monthlySip Monthly SIP in paise
 * @param targetAmount Target amount in paise
 * @param annualRate Expected annual return rate (as percentage)
 * @param months Investment period in months
 * @param volatility Return volatility (as percentage, e.g., 5 for ±5%)
 * @returns Probability of achieving goal (0-100)
 */
export function calculateProbability(
  currentCorpus: number,
  monthlySip: number,
  targetAmount: number,
  annualRate: number,
  months: number,
  volatility: number = 5
): number {
  if (months <= 0) return 0;

  // Three scenarios
  const bestCase = calculateFutureValue(
    currentCorpus,
    monthlySip,
    annualRate + volatility,
    months
  );

  const expectedCase = calculateFutureValue(
    currentCorpus,
    monthlySip,
    annualRate,
    months
  );

  const worstCase = calculateFutureValue(
    currentCorpus,
    monthlySip,
    annualRate - volatility,
    months
  );

  // Calculate probability based on how many scenarios meet the target
  let successCount = 0;
  if (worstCase >= targetAmount) successCount = 3;
  else if (expectedCase >= targetAmount) successCount = 2;
  else if (bestCase >= targetAmount) successCount = 1;

  // Weighted probability
  // Worst case: 20%, Expected: 60%, Best case: 20%
  if (successCount === 3) return 100;
  if (successCount === 2) return 80; // Expected + Best scenarios
  if (successCount === 1) return 20; // Only best case
  return 0;
}

/**
 * Calculate the required initial corpus for a goal with fixed SIP
 *
 * Rearranged FV formula to solve for PV:
 * PV = [FV - P × ((1 + r)^n - 1) / r × (1 + r)] / (1 + r)^n
 *
 * @param targetAmount Target amount in paise
 * @param monthlySip Fixed monthly SIP in paise
 * @param annualRate Expected annual return rate (as percentage)
 * @param months Investment period in months
 * @returns Required initial corpus in paise
 */
export function calculateRequiredCorpus(
  targetAmount: number,
  monthlySip: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return targetAmount;

  const monthlyRate = annualRate / 12 / 100;
  const n = months;

  // Future value of SIP contributions
  let fvSip = 0;
  if (monthlySip > 0 && annualRate !== 0) {
    fvSip = monthlySip *
            (Math.pow(1 + monthlyRate, n) - 1) /
            monthlyRate *
            (1 + monthlyRate);
  } else if (monthlySip > 0) {
    fvSip = monthlySip * months;
  }

  // Remaining amount needed from corpus
  const remainingAmount = targetAmount - fvSip;

  if (remainingAmount <= 0) return 0;

  if (annualRate === 0) return remainingAmount;

  // Calculate required corpus
  const requiredCorpus = remainingAmount / Math.pow(1 + monthlyRate, n);

  return Math.round(requiredCorpus);
}

/**
 * Calculate goal shortfall or surplus
 *
 * @param currentValue Current value in paise
 * @param targetValue Target value in paise
 * @param monthlySip Current monthly SIP in paise
 * @param annualRate Expected annual return rate (as percentage)
 * @param months Months remaining
 * @returns Shortfall (negative) or surplus (positive) in paise
 */
export function calculateGoalShortfall(
  currentValue: number,
  targetValue: number,
  monthlySip: number,
  annualRate: number,
  months: number
): number {
  const projectedValue = calculateFutureValue(
    currentValue,
    monthlySip,
    annualRate,
    months
  );

  return projectedValue - targetValue;
}
