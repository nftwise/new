/**
 * DEPRECATED: Cache removed in KISS refactor
 * This module is kept for backward compatibility
 */

export const smartCache = {
  get: <T>(key: string): T | null => null,
  set: <T>(key: string, value: T, ttl?: number): void => {},
};

export async function getCached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  return await fn();
}

export async function getCachedOrFetch<T>(key: string, fn: () => Promise<T>): Promise<T> {
  return await fn();
}

export function generateCacheKey(...parts: string[]): string {
  return parts.join('-');
}
