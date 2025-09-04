interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config,
    };

    this.startCleanup();
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: entryTTL,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// Global cache instances
export const apiCache = new CacheManager({ maxSize: 500, defaultTTL: 5 * 60 * 1000 });
export const userCache = new CacheManager({ maxSize: 200, defaultTTL: 10 * 60 * 1000 });
export const sessionCache = new CacheManager({ maxSize: 100, defaultTTL: 30 * 60 * 1000 });

// Cache utilities
export function createCacheKey(...parts: string[]): string {
  return parts.join(':');
}

export function invalidateCachePattern(pattern: string): void {
  const keys = Array.from(apiCache['cache'].keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  });
}

// Memory monitoring
export function getCacheStats() {
  return {
    apiCache: {
      size: apiCache.size(),
      memoryUsage: process.memoryUsage(),
    },
    userCache: {
      size: userCache.size(),
    },
    sessionCache: {
      size: sessionCache.size(),
    },
  };
}

// Cleanup on process exit
process.on('SIGINT', () => {
  apiCache.destroy();
  userCache.destroy();
  sessionCache.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  apiCache.destroy();
  userCache.destroy();
  sessionCache.destroy();
  process.exit(0);
});
