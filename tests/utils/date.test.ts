/**
 * Date Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatISO,
  format,
  isBefore,
  isAfter,
  add,
  subtract,
  diff,
  unix,
  fromUnix,
  isValid,
  formatDuration,
  dayjs,
} from '../../src/utils/date.js';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date in YYYY/MM/DD HH:mm:ss format', () => {
      const date = new Date('2024-01-15T10:30:45');
      const result = formatDate(date);
      expect(result).toBe('2024/01/15 10:30:45');
    });

    it('should use current date when no argument provided', () => {
      const result = formatDate();
      expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatISO', () => {
    it('should format date in ISO format', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const result = formatISO(date);
      expect(result).toBe('2024-01-15T10:30:45.000Z');
    });
  });

  describe('format', () => {
    it('should format date with custom format', () => {
      const date = new Date('2024-01-15T10:30:45');
      const result = format(date, 'DD-MM-YYYY');
      expect(result).toBe('15-01-2024');
    });
  });

  describe('isBefore', () => {
    it('should return true when first date is before second', () => {
      expect(isBefore('2024-01-01', '2024-01-02')).toBe(true);
    });

    it('should return false when first date is after second', () => {
      expect(isBefore('2024-01-02', '2024-01-01')).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('should return true when first date is after second', () => {
      expect(isAfter('2024-01-02', '2024-01-01')).toBe(true);
    });

    it('should return false when first date is before second', () => {
      expect(isAfter('2024-01-01', '2024-01-02')).toBe(false);
    });
  });

  describe('add', () => {
    it('should add days to date', () => {
      const date = new Date('2024-01-15');
      const result = add(date, 5, 'day');
      expect(result.getDate()).toBe(20);
    });

    it('should add months to date', () => {
      const date = new Date('2024-01-15');
      const result = add(date, 2, 'month');
      expect(result.getMonth()).toBe(2); // March (0-indexed)
    });
  });

  describe('subtract', () => {
    it('should subtract days from date', () => {
      const date = new Date('2024-01-15');
      const result = subtract(date, 5, 'day');
      expect(result.getDate()).toBe(10);
    });
  });

  describe('diff', () => {
    it('should return difference in days', () => {
      const result = diff('2024-01-10', '2024-01-05', 'day');
      expect(result).toBe(5);
    });

    it('should return difference in milliseconds by default', () => {
      const result = diff('2024-01-02', '2024-01-01');
      expect(result).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('unix', () => {
    it('should return unix timestamp in seconds', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = unix(date);
      expect(result).toBe(1704067200);
    });
  });

  describe('fromUnix', () => {
    it('should convert unix timestamp to Date', () => {
      const result = fromUnix(1704067200);
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isValid', () => {
    it('should return true for valid date', () => {
      expect(isValid('2024-01-15')).toBe(true);
    });

    it('should return false for invalid date', () => {
      expect(isValid('invalid-date')).toBe(false);
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
    });

    it('should format duration in minutes and seconds', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
    });

    it('should format duration in hours, minutes, and seconds', () => {
      expect(formatDuration(3665000)).toBe('1h 1m 5s');
    });
  });
});
