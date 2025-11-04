/**
 * Category groupings and helpers
 * Organize categories by transaction type for better UX
 */

import { TransactionCategory } from '@/types';

/**
 * Income categories (for type='income')
 */
export const INCOME_CATEGORIES: TransactionCategory[] = [
  TransactionCategory.SALARY,
  TransactionCategory.VARIABLE_PAY,
  TransactionCategory.FREELANCE,
  TransactionCategory.BUSINESS_INCOME,
  TransactionCategory.INVESTMENT_INCOME,
  TransactionCategory.RENTAL_INCOME,
  TransactionCategory.LOAN_REPAYMENT,
  TransactionCategory.GIFT_RECEIVED,
  TransactionCategory.INHERITANCE,
  TransactionCategory.REFUND,
  TransactionCategory.CASHBACK,
  TransactionCategory.OTHER_INCOME,
];

/**
 * Expense categories (for type='expense')
 */
export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  // Food & Dining
  TransactionCategory.GROCERIES,
  TransactionCategory.DINING,
  TransactionCategory.FOOD_DELIVERY,

  // Transportation
  TransactionCategory.FUEL,
  TransactionCategory.TRANSPORT,
  TransactionCategory.AUTO,

  // Bills & Utilities
  TransactionCategory.ELECTRICITY,
  TransactionCategory.WATER,
  TransactionCategory.GAS,
  TransactionCategory.INTERNET,
  TransactionCategory.MOBILE,
  TransactionCategory.DTH,

  // Shopping
  TransactionCategory.SHOPPING,
  TransactionCategory.CLOTHING,
  TransactionCategory.ELECTRONICS,

  // Health & Fitness
  TransactionCategory.MEDICAL,
  TransactionCategory.PHARMACY,
  TransactionCategory.FITNESS,

  // Entertainment
  TransactionCategory.ENTERTAINMENT,
  TransactionCategory.MOVIES,
  TransactionCategory.SUBSCRIPTIONS,

  // Education
  TransactionCategory.EDUCATION,
  TransactionCategory.BOOKS,

  // Personal Care
  TransactionCategory.PERSONAL_CARE,
  TransactionCategory.SALON,

  // Home
  TransactionCategory.RENT,
  TransactionCategory.MAINTENANCE,
  TransactionCategory.FURNITURE,

  // Travel
  TransactionCategory.TRAVEL,
  TransactionCategory.HOTEL,

  // Financial
  TransactionCategory.INVESTMENT,
  TransactionCategory.INSURANCE,
  TransactionCategory.EMI,
  TransactionCategory.TAX,

  // Other
  TransactionCategory.GIFTS,
  TransactionCategory.DONATION,
  TransactionCategory.OTHER,
];

/**
 * Get categories for a transaction type
 */
export function getCategoriesForType(type: 'income' | 'expense' | 'transfer'): TransactionCategory[] {
  if (type === 'income') {
    return INCOME_CATEGORIES;
  }
  return EXPENSE_CATEGORIES;
}
