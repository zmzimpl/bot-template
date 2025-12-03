/**
 * Proxy Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { getProxy, proxyToUrl, validateProxy } from '../../src/utils/proxy.js';

describe('proxy utilities', () => {
  describe('getProxy', () => {
    it('should parse proxy with protocol', () => {
      const result = getProxy('http://127.0.0.1:8080:user:pass');
      expect(result).toEqual({
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
        username: 'user',
        password: 'pass',
      });
    });

    it('should parse proxy without protocol', () => {
      const result = getProxy('127.0.0.1:8080:user:pass');
      expect(result).toEqual({
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
        username: 'user',
        password: 'pass',
      });
    });

    it('should parse proxy without auth', () => {
      const result = getProxy('http://127.0.0.1:8080');
      expect(result).toEqual({
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
        username: undefined,
        password: undefined,
      });
    });

    it('should return undefined for empty input', () => {
      expect(getProxy(undefined)).toBeUndefined();
      expect(getProxy('')).toBeUndefined();
    });

    it('should handle socks5 protocol', () => {
      const result = getProxy('socks5://127.0.0.1:1080');
      expect(result?.protocol).toBe('socks5');
    });
  });

  describe('proxyToUrl', () => {
    it('should convert config to URL', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
      };
      expect(proxyToUrl(config)).toBe('http://127.0.0.1:8080');
    });

    it('should include auth in URL', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
        username: 'user',
        password: 'pass',
      };
      expect(proxyToUrl(config)).toBe('http://user:pass@127.0.0.1:8080');
    });

    it('should encode special characters', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
        username: 'user@domain',
        password: 'p@ss:word',
      };
      const result = proxyToUrl(config);
      expect(result).toContain('user%40domain');
      expect(result).toContain('p%40ss%3Aword');
    });
  });

  describe('validateProxy', () => {
    it('should return true for valid config', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '8080',
      };
      expect(validateProxy(config)).toBe(true);
    });

    it('should return false for invalid port', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: 'invalid',
      };
      expect(validateProxy(config)).toBe(false);
    });

    it('should return false for port out of range', () => {
      const config = {
        protocol: 'http',
        host: '127.0.0.1',
        port: '99999',
      };
      expect(validateProxy(config)).toBe(false);
    });

    it('should return false for invalid protocol', () => {
      const config = {
        protocol: 'ftp',
        host: '127.0.0.1',
        port: '8080',
      };
      expect(validateProxy(config)).toBe(false);
    });

    it('should accept socks protocols', () => {
      expect(validateProxy({ protocol: 'socks4', host: '127.0.0.1', port: '1080' })).toBe(true);
      expect(validateProxy({ protocol: 'socks5', host: '127.0.0.1', port: '1080' })).toBe(true);
    });
  });
});
