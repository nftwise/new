/**
 * DEPRECATED: Cache removed in KISS refactor
 * This module is kept for backward compatibility
 */

export const fastCache = {
  get: <T>(key: string): T | null => null,
  set: <T>(key: string, value: T, ttl?: number): void => {},
  delete: (key: string): void => {},
  clear: (): void => {},
  size: (): number => 0,
};
