/**
 * Redis Cache Utility
 * Caching layer using ioredis
 */

import { Redis } from 'ioredis';
import type { CacheOptions } from '../types/index.js';

let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error('[Redis] Max retries reached, giving up');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }

  return redisClient;
}

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  await client.connect();
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Cache class for key-value operations
 */
export class Cache {
  private prefix: string;
  private defaultTTL: number;
  private client: Redis;

  constructor(options: CacheOptions = {}) {
    this.prefix = options.prefix || 'cache:';
    this.defaultTTL = options.ttl || 3600;
    this.client = getRedisClient();
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(this.getKey(key));
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const expiry = ttl || this.defaultTTL;

    if (expiry > 0) {
      await this.client.setex(this.getKey(key), expiry, stringValue);
    } else {
      await this.client.set(this.getKey(key), stringValue);
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(this.getKey(key));
    return result === 1;
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(this.getKey(key));
  }

  /**
   * Set expiry on an existing key
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(this.getKey(key), seconds);
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(this.getKey(key));
  }

  /**
   * Decrement a numeric value
   */
  async decr(key: string): Promise<number> {
    return this.client.decr(this.getKey(key));
  }

  /**
   * Get or set a value with a factory function
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const existing = await this.get<T>(key);
    if (existing !== null) {
      return existing;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Delete all keys with the prefix
   */
  async clear(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Get all keys with the prefix
   */
  async keys(): Promise<string[]> {
    const keys = await this.client.keys(`${this.prefix}*`);
    return keys.map((key: string) => key.slice(this.prefix.length));
  }

  /**
   * Hash operations
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(this.getKey(key), field);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async hset<T>(key: string, field: string, value: T): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.hset(this.getKey(key), field, stringValue);
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const result = await this.client.hgetall(this.getKey(key));
    const parsed: Record<string, T> = {};

    for (const [field, value] of Object.entries(result)) {
      try {
        parsed[field] = JSON.parse(value as string) as T;
      } catch {
        parsed[field] = value as unknown as T;
      }
    }

    return parsed;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(this.getKey(key), field);
  }

  /**
   * List operations
   */
  async lpush<T>(key: string, ...values: T[]): Promise<number> {
    const stringValues = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.client.lpush(this.getKey(key), ...stringValues);
  }

  async rpush<T>(key: string, ...values: T[]): Promise<number> {
    const stringValues = values.map((v) =>
      typeof v === 'string' ? v : JSON.stringify(v)
    );
    return this.client.rpush(this.getKey(key), ...stringValues);
  }

  async lpop<T>(key: string): Promise<T | null> {
    const value = await this.client.lpop(this.getKey(key));
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lrange(this.getKey(key), start, stop);
    return values.map((v: string) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    });
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(this.getKey(key));
  }
}

/**
 * Create a cache instance
 */
export function createCache(options?: CacheOptions): Cache {
  return new Cache(options);
}
