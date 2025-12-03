/**
 * BigNumber Utilities
 * Precision calculations using bignumber.js
 */

import BigNumber from 'bignumber.js';

// Configure BigNumber defaults
BigNumber.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-18, 36],
});

export { BigNumber };

/**
 * Create a BigNumber from various inputs
 */
export function bn(value: BigNumber.Value): BigNumber {
  return new BigNumber(value);
}

/**
 * Add two numbers with precision
 */
export function add(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(a).plus(b);
}

/**
 * Subtract two numbers with precision
 */
export function subtract(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(a).minus(b);
}

/**
 * Multiply two numbers with precision
 */
export function multiply(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(a).times(b);
}

/**
 * Divide two numbers with precision
 */
export function divide(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(a).dividedBy(b);
}

/**
 * Calculate percentage
 */
export function percentage(value: BigNumber.Value, percent: BigNumber.Value): BigNumber {
  return bn(value).times(percent).dividedBy(100);
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: BigNumber.Value, newValue: BigNumber.Value): BigNumber {
  const old = bn(oldValue);
  const newVal = bn(newValue);
  return newVal.minus(old).dividedBy(old).times(100);
}

/**
 * Format a number with specific decimal places
 */
export function format(
  value: BigNumber.Value,
  decimals = 2,
  roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN
): string {
  return bn(value).toFixed(decimals, roundingMode);
}

/**
 * Format a number as a string with thousand separators
 */
export function formatWithCommas(
  value: BigNumber.Value,
  decimals = 2
): string {
  return bn(value).toFormat(decimals);
}

/**
 * Convert from smallest unit to standard unit (e.g., wei to ether)
 */
export function fromSmallestUnit(value: BigNumber.Value, decimals = 18): BigNumber {
  return bn(value).dividedBy(bn(10).pow(decimals));
}

/**
 * Convert from standard unit to smallest unit (e.g., ether to wei)
 */
export function toSmallestUnit(value: BigNumber.Value, decimals = 18): BigNumber {
  return bn(value).times(bn(10).pow(decimals));
}

/**
 * Check if a value is zero
 */
export function isZero(value: BigNumber.Value): boolean {
  return bn(value).isZero();
}

/**
 * Check if a value is positive
 */
export function isPositive(value: BigNumber.Value): boolean {
  return bn(value).isPositive();
}

/**
 * Check if a value is negative
 */
export function isNegative(value: BigNumber.Value): boolean {
  return bn(value).isNegative();
}

/**
 * Compare two values
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compare(a: BigNumber.Value, b: BigNumber.Value): number {
  const result = bn(a).comparedTo(b);
  return result === null ? 0 : result;
}

/**
 * Get the minimum of two values
 */
export function min(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(BigNumber.min(a, b));
}

/**
 * Get the maximum of two values
 */
export function max(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  return bn(BigNumber.max(a, b));
}

/**
 * Get the absolute value
 */
export function abs(value: BigNumber.Value): BigNumber {
  return bn(value).abs();
}

/**
 * Round a value
 */
export function round(
  value: BigNumber.Value,
  decimals = 0,
  mode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP
): BigNumber {
  return bn(value).decimalPlaces(decimals, mode);
}

/**
 * Floor a value (round down)
 */
export function floor(value: BigNumber.Value, decimals = 0): BigNumber {
  return bn(value).decimalPlaces(decimals, BigNumber.ROUND_DOWN);
}

/**
 * Ceil a value (round up)
 */
export function ceil(value: BigNumber.Value, decimals = 0): BigNumber {
  return bn(value).decimalPlaces(decimals, BigNumber.ROUND_UP);
}

/**
 * Power operation
 */
export function pow(base: BigNumber.Value, exponent: BigNumber.Value): BigNumber {
  return bn(base).pow(exponent);
}

/**
 * Square root
 */
export function sqrt(value: BigNumber.Value): BigNumber {
  return bn(value).sqrt();
}

/**
 * Sum an array of values
 */
export function sum(values: BigNumber.Value[]): BigNumber {
  return values.reduce<BigNumber>((acc, val) => acc.plus(val), bn(0));
}

/**
 * Calculate average of an array of values
 */
export function average(values: BigNumber.Value[]): BigNumber {
  if (values.length === 0) return bn(0);
  return sum(values).dividedBy(values.length);
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  try {
    const num = bn(value as BigNumber.Value);
    return !num.isNaN() && num.isFinite();
  } catch {
    return false;
  }
}
