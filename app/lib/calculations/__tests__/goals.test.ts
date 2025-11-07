/**
 * Financial Calculations Tests
 * Tests for SIP, future value, and Monte Carlo simulations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRequiredSIP,
  calculateFutureValue,
  calculateProbability,
  calculateGoalProgress,
} from '../goals';

describe('Financial Calculations', () => {
  describe('SIP Calculation', () => {
    it('should calculate monthly SIP for a goal', () => {
      const target = 100000000; // ₹10,00,000 in paise
      const current = 0;
      const rate = 12; // 12% annual
      const months = 60; // 5 years

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
      expect(sip).toBeLessThan(target); // SIP should be less than target
    });

    it('should return 0 SIP if target already achieved', () => {
      const target = 100000000;
      const current = 100000000;
      const rate = 12;
      const months = 60;

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBe(0);
    });

    it('should handle short duration goals', () => {
      const target = 100000000;
      const current = 0;
      const rate = 12;
      const months = 12; // 1 year

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
    });

    it('should consider existing corpus', () => {
      const target = 100000000;
      const current = 50000000; // Already have ₹5 lakhs
      const rate = 12;
      const months = 60;

      const sipWithCorpus = calculateRequiredSIP(target, current, rate, months);
      const sipWithoutCorpus = calculateRequiredSIP(target, 0, rate, months);

      expect(sipWithCorpus).toBeLessThan(sipWithoutCorpus);
    });

    it('should handle different interest rates', () => {
      const target = 100000000;
      const current = 0;
      const months = 60;

      const sip8 = calculateRequiredSIP(target, current, 8, months);
      const sip12 = calculateRequiredSIP(target, current, 12, months);
      const sip15 = calculateRequiredSIP(target, current, 15, months);

      // Higher rate = lower SIP needed
      expect(sip15).toBeLessThan(sip12);
      expect(sip12).toBeLessThan(sip8);
    });
  });

  describe('Future Value Calculation', () => {
    it('should calculate future value with SIP', () => {
      const principal = 0;
      const sip = 1000000; // ₹10,000/month in paise
      const rate = 12;
      const months = 60;

      const fv = calculateFutureValue(principal, sip, rate, months);

      expect(fv).toBeGreaterThan(sip * months); // Due to compounding
    });

    it('should calculate future value with lumpsum', () => {
      const principal = 10000000; // ₹1,00,000 in paise
      const sip = 0;
      const rate = 12;
      const months = 60;

      const fv = calculateFutureValue(principal, sip, rate, months);

      expect(fv).toBeGreaterThan(principal);
    });

    it('should calculate future value with both lumpsum and SIP', () => {
      const principal = 5000000; // ₹50,000
      const sip = 500000; // ₹5,000/month
      const rate = 12;
      const months = 60;

      const fv = calculateFutureValue(principal, sip, rate, months);

      expect(fv).toBeGreaterThan(principal + (sip * months));
    });

    it('should handle zero interest rate', () => {
      const principal = 10000000;
      const sip = 1000000;
      const rate = 0;
      const months = 60;

      const fv = calculateFutureValue(principal, sip, rate, months);

      expect(fv).toBe(principal + (sip * months));
    });

    it('should handle negative returns', () => {
      const principal = 10000000;
      const sip = 0;
      const rate = -5; // -5% return
      const months = 12;

      const fv = calculateFutureValue(principal, sip, rate, months);

      expect(fv).toBeLessThan(principal);
    });
  });

  describe('Monte Carlo Probability', () => {
    it('should return probability between 0 and 100', () => {
      const target = 100000000;
      const current = 0;
      const monthlySIP = 1500000;
      const expectedReturn = 12;
      const months = 60;

      const prob = calculateProbability(current, monthlySIP, target, expectedReturn, months);

      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(100);
    });

    it('should have high probability for achievable goals', () => {
      const target = 50000000; // ₹5 lakhs
      const current = 10000000; // ₹1 lakh existing
      const monthlySIP = 500000; // ₹5,000/month
      const expectedReturn = 12;
      const months = 60; // 5 years

      const prob = calculateProbability(current, monthlySIP, target, expectedReturn, months);

      expect(prob).toBeGreaterThan(50);
    });

    it('should have low probability for unrealistic goals', () => {
      const target = 100000000; // ₹1 crore
      const current = 0;
      const monthlySIP = 100000; // ₹1,000/month (too low)
      const expectedReturn = 12;
      const months = 12; // 1 year (too short)

      const prob = calculateProbability(current, monthlySIP, target, expectedReturn, months);

      expect(prob).toBeLessThan(50);
    });

    it('should return 100% if target already achieved', () => {
      const target = 100000000;
      const current = 100000000;
      const monthlySIP = 0;
      const expectedReturn = 12;
      const months = 60;

      const prob = calculateProbability(current, monthlySIP, target, expectedReturn, months);

      expect(prob).toBe(100);
    });
  });

  describe('Goal Progress', () => {
    it('should calculate progress percentage', () => {
      const target = 100000000; // ₹10 lakhs
      const current = 25000000; // ₹2.5 lakhs

      const progress = calculateGoalProgress(current, target);

      expect(progress).toBe(25);
    });

    it('should handle 0% progress', () => {
      const target = 100000000;
      const current = 0;

      const progress = calculateGoalProgress(current, target);

      expect(progress).toBe(0);
    });

    it('should handle 100% progress', () => {
      const target = 100000000;
      const current = 100000000;

      const progress = calculateGoalProgress(current, target);

      expect(progress).toBe(100);
    });

    it('should handle over-achievement', () => {
      const target = 100000000;
      const current = 150000000;

      const progress = calculateGoalProgress(current, target);

      expect(progress).toBeGreaterThan(100);
    });

    it('should handle zero target', () => {
      const target = 0;
      const current = 50000000;

      const progress = calculateGoalProgress(current, target);

      expect(progress).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long durations', () => {
      const target = 100000000;
      const current = 0;
      const rate = 12;
      const months = 360; // 30 years

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
      expect(sip).toBeLessThan(100000); // Should be very small monthly amount
    });

    it('should handle very short durations', () => {
      const target = 100000000;
      const current = 0;
      const rate = 12;
      const months = 1;

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
    });

    it('should handle very high interest rates', () => {
      const target = 100000000;
      const current = 0;
      const rate = 50;
      const months = 60;

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
    });

    it('should handle large target amounts', () => {
      const target = 1000000000; // ₹1 crore
      const current = 0;
      const rate = 12;
      const months = 120;

      const sip = calculateRequiredSIP(target, current, rate, months);

      expect(sip).toBeGreaterThan(0);
    });
  });
});
