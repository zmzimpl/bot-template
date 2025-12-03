/**
 * Type definitions for the bot template
 */

// HTTP Client Types
export type HttpClientType = 'impit' | 'got';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  http2?: boolean;
  keepAlive?: boolean;
  dnsCache?: boolean;
  retry?: RetryConfig;
}

export interface RetryConfig {
  enabled: boolean;
  count: number;
  delay: number;
}

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string | string[] | undefined>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// Config Types
export interface EnvConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
}

export interface ApiConfig extends EnvConfig {
  headers: Record<string, string>;
  retry: RetryConfig;
}

export interface AppConfig {
  name: string;
  version: string;
}

export interface Config {
  api: ApiConfig;
  app: AppConfig;
}

// Bark Types
export interface BarkConfig {
  enabled: boolean;
  serverUrl: string;
  deviceKey: string;
  sound?: string;
  level?: 'active' | 'timeSensitive' | 'passive';
  group?: string;
  icon?: string;
}

export interface BarkOptions {
  sound?: string;
  group?: string;
  url?: string;
  icon?: string;
  badge?: number;
  level?: 'active' | 'timeSensitive' | 'passive';
}

// Redis Cache Types
export interface CacheOptions {
  ttl?: number;  // Time to live in seconds
  prefix?: string;
}

// Queue Types
export interface QueueOptions {
  concurrency?: number;
  interval?: number;
  intervalCap?: number;
  timeout?: number;
  throwOnTimeout?: boolean;
}

// Proxy Types
export interface ProxyConfig {
  protocol: string;
  host: string;
  port: string;
  username?: string;
  password?: string;
}

// Logger Types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// User Service Types
export interface LoginData {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  [key: string]: unknown;
}

// Environment Variables
export interface Env {
  NODE_ENV: string;
  API_BASE_URL: string;
  API_TIMEOUT: number;
  HTTP_CLIENT: HttpClientType;
  HTTP2_ENABLED: boolean;
  KEEP_ALIVE: boolean;
  DNS_CACHE: boolean;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: number;
  BARK_ENABLED: boolean;
  BARK_SERVER_URL: string;
  BARK_DEVICE_KEY: string;
  BARK_SOUND: string;
  BARK_LEVEL: string;
  BARK_GROUP: string;
  BARK_ICON: string;
  ENCRYPT_KEY1: string;
  ENCRYPT_KEY2: string;
  MAX_CONCURRENCY: number;
  INTERVAL_MS: number;
  LOG_LEVEL: string;
}
