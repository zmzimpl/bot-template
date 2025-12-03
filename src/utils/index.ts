/**
 * Utilities Index
 * Export all utility functions
 */

// Chalk
export { chalk } from './chalk.js';

// Date utilities (dayjs)
export {
  dayjs,
  formatDate,
  formatISO,
  format,
  fromNow,
  toNow,
  isBefore,
  isAfter,
  add,
  subtract,
  diff,
  startOf,
  endOf,
  unix,
  unixMs,
  fromUnix,
  isValid,
  formatDuration,
} from './date.js';

// Random utilities
export { randfloat, randint, randbool, randpick, shuffle, randstr } from './rand.js';

// Sleep utilities
export { sleep, sleepMs } from './sleep.js';

// Directory utilities
export { getDir, getRootDir, getCurrentDir } from './getDir.js';

// Object property utilities
export {
  getPropByStringPath,
  setPropByStringPath,
  hasPropByStringPath,
} from './getProp.js';

// Logging utilities
export {
  logIntro,
  logLoader,
  logClock,
  logWithTimestamp,
  logSuccess,
  logError,
  logWarning,
  logInfo,
} from './log.js';

// Encryption utilities
export { decrypt, encrypt, generateKey, hash, compareHash } from './encrypt.js';

// Logger utilities
export { createLogger, getLogger, closeLoggers } from './logger.js';

// Retry utilities
export { retry, retryWithBackoff } from './retry.js';

// Alert utilities
export { sendEmail, sendSimpleEmail, sendAlert } from './alert.js';

// Bark notifications
export { BarkNotifier } from './bark.js';

// Proxy utilities
export { getProxy, proxyToUrl, validateProxy } from './proxy.js';

// Cache utilities
export {
  getRedisClient,
  connectRedis,
  disconnectRedis,
  Cache,
  createCache,
} from './cache.js';

// Queue utilities
export {
  createQueue,
  getDefaultQueue,
  resetDefaultQueue,
  withQueue,
  withQueueAll,
  createRateLimiter,
  processBatch,
  withQueueRetry,
  PQueue,
} from './queue.js';

// Fuzzy matching utilities
export {
  ratio,
  partialRatio,
  tokenSortRatio,
  tokenSetRatio,
  weightedRatio,
  quickRatio,
  extractBest,
  extractTop,
  extractAll,
  dedupe,
  isSimilar,
  findSimilar,
  groupSimilar,
  fuzz,
} from './fuzzy.js';

// BigNumber utilities
export {
  BigNumber,
  bn,
  add as bnAdd,
  subtract as bnSubtract,
  multiply as bnMultiply,
  divide as bnDivide,
  percentage,
  percentageChange,
  format as bnFormat,
  formatWithCommas,
  fromSmallestUnit,
  toSmallestUnit,
  isZero,
  isPositive,
  isNegative,
  compare,
  min,
  max,
  abs,
  round,
  floor,
  ceil,
  pow,
  sqrt,
  sum,
  average,
  isValidNumber,
} from './bignumber.js';

// Re-export types
export type { FuzzyMatch } from './fuzzy.js';
export type { RetryOptions } from './retry.js';
