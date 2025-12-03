/**
 * Proxy Utilities
 * Parse and handle proxy configurations
 */

import type { ProxyConfig } from '../types/index.js';

/**
 * Parse a proxy string into a configuration object
 * Supports formats:
 * - protocol://host:port:username:password
 * - host:port:username:password
 * - protocol://host:port
 * - host:port
 * @param proxy - Proxy string
 */
export const getProxy = (proxy: string | undefined): ProxyConfig | undefined => {
  if (!proxy) return undefined;

  const proxyConfig = proxy.split('://');
  let protocol: string;
  let host: string;
  let port: string;
  let username: string | undefined;
  let password: string | undefined;

  if (proxyConfig.length > 1) {
    protocol = proxyConfig[0];
    [host, port, username, password] = proxyConfig[1].split(':');
  } else {
    protocol = 'http';
    [host, port, username, password] = proxyConfig[0].split(':');
  }

  return { protocol, host, port, username, password };
};

/**
 * Convert a proxy config object to a URL string
 * @param config - Proxy configuration
 */
export const proxyToUrl = (config: ProxyConfig): string => {
  let url = `${config.protocol}://`;

  if (config.username && config.password) {
    url += `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`;
  }

  url += `${config.host}:${config.port}`;

  return url;
};

/**
 * Validate a proxy configuration
 * @param config - Proxy configuration to validate
 */
export const validateProxy = (config: ProxyConfig): boolean => {
  if (!config.host || !config.port) {
    return false;
  }

  const portNum = parseInt(config.port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return false;
  }

  const validProtocols = ['http', 'https', 'socks4', 'socks5'];
  if (!validProtocols.includes(config.protocol.toLowerCase())) {
    return false;
  }

  return true;
};
