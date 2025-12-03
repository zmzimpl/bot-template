/**
 * Fuzzy Matching Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ratio,
  partialRatio,
  tokenSortRatio,
  tokenSetRatio,
  extractBest,
  extractTop,
  dedupe,
  isSimilar,
  findSimilar,
  groupSimilar,
} from '../../src/utils/fuzzy.js';

describe('fuzzy matching utilities', () => {
  describe('ratio', () => {
    it('should return 100 for identical strings', () => {
      expect(ratio('hello', 'hello')).toBe(100);
    });

    it('should return lower score for different strings', () => {
      const score = ratio('hello', 'world');
      expect(score).toBeLessThan(50);
    });

    it('should return higher score for similar strings', () => {
      const score = ratio('hello', 'helo');
      expect(score).toBeGreaterThan(80);
    });
  });

  describe('partialRatio', () => {
    it('should match substrings', () => {
      const score = partialRatio('hello world', 'hello');
      expect(score).toBeGreaterThan(90);
    });
  });

  describe('tokenSortRatio', () => {
    it('should ignore word order', () => {
      const score = tokenSortRatio('hello world', 'world hello');
      expect(score).toBe(100);
    });
  });

  describe('tokenSetRatio', () => {
    it('should ignore duplicates', () => {
      const score = tokenSetRatio('hello hello world', 'hello world');
      expect(score).toBe(100);
    });
  });

  describe('extractBest', () => {
    it('should find best match', () => {
      const choices = ['apple', 'banana', 'cherry', 'apricot'];
      const result = extractBest('aple', choices);
      expect(result?.value).toBe('apple');
    });

    it('should return null for no match above threshold', () => {
      const choices = ['apple', 'banana', 'cherry'];
      const result = extractBest('xyz', choices, { scoreThreshold: 80 });
      expect(result).toBeNull();
    });

    it('should use custom processor', () => {
      const choices = [{ name: 'apple' }, { name: 'banana' }];
      const result = extractBest('aple', choices, {
        processor: (item) => item.name,
      });
      expect(result?.value.name).toBe('apple');
    });
  });

  describe('extractTop', () => {
    it('should return top matches', () => {
      const choices = ['apple', 'application', 'apricot', 'banana'];
      const results = extractTop('app', choices, 2);
      expect(results.length).toBe(2);
      expect(results[0].value).toBe('apple');
    });

    it('should filter by threshold', () => {
      const choices = ['apple', 'banana', 'xyz'];
      const results = extractTop('apple', choices, 3, { scoreThreshold: 80 });
      expect(results.length).toBe(1);
    });
  });

  describe('dedupe', () => {
    it('should remove similar duplicates', () => {
      const items = ['apple', 'Apple', 'APPLE', 'banana'];
      const result = dedupe(items, 90);
      expect(result.length).toBe(2);
    });

    it('should keep different items', () => {
      const items = ['apple', 'banana', 'cherry'];
      const result = dedupe(items);
      expect(result.length).toBe(3);
    });
  });

  describe('isSimilar', () => {
    it('should return true for similar strings', () => {
      expect(isSimilar('apple', 'aple', 80)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(isSimilar('apple', 'banana', 80)).toBe(false);
    });
  });

  describe('findSimilar', () => {
    it('should find similar items', () => {
      const items = ['apple', 'application', 'banana', 'apricot'];
      const result = findSimilar('app', items, { threshold: 50 });
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('apple');
    });
  });

  describe('groupSimilar', () => {
    it('should group similar items', () => {
      const items = ['apple', 'Apple', 'APPLE', 'banana', 'Banana'];
      const groups = groupSimilar(items, { threshold: 90 });
      expect(groups.length).toBe(2);
    });

    it('should put unique items in separate groups', () => {
      const items = ['apple', 'banana', 'cherry'];
      const groups = groupSimilar(items);
      expect(groups.length).toBe(3);
    });
  });
});
