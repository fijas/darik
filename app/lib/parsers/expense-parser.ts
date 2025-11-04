/**
 * Expense Parser
 * Parses natural language input into structured expense data
 * Example: "Fuel 900 cash 7:30pm" -> { amount: 90000, merchant: "Fuel", method: "cash", ... }
 */

import { parseDate } from 'chrono-node';
import type { ParsedExpense, ParseError } from '@/types';
import { TransactionCategory, PaymentMethod, Currency } from '@/types';

/**
 * Parse expense from natural language text
 */
export function parseExpense(input: string): ParsedExpense {
  const raw = input.trim();
  const tokens = tokenize(raw);

  // Extract all fields
  const amount = extractAmount(tokens, raw);
  const method = extractPaymentMethod(tokens, raw);
  const date = extractDate(tokens, raw);
  const merchant = extractMerchant(tokens, raw, amount, method, date);
  const category = categorizeByMerchant(merchant);

  // Calculate confidence scores
  const confidence = {
    amount: amount ? 0.9 : 0,
    merchant: merchant ? 0.7 : 0,
    category: category ? 0.6 : 0,
    method: method ? 0.8 : 0,
    date: date ? 0.85 : 0.5, // Default to "now" if not specified
    overall: 0,
  };

  // Overall confidence is average of extracted fields
  const extractedFields = [amount, merchant, method].filter(Boolean).length;
  confidence.overall = extractedFields >= 2 ? 0.7 : 0.4;

  return {
    amount,
    merchant,
    category,
    method,
    date: date || new Date(), // Default to now
    note: undefined,
    currency: Currency.INR,
    confidence,
    raw,
    tokens,
    ambiguities: [],
    suggestions: [],
  };
}

/**
 * Tokenize input string
 */
function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Extract amount from tokens
 * Patterns: 900, ₹900, Rs 900, Rs.900, 900.50, 900/-
 */
function extractAmount(tokens: string[], raw: string): number | undefined {
  const amountPatterns = [
    /₹\s*(\d+(?:[.,]\d+)?)/i,
    /rs\.?\s*(\d+(?:[.,]\d+)?)/i,
    /inr\s*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:rupees?|rs|₹|\/-)?/i,
  ];

  for (const pattern of amountPatterns) {
    const match = raw.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }

  // Fallback: find any standalone number that looks like money
  for (const token of tokens) {
    const num = parseFloat(token.replace(/,/g, ''));
    if (!isNaN(num) && num >= 10 && num <= 1000000) {
      return num;
    }
  }

  return undefined;
}

/**
 * Extract payment method from tokens
 */
function extractPaymentMethod(tokens: string[], raw: string): PaymentMethod | undefined {
  const normalizedInput = raw.toLowerCase();

  // Map keywords to payment methods
  const methodKeywords: Record<string, PaymentMethod> = {
    gpay: PaymentMethod.GPAY,
    'google pay': PaymentMethod.GPAY,
    phonepe: PaymentMethod.PHONEPE,
    paytm: PaymentMethod.PAYTM,
    upi: PaymentMethod.UPI,
    cash: PaymentMethod.CASH,
    card: PaymentMethod.CARD,
    'credit card': PaymentMethod.CREDIT_CARD,
    'debit card': PaymentMethod.DEBIT_CARD,
    netbanking: PaymentMethod.NET_BANKING,
    wallet: PaymentMethod.WALLET,
    cheque: PaymentMethod.CHEQUE,
  };

  // Check for method keywords
  for (const [keyword, method] of Object.entries(methodKeywords)) {
    if (normalizedInput.includes(keyword)) {
      return method;
    }
  }

  // Check tokens
  for (const token of tokens) {
    if (methodKeywords[token]) {
      return methodKeywords[token];
    }
  }

  return undefined;
}

/**
 * Extract date/time from tokens using chrono-node
 */
