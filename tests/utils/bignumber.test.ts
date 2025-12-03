/**
 * BigNumber Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  bn,
  add,
  subtract,
  multiply,
  divide,
  percentage,
  percentageChange,
  format,
  formatWithCommas,
  fromSmallestUnit,
  toSmallestUnit,
  isZero,
  isPositive,
  isNegative,
  compare,
  min,
  max,
  abs,
  round,
  floor,
  ceil,
  pow,
  sqrt,
  sum,
  average,
  isValidNumber,
  BigNumber,
} from '../../src/utils/bignumber.js';

describe('bignumber utilities', () => {
  describe('bn', () => {
    it('should create BigNumber from number', () => {
      const result = bn(123.456);
      expect(result.toNumber()).toBe(123.456);
    });

    it('should create BigNumber from string', () => {
      const result = bn('123.456');
      expect(result.toNumber()).toBe(123.456);
    });
  });

  describe('arithmetic operations', () => {
    it('should add numbers correctly', () => {
      expect(add(0.1, 0.2).toNumber()).toBe(0.3);
    });

    it('should subtract numbers correctly', () => {
      expect(subtract(0.3, 0.1).toNumber()).toBe(0.2);
    });

    it('should multiply numbers correctly', () => {
      expect(multiply(0.1, 0.2).toNumber()).toBe(0.02);
    });

    it('should divide numbers correctly', () => {
      expect(divide(0.3, 0.1).toNumber()).toBe(3);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      expect(percentage(200, 10).toNumber()).toBe(20);
    });
  });

  describe('percentageChange', () => {
    it('should calculate positive change', () => {
      expect(percentageChange(100, 150).toNumber()).toBe(50);
    });

    it('should calculate negative change', () => {
      expect(percentageChange(100, 50).toNumber()).toBe(-50);
    });
  });

  describe('format', () => {
    it('should format with decimal places', () => {
      expect(format(123.456789, 2)).toBe('123.45');
    });
  });

  describe('formatWithCommas', () => {
    it('should format with thousand separators', () => {
      expect(formatWithCommas(1234567.89, 2)).toBe('1,234,567.89');
    });
  });

  describe('unit conversion', () => {
    it('should convert from smallest unit', () => {
      expect(fromSmallestUnit('1000000000000000000', 18).toNumber()).toBe(1);
    });

    it('should convert to smallest unit', () => {
      expect(toSmallestUnit(1, 18).toString()).toBe('1000000000000000000');
    });
  });

  describe('comparison', () => {
    it('should check zero', () => {
      expect(isZero(0)).toBe(true);
      expect(isZero('0')).toBe(true);
      expect(isZero(1)).toBe(false);
    });

    it('should check positive', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(-1)).toBe(false);
    });

    it('should check negative', () => {
      expect(isNegative(-1)).toBe(true);
      expect(isNegative(1)).toBe(false);
    });

    it('should compare values', () => {
      expect(compare(1, 2)).toBe(-1);
      expect(compare(2, 1)).toBe(1);
      expect(compare(1, 1)).toBe(0);
    });

    it('should find min', () => {
      expect(min(5, 3).toNumber()).toBe(3);
    });

    it('should find max', () => {
      expect(max(5, 3).toNumber()).toBe(5);
    });
  });

  describe('rounding', () => {
    it('should get absolute value', () => {
      expect(abs(-5).toNumber()).toBe(5);
    });

    it('should round', () => {
      expect(round(1.5, 0).toNumber()).toBe(2);
    });

    it('should floor', () => {
      expect(floor(1.9, 0).toNumber()).toBe(1);
    });

    it('should ceil', () => {
      expect(ceil(1.1, 0).toNumber()).toBe(2);
    });
  });

  describe('math operations', () => {
    it('should calculate power', () => {
      expect(pow(2, 3).toNumber()).toBe(8);
    });

    it('should calculate square root', () => {
      expect(sqrt(9).toNumber()).toBe(3);
    });
  });

  describe('array operations', () => {
    it('should sum array', () => {
      expect(sum([1, 2, 3, 4, 5]).toNumber()).toBe(15);
    });

    it('should calculate average', () => {
      expect(average([1, 2, 3, 4, 5]).toNumber()).toBe(3);
    });

    it('should return 0 for empty array average', () => {
      expect(average([]).toNumber()).toBe(0);
    });
  });

  describe('validation', () => {
    it('should validate numbers', () => {
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber('123.456')).toBe(true);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber('abc')).toBe(false);
    });
  });
});
