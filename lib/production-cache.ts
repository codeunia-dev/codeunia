// Production-optimized caching system for Codeunia
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'server';
  priority: 'high' | 'medium' | 'low';
}

// Cache types for different Codeunia use cases
export const CACHE_TYPES = {
  // High-priority caches (frequently accessed)
  LEADERBOARD: {
    ttl: 300, // 5 minutes - frequently updated
    type: 'memory' as const,
    priority: 'high' as const
  },
  TEST_DATA: {
    ttl: 1800, // 30 minutes - test definitions don't change often
    type: 'localStorage' as const,
    priority: 'medium' as const
  },
  CERTIFICATES: {
    ttl: 3600, // 1 hour - certificates are read-only
    type: 'localStorage' as const,
    priority: 'medium' as const
  },
  BLOG_POSTS: {
    ttl: 7200, // 2 hours - blog content is static
    type: 'localStorage' as const,
    priority: 'low' as const
  },
  USER_PROFILE: {
    ttl: 900, // 15 minutes - user data changes occasionally
    type: 'memory' as const,
    priority: 'high' as const
  },
  HACKATHONS: {
    ttl: 1800, // 30 minutes - event data changes occasionally
    type: 'localStorage' as const,
    priority: 'medium' as const
  }
} as const;

// Server-side memory cache (simulating Redis)
const serverCache = new Map<string, { data: any; expires: number; priority: string }>();

// Production cache manager
export class ProductionCache {
  // Get cache with automatic fallback
  static async get<T = any>(key: string, config: Partial<CacheConfig> = {}): Promise<T | null> {
    const cacheConfig = this.getCacheConfig(key, config);
    
    // Try server cache first (for high-priority items)
    if (cacheConfig.priority === 'high') {
      const serverData = this.getServerCache(key);
      if (serverData) return serverData;
    }

    // Try localStorage
    if (typeof window !== 'undefined') {
      const localData = this.getLocalStorageCache(key);
      if (localData) return localData;
    }

    return null;
  }

  // Set cache with appropriate storage
  static async set<T = any>(key: string, data: T, config: Partial<CacheConfig> = {}): Promise<void> {
    const cacheConfig = this.getCacheConfig(key, config);
    
    // Store in server cache for high-priority items
    if (cacheConfig.priority === 'high') {
      this.setServerCache(key, data, cacheConfig.ttl, cacheConfig.priority);
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      this.setLocalStorageCache(key, data, cacheConfig.ttl);
    }
  }