function extractDate(_tokens: string[], raw: string): Date | undefined {
  // Try parsing the full string
  const results = parseDate(raw, new Date(), { forwardDate: true });
  if (results) {
    return results;
  }

  // Try common time patterns
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
    /(\d{1,2})\s*(am|pm)/i,
  ];

  for (const pattern of timePatterns) {
    const match = raw.match(pattern);
    if (match && match[1]) {
      const date = new Date();
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const meridiem = match[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  return undefined;
}

/**
 * Extract merchant name from remaining tokens
 */
function extractMerchant(
  tokens: string[],
  _raw: string,
  amount?: number,
  _method?: PaymentMethod,
  _date?: Date
): string | undefined {
  // Remove tokens that are part of other fields
  const stopWords = new Set([
    'at',
    'for',
    'via',
    'using',
    'with',
    'on',
    'paid',
    'spent',
    'rs',
    'inr',
    'rupees',
    'cash',
    'card',
    'upi',
    'gpay',
    'phonepe',
    'paytm',
    'today',
    'yesterday',
    'tomorrow',
    'am',
    'pm',
  ]);

  const merchantTokens: string[] = [];

  for (const token of tokens) {
    // Skip if it's a stop word
    if (stopWords.has(token)) continue;

    // Skip if it's the amount
    if (amount && token.includes(amount.toString())) continue;

    // Skip if it's just a number
    if (/^\d+$/.test(token)) continue;

    // Skip if it's a time pattern
    if (/^\d{1,2}:\d{2}$/.test(token)) continue;

    // Skip currency symbols
    if (/^[₹\$€£]$/.test(token)) continue;

    merchantTokens.push(token);
  }

  if (merchantTokens.length === 0) return undefined;

  // Capitalize first letter of each word
  return merchantTokens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Categorize transaction based on merchant name
 * This is basic - will be improved in Phase 3.2 with learning
 */
function categorizeByMerchant(merchant?: string): TransactionCategory | undefined {
  if (!merchant) return undefined;

  const merchantLower = merchant.toLowerCase();

  // Simple keyword matching for common categories
  const categoryKeywords: Record<string, TransactionCategory> = {
    // Food & Dining
    restaurant: TransactionCategory.DINING,
    cafe: TransactionCategory.DINING,
    coffee: TransactionCategory.DINING,
    food: TransactionCategory.FOOD_DELIVERY,
    swiggy: TransactionCategory.FOOD_DELIVERY,
    zomato: TransactionCategory.FOOD_DELIVERY,
    grocery: TransactionCategory.GROCERIES,
    supermarket: TransactionCategory.GROCERIES,
    dmart: TransactionCategory.GROCERIES,
    bigbasket: TransactionCategory.GROCERIES,

    // Transportation
    fuel: TransactionCategory.FUEL,
    petrol: TransactionCategory.FUEL,
    diesel: TransactionCategory.FUEL,
    uber: TransactionCategory.TRANSPORT,
    ola: TransactionCategory.TRANSPORT,
    taxi: TransactionCategory.AUTO,
    auto: TransactionCategory.AUTO,
    metro: TransactionCategory.TRANSPORT,
    bus: TransactionCategory.TRANSPORT,

    // Shopping
    amazon: TransactionCategory.SHOPPING,
    flipkart: TransactionCategory.SHOPPING,
    mall: TransactionCategory.SHOPPING,
    clothing: TransactionCategory.CLOTHING,
    shoes: TransactionCategory.CLOTHING,

    // Bills
    electricity: TransactionCategory.ELECTRICITY,
    water: TransactionCategory.WATER,
    gas: TransactionCategory.GAS,
    internet: TransactionCategory.INTERNET,
    wifi: TransactionCategory.INTERNET,
    mobile: TransactionCategory.MOBILE,
    phone: TransactionCategory.MOBILE,
    airtel: TransactionCategory.MOBILE,
    jio: TransactionCategory.MOBILE,

    // Health
    medical: TransactionCategory.MEDICAL,
    doctor: TransactionCategory.MEDICAL,
    hospital: TransactionCategory.MEDICAL,
    pharmacy: TransactionCategory.PHARMACY,
    medicine: TransactionCategory.PHARMACY,
    gym: TransactionCategory.FITNESS,

    // Entertainment
    movie: TransactionCategory.MOVIES,
    cinema: TransactionCategory.MOVIES,
    netflix: TransactionCategory.SUBSCRIPTIONS,
    spotify: TransactionCategory.SUBSCRIPTIONS,
    prime: TransactionCategory.SUBSCRIPTIONS,
  };

  // Check if merchant contains any category keywords
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (merchant && merchantLower.includes(keyword)) {
      return category;
    }
  }

  return TransactionCategory.OTHER;
}

/**
 * Validate parsed expense
 */
export function validateParsedExpense(parsed: ParsedExpense): ParseError[] {
  const errors: ParseError[] = [];

  if (!parsed.amount || parsed.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount is required and must be greater than 0',
      severity: 'error',
      suggestion: 'Try including an amount like "900" or "₹900"',
    });
  }

  if (!parsed.merchant) {
    errors.push({
      field: 'merchant',
      message: 'Could not identify merchant name',
      severity: 'warning',
      suggestion: 'Add a description like "Fuel at HP Station"',
    });
  }

  return errors;
}
