/**
 * API Service Entry
 * Export unified request methods
 */

import { request, setAuthToken, getAuthToken, recreateClient, getClient } from './request.js';
import type { RequestConfig } from '../types/index.js';

export { request as default, setAuthToken, getAuthToken, recreateClient, getClient };

/**
 * GET request
 */
export function get<T = unknown>(
  url: string,
  params?: Record<string, string | number | boolean>,
  config?: Partial<RequestConfig>
): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    params,
    ...config,
  });
}

/**
 * POST request
 */
export function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: Partial<RequestConfig>
): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config,
  });
}

/**
 * PUT request
 */
export function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: Partial<RequestConfig>
): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config,
  });
}

/**
 * DELETE request
 */
export function del<T = unknown>(
  url: string,
  data?: unknown,
  config?: Partial<RequestConfig>
): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...config,
  });
}

/**
 * PATCH request
 */
export function patch<T = unknown>(
  url: string,
  data?: unknown,
  config?: Partial<RequestConfig>
): Promise<T> {
  return request<T>({
    url,
    method: 'PATCH',
    data,
    ...config,
  });
}
