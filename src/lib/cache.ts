/**
 * DEPRECATED: Cache removed in KISS refactor
 * These exports are kept for backward compatibility
 */

export const cache = {
  get: () => null,
  set: () => {},
  clear: () => {},
  size: () => 0
};

export async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // No caching - just execute the function
  return await fn();
}

export const cacheKeys = {
  client: (id: string) => `client-${id}`,
  googleAnalytics: (timeRange: any) => `ga-${timeRange.period}`,
  googleAds: (timeRange: any) => `gads-${timeRange.period}`,
  searchConsole: (timeRange: any) => `gsc-${timeRange.period}`,
  callRail: (timeRange: any) => `callrail-${timeRange.period}`,
  callsByDay: (timeRange: any) => `callsbyday-${timeRange.period}`,
  callsBySource: (timeRange: any) => `callsbysource-${timeRange.period}`,
};
