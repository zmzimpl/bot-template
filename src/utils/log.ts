/**
 * Console Log Utilities
 * Animated logging and visual elements
 */

import figlet from 'figlet';
import logUpdate from 'log-update';
import { chalk } from './chalk.js';
import { formatDate } from './date.js';
import { sleep } from './sleep.js';

const LOADER_FRAMES = ['-', '\\', '|', '/'];

/**
 * Display the intro ASCII art banner
 */
export const logIntro = (): void => {
  console.log(
    `\n${chalk.cyanBright(
      figlet.textSync('MILES', {
        font: 'Alligator',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 150,
        whitespaceBreak: true,
      })
    )}\n`
  );
  console.log(
    chalk.cyanBright.bold(
      `Supports: Twitter followers check, Pending tx watching, Auto sell if profitable.
      Follow me on Twitter if you find it helpful: @zmzimpl `
    )
  );
};

interface LogLoaderOptions {
  loadingText: string;
  successText?: string;
}

/**
 * Display a loading spinner while executing a function
 * @param options - Loading and success text
 * @param fn - Function to execute
 */
export const logLoader = async <T>(
  options: LogLoaderOptions,
  fn: () => Promise<T>
): Promise<T> => {
  let i = 0;
  const interval = setInterval(() => {
    logUpdate(
      `[${formatDate(new Date())}] ` +
        chalk.gray(
          `${options.loadingText} ${LOADER_FRAMES[(i = ++i % LOADER_FRAMES.length)]}`
        )
    );
  }, 100);

  try {
    const result = await fn();

    clearInterval(interval);
    if (options.successText) {
      logUpdate(`[${formatDate(new Date())}] ` + chalk.green(options.successText));
      logUpdate.done();
    } else {
      logUpdate.clear();
    }

    return result;
  } catch (error) {
    clearInterval(interval);
    logUpdate.clear();
    throw error;
  }
};

interface LogClockOptions {
  waitingText: string;
  endText: string;
  timeout: number;
}

/**
 * Display a countdown timer while waiting
 * @param options - Timer options
 * @param fn - Function to execute after countdown
 */
export const logClock = async <T>(
  options: LogClockOptions,
  fn: () => Promise<T>
): Promise<T> => {
  let i = 0;
  let remaining = options.timeout;

  const interval = setInterval(() => {
    remaining = remaining - 1;
    logUpdate(
      `[${formatDate(new Date())}] ` +
        chalk.gray(
          `${options.waitingText}, after ${remaining} seconds ${
            LOADER_FRAMES[(i = ++i % LOADER_FRAMES.length)]
          }`
        )
    );
  }, 1000);

  await sleep(options.timeout);
  clearInterval(interval);

  const result = await fn();
  logUpdate(`[${formatDate(new Date())}] ` + chalk.green(options.endText));
  logUpdate.done();

  return result;
};

/**
 * Log with timestamp
 * @param message - Message to log
 */
export const logWithTimestamp = (message: string): void => {
  console.log(`[${formatDate(new Date())}] ${message}`);
};

/**
 * Log success message
 * @param message - Message to log
 */
export const logSuccess = (message: string): void => {
  console.log(`[${formatDate(new Date())}] ${chalk.green(message)}`);
};

/**
 * Log error message
 * @param message - Message to log
 */
export const logError = (message: string): void => {
  console.log(`[${formatDate(new Date())}] ${chalk.red(message)}`);
};

/**
 * Log warning message
 * @param message - Message to log
 */
export const logWarning = (message: string): void => {
  console.log(`[${formatDate(new Date())}] ${chalk.yellow(message)}`);
};

/**
 * Log info message
 * @param message - Message to log
 */
export const logInfo = (message: string): void => {
  console.log(`[${formatDate(new Date())}] ${chalk.blue(message)}`);
};
