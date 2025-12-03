/**
 * Logger Utility
 * Winston-based logging with daily file rotation
 */

import { existsSync, mkdirSync } from 'fs';
import * as winston from 'winston';
import { dayjs } from './date.js';

const colorizer = winston.format.colorize();
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Create a logger instance with a specific label
 * Logs are saved to logs/{label}/YYYY-MM-DD.log
 * @param label - Logger label (used for file organization)
 */
export function createLogger(label: string): winston.Logger {
  if (!winston.loggers.has(label)) {
    // Create logs directory if it doesn't exist
    if (!existsSync('logs')) {
      mkdirSync('logs');
    }
    if (!existsSync(`logs/${label}`)) {
      mkdirSync(`logs/${label}`);
    }

    const formattedDate = dayjs().format('YYYY-MM-DD');
    const logFile = `logs/${label}/${formattedDate}.log`;

    // Create file transport
    const transport = new winston.transports.File({
      level: process.env.LOG_LEVEL || 'info',
      filename: logFile,
    });

    // Create console transport for development
    const consoleTransport = new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
    });

    const transports: winston.transport[] = [transport];
    if (isDevelopment) {
      transports.push(consoleTransport);
    }

    winston.loggers.add(label, {
      transports,
      format: winston.format.combine(
        winston.format.label({ label }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((info) => {
          const { timestamp, level, message } = info;
          const splat = info[Symbol.for('splat')] as unknown[] | undefined;
          const metaString = splat?.length
            ? splat.map((item) => JSON.stringify(item)).join(' ')
            : '';
          const formattedMessage = `${message} ${metaString}`.trim();

          const logLine = `${label} | ${timestamp} - ${level}: ${formattedMessage}`;

          return isDevelopment ? colorizer.colorize(level, logLine) : logLine;
        })
      ),
    });
  }

  return winston.loggers.get(label);
}

/**
 * Get an existing logger or create a new one
 * @param label - Logger label
 */
export function getLogger(label: string): winston.Logger {
  return winston.loggers.has(label)
    ? winston.loggers.get(label)
    : createLogger(label);
}

/**
 * Close all logger transports
 */
export function closeLoggers(): void {
  winston.loggers.close();
}
