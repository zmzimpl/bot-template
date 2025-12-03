/**
 * Sleep Utility
 * Promise-based delay function
 */

/**
 * Sleep for a specified number of seconds
 * @param seconds - Number of seconds to sleep
 */
export const sleep = (seconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/**
 * Sleep for a specified number of milliseconds
 * @param ms - Number of milliseconds to sleep
 */
export const sleepMs = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
