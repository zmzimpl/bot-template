/**
 * Queue Utility
 * Concurrency control using p-queue
 */

import PQueue from 'p-queue';
import type { QueueOptions } from '../types/index.js';

/**
 * Create a new queue with concurrency control
 */
export function createQueue(options: QueueOptions = {}): PQueue {
  const concurrency = options.concurrency || parseInt(process.env.MAX_CONCURRENCY || '10', 10);
  const interval = options.interval || parseInt(process.env.INTERVAL_MS || '0', 10);

  // p-queue requires intervalCap when interval is set
  if (interval > 0) {
    return new PQueue({
      concurrency,
      interval,
      intervalCap: options.intervalCap || concurrency,
      timeout: options.timeout,
      throwOnTimeout: options.throwOnTimeout ?? true,
    });
  }

  return new PQueue({
    concurrency,
    timeout: options.timeout,
    throwOnTimeout: options.throwOnTimeout ?? true,
  });
}

/**
 * Default shared queue instance
 */
let defaultQueue: PQueue | null = null;

/**
 * Get the default queue instance
 */
export function getDefaultQueue(): PQueue {
  if (!defaultQueue) {
    defaultQueue = createQueue();
  }
  return defaultQueue;
}

/**
 * Reset the default queue
 */
export function resetDefaultQueue(): void {
  if (defaultQueue) {
    defaultQueue.clear();
    defaultQueue = null;
  }
}

/**
 * Run a function with concurrency control using the default queue
 */
export async function withQueue<T>(fn: () => Promise<T>): Promise<T> {
  return getDefaultQueue().add(fn) as Promise<T>;
}

/**
 * Run multiple functions with concurrency control
 */
export async function withQueueAll<T>(
  fns: (() => Promise<T>)[],
  options?: QueueOptions
): Promise<T[]> {
  const queue = options ? createQueue(options) : getDefaultQueue();
  return Promise.all(fns.map((fn) => queue.add(fn) as Promise<T>));
}

/**
 * Rate-limited function execution
 */
export function createRateLimiter(
  requestsPerInterval: number,
  intervalMs: number
): PQueue {
  return new PQueue({
    concurrency: requestsPerInterval,
    interval: intervalMs,
    intervalCap: requestsPerInterval,
  });
}

/**
 * Batch processor with concurrency control
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options?: QueueOptions
): Promise<R[]> {
  const queue = options ? createQueue(options) : getDefaultQueue();
  const results: R[] = [];

  await Promise.all(
    items.map((item, index) =>
      queue.add(async () => {
        const result = await processor(item, index);
        results[index] = result;
      })
    )
  );

  return results;
}

/**
 * Retry wrapper with queue
 */
export async function withQueueRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  const queue = getDefaultQueue();

  return queue.add(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }) as Promise<T>;
}

// Re-export PQueue for advanced usage
export { PQueue };
