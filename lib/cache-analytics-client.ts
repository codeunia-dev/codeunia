'use client'

/**
 * Cache Analytics React Hooks - Client Side
 * 
 * React hooks for consuming cache analytics data in components
 */

import { useState, useEffect } from 'react'

interface CacheStats {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  averageResponseTime: number
  invalidations: number
  errors: number
  lastUpdated: Date
}

interface RouteStats {
  hits: number
  misses: number
  total: number
}

interface HourlyStats {
  hits: number
  misses: number
  total: number
}

interface DetailedAnalytics {
  overview: CacheStats
  byStrategy: Record<string, RouteStats>
  hourlyTrend: Record<number, HourlyStats>
  topRoutes: Array<{ route: string } & RouteStats>
  recentEvents: Array<{
    timestamp: number
    type: 'hit' | 'miss' | 'invalidation' | 'error'
    strategy: string
    route: string
    responseTime?: number
    buildId?: string
    userAgent?: string
    region?: string
  }>
}

/**
 * Hook to fetch and automatically refresh cache analytics data
 */
export function useCacheAnalytics(refreshInterval: number = 30000) {
  const [data, setData] = useState<DetailedAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/cache-analytics')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const analytics = await response.json()
      setData(analytics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Failed to fetch cache analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error, refresh: fetchAnalytics }
}

/**
 * Hook to trigger cache invalidation
 */
export function useCacheInvalidation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invalidateCache = async (type: 'all' | 'cloudflare' | 'vercel' | 'local' = 'all') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/cache-invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invalidate cache'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { invalidateCache, loading, error }
}

/**
 * Hook to get real-time cache performance stats
 */
export function useCachePerformance() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/cache-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch cache stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  return { stats, loading }
}
