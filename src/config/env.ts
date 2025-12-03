/**
 * Environment Configuration
 * Load and validate environment variables
 */

import 'dotenv/config';
import type { Env, HttpClientType } from '../types/index.js';

/**
 * Get environment variable with optional default
 */
function getEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as boolean
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get all environment variables
 */
export function getEnv(): Env {
  return {
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:3000/api'),
    API_TIMEOUT: getEnvNumber('API_TIMEOUT', 30000),
    HTTP_CLIENT: (getEnvVar('HTTP_CLIENT', 'impit') as HttpClientType),
    HTTP2_ENABLED: getEnvBoolean('HTTP2_ENABLED', true),
    KEEP_ALIVE: getEnvBoolean('KEEP_ALIVE', true),
    DNS_CACHE: getEnvBoolean('DNS_CACHE', true),
    REDIS_HOST: getEnvVar('REDIS_HOST', 'localhost'),
    REDIS_PORT: getEnvNumber('REDIS_PORT', 6379),
    REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD', ''),
    REDIS_DB: getEnvNumber('REDIS_DB', 0),
    BARK_ENABLED: getEnvBoolean('BARK_ENABLED', false),
    BARK_SERVER_URL: getEnvVar('BARK_SERVER_URL', 'https://api.day.app'),
    BARK_DEVICE_KEY: getEnvVar('BARK_DEVICE_KEY', ''),
    BARK_SOUND: getEnvVar('BARK_SOUND', 'bell'),
    BARK_LEVEL: getEnvVar('BARK_LEVEL', 'active'),
    BARK_GROUP: getEnvVar('BARK_GROUP', 'Notifications'),
    BARK_ICON: getEnvVar('BARK_ICON', ''),
    ENCRYPT_KEY1: getEnvVar('ENCRYPT_KEY1', ''),
    ENCRYPT_KEY2: getEnvVar('ENCRYPT_KEY2', ''),
    MAX_CONCURRENCY: getEnvNumber('MAX_CONCURRENCY', 10),
    INTERVAL_MS: getEnvNumber('INTERVAL_MS', 0),
    LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

/**
 * Environment-specific API configurations
 */
export const envConfigs = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 30000,
    withCredentials: true,
  },
  production: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    withCredentials: true,
  },
  test: {
    baseURL: 'http://localhost:3000/api',
    timeout: 30000,
    withCredentials: false,
  },
};

/**
 * Get environment-specific config
 */
export function getEnvConfig() {
  const nodeEnv = getEnv().NODE_ENV as keyof typeof envConfigs;
  return envConfigs[nodeEnv] || envConfigs.development;
}

export default getEnv;
