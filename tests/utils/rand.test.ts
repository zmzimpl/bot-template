/**
 * Random Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { randint, randfloat, randbool, randpick, shuffle, randstr } from '../../src/utils/rand.js';

describe('random utilities', () => {
  describe('randint', () => {
    it('should return integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randint(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should handle reversed min/max', () => {
      for (let i = 0; i < 100; i++) {
        const result = randint(10, 1);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('should return same value when min equals max', () => {
      const result = randint(5, 5);
      expect(result).toBe(5);
    });
  });

  describe('randfloat', () => {
    it('should return float within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randfloat(1.0, 10.0);
        expect(result).toBeGreaterThanOrEqual(1.0);
        expect(result).toBeLessThan(10.0);
      }
    });

    it('should handle reversed min/max', () => {
      for (let i = 0; i < 100; i++) {
        const result = randfloat(10.0, 1.0);
        expect(result).toBeGreaterThanOrEqual(1.0);
        expect(result).toBeLessThan(10.0);
      }
    });
  });

  describe('randbool', () => {
    it('should return boolean', () => {
      const result = randbool();
      expect(typeof result).toBe('boolean');
    });

    it('should return true with probability 1', () => {
      for (let i = 0; i < 10; i++) {
        expect(randbool(1)).toBe(true);
      }
    });

    it('should return false with probability 0', () => {
      for (let i = 0; i < 10; i++) {
        expect(randbool(0)).toBe(false);
      }
    });
  });

  describe('randpick', () => {
    it('should pick element from array', () => {
      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 100; i++) {
        const result = randpick(arr);
        expect(arr).toContain(result);
      }
    });

    it('should return undefined for empty array', () => {
      expect(randpick([])).toBeUndefined();
    });
  });

  describe('shuffle', () => {
    it('should return array with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffle(arr);
      expect(result.sort()).toEqual(arr.sort());
    });

    it('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });

    it('should handle empty array', () => {
      expect(shuffle([])).toEqual([]);
    });
  });

  describe('randstr', () => {
    it('should return string of specified length', () => {
      const result = randstr(10);
      expect(result.length).toBe(10);
    });

    it('should use custom characters', () => {
      const result = randstr(10, 'abc');
      expect(result).toMatch(/^[abc]+$/);
    });

    it('should return empty string for length 0', () => {
      expect(randstr(0)).toBe('');
    });
  });
});
