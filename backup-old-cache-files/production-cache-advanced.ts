/**
 * Production-Grade Cache Management System
 * 
 * Implements:
 * - Cloudflare CDN integration
 * - Redis caching for database queries
 * - Automatic cache purging
 * - Stale-while-revalidate strategies
 * - Cache tagging for selective purging
 */

import { NextResponse } from 'next/server'
import { Redis } from 'ioredis'

// Build ID for cache busting
export const BUILD_ID = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString()

// Redis client (optional - falls back to in-memory if not available)
let redis: Redis | null = null
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL)
  }
} catch {
  console.warn('Redis not available, using in-memory cache fallback')
}

// In-memory cache fallback
const memoryCache = new Map<string, { data: unknown; expires: number }>()

export interface CacheConfig {
  maxAge: number          // Browser cache duration
  sMaxAge: number        // CDN cache duration
  staleWhileRevalidate?: number  // SWR duration
  tags?: string[]        // Cache tags for purging
  private?: boolean      // Private cache flag
  revalidate?: boolean   // Force revalidation
}

export const CACHE_STRATEGIES = {
  // Static assets - 1 year cache with immutable
  STATIC_IMMUTABLE: {
    maxAge: 31536000,      // 1 year
    sMaxAge: 31536000,     // 1 year
    tags: ['static'],
  } as CacheConfig,
  
  // Events/Hackathons - fast updates with SWR
  EVENTS_DYNAMIC: {
    maxAge: 0,             // No browser cache
    sMaxAge: 60,           // 1 minute CDN
    staleWhileRevalidate: 300, // 5 minutes SWR
    tags: ['events', 'hackathons'],
  } as CacheConfig,
  
  // API responses - short cache with SWR
  API_SHORT: {
    maxAge: 0,             // No browser cache
    sMaxAge: 30,           // 30 seconds CDN
    staleWhileRevalidate: 120, // 2 minutes SWR
    tags: ['api'],
  } as CacheConfig,
  
  // Pages - moderate cache with SWR
  PAGES_DYNAMIC: {
    maxAge: 0,             // No browser cache
    sMaxAge: 120,          // 2 minutes CDN
    staleWhileRevalidate: 600, // 10 minutes SWR
    tags: ['pages'],
  } as CacheConfig,
  
  // User-specific - no cache
  USER_PRIVATE: {
    maxAge: 0,
    sMaxAge: 0,
    private: true,
    revalidate: true,
  } as CacheConfig,
  
  // Database cache - Redis/memory only
  DATABASE_CACHE: {
    maxAge: 300,           // 5 minutes in Redis
    sMaxAge: 0,            // No CDN cache
    tags: ['database'],
  } as CacheConfig,
} as const

/**
 * Generate cache control headers
 */
export function generateCacheHeaders(strategy: keyof typeof CACHE_STRATEGIES): Record<string, string> {
  const config = CACHE_STRATEGIES[strategy]
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Cache-Strategy': 'development',
    }
  }

  let cacheControl = config.private ? 'private' : 'public'
  
  if (config.maxAge > 0) {
    cacheControl += `, max-age=${config.maxAge}`
  } else {
    cacheControl += ', max-age=0'
  }
  
  if (config.sMaxAge > 0) {
    cacheControl += `, s-maxage=${config.sMaxAge}`
  }
  
  if (config.staleWhileRevalidate) {
    cacheControl += `, stale-while-revalidate=${config.staleWhileRevalidate}`
  }
  
  if (config.revalidate) {
    cacheControl += ', must-revalidate'
  }

  const headers: Record<string, string> = {
    'Cache-Control': cacheControl,
    'X-Build-ID': BUILD_ID,
    'X-Cache-Strategy': strategy,
    'Vary': 'Accept-Encoding, Authorization',
  }

  // Add CDN-specific headers for Cloudflare
  if (config.sMaxAge > 0) {
    headers['CDN-Cache-Control'] = `public, max-age=${config.sMaxAge}${
      config.staleWhileRevalidate ? `, stale-while-revalidate=${config.staleWhileRevalidate}` : ''
    }`
  } else {
    headers['CDN-Cache-Control'] = 'no-cache'
  }

  // Add cache tags for selective purging
  if (config.tags?.length) {
    headers['Cache-Tag'] = config.tags.join(',')
  }

  return headers
}

