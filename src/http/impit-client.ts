/**
 * Impit HTTP Client Implementation
 * Uses Apify's impit library with HTTP/2, keep-alive, and DNS caching
 */

import { Impit, type ImpitResponse } from 'impit';
import { BaseHttpClient } from './base.js';
import type { HttpClientConfig, HttpResponse, RequestConfig } from '../types/index.js';

export class ImpitClient extends BaseHttpClient {
  private client: Impit;

  constructor(config: HttpClientConfig = {}) {
    super(config);

    this.client = new Impit({
      timeout: this.config.timeout,
    });
  }

  async request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>> {
    const url = this.buildUrl(config.url, config.params);
    const headers = { ...this.config.headers, ...config.headers };

    let retryCount = 0;
    const maxRetries = this.config.retry?.enabled ? (this.config.retry.count || 3) : 0;
    const retryDelay = this.config.retry?.delay || 1000;

    while (true) {
      try {
        const response = await this.executeRequest<T>(url, config, headers);
        return response;
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[Impit] Retry ${retryCount}/${maxRetries}...`);
          await this.sleep(retryDelay);
          continue;
        }
        throw error;
      }
    }
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    headers: Record<string, string>
  ): Promise<HttpResponse<T>> {
    const method = config.method || 'GET';

    let body: string | undefined;
    if (config.data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    }

    const response: ImpitResponse = await this.client.fetch(url, {
      method,
      headers,
      body,
      timeout: config.timeout || this.config.timeout,
    });

    const responseText = response.body.toString();
    let data: T;

    try {
      data = JSON.parse(responseText) as T;
    } catch {
      data = responseText as unknown as T;
    }

    const responseHeaders: Record<string, string | string[] | undefined> = {};
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        responseHeaders[key] = value;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = (response as any).statusCode ?? (response as any).status ?? 200;

    return {
      data,
      status,
      headers: responseHeaders,
    };
  }

  private buildUrl(url: string, params?: Record<string, string | number | boolean>): string {
    const baseURL = this.config.baseURL || '';
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const urlObj = new URL(fullUrl);
    for (const [key, value] of Object.entries(params)) {
      urlObj.searchParams.append(key, String(value));
    }

    return urlObj.toString();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    // Impit doesn't have a close method, but we keep this for interface compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.client as any).close) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.client as any).close();
    }
  }
}
