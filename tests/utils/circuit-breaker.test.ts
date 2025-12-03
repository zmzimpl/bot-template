/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitBreakerRegistry,
  CircuitState,
  createCircuitBreaker,
  withCircuitBreaker,
} from '../../src/utils/circuit-breaker.js';

describe('circuit breaker utilities', () => {
  describe('CircuitBreaker', () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
      breaker = new CircuitBreaker({
        failureThreshold: 3,
        successThreshold: 2,
        resetTimeout: 100,
        failureWindow: 1000,
      });
    });

    describe('initial state', () => {
      it('should start in closed state', () => {
        expect(breaker.getState()).toBe(CircuitState.CLOSED);
      });

      it('should be callable initially', () => {
        expect(breaker.isCallable()).toBe(true);
      });

      it('should have zero stats initially', () => {
        const stats = breaker.getStats();
        expect(stats.totalCalls).toBe(0);
        expect(stats.failures).toBe(0);
        expect(stats.successes).toBe(0);
      });
    });

    describe('successful calls', () => {
      it('should execute and return result', async () => {
        const result = await breaker.execute(async () => 'success');
        expect(result).toBe('success');
      });

      it('should track successful calls', async () => {
        await breaker.execute(async () => 'ok');
        const stats = breaker.getStats();
        expect(stats.totalCalls).toBe(1);
        expect(stats.totalSuccesses).toBe(1);
      });

      it('should emit success event', async () => {
        const handler = vi.fn();
        breaker.on('success', handler);

        await breaker.execute(async () => 'ok');

        expect(handler).toHaveBeenCalled();
      });
    });

    describe('failed calls', () => {
      it('should throw and track failures', async () => {
        await expect(
          breaker.execute(async () => {
            throw new Error('fail');
          })
        ).rejects.toThrow('fail');

        const stats = breaker.getStats();
        expect(stats.totalFailures).toBe(1);
      });

      it('should emit failure event', async () => {
        const handler = vi.fn();
        breaker.on('failure', handler);

        try {
          await breaker.execute(async () => {
            throw new Error('fail');
          });
        } catch {
          // Expected
        }

        expect(handler).toHaveBeenCalled();
      });
    });

    describe('state transitions', () => {
      it('should open after threshold failures', async () => {
        for (let i = 0; i < 3; i++) {
          try {
            await breaker.execute(async () => {
              throw new Error('fail');
            });
          } catch {
            // Expected
          }
        }

        expect(breaker.getState()).toBe(CircuitState.OPEN);
        expect(breaker.isCallable()).toBe(false);
      });

      it('should use fallback when open', async () => {
        const fallbackBreaker = new CircuitBreaker({
          failureThreshold: 1,
          fallback: () => 'fallback-value',
        });

        try {
          await fallbackBreaker.execute(async () => {
            throw new Error('fail');
          });
        } catch {
          // Expected
        }

        const result = await fallbackBreaker.execute(async () => 'normal');
        expect(result).toBe('fallback-value');
      });

      it('should transition to half-open after timeout', async () => {
        // Open the breaker
        for (let i = 0; i < 3; i++) {
          try {
            await breaker.execute(async () => {
              throw new Error('fail');
            });
          } catch {
            // Expected
          }
        }

        expect(breaker.getState()).toBe(CircuitState.OPEN);

        // Wait for reset timeout
        await new Promise((resolve) => setTimeout(resolve, 150));

        expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);
      });

      it('should close after successful calls in half-open', async () => {
        // Open and transition to half-open
        for (let i = 0; i < 3; i++) {
          try {
            await breaker.execute(async () => {
              throw new Error('fail');
            });
          } catch {
            // Expected
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

        // Successful calls to close
        await breaker.execute(async () => 'ok');
        await breaker.execute(async () => 'ok');

        expect(breaker.getState()).toBe(CircuitState.CLOSED);
      });

      it('should re-open on failure in half-open', async () => {
        // Open and transition to half-open
        for (let i = 0; i < 3; i++) {
          try {
            await breaker.execute(async () => {
              throw new Error('fail');
            });
          } catch {
            // Expected
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

        // Failure reopens
        try {
          await breaker.execute(async () => {
            throw new Error('fail again');
          });
        } catch {
          // Expected
        }

        expect(breaker.getState()).toBe(CircuitState.OPEN);
      });
    });

    describe('force methods', () => {
      it('should force open', () => {
        breaker.forceOpen();
        expect(breaker.getState()).toBe(CircuitState.OPEN);
      });

      it('should force close', async () => {
        breaker.forceOpen();
        breaker.forceClose();
        expect(breaker.getState()).toBe(CircuitState.CLOSED);
      });
    });

    describe('reset', () => {
      it('should reset all stats', async () => {
        await breaker.execute(async () => 'ok');

        breaker.reset();

        const stats = breaker.getStats();
        expect(stats.totalCalls).toBe(0);
        expect(stats.totalSuccesses).toBe(0);
        expect(stats.state).toBe(CircuitState.CLOSED);
      });
    });

    describe('custom failure detection', () => {
      it('should use custom isFailure function', async () => {
        const customBreaker = new CircuitBreaker({
          failureThreshold: 1,
          isFailure: (error) => error.message === 'critical',
        });

        // This error should not count as failure
        try {
          await customBreaker.execute(async () => {
            throw new Error('minor');
          });
        } catch {
          // Expected
        }

        expect(customBreaker.getState()).toBe(CircuitState.CLOSED);

        // This error should count
        try {
          await customBreaker.execute(async () => {
            throw new Error('critical');
          });
        } catch {
          // Expected
        }

        expect(customBreaker.getState()).toBe(CircuitState.OPEN);
      });
    });
  });

  describe('CircuitBreakerError', () => {
    it('should have correct name', () => {
      const error = new CircuitBreakerError('test');
      expect(error.name).toBe('CircuitBreakerError');
      expect(error.message).toBe('test');
    });
  });

  describe('CircuitBreakerRegistry', () => {
    let registry: CircuitBreakerRegistry;

    beforeEach(() => {
      registry = new CircuitBreakerRegistry();
    });

    it('should create and get circuit breakers', () => {
      const breaker = registry.get('test-service');
      expect(breaker).toBeInstanceOf(CircuitBreaker);
      expect(breaker.getName()).toBe('test-service');
    });

    it('should return same instance for same name', () => {
      const breaker1 = registry.get('service');
      const breaker2 = registry.get('service');
      expect(breaker1).toBe(breaker2);
    });

    it('should check if breaker exists', () => {
      expect(registry.has('unknown')).toBe(false);
      registry.get('known');
      expect(registry.has('known')).toBe(true);
    });

    it('should remove breakers', () => {
      registry.get('to-remove');
      expect(registry.has('to-remove')).toBe(true);

      registry.remove('to-remove');
      expect(registry.has('to-remove')).toBe(false);
    });

    it('should get all stats', async () => {
      const b1 = registry.get('service1');
      const b2 = registry.get('service2');

      await b1.execute(async () => 'ok');
      await b2.execute(async () => 'ok');

      const stats = registry.getAllStats();
      expect(stats['service1']).toBeDefined();
      expect(stats['service2']).toBeDefined();
    });

    it('should reset all breakers', async () => {
      const b1 = registry.get('service1');
      await b1.execute(async () => 'ok');

      registry.resetAll();

      expect(b1.getStats().totalCalls).toBe(0);
    });

    it('should track size', () => {
      expect(registry.size).toBe(0);
      registry.get('s1');
      registry.get('s2');
      expect(registry.size).toBe(2);
    });
  });

  describe('createCircuitBreaker', () => {
    it('should create a circuit breaker with options', () => {
      const breaker = createCircuitBreaker({ failureThreshold: 10 });
      expect(breaker).toBeInstanceOf(CircuitBreaker);
    });
  });

  describe('withCircuitBreaker', () => {
    it('should wrap async function with circuit breaker', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = withCircuitBreaker(fn);

      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    it('should open circuit on failures', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        throw new Error('fail');
      };

      const wrapped = withCircuitBreaker(fn, {
        failureThreshold: 2,
        fallback: () => 'fallback',
      });

      // First two calls fail and open circuit
      try { await wrapped(); } catch { /* expected */ }
      try { await wrapped(); } catch { /* expected */ }

      // Third call uses fallback
      const result = await wrapped();
      expect(result).toBe('fallback');
      expect(callCount).toBe(2); // Original function not called on 3rd
    });
  });
});
