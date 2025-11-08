/**
 * Integration Tests for Transaction Database Operations
 * Tests Dexie database operations with IndexedDB
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../schema';
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionsByDateRange,
  getRecentTransactions,
  bulkAddTransactions,
} from '../transactions';
import { TransactionCategory, PaymentMethod, TransactionSource, Currency } from '@/types/enums';

describe('Transaction Database Operations (Integration)', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.transactions.clear();
    await db._clock.clear();

    // Initialize clock
    await db._clock.put({
      tableName: 'transactions',
      lastServerClock: 0,
      lastSyncTs: 0,
      pendingOps: 0,
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await db.transactions.clear();
    await db._clock.clear();
  });

  describe('addTransaction', () => {
    it('should add a transaction to the database', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 50000,
        currency: Currency.INR,
        merchant: 'Test Store',
        category: TransactionCategory.GROCERIES,
        method: PaymentMethod.CASH,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      const id = await addTransaction(transaction);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      // Verify it was added
      const saved = await db.transactions.get(id);
      expect(saved).toBeDefined();
      expect(saved?.merchant).toBe('Test Store');
      expect(saved?.amountPaise).toBe(50000);
      expect(saved?.syncStatus).toBe('pending');
    });

    it('should update clock when adding transaction', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 10000,
        currency: Currency.INR,
        merchant: 'Coffee Shop',
        category: TransactionCategory.DINING,
        method: PaymentMethod.UPI,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      await addTransaction(transaction);

      const clock = await db._clock.get('transactions');
      expect(clock?.pendingOps).toBe(1);
    });

    it('should handle transactions with optional fields', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'income' as const,
        amountPaise: 500000,
        currency: Currency.INR,
        merchant: 'Employer',
        category: TransactionCategory.SALARY,
        method: PaymentMethod.BANK_TRANSFER,
        source: TransactionSource.MANUAL,
        note: 'Monthly salary',
        tags: JSON.stringify(['salary', 'income']),
        isRecurring: false,
      };

      const id = await addTransaction(transaction);
      const saved = await db.transactions.get(id);

      expect(saved?.note).toBe('Monthly salary');
      expect(saved?.tags).toBe(JSON.stringify(['salary', 'income']));
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 5000,
        currency: Currency.INR,
        merchant: 'Original Store',
        category: TransactionCategory.SHOPPING,
        method: PaymentMethod.CARD,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      const id = await addTransaction(transaction);

      await updateTransaction(id, {
        merchant: 'Updated Store',
        amountPaise: 6000,
      });

      const updated = await db.transactions.get(id);
      expect(updated?.merchant).toBe('Updated Store');
      expect(updated?.amountPaise).toBe(6000);
      expect(updated?.syncStatus).toBe('pending');
    });

    it('should increment pending ops on update', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 5000,
        currency: Currency.INR,
        merchant: 'Store',
        category: TransactionCategory.SHOPPING,
        method: PaymentMethod.CARD,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      const id = await addTransaction(transaction);
      await updateTransaction(id, { merchant: 'New Store' });

      const clock = await db._clock.get('transactions');
      expect(clock?.pendingOps).toBe(2); // 1 add + 1 update
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 5000,
        currency: Currency.INR,
        merchant: 'Store',
        category: TransactionCategory.SHOPPING,
        method: PaymentMethod.CARD,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      const id = await addTransaction(transaction);
      await deleteTransaction(id);

      const deleted = await db.transactions.get(id);
      expect(deleted).toBeUndefined();
    });

    it('should increment pending ops on delete', async () => {
      const transaction = {
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 5000,
        currency: Currency.INR,
        merchant: 'Store',
        category: TransactionCategory.SHOPPING,
        method: PaymentMethod.CARD,
        source: TransactionSource.MANUAL,
        isRecurring: false,
      };

      const id = await addTransaction(transaction);
      await deleteTransaction(id);

      const clock = await db._clock.get('transactions');
      expect(clock?.pendingOps).toBe(2); // 1 add + 1 delete
    });
  });

  describe('getTransactions', () => {
    it('should retrieve all transactions', async () => {
      const transactions = [
        {
          userId: 'user-123',
          type: 'expense' as const,
          amountPaise: 5000,
          currency: Currency.INR,
          merchant: 'Store A',
          category: TransactionCategory.GROCERIES,
          method: PaymentMethod.CASH,
          source: TransactionSource.MANUAL,
          isRecurring: false,
        },
        {
          userId: 'user-123',
          type: 'income' as const,
          amountPaise: 50000,
          currency: Currency.INR,
          merchant: 'Employer',
          category: TransactionCategory.SALARY,
          method: PaymentMethod.BANK_TRANSFER,
          source: TransactionSource.MANUAL,
          isRecurring: false,
        },
      ];

      await Promise.all(transactions.map((t) => addTransaction(t)));

      const all = await getTransactions();
      expect(all.length).toBe(2);
    });

    it('should filter transactions by type', async () => {
      const transactions = [
        {
          userId: 'user-123',
          type: 'expense' as const,
          amountPaise: 5000,
          currency: Currency.INR,
          merchant: 'Store',
          category: TransactionCategory.GROCERIES,
          method: PaymentMethod.CASH,
          source: TransactionSource.MANUAL,
          isRecurring: false,
        },
        {
          userId: 'user-123',
          type: 'income' as const,
          amountPaise: 50000,
          currency: Currency.INR,
          merchant: 'Employer',
          category: TransactionCategory.SALARY,
          method: PaymentMethod.BANK_TRANSFER,
          source: TransactionSource.MANUAL,
          isRecurring: false,
        },
      ];

      await Promise.all(transactions.map((t) => addTransaction(t)));

      const expenses = await getTransactions({ type: 'expense' });
      expect(expenses.length).toBe(1);
      expect(expenses[0]?.type).toBe('expense');
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should retrieve transactions within date range', async () => {
      const now = Date.now();
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

      await addTransaction({
        userId: 'user-123',
        type: 'expense' as const,
        amountPaise: 5000,
        currency: Currency.INR,
        merchant: 'Store',
        category: TransactionCategory.GROCERIES,
        method: PaymentMethod.CASH,
        source: TransactionSource.MANUAL,
        createdTs: now,
        postedTs: now,
        isRecurring: false,
      });

      const transactions = await getTransactionsByDateRange(yesterday, tomorrow);
      expect(transactions.length).toBe(1);
    });
  });

  describe('getRecentTransactions', () => {
    it('should return most recent transactions', async () => {
      // Add 3 transactions
      for (let i = 0; i < 3; i++) {
        await addTransaction({
          userId: 'user-123',
          type: 'expense' as const,
          amountPaise: 1000 * (i + 1),
          currency: Currency.INR,
          merchant: `Store ${i}`,
          category: TransactionCategory.SHOPPING,
          method: PaymentMethod.CASH,
          source: TransactionSource.MANUAL,
          isRecurring: false,
        });
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const recent = await getRecentTransactions(2);
      expect(recent.length).toBe(2);
      // Most recent should be first
      expect(recent[0]?.merchant).toBe('Store 2');
    });
  });

  describe('bulkAddTransactions', () => {
    it('should add multiple transactions at once', async () => {
      const transactions = [
        {
          userId: 'user-123',
          type: 'expense' as const,
          amountPaise: 5000,
          currency: Currency.INR,
          merchant: 'Store A',
          category: TransactionCategory.GROCERIES,
          method: PaymentMethod.CASH,
          source: TransactionSource.IMPORT,
          isRecurring: false,
        },
        {
          userId: 'user-123',
          type: 'expense' as const,
          amountPaise: 10000,
          currency: Currency.INR,
          merchant: 'Store B',
          category: TransactionCategory.DINING,
          method: PaymentMethod.CARD,
          source: TransactionSource.IMPORT,
          isRecurring: false,
        },
      ];

      const ids = await bulkAddTransactions(transactions);
      expect(ids.length).toBe(2);

      const all = await getTransactions();
      expect(all.length).toBe(2);
    });
  });
});
