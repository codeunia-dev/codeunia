// Environment-aware cache headers utility
export interface CacheConfig {
  maxAge: number;
  staleWhileRevalidate?: number;
  cdnMaxAge?: number;
  mustRevalidate?: boolean;
}

export function createCacheHeaders(config: CacheConfig) {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';
  
  // In development, disable caching for immediate feedback
  if (isDev) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }

  // Build cache control value
  let cacheControl = `public, s-maxage=${config.maxAge}`;
  
  if (config.staleWhileRevalidate) {
    cacheControl += `, stale-while-revalidate=${config.staleWhileRevalidate}`;
  }
  
  if (config.mustRevalidate) {
    cacheControl += ', must-revalidate';
  }

  const headers: Record<string, string> = {
    'Cache-Control': cacheControl,
  };

  // Add CDN-specific headers for better control
  if (isProd && config.cdnMaxAge) {
    headers['CDN-Cache-Control'] = `public, s-maxage=${config.cdnMaxAge}`;
    headers['Cloudflare-CDN-Cache-Control'] = `public, s-maxage=${config.cdnMaxAge}`;
  }

  // Add build ID for cache busting
  if (process.env.BUILD_ID) {
    headers['X-Build-ID'] = process.env.BUILD_ID;
  }

  return headers;
}

// Predefined cache configurations
export const CACHE_CONFIGS = {
  // Very short cache for frequently changing data
  SHORT: {
    maxAge: 30,
    staleWhileRevalidate: 60,
    cdnMaxAge: 30,
  },
  
  // Medium cache for semi-static data
  MEDIUM: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
    cdnMaxAge: 300,
  },
  
  // Long cache for static data
  LONG: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
    cdnMaxAge: 3600,
  },
  
  // No cache for dynamic/user-specific data
  NO_CACHE: {
    maxAge: 0,
    mustRevalidate: true,
  },
} as const;

// Utility for API responses
export function createCachedResponse(data: any, cacheConfig: CacheConfig) {
  const headers = createCacheHeaders(cacheConfig);
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}