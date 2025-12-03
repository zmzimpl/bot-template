/**
 * Got HTTP Client Implementation
 * Uses got library with HTTP/2, keep-alive, and DNS caching
 */

import got, { type Got, type OptionsInit, type Response } from 'got';
import CacheableLookup from 'cacheable-lookup';
import { Agent as HttpAgent } from 'node:http';
import { Agent as HttpsAgent } from 'node:https';
import { BaseHttpClient } from './base.js';
import type { HttpClientConfig, HttpResponse, RequestConfig } from '../types/index.js';

export class GotClient extends BaseHttpClient {
  private client: Got;
  private dnsCache?: CacheableLookup;
  private httpAgent?: HttpAgent;
  private httpsAgent?: HttpsAgent;

  constructor(config: HttpClientConfig = {}) {
    super(config);

    // Setup DNS caching
    if (this.config.dnsCache) {
      this.dnsCache = new CacheableLookup();
    }

    // Setup keep-alive agents
    if (this.config.keepAlive) {
      this.httpAgent = new HttpAgent({
        keepAlive: true,
        keepAliveMsecs: 30000,
      });
      this.httpsAgent = new HttpsAgent({
        keepAlive: true,
        keepAliveMsecs: 30000,
      });
    }

    // Create got instance
    const options: OptionsInit = {
      prefixUrl: this.config.baseURL || undefined,
      timeout: {
        request: this.config.timeout,
      },
      headers: this.config.headers || {},
      retry: {
        limit: this.config.retry?.enabled ? (this.config.retry.count || 3) : 0,
      },
      throwHttpErrors: false,
      responseType: 'text',
      http2: this.config.http2 ?? false,
    };

    // Add keep-alive agents
    if (this.httpAgent && this.httpsAgent) {
      options.agent = {
        http: this.httpAgent,
        https: this.httpsAgent,
      };
    }

    // Add DNS cache
    if (this.dnsCache) {
      options.dnsCache = this.dnsCache;
    }

    this.client = got.extend(options);
  }

  async request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>> {
    const method = config.method || 'GET';
    let url = config.url;

    // Handle relative URLs
    if (url.startsWith('/')) {
      url = url.slice(1);
    }

    const requestOptions: OptionsInit = {
      method,
      headers: { ...this.config.headers, ...config.headers },
      timeout: {
        request: config.timeout || this.config.timeout,
      },
    };

    // Add query parameters
    if (config.params && Object.keys(config.params).length > 0) {
      requestOptions.searchParams = config.params;
    }

    // Add request body
    if (config.data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (typeof config.data === 'string') {
        requestOptions.body = config.data;
      } else {
        requestOptions.json = config.data;
        requestOptions.responseType = 'json';
      }
    }

    const response = await this.client(url, requestOptions) as Response<string>;

    let data: T;
    try {
      data = typeof response.body === 'string'
        ? JSON.parse(response.body) as T
        : response.body as unknown as T;
    } catch {
      data = response.body as unknown as T;
    }

    const headers: Record<string, string | string[] | undefined> = {};
    for (const [key, value] of Object.entries(response.headers)) {
      headers[key] = value;
    }

    return {
      data,
      status: response.statusCode,
      headers,
    };
  }

  async close(): Promise<void> {
    this.httpAgent?.destroy();
    this.httpsAgent?.destroy();
  }
}
