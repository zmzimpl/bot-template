/**
 * Environment Configuration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('environment configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should use default values when env vars not set', async () => {
      // Note: vitest sets NODE_ENV to 'test' automatically
      delete process.env.API_TIMEOUT;
      delete process.env.HTTP_CLIENT;
      delete process.env.HTTP2_ENABLED;
      delete process.env.REDIS_PORT;

      const { getEnv } = await import('../../src/config/env.js');
      const env = getEnv();

      // NODE_ENV is 'test' because vitest sets it
      expect(env.NODE_ENV).toBe('test');
      expect(env.API_TIMEOUT).toBe(30000);
      expect(env.HTTP_CLIENT).toBe('impit');
      expect(env.HTTP2_ENABLED).toBe(true);
      expect(env.REDIS_PORT).toBe(6379);
    });

    it('should read string env vars', async () => {
      process.env.API_BASE_URL = 'https://custom.api.com';

      const { getEnv } = await import('../../src/config/env.js');
      const env = getEnv();

      expect(env.API_BASE_URL).toBe('https://custom.api.com');
    });

    it('should read number env vars', async () => {
      process.env.API_TIMEOUT = '5000';
      process.env.REDIS_PORT = '6380';

      const { getEnv } = await import('../../src/config/env.js');
      const env = getEnv();

      expect(env.API_TIMEOUT).toBe(5000);
      expect(env.REDIS_PORT).toBe(6380);
    });

    it('should read boolean env vars', async () => {
      process.env.HTTP2_ENABLED = 'false';
      process.env.BARK_ENABLED = 'true';

      const { getEnv } = await import('../../src/config/env.js');
      const env = getEnv();

      expect(env.HTTP2_ENABLED).toBe(false);
      expect(env.BARK_ENABLED).toBe(true);
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development', async () => {
      process.env.NODE_ENV = 'development';

      const { isDevelopment } = await import('../../src/config/env.js');
      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production', async () => {
      process.env.NODE_ENV = 'production';

      const { isDevelopment } = await import('../../src/config/env.js');
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true in production', async () => {
      process.env.NODE_ENV = 'production';

      const { isProduction } = await import('../../src/config/env.js');
      expect(isProduction()).toBe(true);
    });
  });

  describe('isTest', () => {
    it('should return true in test', async () => {
      process.env.NODE_ENV = 'test';

      const { isTest } = await import('../../src/config/env.js');
      expect(isTest()).toBe(true);
    });
  });
});