/**
 * Database cache utilities
 */
export class DatabaseCache {
  private static getKey(prefix: string, key: string): string {
    return `cache:${prefix}:${key}`
  }

  static async get<T>(prefix: string, key: string): Promise<T | null> {
    const cacheKey = this.getKey(prefix, key)
    
    try {
      if (redis) {
        const cached = await redis.get(cacheKey)
        return cached ? JSON.parse(cached) : null
      } else {
        // Fallback to memory cache
        const cached = memoryCache.get(cacheKey)
        if (cached && cached.expires > Date.now()) {
          return cached.data as T
        }
        return null
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set<T>(prefix: string, key: string, data: T, ttlSeconds: number = 300): Promise<void> {
    const cacheKey = this.getKey(prefix, key)
    
    try {
      if (redis) {
        await redis.setex(cacheKey, ttlSeconds, JSON.stringify(data))
      } else {
        // Fallback to memory cache
        memoryCache.set(cacheKey, {
          data,
          expires: Date.now() + (ttlSeconds * 1000)
        })
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async delete(prefix: string, key: string): Promise<void> {
    const cacheKey = this.getKey(prefix, key)
    
    try {
      if (redis) {
        await redis.del(cacheKey)
      } else {
        memoryCache.delete(cacheKey)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.keys(`cache:${pattern}`)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        // Clear memory cache entries matching pattern
        for (const [key] of memoryCache.entries()) {
          if (key.includes(pattern)) {
            memoryCache.delete(key)
          }
        }
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error)
    }
  }
}

/**
 * Cached query wrapper for expensive database operations
 */
export async function cachedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 300,
  prefix: string = 'query'
): Promise<T> {
  // Try to get from cache first
  const cached = await DatabaseCache.get<T>(prefix, queryKey)
  if (cached !== null) {
    return cached
  }

  // Execute query and cache result
  const result = await queryFn()
  await DatabaseCache.set(prefix, queryKey, result, ttlSeconds)
  
  return result
}

/**
 * API response wrapper with caching
 */
export function createCachedApiResponse(
  data: unknown,
  strategy: keyof typeof CACHE_STRATEGIES = 'API_SHORT'
): Response {
  const headers = generateCacheHeaders(strategy)
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * Middleware helper
 */
export function applyCacheHeaders(
  response: NextResponse,
  strategy: keyof typeof CACHE_STRATEGIES
): NextResponse {
  const headers = generateCacheHeaders(strategy)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  private static readonly WARM_ENDPOINTS = [
    '/api/hackathons',
    '/api/events',
    '/api/leaderboard/stats',
  ]

  static async warmCache(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') return

    console.log('🔥 Warming cache...')
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const warmPromises = this.WARM_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: { 'User-Agent': 'Cache-Warmer/1.0' }
        })
        console.log(`✅ Warmed: ${endpoint} (${response.status})`)
      } catch (error) {
        console.error(`❌ Failed to warm: ${endpoint}`, error)
      }
    })

    await Promise.allSettled(warmPromises)
    console.log('🔥 Cache warming completed')
  }
}

/**
 * Development utilities
 */
export const CacheUtils = {
  async getCacheInfo() {
    return {
      buildId: BUILD_ID,
      environment: process.env.NODE_ENV,
      redisAvailable: !!redis,
      strategies: Object.keys(CACHE_STRATEGIES),
      timestamp: new Date().toISOString(),
    }
  },
  
  async clearAllCache() {
    try {
      if (redis) {
        await redis.flushdb()
      }
      memoryCache.clear()
      console.log('🧹 All caches cleared')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }
}
