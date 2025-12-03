/**
 * Bot Template - Main Entry Point
 * TypeScript version with HTTP/2, caching, and modern utilities
 */

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';

// Import utilities
import {
  getDir,
  logIntro,
  chalk,
  createLogger,
  BarkNotifier,
  createCache,
  createQueue,
  formatDate,
  PQueue,
} from './utils/index.js';

// Import configuration
import config, { getEnv, isDevelopment } from './config/index.js';

// Import HTTP client
import { resetDefaultClient } from './http/index.js';

// Types
interface AppConfig {
  wallets?: string[];
  [key: string]: unknown;
}

// Load application config if exists
let appConfig: AppConfig = {};
const configPath = getDir('config.json');
if (existsSync(configPath)) {
  try {
    appConfig = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error(chalk.red('Failed to load config.json:'), error);
  }
}

// Initialize logger
const logger = createLogger('main');

// Initialize Bark notifier
const bark = BarkNotifier.fromEnv();

// Initialize cache (optional - only if Redis is configured)
const env = getEnv();
let cache: ReturnType<typeof createCache> | null = null;
if (env.REDIS_HOST && env.REDIS_HOST !== 'localhost') {
  cache = createCache({ prefix: 'bot:', ttl: 3600 });
}

// Initialize queue for concurrency control
const queue: InstanceType<typeof PQueue> = createQueue({
  concurrency: env.MAX_CONCURRENCY,
  interval: env.INTERVAL_MS,
});

/**
 * Main application logic
 */
async function main(): Promise<void> {
  const execute = async (): Promise<void> => {
    // Example: Log startup information
    logger.info('Bot started', {
      version: config.app.version,
      env: env.NODE_ENV,
      httpClient: env.HTTP_CLIENT,
      http2: env.HTTP2_ENABLED,
    });

    // Example: Using the HTTP client directly
    if (isDevelopment()) {
      console.log(chalk.gray('Running in development mode'));
      console.log(chalk.gray(`HTTP Client: ${env.HTTP_CLIENT}`));
      console.log(chalk.gray(`HTTP/2 Enabled: ${env.HTTP2_ENABLED}`));
      console.log(chalk.gray(`Keep-Alive: ${env.KEEP_ALIVE}`));
      console.log(chalk.gray(`DNS Cache: ${env.DNS_CACHE}`));
    }

    // Your main bot logic goes here
    // ...

    console.log(chalk.green('Bot is ready!'));
    console.log(chalk.gray(`Timestamp: ${formatDate()}`));
  };

  try {
    await execute();
  } catch (error) {
    logger.error('Bot execution failed:', error);
    await bark.error('Bot Error', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(): Promise<void> {
  console.log(chalk.yellow('\nShutting down...'));

  // Clear queue
  queue.clear();

  // Reset HTTP client
  await resetDefaultClient();

  // Close cache connection
  if (cache) {
    // Redis client will be closed automatically
  }

  console.log(chalk.green('Shutdown complete'));
  process.exit(0);
}

// Register shutdown handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Display intro and start
logIntro();
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});

// Export for testing
export { main, shutdown, appConfig, bark, cache, queue, logger };
