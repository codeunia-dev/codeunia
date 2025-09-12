import { useState, useEffect } from 'react'

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

export function useEvents(params: EventsParams = {}) {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Force useEffect to run by using a more explicit dependency
  const paramsString = JSON.stringify(params)
  
  useEffect(() => {
    let isMounted = true
    
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const queryParams = new URLSearchParams()
        if (params.search) queryParams.append('search', params.search)
        if (params.category && params.category !== 'All') queryParams.append('category', params.category)
        if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter)
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.offset) queryParams.append('offset', params.offset.toString())

        const url = `/api/events?${queryParams.toString()}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        
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

    fetchEvents()
    
    return () => {
      isMounted = false
    }
  }, [paramsString]) // Use paramsString instead of individual params

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