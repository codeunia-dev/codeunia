"use client"

import { useState, useEffect, useCallback } from 'react'
import { Event } from '@/components/data/events'
import { EventsFilters, EventsResponse } from '@/lib/services/events'

// Hook for fetching events with filters
export function useEvents(filters: EventsFilters = {}) {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/events?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchEvents()
    // Only re-run when filters actually change
  }, [fetchEvents])

  return {
    data,
    loading,
    error,
    refetch: fetchEvents
  }
}

// Hook for fetching a single event by slug
export function useEvent(slug: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!slug) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/events/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setEvent(null)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setEvent(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  }
}

// Hook for fetching featured events
export function useFeaturedEvents(limit: number = 5) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeaturedEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/events/featured?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setEvents(result.events)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured events')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchFeaturedEvents()
  }, [fetchFeaturedEvents])

  return {
    events,
    loading,
    error,
    refetch: fetchFeaturedEvents
  }
}

// Hook for creating events
export function useCreateEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createEvent,
    loading,
    error
  }
}

// Hook for updating events
export function useUpdateEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateEvent = useCallback(async (slug: string, eventData: Partial<Event>) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/events/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateEvent,
    loading,
    error
  }
}

// Hook for deleting events
export function useDeleteEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteEvent = useCallback(async (slug: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/events/${slug}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    deleteEvent,
    loading,
    error
  }
} 