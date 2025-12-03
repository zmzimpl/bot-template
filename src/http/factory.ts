/**
 * HTTP Client Factory
 * Creates HTTP client instances based on configuration
 * Allows switching between impit and got implementations
 */

import { BaseHttpClient } from './base.js';
import { ImpitClient } from './impit-client.js';
import { GotClient } from './got-client.js';
import type { HttpClientConfig, HttpClientType } from '../types/index.js';

let defaultClient: BaseHttpClient | null = null;

/**
 * Create an HTTP client based on the specified type
 */
export function createHttpClient(
  type: HttpClientType = 'impit',
  config: HttpClientConfig = {}
): BaseHttpClient {
  switch (type) {
    case 'impit':
      return new ImpitClient(config);
    case 'got':
      return new GotClient(config);
    default:
      throw new Error(`Unknown HTTP client type: ${type}`);
  }
}

/**
 * Get the default HTTP client (singleton)
 * Creates one if it doesn't exist
 */
export function getDefaultClient(): BaseHttpClient {
  if (!defaultClient) {
    const clientType = (process.env.HTTP_CLIENT as HttpClientType) || 'impit';
    const config: HttpClientConfig = {
      baseURL: process.env.API_BASE_URL,
      timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      http2: process.env.HTTP2_ENABLED !== 'false',
      keepAlive: process.env.KEEP_ALIVE !== 'false',
      dnsCache: process.env.DNS_CACHE !== 'false',
      headers: {
        'Content-Type': 'application/json',
      },
      retry: {
        enabled: true,
        count: 3,
        delay: 1000,
      },
    };
    defaultClient = createHttpClient(clientType, config);
  }
  return defaultClient;
}

/**
 * Set the default HTTP client
 */
export function setDefaultClient(client: BaseHttpClient): void {
  defaultClient = client;
}

/**
 * Reset the default HTTP client
 */
export async function resetDefaultClient(): Promise<void> {
  if (defaultClient) {
    if ('close' in defaultClient && typeof defaultClient.close === 'function') {
      await (defaultClient as ImpitClient | GotClient).close();
    }
    defaultClient = null;
  }
}

// Re-export client classes
export { BaseHttpClient } from './base.js';
export { ImpitClient } from './impit-client.js';
export { GotClient } from './got-client.js';
