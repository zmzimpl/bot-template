/**
 * Sleep Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { sleep, sleepMs } from '../../src/utils/sleep.js';

describe('sleep utilities', () => {
  describe('sleep', () => {
    it('should sleep for specified seconds', async () => {
      const start = Date.now();
      await sleep(0.1);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });

    it('should resolve without value', async () => {
      const result = await sleep(0.01);
      expect(result).toBeUndefined();
    });
  });

  describe('sleepMs', () => {
    it('should sleep for specified milliseconds', async () => {
      const start = Date.now();
      await sleepMs(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });
});
