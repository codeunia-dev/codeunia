import { useState, useEffect, useCallback } from 'react'

export interface CompanyEvent {
  id: string
  slug: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  category?: string
  image_url?: string
  company_id: string
  created_by: string
  approval_status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  rejection_reason?: string
  views: number
  clicks: number
  registrations_count?: number
  created_at: string
  updated_at: string
}

export interface CompanyEventsParams {
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'all'
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface CompanyEventsResponse {
  events: CompanyEvent[]
  total: number
  hasMore: boolean
}

/**
 * Hook for fetching company events
 */
export function useCompanyEvents(companySlug: string | null, params: CompanyEventsParams = {}) {
  const [data, setData] = useState<CompanyEventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!companySlug) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status)
      }
      if (params.category) queryParams.append('category', params.category)
      if (params.search) queryParams.append('search', params.search)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const response = await fetch(`/api/companies/${companySlug}/events?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch company events')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company events')
      console.error('Error fetching company events:', err)
    } finally {
      setLoading(false)
    }
  }, [companySlug, params.status, params.category, params.search, params.limit, params.offset])

  const refresh = useCallback(() => {
    fetchEvents()
  }, [fetchEvents])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    data,
    loading,
    error,
    refresh,
    clearError,
  }
}

/**
 * Hook for managing a single company event
 */
export function useCompanyEvent(eventSlug: string | null) {
  const [event, setEvent] = useState<CompanyEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchEvent = useCallback(async () => {
    if (!eventSlug) {
      setEvent(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/events/${eventSlug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found')
        }
        throw new Error('Failed to fetch event')
      }

      const result = await response.json()
      setEvent(result.event || result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }, [eventSlug])

  const updateEvent = async (updates: Partial<CompanyEvent>): Promise<boolean> => {
    if (!eventSlug) return false

    try {
      setError(null)

      const response = await fetch(`/api/events/${eventSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update event')
      }

      const result = await response.json()
      setEvent(result.event)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
      console.error('Error updating event:', err)
      return false
    }
  }

  const submitForApproval = async (): Promise<boolean> => {
    if (!eventSlug) return false

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/events/${eventSlug}/submit`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit event')
      }

      const result = await response.json()
      setEvent(result.event)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit event')
      console.error('Error submitting event:', err)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const deleteEvent = async (): Promise<boolean> => {
    if (!eventSlug) return false

    try {
      setDeleting(true)
      setError(null)

      const response = await fetch(`/api/events/${eventSlug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      setEvent(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
      console.error('Error deleting event:', err)
      return false
    } finally {
      setDeleting(false)
    }
  }

  const refresh = useCallback(() => {
    fetchEvent()
  }, [fetchEvent])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  return {
    event,
    loading,
    error,
    submitting,
    deleting,
    updateEvent,
    submitForApproval,
    deleteEvent,
    refresh,
    clearError,
  }
}

/**
 * Hook for creating a new company event
 */
export function useCreateCompanyEvent() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEvent = async (eventData: Partial<CompanyEvent>): Promise<{ success: boolean; event?: CompanyEvent; slug?: string }> => {
    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const result = await response.json()
      return { 
        success: true, 
        event: result.event,
        slug: result.event?.slug 
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      console.error('Error creating event:', err)
      return { success: false }
    } finally {
      setCreating(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    creating,
    error,
    createEvent,
    clearError,
  }
}

/**
 * Hook for company event statistics
 */
export function useCompanyEventStats(companySlug: string | null) {
  const [stats, setStats] = useState({
    total_events: 0,
    draft_events: 0,
    pending_events: 0,
    approved_events: 0,
    rejected_events: 0,
    total_views: 0,
    total_registrations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!companySlug) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/events/stats`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch event stats')
      }

      const result = await response.json()
      setStats(result.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event stats')
      console.error('Error fetching event stats:', err)
    } finally {
      setLoading(false)
    }
  }, [companySlug])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
