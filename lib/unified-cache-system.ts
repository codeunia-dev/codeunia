/**
 * UNIFIED PRODUCTION CACHE SYSTEM
 * 
 * This replaces all existing cache libraries with a single, consistent system:
 * - lib/production-cache.ts ❌
 * - lib/production-cache-advanced.ts ❌  
 * - lib/simple-cache.ts ❌
 * - lib/cache-headers.ts ❌
 * - lib/performance/cache-manager.ts ❌
 * 
 * Goals:
 * 1. Single source of truth for all caching
 * 2. Prevent duplicate cache layers
 * 3. Consistent TTL and invalidation strategies
 * 4. Automatic cache warming and purging
 * 5. Built-in monitoring and metrics
 */

import { NextResponse } from 'next/server'
import { Redis } from 'ioredis'

// Build ID for cache busting
export const BUILD_ID = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString()

// === REDIS CONNECTION (SINGLETON) ===
class RedisManager {
  private static instance: Redis | null = null
  private static connectionAttempted = false

  static getInstance(): Redis | null {
    if (!this.connectionAttempted) {
      this.connectionAttempted = true
      try {
        if (process.env.REDIS_URL) {
          this.instance = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          })
          console.log('✅ Redis connected')
        } else {
          console.warn('⚠️  Redis not configured, using memory cache only')
        }
      } catch (error) {
        console.error('❌ Redis connection failed:', error)
      }
    }
    return this.instance
  }
}

// === UNIFIED CACHE STRATEGIES ===
export interface CacheStrategy {
  // Browser cache (user's device)
  browserTTL: number
  
  // CDN cache (Cloudflare/Vercel Edge)
  cdnTTL: number
  
  // Application cache (Redis/Memory)
  appTTL: number
  
  // Stale-while-revalidate duration
  swr?: number
  
  // Cache tags for selective purging
  tags: string[]
  
  // Private cache flag
  private?: boolean
  
  // Must revalidate flag
  mustRevalidate?: boolean
}

export const CACHE_STRATEGIES = {
  // Static assets - 1 year edge cache with versioning
  STATIC_IMMUTABLE: {
    browserTTL: 31536000,  // 1 year
    cdnTTL: 31536000,      // 1 year
    appTTL: 0,             // No app cache needed
    tags: ['static'],
    mustRevalidate: false,
  } as CacheStrategy,

  // Dynamic content - Fast updates with SWR
  DYNAMIC_CONTENT: {
    browserTTL: 0,         // No browser cache
    cdnTTL: 60,            // 1 minute CDN
    appTTL: 300,           // 5 minutes app cache
    swr: 300,              // 5 minutes SWR
    tags: ['pages', 'content'],
  } as CacheStrategy,

  // API responses - Short cache with SWR
  API_STANDARD: {
    browserTTL: 0,         // No browser cache
    cdnTTL: 30,            // 30 seconds CDN
    appTTL: 180,           // 3 minutes app cache
    swr: 120,              // 2 minutes SWR
    tags: ['api'],
  } as CacheStrategy,

  // Database queries - App cache only
  DATABASE_QUERIES: {
    browserTTL: 0,         // No browser cache
    cdnTTL: 0,             // No CDN cache
    appTTL: 300,           // 5 minutes app cache
    tags: ['database'],
  } as CacheStrategy,

  // User-specific - No cache
  USER_PRIVATE: {
    browserTTL: 0,
    cdnTTL: 0,
    appTTL: 0,
    private: true,
    mustRevalidate: true,
    tags: ['private'],
  } as CacheStrategy,

  // Real-time data - Minimal cache
  REALTIME: {
    browserTTL: 0,         // No browser cache
    cdnTTL: 5,             // 5 seconds CDN
    appTTL: 30,            // 30 seconds app cache
    swr: 60,               // 1 minute SWR
    tags: ['realtime'],
  } as CacheStrategy,
} as const

// === MEMORY CACHE (FALLBACK) ===
interface MemoryCacheEntry {
  data: unknown
  expires: number
  tags: string[]
}

