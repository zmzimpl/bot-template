/**
 * Random Number Utilities
 */

/**
 * Generate a random float between min and max
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 */
export const randfloat = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.random() * (max - min) + min;
};

/**
 * Generate a random integer between min and max (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export const randint = (min: number, max: number): number => {
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random boolean
 * @param probability - Probability of true (0-1), defaults to 0.5
 */
export const randbool = (probability = 0.5): boolean => {
  return Math.random() < probability;
};

/**
 * Pick a random element from an array
 * @param array - Array to pick from
 */
export const randpick = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[randint(0, array.length - 1)];
};

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param array - Array to shuffle
 * @returns New shuffled array (does not mutate original)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randint(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Generate a random string of specified length
 * @param length - Length of the string
 * @param chars - Characters to use (defaults to alphanumeric)
 */
export const randstr = (
  length: number,
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randint(0, chars.length - 1));
  }
  return result;
};
