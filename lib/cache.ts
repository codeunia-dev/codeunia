// Cache utility for performance optimization
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
  data: unknown;
}

interface CachedItem {
  data: unknown;
  expires: number;
}

// In-memory cache for server-side
const memoryCache = new Map<string, CachedItem>();

// Cookie-based cache utilities
export const cookieCache = {
  // Set cookie with data
  set: (key: string, data: unknown, ttl: number = 3600000) => { // Default 1 hour
    const expires = new Date(Date.now() + ttl);
    const serializedData = JSON.stringify({ data, expires: expires.getTime() });
    
    // Set cookie with secure options
    document.cookie = `${key}=${encodeURIComponent(serializedData)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  },

  // Get data from cookie
  get: <T = unknown>(key: string): T | null => {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
    
    if (!cookie) return null;
    
    try {
      const serializedData = decodeURIComponent(cookie.split('=')[1]);
      const { data, expires } = JSON.parse(serializedData);
      
      if (Date.now() > expires) {
        // Cookie expired, remove it
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        return null;
      }
      
      return data as T;
    } catch {
      return null;
    }
  },

  // Remove cookie
  remove: (key: string) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// localStorage-based cache utilities
export const localStorageCache = {
  // Set data in localStorage
  set: (key: string, data: unknown, ttl: number = 3600000) => {
    const expires = Date.now() + ttl;
    const cacheData = { data, expires };
    
    try {
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },

  // Get data from localStorage
  get: <T = unknown>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, expires } = JSON.parse(cached);
      
      if (Date.now() > expires) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data as T;
    } catch {
      return null;
    }
  },

  // Remove from localStorage
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
};

// Server-side memory cache utilities
export const serverCache = {
  // Set data in memory cache
  set: (key: string, data: unknown, ttl: number = 300000) => { // Default 5 minutes
    const expires = Date.now() + ttl;
    memoryCache.set(key, { data, expires });
  },

  // Get data from memory cache
  get: <T = unknown>(key: string): T | null => {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  },

  // Remove from memory cache
  remove: (key: string) => {
    memoryCache.delete(key);
  },

  // Clear all cache
  clear: () => {
    memoryCache.clear();
  }
};

// Universal cache wrapper that tries multiple strategies
export const universalCache = {
  // Set data using best available cache
  set: (key: string, data: unknown, ttl: number = 3600000) => {
    // Try localStorage first (client-side)
    if (typeof window !== 'undefined') {
      localStorageCache.set(key, data, ttl);
      cookieCache.set(key, data, ttl);
    } else {
      // Server-side
      serverCache.set(key, data, ttl);
    }
  },

  // Get data from best available cache
  get: <T = unknown>(key: string): T | null => {
    if (typeof window !== 'undefined') {
      // Try localStorage first, then cookies
      const localData = localStorageCache.get<T>(key);
      if (localData) return localData;
      
      return cookieCache.get<T>(key);
    } else {
      // Server-side
      return serverCache.get<T>(key);
    }
  },

  // Remove from all caches
  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorageCache.remove(key);
      cookieCache.remove(key);
    } else {
      serverCache.remove(key);
    }
  }
};

// API response cache wrapper
export const apiCache = {
  // Cache API response
  cacheResponse: async <T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = 300000
  ): Promise<T> => {
    // Check cache first
    const cached = universalCache.get<T>(key);
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    universalCache.set(key, data, ttl);
    
    return data;
  },

  // Generate cache key from URL and params
  generateKey: (url: string, params?: Record<string, string>): string => {
    const baseKey = `api:${url}`;
    if (!params) return baseKey;
    
    const paramString = JSON.stringify(params);
    return `${baseKey}:${paramString}`;
  }
};

// Performance monitoring utilities
export const performanceCache = {
  // Track cache hit rate
  hits: 0,
  misses: 0,

  recordHit: () => {
    performanceCache.hits++;
  },

  recordMiss: () => {
    performanceCache.misses++;
  },

  getHitRate: () => {
    const total = performanceCache.hits + performanceCache.misses;
    return total > 0 ? (performanceCache.hits / total) * 100 : 0;
  },

  reset: () => {
    performanceCache.hits = 0;
    performanceCache.misses = 0;
  }
}; 