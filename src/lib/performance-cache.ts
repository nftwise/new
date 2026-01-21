/**
 * DEPRECATED: Cache removed in KISS refactor
 * This module is kept for backward compatibility
 */

export const performanceCache = {
  get: <T>(key: string): T | null => null,
  set: <T>(key: string, value: T, ttl?: number): void => {},
};

export async function cachedApiCall<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
  return await fn();
}
