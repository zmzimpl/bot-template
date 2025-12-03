/**
 * Object Property Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getPropByStringPath,
  setPropByStringPath,
  hasPropByStringPath,
} from '../../src/utils/getProp.js';

describe('object property utilities', () => {
  describe('getPropByStringPath', () => {
    it('should get nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(getPropByStringPath(obj, 'a.b.c')).toBe('value');
    });

    it('should get array element', () => {
      const obj = { items: [{ name: 'first' }, { name: 'second' }] };
      expect(getPropByStringPath(obj, 'items[1].name')).toBe('second');
    });

    it('should return undefined for non-existent path', () => {
      const obj = { a: { b: 1 } };
      expect(getPropByStringPath(obj, 'a.c.d')).toBeUndefined();
    });

    it('should return undefined for out of bounds index', () => {
      const obj = { items: [1, 2, 3] };
      expect(getPropByStringPath(obj, 'items[10]')).toBeUndefined();
    });

    it('should handle null values', () => {
      const obj = { a: null };
      expect(getPropByStringPath(obj, 'a.b')).toBeUndefined();
    });
  });

  describe('setPropByStringPath', () => {
    it('should set nested property', () => {
      const obj: Record<string, unknown> = {};
      setPropByStringPath(obj, 'a.b.c', 'value');
      expect(obj).toEqual({ a: { b: { c: 'value' } } });
    });

    it('should set array element', () => {
      const obj: Record<string, unknown> = {};
      setPropByStringPath(obj, 'items[0]', 'first');
      setPropByStringPath(obj, 'items[1]', 'second');
      expect(obj).toEqual({ items: ['first', 'second'] });
    });

    it('should overwrite existing value', () => {
      const obj: Record<string, unknown> = { a: { b: 1 } };
      setPropByStringPath(obj, 'a.b', 2);
      expect(obj).toEqual({ a: { b: 2 } });
    });
  });

  describe('hasPropByStringPath', () => {
    it('should return true for existing property', () => {
      const obj = { a: { b: { c: 'value' } } };
      expect(hasPropByStringPath(obj, 'a.b.c')).toBe(true);
    });

    it('should return false for non-existent property', () => {
      const obj = { a: { b: 1 } };
      expect(hasPropByStringPath(obj, 'a.c')).toBe(false);
    });

    it('should return true for array element', () => {
      const obj = { items: [1, 2, 3] };
      expect(hasPropByStringPath(obj, 'items[1]')).toBe(true);
    });
  });
});