class MemoryCache {
  private cache = new Map<string, MemoryCacheEntry>()
  private readonly maxSize = 1000
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  set(key: string, data: unknown, ttlSeconds: number, tags: string[] = []) {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000),
      tags,
    })
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  deleteByTags(tags: string[]) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }

  private evictOldest() {
    const oldestEntry = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.expires - b.expires)[0]
    
    if (oldestEntry) {
      this.cache.delete(oldestEntry[0])
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache()

// === UNIFIED CACHE CLASS ===
export class UnifiedCache {
  private static redis = RedisManager.getInstance()

  // === CACHE HEADERS GENERATION ===
  static generateHeaders(strategy: keyof typeof CACHE_STRATEGIES): Record<string, string> {
    const config = CACHE_STRATEGIES[strategy]
    const isDev = process.env.NODE_ENV === 'development'
    
    // Development: No caching
    if (isDev) {
      return {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Strategy': 'development',
        'X-Build-ID': BUILD_ID,
      }
    }

    // Production: Build cache control header
    let cacheControl = config.private ? 'private' : 'public'
    
    if (config.browserTTL > 0) {
      cacheControl += `, max-age=${config.browserTTL}`
    } else {
      cacheControl += ', max-age=0'
    }
    
    if (config.cdnTTL > 0) {
      cacheControl += `, s-maxage=${config.cdnTTL}`
    }
    
    if (config.swr) {
      cacheControl += `, stale-while-revalidate=${config.swr}`
    }
    
    if (config.mustRevalidate) {
      cacheControl += ', must-revalidate'
    }

    const headers: Record<string, string> = {
      'Cache-Control': cacheControl,
      'X-Build-ID': BUILD_ID,
      'X-Cache-Strategy': strategy,
      'Vary': 'Accept-Encoding, Authorization',
    }

    // CDN-specific headers
    if (config.cdnTTL > 0) {
      headers['CDN-Cache-Control'] = `public, max-age=${config.cdnTTL}${
        config.swr ? `, stale-while-revalidate=${config.swr}` : ''
      }`
    } else {
      headers['CDN-Cache-Control'] = 'no-cache'
    }

    // Cache tags for purging
    if (config.tags.length > 0) {
      headers['Cache-Tag'] = config.tags.join(',')
    }

    return headers
  }

  // === APPLICATION CACHE (Redis + Memory) ===
  static async set(key: string, data: unknown, strategy: keyof typeof CACHE_STRATEGIES): Promise<void> {
    const config = CACHE_STRATEGIES[strategy]
    if (config.appTTL <= 0) return // No app caching for this strategy

    const serializedData = JSON.stringify({
      data,
      timestamp: Date.now(),
      strategy,
      buildId: BUILD_ID,
    })

    try {
      // Try Redis first
      if (this.redis) {
        await this.redis.setex(key, config.appTTL, serializedData)
        console.log(`📦 Redis cache set: ${key} (${config.appTTL}s)`)
      } else {
        // Fallback to memory
        memoryCache.set(key, data, config.appTTL, config.tags)
        console.log(`🧠 Memory cache set: ${key} (${config.appTTL}s)`)
      }
    } catch (error) {
      console.error('Cache set error:', error)
      // Always fallback to memory cache
      memoryCache.set(key, data, config.appTTL, config.tags)
    }
  }

  static async get(key: string): Promise<unknown | null> {
    try {
      // Try Redis first
      if (this.redis) {
        const cached = await this.redis.get(key)
        if (cached) {
          const parsed = JSON.parse(cached)
          
          // Check if cache is from current build
          if (parsed.buildId === BUILD_ID) {
            console.log(`✅ Redis cache hit: ${key}`)
            return parsed.data
          } else {
            console.log(`🔄 Redis cache invalidated (old build): ${key}`)
            await this.redis.del(key)
          }
        }
      }

      // Fallback to memory cache
      const memData = memoryCache.get(key)
      if (memData) {
        console.log(`✅ Memory cache hit: ${key}`)
        return memData
      }

      console.log(`❌ Cache miss: ${key}`)
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      return memoryCache.get(key)
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key)
      }
      memoryCache.delete(key)
      console.log(`🗑️  Cache deleted: ${key}`)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  static async purgeByTags(tags: string[]): Promise<void> {
    try {
      if (this.redis) {
        // For Redis, we'd need to implement key pattern scanning
        // This is a simplified version - in production, consider using Redis Streams
        const keys = await this.redis.keys('*')
        for (const key of keys) {
          const cached = await this.redis.get(key)
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              const config = CACHE_STRATEGIES[parsed.strategy as keyof typeof CACHE_STRATEGIES]
              if (config && config.tags.some(tag => tags.includes(tag))) {
                await this.redis.del(key)
              }
            } catch {
              // Invalid JSON, delete anyway
              await this.redis.del(key)
            }
          }
        }
      }

      memoryCache.deleteByTags(tags)
      console.log(`🧹 Cache purged by tags: ${tags.join(', ')}`)
    } catch (error) {
      console.error('Cache purge error:', error)
    }
  }

  static async clear(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.flushdb()
      }
      memoryCache.clear()
      console.log('🧹 All caches cleared')
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  // === API RESPONSE HELPERS ===
  static createResponse(data: unknown, strategy: keyof typeof CACHE_STRATEGIES = 'API_STANDARD'): Response {
    const headers = this.generateHeaders(strategy)
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  }

  static applyHeaders(response: NextResponse, strategy: keyof typeof CACHE_STRATEGIES): NextResponse {
    const headers = this.generateHeaders(strategy)
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }

  // === CACHED QUERY WRAPPER ===
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    strategy: keyof typeof CACHE_STRATEGIES = 'DATABASE_QUERIES'
  ): Promise<T> {
    // Check cache first
    const cached = await this.get(key)
    if (cached !== null) {
      return cached as T
    }

    // Execute query
    const result = await queryFn()
    
    // Cache the result
    await this.set(key, result, strategy)
    
    return result
  }
}

// === CACHE WARMING ===
export class CacheWarmer {
  private static readonly CRITICAL_ENDPOINTS = [
    '/api/hackathons',
    '/api/leaderboard/stats',
    '/api/tests/public',
  ]

  static async warmCache(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') return

    console.log('🔥 Starting cache warming...')
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const promises = this.CRITICAL_ENDPOINTS.map(async (endpoint) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: { 'User-Agent': 'CacheWarmer/2.0' }
        })
        console.log(`✅ Warmed: ${endpoint} (${response.status})`)
      } catch (error) {
        console.error(`❌ Failed to warm: ${endpoint}`, error)
      }
    })

    await Promise.allSettled(promises)
    console.log('🔥 Cache warming completed')
  }
}

// === CACHE ANALYTICS ===
export class CacheAnalytics {
  static async getStats() {
    return {
      buildId: BUILD_ID,
      environment: process.env.NODE_ENV,
      redisAvailable: !!RedisManager.getInstance(),
      strategies: Object.keys(CACHE_STRATEGIES),
      timestamp: new Date().toISOString(),
    }
  }
}

// Export for backward compatibility during migration
export const {
  createResponse: createCachedApiResponse,
  applyHeaders: applyCacheHeaders,
  generateHeaders: createCacheHeaders,
  cachedQuery,
} = UnifiedCache
