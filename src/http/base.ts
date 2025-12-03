/**
 * Base HTTP Client Interface
 * Abstract base class for HTTP clients (impit/got)
 */

import type { HttpClientConfig, HttpResponse, RequestConfig } from '../types/index.js';

export abstract class BaseHttpClient {
  protected config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 30000,
      http2: true,
      keepAlive: true,
      dnsCache: true,
      headers: {
        'Content-Type': 'application/json',
      },
      retry: {
        enabled: true,
        count: 3,
        delay: 1000,
      },
      ...config,
    };
  }

  abstract request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>>;

  async get<T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...config,
    });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...config,
    });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...config,
    });
  }

  async delete<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      ...config,
    });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      data,
      ...config,
    });
  }

  getConfig(): HttpClientConfig {
    return this.config;
  }

  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
  }

  setHeader(key: string, value: string): void {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    this.config.headers[key] = value;
  }

  setHeaders(headers: Record<string, string>): void {
    this.config.headers = { ...this.config.headers, ...headers };
  }
}
