/**
 * Encryption Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateKey, hash, compareHash } from '../../src/utils/encrypt.js';

describe('encryption utilities', () => {
  const testText = 'Hello, World!';
  const password1 = 'secretkey1';
  const password2 = 'secretkey2';

  describe('encrypt', () => {
    it('should return hex string', () => {
      const result = encrypt(testText, password1, password2);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it('should return different result for different passwords', () => {
      const result1 = encrypt(testText, password1, password2);
      const result2 = encrypt(testText, 'different', password2);
      expect(result1).not.toBe(result2);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text', () => {
      const encrypted = encrypt(testText, password1, password2);
      const result = decrypt(encrypted, password1, password2);
      expect(result).toBe(testText);
    });

    it('should handle unicode text', () => {
      const unicode = '你好世界！🌍';
      const encrypted = encrypt(unicode, password1, password2);
      const result = decrypt(encrypted, password1, password2);
      expect(result).toBe(unicode);
    });
  });

  describe('generateKey', () => {
    it('should generate key of specified length', () => {
      const result = generateKey(32);
      expect(result.length).toBe(64); // hex string is 2x length
    });

    it('should generate different keys each time', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('hash', () => {
    it('should return SHA-256 hash', () => {
      const result = hash('test');
      expect(result).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should return same hash for same input', () => {
      const hash1 = hash('test');
      const hash2 = hash('test');
      expect(hash1).toBe(hash2);
    });
  });

  describe('compareHash', () => {
    it('should return true for matching hash', () => {
      const testHash = hash('test');
      expect(compareHash('test', testHash)).toBe(true);
    });

    it('should return false for non-matching hash', () => {
      const testHash = hash('test');
      expect(compareHash('different', testHash)).toBe(false);
    });
  });
});
