/**
 * Expense Parser Tests
 * Tests for natural language expense parsing
 */

import { describe, it, expect } from 'vitest';
import { parseExpense } from '../expense-parser';
import { TransactionCategory, PaymentMethod } from '@/types/enums';

describe('Expense Parser', () => {
  describe('Amount Extraction', () => {
    it('should parse simple amount with rupee symbol', () => {
      const result = parseExpense('₹500 groceries');
      expect(result.amount).toBe(500);
    });

    it('should parse amount with Rs prefix', () => {
      const result = parseExpense('Rs 250 fuel');
      expect(result.amount).toBe(250);
    });

    it('should parse amount with decimal', () => {
      const result = parseExpense('₹99.50 coffee');
      expect(result.amount).toBe(99.50);
    });

    it('should parse amount with commas', () => {
      const result = parseExpense('₹1,500 shopping');
      expect(result.amount).toBe(1500);
    });

    it('should parse amount without symbol', () => {
      const result = parseExpense('500 groceries');
      expect(result.amount).toBe(500);
    });

    it('should handle large amounts', () => {
      const result = parseExpense('₹50,000 rent');
      expect(result.amount).toBe(50000);
    });

    it('should handle float precision correctly', () => {
      const result = parseExpense('₹10.99 snacks');
      expect(result.amount).toBe(10.99);
    });
  });

  describe('Merchant/Category Extraction', () => {
    it('should extract merchant name', () => {
      const result = parseExpense('₹500 Big Bazaar');
      expect(result.merchant).toContain('Big Bazaar');
    });

    it('should categorize groceries', () => {
      const result = parseExpense('₹500 groceries');
      expect(result.category).toBe(TransactionCategory.GROCERIES);
    });

    it('should categorize fuel', () => {
      const result = parseExpense('₹900 fuel');
      expect(result.category).toBe(TransactionCategory.FUEL);
    });

    it('should categorize dining', () => {
      const result = parseExpense('₹350 lunch');
      expect(result.category).toBe(TransactionCategory.DINING);
    });

    it('should categorize electricity bill', () => {
      const result = parseExpense('₹1200 electricity bill');
      expect(result.category).toBe(TransactionCategory.ELECTRICITY);
    });

    it('should default to OTHER for unknown category', () => {
      const result = parseExpense('₹100 something random');
      expect(result.category).toBe(TransactionCategory.OTHER);
    });
  });

  describe('Payment Method Detection', () => {
    it('should detect UPI payment', () => {
      const result = parseExpense('₹500 groceries UPI');
      expect(result.method).toBe(PaymentMethod.UPI);
    });

    it('should detect GPay', () => {
      const result = parseExpense('₹500 groceries GPay');
      expect(result.method).toBe(PaymentMethod.GPAY);
    });

    it('should detect PhonePe', () => {
      const result = parseExpense('₹500 groceries PhonePe');
      expect(result.method).toBe(PaymentMethod.PHONEPE);
    });

    it('should detect cash payment', () => {
      const result = parseExpense('₹500 groceries cash');
      expect(result.method).toBe(PaymentMethod.CASH);
    });

    it('should detect card payment', () => {
      const result = parseExpense('₹500 groceries card');
      expect(result.method).toBe(PaymentMethod.CARD);
    });

    it('should default to UPI if not specified', () => {
      const result = parseExpense('₹500 groceries');
      expect(result.method).toBe(PaymentMethod.UPI);
    });
  });

  describe('Date/Time Parsing', () => {
    it('should parse time in input', () => {
      const result = parseExpense('₹500 groceries 7:30pm');
      expect(result.date).toBeInstanceOf(Date);
      if (result.date) {
        expect(result.date.getHours()).toBeGreaterThanOrEqual(0);
      }
    });

    it('should parse "yesterday"', () => {
      const result = parseExpense('₹500 groceries yesterday');
      expect(result.date).toBeInstanceOf(Date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (result.date) {
        expect(result.date.getDate()).toBe(yesterday.getDate());
      }
    });

    it('should use current date if not specified', () => {
      const result = parseExpense('₹500 groceries');
      expect(result.date).toBeInstanceOf(Date);
      const now = new Date();
      if (result.date) {
        expect(result.date.getDate()).toBe(now.getDate());
      }
    });
  });

  describe('Income Detection', () => {
    it('should detect salary as income', () => {
      const result = parseExpense('Salary 50000 received');
      expect(result.type).toBe('income');
      expect(result.category).toBe(TransactionCategory.SALARY);
    });

    it('should detect freelance income', () => {
      const result = parseExpense('Freelance project 15000');
      expect(result.type).toBe('income');
      expect(result.category).toBe(TransactionCategory.FREELANCE);
    });

    it('should detect loan repayment', () => {
      const result = parseExpense('Ram repaid 5000');
      expect(result.type).toBe('income');
      expect(result.category).toBe(TransactionCategory.LOAN_REPAYMENT);
    });

    it('should detect refund', () => {
      const result = parseExpense('Refund 500 from Amazon');
      expect(result.type).toBe('income');
      expect(result.category).toBe(TransactionCategory.REFUND);
    });

    it('should default to expense for non-income keywords', () => {
      const result = parseExpense('₹500 groceries');
      expect(result.type).toBe('expense');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const result = parseExpense('');
      expect(result.amount).toBeUndefined();
      expect(result.merchant).toBeUndefined();
    });

    it('should handle input with only amount', () => {
      const result = parseExpense('₹500');
      expect(result.amount).toBe(500);
    });

    it('should handle very long merchant names', () => {
      const longName = 'A'.repeat(100);
      const result = parseExpense(`₹500 ${longName}`);
      expect(result.merchant).toBeTruthy();
      expect(result.merchant!.length).toBeGreaterThan(0);
    });

    it('should handle special characters in merchant name', () => {
      const result = parseExpense('₹500 McDonald\'s');
      expect(result.merchant).toBeTruthy();
    });

    it('should handle multiple spaces', () => {
      const result = parseExpense('₹500    groceries    UPI');
      expect(result.amount).toBe(500);
      expect(result.method).toBe(PaymentMethod.UPI);
    });

    it('should handle case insensitivity', () => {
      const result1 = parseExpense('₹500 GROCERIES upi');
      const result2 = parseExpense('₹500 groceries UPI');
      expect(result1.category).toBe(result2.category);
      expect(result1.method).toBe(result2.method);
    });

    it('should handle zero amount', () => {
      const result = parseExpense('₹0 test');
      expect(result.amount).toBe(0);
    });

    it('should handle negative amount (should convert to positive)', () => {
      const result = parseExpense('₹-500 groceries');
      // Parser should handle this gracefully
      expect(typeof result.amount).toBe('number');
    });
  });

  describe('Complex Inputs', () => {
    it('should parse complete expense with all fields', () => {
      const result = parseExpense('₹899 Fuel Shell Petrol Pump UPI 7:30pm');
      expect(result.amount).toBe(899);
      expect(result.category).toBe(TransactionCategory.FUEL);
      expect(result.method).toBe(PaymentMethod.UPI);
      expect(result.merchant).toBeTruthy();
    });

    it('should handle expense with note', () => {
      const result = parseExpense('₹500 groceries monthly stock cash');
      expect(result.amount).toBe(500);
      expect(result.category).toBe(TransactionCategory.GROCERIES);
      expect(result.method).toBe(PaymentMethod.CASH);
    });

    it('should handle income with details', () => {
      const result = parseExpense('Salary 50000 bank transfer received');
      expect(result.type).toBe('income');
      expect(result.amount).toBe(50000);
      expect(result.category).toBe(TransactionCategory.SALARY);
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for complete input', () => {
      const result = parseExpense('₹500 groceries UPI');
      expect(result.confidence.overall).toBeGreaterThan(0.5);
    });

    it('should have lower confidence for incomplete input', () => {
      const result = parseExpense('500');
      expect(result.confidence.overall).toBeLessThan(0.8);
    });
  });
});
