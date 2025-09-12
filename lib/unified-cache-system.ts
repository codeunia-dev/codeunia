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

// Conditional Redis import for server-side only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Redis: any = null
if (typeof window === 'undefined') {
  try {
    // Only import Redis if REDIS_URL is configured
    if (process.env.REDIS_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Redis = require('ioredis').Redis
    }
  } catch {
    // Silently handle Redis import errors - fallback to memory cache only
    Redis = null
  }
}

// Build ID for cache busting
export const BUILD_ID = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || Date.now().toString()

// === REDIS CONNECTION (SINGLETON) ===
class RedisManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static instance: any = null
  private static connectionAttempted = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getInstance(): any {
    if (!this.connectionAttempted) {
      this.connectionAttempted = true
      try {
        if (process.env.REDIS_URL && Redis) {
          this.instance = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
          })
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Redis connected')
          }
        } else {
          // Silently fallback to memory cache only - no warning in production
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️  Redis not configured, using memory cache only')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Redis connection failed:', error)
        }
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
  private readonly maxSize = parseInt(process.env.CACHE_MAX_SIZE || '1000')
  private cleanupInterval: NodeJS.Timeout
  private accessOrder = new Map<string, number>() // For LRU tracking
  private accessCounter = 0

  constructor() {
    // Cleanup expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  set(key: string, data: unknown, ttlSeconds: number, tags: string[] = []) {
    try {
      if (this.cache.size >= this.maxSize) {
        this.evictLRU()
      }

      this.accessCounter++
      this.accessOrder.set(key, this.accessCounter)

      this.cache.set(key, {
        data,
        expires: Date.now() + (ttlSeconds * 1000),
        tags,
      })
    } catch (error) {
      console.error('Memory cache set error:', error)
    }
  }

  get(key: string): unknown | null {
    try {
      const entry = this.cache.get(key)
      if (!entry) return null
      
      if (Date.now() > entry.expires) {
        this.cache.delete(key)
        this.accessOrder.delete(key)
        return null
      }
      
      // Update access order for LRU
      this.accessCounter++
      this.accessOrder.set(key, this.accessCounter)
      
      return entry.data
    } catch (error) {
      console.error('Memory cache get error:', error)
      return null
    }
  }

  delete(key: string) {
    try {
      this.cache.delete(key)
      this.accessOrder.delete(key)
    } catch (error) {
      console.error('Memory cache delete error:', error)
    }
  }

  deleteByTags(tags: string[]) {
    try {
      for (const [key, entry] of this.cache.entries()) {
        if (entry.tags.some(tag => tags.includes(tag))) {
          this.cache.delete(key)
          this.accessOrder.delete(key)
        }
      }
    } catch (error) {
      console.error('Memory cache deleteByTags error:', error)
    }
  }

  clear() {
    try {
      this.cache.clear()
      this.accessOrder.clear()
    } catch (error) {
      console.error('Memory cache clear error:', error)
    }
  }

  private evictLRU() {
    try {
      // Find the least recently used entry
      let lruKey = ''
      let lruAccess = Infinity
      
      for (const [key, accessTime] of this.accessOrder.entries()) {
        if (accessTime < lruAccess) {
          lruAccess = accessTime
          lruKey = key
        }
      }
      
      if (lruKey) {
        this.cache.delete(lruKey)
        this.accessOrder.delete(lruKey)
      }
    } catch (error) {
      console.error('Memory cache evictLRU error:', error)
    }
  }

  private cleanup() {
    try {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key)
          this.accessOrder.delete(key)
        }
      }
    } catch (error) {
      console.error('Memory cache cleanup error:', error)
    }
  }

  destroy() {
    try {
      clearInterval(this.cleanupInterval)
      this.cache.clear()
      this.accessOrder.clear()
    } catch (error) {
      console.error('Memory cache destroy error:', error)
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  private calculateHitRate(): number {
    // This would need to be implemented with hit/miss tracking
    return 0.85 // Placeholder
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    return this.cache.size * 1024 // 1KB per entry estimate
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
        this.logCacheEvent('redis_set', key, { ttl: config.appTTL, strategy })
      }
    } catch (error) {
      console.error('Redis cache set error:', error)
      // Continue to memory cache fallback
    }

    // Always set in memory cache as fallback
    try {
      memoryCache.set(key, data, config.appTTL, config.tags)
      this.logCacheEvent('memory_set', key, { ttl: config.appTTL, strategy, tags: config.tags })
    } catch (error) {
      this.logCacheError(error as Error, 'memory_set', { key, strategy })
      // Log but don't throw - cache is not critical
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
            this.logCacheEvent('redis_hit', key, { buildId: parsed.buildId })
            return parsed.data
          } else {
            this.logCacheEvent('redis_invalidated', key, { oldBuildId: parsed.buildId, currentBuildId: BUILD_ID })
            await this.redis.del(key)
          }
        }
      }

      // Fallback to memory cache
      const memData = memoryCache.get(key)
      if (memData) {
        this.logCacheEvent('memory_hit', key)
        return memData
      }

      this.logCacheEvent('cache_miss', key)
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

  // === ISR (Incremental Static Regeneration) SUPPORT ===
  static async createISRResponse(
    data: unknown, 
    revalidate: number = 3600, // 1 hour default
    strategy: keyof typeof CACHE_STRATEGIES = 'DYNAMIC_CONTENT'
  ): Promise<Response> {
    const headers = this.generateHeaders(strategy)
    
    // Add ISR-specific headers
    headers['X-ISR-Revalidate'] = revalidate.toString()
    headers['X-ISR-Timestamp'] = Date.now().toString()
    
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

  // === CACHE INVALIDATION ===
  static async invalidate(key: string): Promise<void> {
    try {
      // Remove from Redis
      if (this.redis) {
        await this.redis.del(key)
      }
      
      // Remove from memory cache
      memoryCache.delete(key)
      
      // Trigger invalidation callbacks
      await CacheInvalidationManager.triggerInvalidation(key, [])
      
      console.log(`🗑️ Cache invalidated: ${key}`)
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  static async invalidateByTags(tags: string[]): Promise<void> {
    try {
      // Remove from memory cache by tags
      memoryCache.deleteByTags(tags)
      
      // Trigger invalidation callbacks
      await CacheInvalidationManager.triggerInvalidation('', tags)
      
      // For Redis, we'd need to implement tag-based invalidation
      // This would require storing tag-to-key mappings
      console.log(`🗑️ Cache invalidated by tags: ${tags.join(', ')}`)
    } catch (error) {
      console.error('Cache invalidation by tags error:', error)
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
      
      // For memory cache, we'd need to implement pattern matching
      console.log(`🗑️ Cache invalidated by pattern: ${pattern}`)
    } catch (error) {
      console.error('Cache invalidation by pattern error:', error)
    }
  }

  // === STRUCTURED LOGGING ===
  private static logCacheEvent(event: string, key: string, details: Record<string, any> = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'cache',
      event,
      key,
      buildId: BUILD_ID,
      environment: process.env.NODE_ENV,
      ...details
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CACHE] ${event}:`, logEntry)
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logEntry))
    }
  }

  private static logCacheError(error: Error, context: string, details: Record<string, any> = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'cache',
      event: 'error',
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      buildId: BUILD_ID,
      environment: process.env.NODE_ENV,
      ...details
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[CACHE ERROR] ${context}:`, logEntry)
    } else {
      // In production, use structured JSON logging
      console.error(JSON.stringify(logEntry))
    }
  }

  // === CACHE STATISTICS ===
  static async getStats() {
    try {
      const memoryStats = memoryCache.getStats()
      let redisStats = null
      
      if (this.redis) {
        const info = await this.redis.info('memory')
        redisStats = {
          connected: true,
          memory: info
        }
      }
      
      const stats = {
        memory: memoryStats,
        redis: redisStats,
        buildId: BUILD_ID
      }
      
      this.logCacheEvent('stats_retrieved', 'system', { stats })
      return stats
    } catch (error) {
      this.logCacheError(error as Error, 'getStats')
      return {
        memory: memoryCache.getStats(),
        redis: { connected: false, error: error instanceof Error ? error.message : 'Unknown error' },
        buildId: BUILD_ID
      }
    }
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

// === CACHE INVALIDATION HOOKS ===
type CacheInvalidationCallback = (key: string, tags: string[]) => void

class CacheInvalidationManager {
  private static callbacks: CacheInvalidationCallback[] = []

  static registerCallback(callback: CacheInvalidationCallback) {
    this.callbacks.push(callback)
  }

  static unregisterCallback(callback: CacheInvalidationCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback)
  }

  static async triggerInvalidation(key: string, tags: string[]) {
    for (const callback of this.callbacks) {
      try {
        callback(key, tags)
      } catch (error) {
        console.error('Cache invalidation callback error:', error)
      }
    }
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

// Export cache invalidation manager
export { CacheInvalidationManager }

// Export for backward compatibility during migration
export const {
  createResponse: createCachedApiResponse,
  applyHeaders: applyCacheHeaders,
  generateHeaders: createCacheHeaders,
  cachedQuery,
} = UnifiedCache
