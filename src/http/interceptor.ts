/**
 * HTTP Interceptor System
 * Request/Response middleware for HTTP clients
 */

import type { RequestConfig, HttpResponse } from '../types/index.js';

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor<T = unknown> = (
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (
  error: Error
) => Error | Promise<Error> | never;

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
  error?: ErrorInterceptor[];
}

/**
 * Interceptor manager class
 */
export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Add a request interceptor
   * @returns Function to remove the interceptor
   */
  useRequest(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor
   * @returns Function to remove the interceptor
   */
  useResponse<T = unknown>(interceptor: ResponseInterceptor<T>): () => void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(
        interceptor as ResponseInterceptor
      );
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add an error interceptor
   * @returns Function to remove the interceptor
   */
  useError(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Run all request interceptors
   */
  async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let currentConfig = config;
    for (const interceptor of this.requestInterceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  }

  /**
   * Run all response interceptors
   */
  async runResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let currentResponse = response;
    for (const interceptor of this.responseInterceptors) {
      currentResponse = (await interceptor(currentResponse)) as HttpResponse<T>;
    }
    return currentResponse;
  }

  /**
   * Run all error interceptors
   */
  async runErrorInterceptors(error: Error): Promise<Error> {
    let currentError = error;
    for (const interceptor of this.errorInterceptors) {
      currentError = await interceptor(currentError);
    }
    return currentError;
  }

  /**
   * Clear all interceptors
   */
  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  /**
   * Get interceptor counts
   */
  get counts() {
    return {
      request: this.requestInterceptors.length,
      response: this.responseInterceptors.length,
      error: this.errorInterceptors.length,
    };
  }
}

// ============================================
// Built-in Interceptors
// ============================================

/**
 * Create auth token interceptor
 */
export function createAuthInterceptor(
  getToken: () => string | null | Promise<string | null>
): RequestInterceptor {
  return async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  };
}

/**
 * Create request ID interceptor for tracing
 */
export function createRequestIdInterceptor(
  headerName = 'X-Request-ID'
): RequestInterceptor {
  return (config) => {
    const requestId = generateRequestId();
    config.headers = {
      ...config.headers,
      [headerName]: requestId,
    };
    return config;
  };
}

/**
 * Create timestamp interceptor
 */
export function createTimestampInterceptor(
  headerName = 'X-Request-Time'
): RequestInterceptor {
  return (config) => {
    config.headers = {
      ...config.headers,
      [headerName]: Date.now().toString(),
    };
    return config;
  };
}

/**
 * Create logging interceptor
 */
export function createLoggingInterceptor(
  logger: {
    info: (msg: string, meta?: unknown) => void;
    error: (msg: string, meta?: unknown) => void;
  } = console
): { request: RequestInterceptor; response: ResponseInterceptor; error: ErrorInterceptor } {
  return {
    request: (config) => {
      logger.info(`[HTTP] ${config.method || 'GET'} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    response: (response) => {
      logger.info(`[HTTP] Response ${response.status}`, {
        data: response.data,
      });
      return response;
    },
    error: (error) => {
      logger.error(`[HTTP] Error: ${error.message}`, { error });
      return error;
    },
  };
}

/**
 * Create retry-after interceptor
 * Handles 429 responses with Retry-After header
 */
export function createRetryAfterInterceptor(): ResponseInterceptor {
  return (response) => {
    if (response.status === 429) {
      const retryAfter = response.headers['retry-after'];
      if (retryAfter) {
        const seconds = parseInt(retryAfter as string, 10);
        if (!isNaN(seconds)) {
          (response as HttpResponse & { retryAfterMs?: number }).retryAfterMs =
            seconds * 1000;
        }
      }
    }
    return response;
  };
}

/**
 * Create response transformer interceptor
 */
export function createTransformInterceptor<T, R>(
  transform: (data: T) => R
): ResponseInterceptor<T> {
  return (response) => {
    return {
      ...response,
      data: transform(response.data),
    } as unknown as HttpResponse<T>;
  };
}

/**
 * Create error transformer interceptor
 */
export function createErrorTransformer(
  transform: (error: Error) => Error
): ErrorInterceptor {
  return (error) => transform(error);
}

/**
 * Create content-type interceptor
 */
export function createContentTypeInterceptor(
  contentType = 'application/json'
): RequestInterceptor {
  return (config) => {
    if (config.data && !config.headers?.['Content-Type']) {
      config.headers = {
        ...config.headers,
        'Content-Type': contentType,
      };
    }
    return config;
  };
}

/**
 * Create user-agent interceptor
 */
export function createUserAgentInterceptor(
  userAgent: string
): RequestInterceptor {
  return (config) => {
    config.headers = {
      ...config.headers,
      'User-Agent': userAgent,
    };
    return config;
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Compose multiple interceptors into one
 */
export function composeRequestInterceptors(
  ...interceptors: RequestInterceptor[]
): RequestInterceptor {
  return async (config) => {
    let currentConfig = config;
    for (const interceptor of interceptors) {
      currentConfig = await interceptor(currentConfig);
    }
    return currentConfig;
  };
}

/**
 * Compose multiple response interceptors into one
 */
export function composeResponseInterceptors<T>(
  ...interceptors: ResponseInterceptor<T>[]
): ResponseInterceptor<T> {
  return async (response) => {
    let currentResponse = response;
    for (const interceptor of interceptors) {
      currentResponse = await interceptor(currentResponse);
    }
    return currentResponse;
  };
}

// Export a default instance
export const interceptors = new InterceptorManager();
