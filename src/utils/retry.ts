/**
 * Retry Utility
 * Retry function with exponential backoff support
 */

export interface RetryOptions {
  retries?: number;
  delay?: number;
  exponential?: boolean;
  maxDelay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with configurable options
 * @param fn - Function to retry
 * @param options - Retry options
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions | number = 5,
  delay?: number
): Promise<T> {
  const opts: Required<RetryOptions> = {
    retries: typeof options === 'number' ? options : (options.retries ?? 5),
    delay: typeof options === 'number' ? (delay ?? 5000) : (options.delay ?? 5000),
    exponential: typeof options === 'number' ? false : (options.exponential ?? false),
    maxDelay: typeof options === 'number' ? 60000 : (options.maxDelay ?? 60000),
    onRetry: typeof options === 'number' ? (() => {}) : (options.onRetry ?? (() => {})),
  };

  let lastError: Error | null = null;

  for (let i = 0; i < opts.retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (i < opts.retries - 1) {
        opts.onRetry(lastError, i + 1);

        let waitTime = opts.delay;
        if (opts.exponential) {
          waitTime = Math.min(opts.delay * Math.pow(2, i), opts.maxDelay);
        }

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError ?? new Error('Retries exhausted with unknown error');
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retries
 * @param initialDelay - Initial delay in milliseconds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 5,
  initialDelay = 1000
): Promise<T> {
  return retry(fn, {
    retries,
    delay: initialDelay,
    exponential: true,
  });
}
