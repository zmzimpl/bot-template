/**
 * Date Utilities
 * Uses dayjs for date manipulation and formatting
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import duration from 'dayjs/plugin/duration.js';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);

export { dayjs };

/**
 * Format date like console-stamp format: YYYY/MM/DD HH:mm:ss
 */
export const formatDate = (date: Date | string | number = new Date()): string => {
  return dayjs(date).format('YYYY/MM/DD HH:mm:ss');
};

/**
 * Format date in ISO format
 */
export const formatISO = (date: Date | string | number = new Date()): string => {
  return dayjs(date).toISOString();
};

/**
 * Format date with custom format string
 */
export const format = (date: Date | string | number, formatStr: string): string => {
  return dayjs(date).format(formatStr);
};

/**
 * Get relative time from now (e.g., "2 hours ago")
 */
export const fromNow = (date: Date | string | number): string => {
  return dayjs(date).fromNow();
};

/**
 * Get relative time to now (e.g., "in 2 hours")
 */
export const toNow = (date: Date | string | number): string => {
  return dayjs(date).toNow();
};

/**
 * Check if a date is before another date
 */
export const isBefore = (date1: Date | string | number, date2: Date | string | number): boolean => {
  return dayjs(date1).isBefore(date2);
};

/**
 * Check if a date is after another date
 */
export const isAfter = (date1: Date | string | number, date2: Date | string | number): boolean => {
  return dayjs(date1).isAfter(date2);
};

/**
 * Add time to a date
 */
export const add = (
  date: Date | string | number,
  value: number,
  unit: dayjs.ManipulateType
): Date => {
  return dayjs(date).add(value, unit).toDate();
};

/**
 * Subtract time from a date
 */
export const subtract = (
  date: Date | string | number,
  value: number,
  unit: dayjs.ManipulateType
): Date => {
  return dayjs(date).subtract(value, unit).toDate();
};

/**
 * Get difference between two dates
 */
export const diff = (
  date1: Date | string | number,
  date2: Date | string | number,
  unit: dayjs.ManipulateType = 'millisecond'
): number => {
  return dayjs(date1).diff(date2, unit);
};

/**
 * Get start of a unit (day, week, month, etc.)
 */
export const startOf = (
  date: Date | string | number,
  unit: dayjs.OpUnitType
): Date => {
  return dayjs(date).startOf(unit).toDate();
};

/**
 * Get end of a unit (day, week, month, etc.)
 */
export const endOf = (
  date: Date | string | number,
  unit: dayjs.OpUnitType
): Date => {
  return dayjs(date).endOf(unit).toDate();
};

/**
 * Get unix timestamp (seconds)
 */
export const unix = (date: Date | string | number = new Date()): number => {
  return dayjs(date).unix();
};

/**
 * Get unix timestamp (milliseconds)
 */
export const unixMs = (date: Date | string | number = new Date()): number => {
  return dayjs(date).valueOf();
};

/**
 * Parse unix timestamp to Date
 */
export const fromUnix = (timestamp: number): Date => {
  return dayjs.unix(timestamp).toDate();
};

/**
 * Check if a date is valid
 */
export const isValid = (date: Date | string | number): boolean => {
  return dayjs(date).isValid();
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  const dur = dayjs.duration(milliseconds);
  const hours = dur.hours();
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
