import { useState, useEffect, useMemo, useCallback } from 'react'
import { usePerformanceMonitor } from '@/lib/performance-monitor'

export interface EventsParams {
  search?: string
  category?: string
  dateFilter?: string
  limit?: number
  offset?: number
}

export interface EventsResponse {
  events: any[]
  total: number
  hasMore: boolean
}

// Simple in-memory cache for API responses
const cache = new Map<string, { data: EventsResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Request deduplication
const pendingRequests = new Map<string, Promise<EventsResponse>>()

export function useEvents(params: EventsParams = {}) {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { trackAPICall } = usePerformanceMonitor()

  // Memoize cache key to prevent unnecessary re-renders
  const cacheKey = useMemo(() => {
    return `events-${JSON.stringify(params)}`
  }, [params])

  // Optimized fetch function with caching and deduplication
  const fetchEvents = useCallback(async (): Promise<EventsResponse> => {
    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.category && params.category !== 'All') queryParams.append('category', params.category)
    if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    const url = `/api/events?${queryParams.toString()}`
    
    // Create and store the promise with performance tracking
    const startTime = performance.now()
    const fetchPromise = fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(result => {
        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() })
        
        // Track API performance
        const duration = performance.now() - startTime
        trackAPICall('events', duration)
        
        return result
      })
      .finally(() => {
        // Remove from pending requests
        pendingRequests.delete(cacheKey)
      })

    pendingRequests.set(cacheKey, fetchPromise)
    return fetchPromise
  }, [cacheKey, params])
  
  useEffect(() => {
    let isMounted = true
    
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await fetchEvents()
        
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch events')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadEvents()
    
    return () => {
      isMounted = false
    }
  }, [fetchEvents])

  return { data, loading, error }
}

export function useFeaturedEvents(limit: number = 5) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/events/featured?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured events')
        }

        const result = await response.json()
        setEvents(result.events || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [limit])

  return { events, loading, error }
}

export function useEvent(slug: string) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setError('No event slug provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/events/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found')
          }
          throw new Error('Failed to fetch event')
        }

        const result = await response.json()
        setEvent(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  return { event, loading, error }
}