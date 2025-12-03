/**
 * HTTP Client Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createHttpClient,
  getDefaultClient,
  resetDefaultClient,
  ImpitClient,
  GotClient,
} from '../../src/http/index.js';

describe('HTTP client', () => {
  beforeEach(async () => {
    await resetDefaultClient();
  });

  describe('createHttpClient', () => {
    it('should create impit client by default', () => {
      const client = createHttpClient();
      expect(client).toBeInstanceOf(ImpitClient);
    });

    it('should create impit client when specified', () => {
      const client = createHttpClient('impit');
      expect(client).toBeInstanceOf(ImpitClient);
    });

    it('should create got client when specified', () => {
      const client = createHttpClient('got');
      expect(client).toBeInstanceOf(GotClient);
    });

    it('should throw for unknown client type', () => {
      expect(() => createHttpClient('unknown' as 'impit')).toThrow();
    });
  });

  describe('client configuration', () => {
    it('should use custom base URL', () => {
      const client = createHttpClient('impit', {
        baseURL: 'https://api.example.com',
      });
      expect(client.getConfig().baseURL).toBe('https://api.example.com');
    });

    it('should use custom timeout', () => {
      const client = createHttpClient('impit', {
        timeout: 5000,
      });
      expect(client.getConfig().timeout).toBe(5000);
    });

    it('should use HTTP/2 by default', () => {
      const client = createHttpClient('impit');
      expect(client.getConfig().http2).toBe(true);
    });

    it('should allow disabling HTTP/2', () => {
      const client = createHttpClient('impit', {
        http2: false,
      });
      expect(client.getConfig().http2).toBe(false);
    });
  });

  describe('header management', () => {
    it('should set individual header', () => {
      const client = createHttpClient('impit');
      client.setHeader('Authorization', 'Bearer token');
      expect(client.getConfig().headers?.['Authorization']).toBe('Bearer token');
    });

    it('should set multiple headers', () => {
      const client = createHttpClient('impit');
      client.setHeaders({
        'X-Custom-1': 'value1',
        'X-Custom-2': 'value2',
      });
      expect(client.getConfig().headers?.['X-Custom-1']).toBe('value1');
      expect(client.getConfig().headers?.['X-Custom-2']).toBe('value2');
    });

    it('should update base URL', () => {
      const client = createHttpClient('impit', {
        baseURL: 'https://old.example.com',
      });
      client.setBaseURL('https://new.example.com');
      expect(client.getConfig().baseURL).toBe('https://new.example.com');
    });
  });

  describe('getDefaultClient', () => {
    it('should return singleton instance', () => {
      const client1 = getDefaultClient();
      const client2 = getDefaultClient();
      expect(client1).toBe(client2);
    });
  });

  describe('resetDefaultClient', () => {
    it('should clear the singleton', async () => {
      const client1 = getDefaultClient();
      await resetDefaultClient();
      const client2 = getDefaultClient();
      expect(client1).not.toBe(client2);
    });
  });
});
