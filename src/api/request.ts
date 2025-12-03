/**
 * HTTP Request Service
 * Unified request handler with interceptors
 */

import { createHttpClient, BaseHttpClient } from '../http/index.js';
import { apiConfig, httpConfig, isDevelopment } from '../config/index.js';
import { chalk } from '../utils/chalk.js';
import type { HttpClientConfig, HttpResponse, RequestConfig, ApiResponse } from '../types/index.js';

// Token storage (in-memory for Node.js environment)
let authToken: string | null = null;

/**
 * Set the authentication token
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/**
 * Get the authentication token
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Create and configure the HTTP client
 */
function createConfiguredClient(): BaseHttpClient {
  const config: HttpClientConfig = {
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    http2: httpConfig.http2,
    keepAlive: httpConfig.keepAlive,
    dnsCache: httpConfig.dnsCache,
    headers: {
      ...apiConfig.headers,
    },
    retry: apiConfig.retry,
  };

  return createHttpClient(httpConfig.client, config);
}

// Create the default client
let client = createConfiguredClient();

/**
 * Recreate the client with new configuration
 */
export function recreateClient(): void {
  client = createConfiguredClient();
}

/**
 * Get the current client
 */
export function getClient(): BaseHttpClient {
  return client;
}

/**
 * Make an HTTP request with interceptors
 */
export async function request<T = unknown>(config: RequestConfig): Promise<T> {
  const headers = { ...config.headers };

  // Add authorization header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Log request in development
  if (isDevelopment()) {
    console.log(
      chalk.gray(
        `[API Request] ${config.method || 'GET'} ${config.url}`
      ),
      config.data || config.params || ''
    );
  }

  try {
    const response: HttpResponse<ApiResponse<T> | T> = await client.request({
      ...config,
      headers,
    });

    // Log response in development
    if (isDevelopment()) {
      console.log(
        chalk.gray(
          `[API Response] ${config.method || 'GET'} ${config.url}`
        ),
        response.status,
        response.data
      );
    }

    // Handle API response format { code, data, message }
    const data = response.data as ApiResponse<T>;
    if (typeof data === 'object' && data !== null && 'code' in data) {
      if (data.code === 200 || data.code === 0) {
        return data.data;
      }

      // Business error
      const errorMsg = data.message || 'Request failed';
      console.error(chalk.red(`[API Error] ${errorMsg}`));
      throw new Error(errorMsg);
    }

    // Return raw response data
    return response.data as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific HTTP errors
    if (errorMessage.includes('401')) {
      authToken = null;
      console.error(chalk.red('[401] Unauthorized, please login again'));
    } else if (errorMessage.includes('403')) {
      console.error(chalk.red('[403] Access forbidden'));
    } else if (errorMessage.includes('404')) {
      console.error(chalk.red('[404] Resource not found'));
    } else if (errorMessage.includes('500')) {
      console.error(chalk.red('[500] Internal server error'));
    } else if (errorMessage.includes('502')) {
      console.error(chalk.red('[502] Bad gateway'));
    } else if (errorMessage.includes('503')) {
      console.error(chalk.red('[503] Service unavailable'));
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ECONNABORTED')) {
      console.error(chalk.red('[Timeout] Request timeout, please try again'));
    } else if (errorMessage.includes('Network') || errorMessage.includes('ECONNREFUSED')) {
      console.error(chalk.red('[Network Error] Connection failed, please check your network'));
    }

    throw error;
  }
}

export default request;