  // Invalidate cache
  static async invalidate(key: string): Promise<void> {
    // Clear from server cache
    serverCache.delete(key);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`);
    }
  }

  // Batch operations for performance
  static async getMultiple<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get<T>(key);
      })
    );
    
    return results;
  }

  // Cache warming (preload frequently accessed data)
  static async warmCache(keys: string[]): Promise<void> {
    // This would typically fetch data from API and cache it
    console.log('Warming cache for:', keys);
  }

  // Private methods
  private static getCacheConfig(key: string, config: Partial<CacheConfig>): CacheConfig {
    // Determine cache type based on key pattern
    let cacheType: typeof CACHE_TYPES[keyof typeof CACHE_TYPES] = CACHE_TYPES.TEST_DATA;
    
    if (key.includes('leaderboard')) cacheType = CACHE_TYPES.LEADERBOARD;
    else if (key.includes('certificate')) cacheType = CACHE_TYPES.CERTIFICATES;
    else if (key.includes('blog')) cacheType = CACHE_TYPES.BLOG_POSTS;
    else if (key.includes('profile')) cacheType = CACHE_TYPES.USER_PROFILE;
    else if (key.includes('hackathon')) cacheType = CACHE_TYPES.HACKATHONS;

    return {
      ttl: config.ttl || cacheType.ttl,
      key,
      type: config.type || cacheType.type,
      priority: config.priority || cacheType.priority
    };
  }

  private static getServerCache(key: string): any {
    const cached = serverCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      serverCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private static setServerCache(key: string, data: any, ttl: number, priority: string): void {
    const expires = Date.now() + (ttl * 1000);
    serverCache.set(key, { data, expires, priority });
    
    // Implement LRU eviction for high-priority items
    if (priority === 'high' && serverCache.size > 100) {
      const oldestKey = serverCache.keys().next().value;
      if (oldestKey) {
        serverCache.delete(oldestKey);
      }
    }
  }

  private static getLocalStorageCache(key: string): any {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { data, expires } = JSON.parse(cached);
      if (Date.now() > expires) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }

  private static setLocalStorageCache(key: string, data: any, ttl: number): void {
    try {
      const expires = Date.now() + (ttl * 1000);
      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expires }));
    } catch (error) {
      console.warn('localStorage cache failed:', error);
    }
  }
}

// Specialized cache managers for Codeunia features
export class LeaderboardCache {
  static async getLeaderboard(type: 'global' | 'test' | 'hackathon', testId?: string): Promise<any> {
    const key = `leaderboard_${type}${testId ? `_${testId}` : ''}`;
    return ProductionCache.get(key, CACHE_TYPES.LEADERBOARD);
  }

  static async setLeaderboard(type: 'global' | 'test' | 'hackathon', data: any, testId?: string): Promise<void> {
    const key = `leaderboard_${type}${testId ? `_${testId}` : ''}`;
    await ProductionCache.set(key, data, CACHE_TYPES.LEADERBOARD);
  }

  static async invalidateLeaderboard(type: 'global' | 'test' | 'hackathon', testId?: string): Promise<void> {
    const key = `leaderboard_${type}${testId ? `_${testId}` : ''}`;
    await ProductionCache.invalidate(key);
  }
}

export class TestDataCache {
  static async getTest(testId: string): Promise<any> {
    const key = `test_${testId}`;
    return ProductionCache.get(key, CACHE_TYPES.TEST_DATA);
  }

  static async setTest(testId: string, data: any): Promise<void> {
    const key = `test_${testId}`;
    await ProductionCache.set(key, data, CACHE_TYPES.TEST_DATA);
  }

  static async getTestList(): Promise<any> {
    const key = 'test_list';
    return ProductionCache.get(key, CACHE_TYPES.TEST_DATA);
  }

  static async setTestList(data: any): Promise<void> {
    const key = 'test_list';
    await ProductionCache.set(key, data, CACHE_TYPES.TEST_DATA);
  }
}

export class CertificateCache {
  static async getCertificate(certId: string): Promise<any> {
    const key = `certificate_${certId}`;
    return ProductionCache.get(key, CACHE_TYPES.CERTIFICATES);
  }

  static async setCertificate(certId: string, data: any): Promise<void> {
    const key = `certificate_${certId}`;
    await ProductionCache.set(key, data, CACHE_TYPES.CERTIFICATES);
  }

  static async getCertificatePreview(certId: string): Promise<any> {
    const key = `certificate_preview_${certId}`;
    return ProductionCache.get(key, { ...CACHE_TYPES.CERTIFICATES, ttl: 1800 }); // 30 min for previews
  }
}

export class BlogCache {
  static async getBlogPost(slug: string): Promise<any> {
    const key = `blog_${slug}`;
    return ProductionCache.get(key, CACHE_TYPES.BLOG_POSTS);
  }

  static async setBlogPost(slug: string, data: any): Promise<void> {
    const key = `blog_${slug}`;
    await ProductionCache.set(key, data, CACHE_TYPES.BLOG_POSTS);
  }

  static async getBlogList(): Promise<any> {
    const key = 'blog_list';
    return ProductionCache.get(key, CACHE_TYPES.BLOG_POSTS);
  }

  static async setBlogList(data: any): Promise<void> {
    const key = 'blog_list';
    await ProductionCache.set(key, data, CACHE_TYPES.BLOG_POSTS);
  }
}

export class HackathonCache {
  static async getHackathon(hackathonId: string): Promise<any> {
    const key = `hackathon_${hackathonId}`;
    return ProductionCache.get(key, CACHE_TYPES.HACKATHONS);
  }

  static async setHackathon(hackathonId: string, data: any): Promise<void> {
    const key = `hackathon_${hackathonId}`;
    await ProductionCache.set(key, data, CACHE_TYPES.HACKATHONS);
  }

  static async getHackathonList(): Promise<any> {
    const key = 'hackathon_list';
    return ProductionCache.get(key, CACHE_TYPES.HACKATHONS);
  }

  static async setHackathonList(data: any): Promise<void> {
    const key = 'hackathon_list';
    await ProductionCache.set(key, data, CACHE_TYPES.HACKATHONS);
  }
}

// Cache performance monitoring
export class CacheMetrics {
  private static hits = 0;
  private static misses = 0;
  private static sets = 0;

  static recordHit(): void {
    this.hits++;
  }

  static recordMiss(): void {
    this.misses++;
  }

  static recordSet(): void {
    this.sets++;
  }

  static getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  static getStats(): { hits: number; misses: number; sets: number; hitRate: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      hitRate: this.getHitRate()
    };
  }

  static reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
  }
} 