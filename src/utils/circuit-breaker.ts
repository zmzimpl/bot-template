/**
 * Circuit Breaker Pattern Implementation
 * Fault tolerance for external service calls
 */

import { EventEmitter } from 'events';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject all calls
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold?: number;
  /** Number of successes in half-open to close circuit */
  successThreshold?: number;
  /** Time in ms before attempting recovery */
  resetTimeout?: number;
  /** Time window in ms for counting failures */
  failureWindow?: number;
  /** Custom function to determine if error should count as failure */
  isFailure?: (error: Error) => boolean;
  /** Fallback function when circuit is open */
  fallback?: <T>() => T | Promise<T>;
  /** Name for logging/identification */
  name?: string;
}

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
}

/**
 * Circuit breaker events
 */
export interface CircuitBreakerEvents {
  stateChange: (state: CircuitState, previousState: CircuitState) => void;
  success: () => void;
  failure: (error: Error) => void;
  open: () => void;
  close: () => void;
  halfOpen: () => void;
  fallback: () => void;
}

/**
 * Circuit Breaker class
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private totalCalls: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;
  private failureTimestamps: number[] = [];

  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    super();
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      resetTimeout: options.resetTimeout ?? 30000,
      failureWindow: options.failureWindow ?? 60000,
      isFailure: options.isFailure ?? (() => true),
      fallback: options.fallback ?? (() => {
        throw new CircuitBreakerError('Circuit breaker is open');
      }),
      name: options.name ?? 'default',
    };
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      this.emit('fallback');
      return this.options.fallback<T>() as Promise<T>;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.options.isFailure(error as Error)) {
        this.onFailure(error as Error);
      }
      throw error;
    }
  }

  /**
   * Record a success
   */
  private onSuccess(): void {
    this.successes++;
    this.totalSuccesses++;
    this.lastSuccess = new Date();
    this.emit('success');

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.options.successThreshold) {
        this.close();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failures = 0;
      this.failureTimestamps = [];
    }
  }

  /**
   * Record a failure
   */
  private onFailure(error: Error): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailure = new Date();
    this.failureTimestamps.push(Date.now());
    this.emit('failure', error);

    // Clean up old failure timestamps
    this.cleanupFailureTimestamps();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state opens the circuit
      this.open();
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open the circuit
      if (this.failureTimestamps.length >= this.options.failureThreshold) {
        this.open();
      }
    }
  }

  /**
   * Remove failure timestamps outside the window
   */
  private cleanupFailureTimestamps(): void {
    const cutoff = Date.now() - this.options.failureWindow;
    this.failureTimestamps = this.failureTimestamps.filter(ts => ts > cutoff);
  }

  /**
   * Open the circuit
   */
  private open(): void {
    if (this.state === CircuitState.OPEN) return;

    const previousState = this.state;
    this.state = CircuitState.OPEN;
    this.emit('stateChange', CircuitState.OPEN, previousState);
    this.emit('open');

    // Schedule transition to half-open
    this.scheduleReset();
  }

  /**
   * Close the circuit
   */
  private close(): void {
    if (this.state === CircuitState.CLOSED) return;

    const previousState = this.state;
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];
    this.clearResetTimer();
    this.emit('stateChange', CircuitState.CLOSED, previousState);
    this.emit('close');
  }

  /**
   * Transition to half-open state
   */
  private halfOpen(): void {
    if (this.state === CircuitState.HALF_OPEN) return;

    const previousState = this.state;
    this.state = CircuitState.HALF_OPEN;
    this.successes = 0;
    this.emit('stateChange', CircuitState.HALF_OPEN, previousState);
    this.emit('halfOpen');
  }

  /**
   * Schedule reset timer
   */
  private scheduleReset(): void {
    this.clearResetTimer();
    this.resetTimer = setTimeout(() => {
      this.halfOpen();
    }, this.options.resetTimeout);
  }

  /**
   * Clear reset timer
   */
  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Check if circuit allows requests
   */
  isCallable(): boolean {
    return this.state !== CircuitState.OPEN;
  }

  /**
   * Force open the circuit
   */
  forceOpen(): void {
    this.open();
  }

  /**
   * Force close the circuit
   */
  forceClose(): void {
    this.close();
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.close();
    this.totalCalls = 0;
    this.totalFailures = 0;
    this.totalSuccesses = 0;
    this.lastFailure = null;
    this.lastSuccess = null;
  }

  /**
   * Get circuit breaker name
   */
  getName(): string {
    return this.options.name;
  }
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker({ ...options, name });
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  /**
   * Check if a circuit breaker exists
   */
  has(name: string): boolean {
    return this.breakers.has(name);
  }

  /**
   * Remove a circuit breaker
   */
  remove(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
      return this.breakers.delete(name);
    }
    return false;
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get count of circuit breakers
   */
  get size(): number {
    return this.breakers.size;
  }
}

// Default registry instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Create a circuit breaker with default options
 */
export function createCircuitBreaker(
  options?: CircuitBreakerOptions
): CircuitBreaker {
  return new CircuitBreaker(options);
}

/**
 * Decorator function for wrapping async functions with circuit breaker
 */
export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: CircuitBreakerOptions
): T {
  const breaker = new CircuitBreaker(options);
  return (async (...args: Parameters<T>) => {
    return breaker.execute(() => fn(...args));
  }) as T;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  healthy: boolean;
  state: CircuitState;
  stats: CircuitBreakerStats;
}

/**
 * Get health status of all circuit breakers
 */
export function getCircuitBreakerHealth(): HealthCheckResult[] {
  const stats = circuitBreakerRegistry.getAllStats();
  return Object.entries(stats).map(([name, stat]) => ({
    name,
    healthy: stat.state !== CircuitState.OPEN,
    state: stat.state,
    stats: stat,
  }));
}
