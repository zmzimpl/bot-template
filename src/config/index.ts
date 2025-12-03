/**
 * Main Configuration File
 * Export all configuration options
 */

import { getEnv, getEnvConfig, isDevelopment, isProduction, isTest } from './env.js';
import type { ApiConfig, AppConfig, Config } from '../types/index.js';

// Get current environment config
const envConfig = getEnvConfig();
const env = getEnv();

// API Configuration
export const apiConfig: ApiConfig = {
  baseURL: env.API_BASE_URL || envConfig.baseURL,
  timeout: env.API_TIMEOUT || envConfig.timeout,
  withCredentials: envConfig.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: {
    enabled: true,
    count: 3,
    delay: 1000,
  },
};

// Application Configuration
export const appConfig: AppConfig = {
  name: 'Bot Template',
  version: '2.0.0',
};

// HTTP Client Configuration
export const httpConfig = {
  client: env.HTTP_CLIENT,
  http2: env.HTTP2_ENABLED,
  keepAlive: env.KEEP_ALIVE,
  dnsCache: env.DNS_CACHE,
};

// Redis Configuration
export const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
};

// Bark Configuration
export const barkConfig = {
  enabled: env.BARK_ENABLED,
  serverUrl: env.BARK_SERVER_URL,
  deviceKey: env.BARK_DEVICE_KEY,
  sound: env.BARK_SOUND,
  level: env.BARK_LEVEL as 'active' | 'timeSensitive' | 'passive',
  group: env.BARK_GROUP,
  icon: env.BARK_ICON,
};

// Queue Configuration
export const queueConfig = {
  concurrency: env.MAX_CONCURRENCY,
  interval: env.INTERVAL_MS,
};

// Default exported configuration
const config: Config = {
  api: apiConfig,
  app: appConfig,
};

export default config;

// Re-export environment utilities
export { getEnv, getEnvConfig, isDevelopment, isProduction, isTest };
