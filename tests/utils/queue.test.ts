/**
 * Queue Utilities Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createQueue,
  getDefaultQueue,
  resetDefaultQueue,
  withQueue,
  processBatch,
  createRateLimiter,
} from '../../src/utils/queue.js';

describe('queue utilities', () => {
  beforeEach(() => {
    resetDefaultQueue();
  });

  afterEach(() => {
    resetDefaultQueue();
  });

  describe('createQueue', () => {
    it('should create queue with default options', () => {
      const queue = createQueue();
      expect(queue).toBeDefined();
      expect(queue.concurrency).toBe(10);
    });

    it('should create queue with custom concurrency', () => {
      const queue = createQueue({ concurrency: 5 });
      expect(queue.concurrency).toBe(5);
    });
  });

  describe('getDefaultQueue', () => {
    it('should return same instance', () => {
      const queue1 = getDefaultQueue();
      const queue2 = getDefaultQueue();
      expect(queue1).toBe(queue2);
    });
  });

  describe('withQueue', () => {
    it('should execute function with queue', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const result = await withQueue(fn);
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();
    });

    it('should respect concurrency', async () => {
      const queue = createQueue({ concurrency: 2 });
      const running: number[] = [];
      const maxConcurrent = { value: 0 };

      const tasks = Array.from({ length: 5 }, (_, i) =>
        queue.add(async () => {
          running.push(i);
          maxConcurrent.value = Math.max(maxConcurrent.value, running.length);
          await new Promise(resolve => setTimeout(resolve, 50));
          running.splice(running.indexOf(i), 1);
          return i;
        })
      );

      await Promise.all(tasks);
      expect(maxConcurrent.value).toBeLessThanOrEqual(2);
    });
  });

  describe('processBatch', () => {
    it('should process all items', async () => {
      const items = [1, 2, 3, 4, 5];
      const processor = vi.fn().mockImplementation(async (item: number) => item * 2);

      const results = await processBatch(items, processor, { concurrency: 2 });

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(processor).toHaveBeenCalledTimes(5);
    });

    it('should preserve order', async () => {
      const items = [1, 2, 3];
      const delays = [30, 10, 20];

      const processor = async (item: number, index: number) => {
        await new Promise(resolve => setTimeout(resolve, delays[index]));
        return item;
      };

      const results = await processBatch(items, processor, { concurrency: 3 });
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('createRateLimiter', () => {
    it('should limit requests per interval', async () => {
      const limiter = createRateLimiter(2, 100);
      const times: number[] = [];
      const start = Date.now();

      const tasks = Array.from({ length: 4 }, () =>
        limiter.add(async () => {
          times.push(Date.now() - start);
        })
      );

      await Promise.all(tasks);

      // First 2 should be immediate, next 2 should be after ~100ms
      expect(times[0]).toBeLessThan(50);
      expect(times[1]).toBeLessThan(50);
      expect(times[2]).toBeGreaterThanOrEqual(90);
      expect(times[3]).toBeGreaterThanOrEqual(90);
    });
  });
});
