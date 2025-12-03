/**
 * HTTP Interceptor Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  InterceptorManager,
  createAuthInterceptor,
  createRequestIdInterceptor,
  createTimestampInterceptor,
  createLoggingInterceptor,
  createContentTypeInterceptor,
  createUserAgentInterceptor,
  composeRequestInterceptors,
  composeResponseInterceptors,
} from '../../src/http/interceptor.js';
import type { RequestConfig, HttpResponse } from '../../src/types/index.js';

describe('interceptor utilities', () => {
  describe('InterceptorManager', () => {
    let manager: InterceptorManager;

    beforeEach(() => {
      manager = new InterceptorManager();
    });

    describe('request interceptors', () => {
      it('should add and run request interceptors', async () => {
        manager.useRequest((config) => ({
          ...config,
          headers: { ...config.headers, 'X-Test': 'value' },
        }));

        const config: RequestConfig = { url: '/test' };
        const result = await manager.runRequestInterceptors(config);

        expect(result.headers?.['X-Test']).toBe('value');
      });

      it('should run multiple interceptors in order', async () => {
        const order: number[] = [];

        manager.useRequest((config) => {
          order.push(1);
          return config;
        });

        manager.useRequest((config) => {
          order.push(2);
          return config;
        });

        await manager.runRequestInterceptors({ url: '/test' });

        expect(order).toEqual([1, 2]);
      });

      it('should allow removing interceptors', async () => {
        const interceptor = (config: RequestConfig) => ({
          ...config,
          headers: { 'X-Remove': 'true' },
        });

        const remove = manager.useRequest(interceptor);
        remove();

        const result = await manager.runRequestInterceptors({ url: '/test' });
        expect(result.headers?.['X-Remove']).toBeUndefined();
      });

      it('should support async interceptors', async () => {
        manager.useRequest(async (config) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { ...config, headers: { 'X-Async': 'true' } };
        });

        const result = await manager.runRequestInterceptors({ url: '/test' });
        expect(result.headers?.['X-Async']).toBe('true');
      });
    });

    describe('response interceptors', () => {
      it('should add and run response interceptors', async () => {
        manager.useResponse((response) => ({
          ...response,
          data: { ...response.data, modified: true },
        }));

        const response: HttpResponse<{ value: number; modified?: boolean }> = {
          data: { value: 1 },
          status: 200,
          headers: {},
        };

        const result = await manager.runResponseInterceptors(response);
        expect(result.data.modified).toBe(true);
      });

      it('should transform response data', async () => {
        manager.useResponse<{ items: string[] }>((response) => ({
          ...response,
          data: { items: response.data.items.map((s) => s.toUpperCase()) },
        }));

        const response: HttpResponse<{ items: string[] }> = {
          data: { items: ['a', 'b'] },
          status: 200,
          headers: {},
        };

        const result = await manager.runResponseInterceptors(response);
        expect(result.data.items).toEqual(['A', 'B']);
      });
    });

    describe('error interceptors', () => {
      it('should add and run error interceptors', async () => {
        manager.useError((error) => {
          error.message = `Modified: ${error.message}`;
          return error;
        });

        const error = new Error('Original');
        const result = await manager.runErrorInterceptors(error);

        expect(result.message).toBe('Modified: Original');
      });

      it('should chain error transformations', async () => {
        manager.useError((error) => {
          error.message = error.message + ' [1]';
          return error;
        });

        manager.useError((error) => {
          error.message = error.message + ' [2]';
          return error;
        });

        const result = await manager.runErrorInterceptors(new Error('Base'));
        expect(result.message).toBe('Base [1] [2]');
      });
    });

    describe('clear', () => {
      it('should clear all interceptors', () => {
        manager.useRequest((c) => c);
        manager.useResponse((r) => r);
        manager.useError((e) => e);

        manager.clear();

        expect(manager.counts.request).toBe(0);
        expect(manager.counts.response).toBe(0);
        expect(manager.counts.error).toBe(0);
      });
    });

    describe('counts', () => {
      it('should track interceptor counts', () => {
        manager.useRequest((c) => c);
        manager.useRequest((c) => c);
        manager.useResponse((r) => r);

        expect(manager.counts.request).toBe(2);
        expect(manager.counts.response).toBe(1);
        expect(manager.counts.error).toBe(0);
      });
    });
  });

  describe('built-in interceptors', () => {
    describe('createAuthInterceptor', () => {
      it('should add auth header when token exists', async () => {
        const interceptor = createAuthInterceptor(() => 'test-token');
        const config = await interceptor({ url: '/test' });

        expect(config.headers?.Authorization).toBe('Bearer test-token');
      });

      it('should not add header when token is null', async () => {
        const interceptor = createAuthInterceptor(() => null);
        const config = await interceptor({ url: '/test' });

        expect(config.headers?.Authorization).toBeUndefined();
      });

      it('should support async token getter', async () => {
        const interceptor = createAuthInterceptor(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return 'async-token';
        });

        const config = await interceptor({ url: '/test' });
        expect(config.headers?.Authorization).toBe('Bearer async-token');
      });
    });

    describe('createRequestIdInterceptor', () => {
      it('should add request ID header', () => {
        const interceptor = createRequestIdInterceptor();
        const config = interceptor({ url: '/test' });

        expect(config.headers?.['X-Request-ID']).toBeDefined();
        expect(config.headers?.['X-Request-ID']).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      });

      it('should use custom header name', () => {
        const interceptor = createRequestIdInterceptor('X-Correlation-ID');
        const config = interceptor({ url: '/test' });

        expect(config.headers?.['X-Correlation-ID']).toBeDefined();
        expect(config.headers?.['X-Request-ID']).toBeUndefined();
      });
    });

    describe('createTimestampInterceptor', () => {
      it('should add timestamp header', () => {
        const before = Date.now();
        const interceptor = createTimestampInterceptor();
        const config = interceptor({ url: '/test' });
        const after = Date.now();

        const timestamp = parseInt(config.headers?.['X-Request-Time'] || '0', 10);
        expect(timestamp).toBeGreaterThanOrEqual(before);
        expect(timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe('createLoggingInterceptor', () => {
      it('should create request, response, and error interceptors', () => {
        const logger = {
          info: vi.fn(),
          error: vi.fn(),
        };

        const interceptors = createLoggingInterceptor(logger);

        expect(interceptors.request).toBeInstanceOf(Function);
        expect(interceptors.response).toBeInstanceOf(Function);
        expect(interceptors.error).toBeInstanceOf(Function);
      });

      it('should log requests', () => {
        const logger = { info: vi.fn(), error: vi.fn() };
        const { request } = createLoggingInterceptor(logger);

        request({ url: '/test', method: 'POST', data: { x: 1 } });

        expect(logger.info).toHaveBeenCalledWith(
          '[HTTP] POST /test',
          expect.any(Object)
        );
      });

      it('should log responses', () => {
        const logger = { info: vi.fn(), error: vi.fn() };
        const { response } = createLoggingInterceptor(logger);

        response({ data: { result: 'ok' }, status: 200, headers: {} });

        expect(logger.info).toHaveBeenCalledWith(
          '[HTTP] Response 200',
          expect.any(Object)
        );
      });

      it('should log errors', () => {
        const logger = { info: vi.fn(), error: vi.fn() };
        const { error } = createLoggingInterceptor(logger);

        error(new Error('Test error'));

        expect(logger.error).toHaveBeenCalledWith(
          '[HTTP] Error: Test error',
          expect.any(Object)
        );
      });
    });

    describe('createContentTypeInterceptor', () => {
      it('should add content-type when data exists', () => {
        const interceptor = createContentTypeInterceptor();
        const config = interceptor({ url: '/test', data: { x: 1 } });

        expect(config.headers?.['Content-Type']).toBe('application/json');
      });

      it('should not override existing content-type', () => {
        const interceptor = createContentTypeInterceptor();
        const config = interceptor({
          url: '/test',
          data: { x: 1 },
          headers: { 'Content-Type': 'text/plain' },
        });

        expect(config.headers?.['Content-Type']).toBe('text/plain');
      });

      it('should not add when no data', () => {
        const interceptor = createContentTypeInterceptor();
        const config = interceptor({ url: '/test' });

        expect(config.headers?.['Content-Type']).toBeUndefined();
      });

      it('should use custom content type', () => {
        const interceptor = createContentTypeInterceptor('application/xml');
        const config = interceptor({ url: '/test', data: '<xml/>' });

        expect(config.headers?.['Content-Type']).toBe('application/xml');
      });
    });

    describe('createUserAgentInterceptor', () => {
      it('should add user-agent header', () => {
        const interceptor = createUserAgentInterceptor('MyBot/1.0');
        const config = interceptor({ url: '/test' });

        expect(config.headers?.['User-Agent']).toBe('MyBot/1.0');
      });
    });
  });

  describe('compose functions', () => {
    describe('composeRequestInterceptors', () => {
      it('should compose multiple interceptors', async () => {
        const add1 = (c: RequestConfig) => ({
          ...c,
          headers: { ...c.headers, 'X-1': 'true' },
        });
        const add2 = (c: RequestConfig) => ({
          ...c,
          headers: { ...c.headers, 'X-2': 'true' },
        });

        const composed = composeRequestInterceptors(add1, add2);
        const result = await composed({ url: '/test' });

        expect(result.headers?.['X-1']).toBe('true');
        expect(result.headers?.['X-2']).toBe('true');
      });
    });

    describe('composeResponseInterceptors', () => {
      it('should compose multiple interceptors', async () => {
        const double = (r: HttpResponse<number>) => ({ ...r, data: r.data * 2 });
        const addOne = (r: HttpResponse<number>) => ({ ...r, data: r.data + 1 });

        const composed = composeResponseInterceptors(double, addOne);
        const result = await composed({ data: 5, status: 200, headers: {} });

        expect(result.data).toBe(11); // (5 * 2) + 1
      });
    });
  });
});
