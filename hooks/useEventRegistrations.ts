import { useState, useEffect } from 'react'

export interface EventRegistration {
  id: number
  registrationDate: string
  status: 'registered' | 'attended' | 'cancelled' | 'no_show'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  notes?: string
  event: {
    id: number
    slug: string
    title: string
    excerpt: string
    organizer: string
    date: string
    time: string
    location: string
    category: string
    featured: boolean
    image?: string
  }
}

export interface EventRegistrationsResponse {
  registrations: EventRegistration[]
  total: number
}

export function useEventRegistrations() {
  const [data, setData] = useState<EventRegistrationsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/events')
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to view your event registrations')
          }
          throw new Error('Failed to fetch event registrations')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  const registerForEvent = async (eventSlug: string) => {
    try {
      const response = await fetch(`/api/events/${eventSlug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register for event')
      }

      const result = await response.json()
      
      // Refresh the registrations list
      const refreshResponse = await fetch('/api/user/events')
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setData(refreshData)
      }

      return result
    } catch (err) {
      throw err
    }
  }

  const unregisterFromEvent = async (eventSlug: string) => {
    try {
      const response = await fetch(`/api/events/${eventSlug}/register`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unregister from event')
      }

      const result = await response.json()
      
      // Refresh the registrations list
      const refreshResponse = await fetch('/api/user/events')
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setData(refreshData)
      }

      return result
    } catch (err) {
      throw err
    }
  }

  return { 
    data, 
    loading, 
    error, 
    registerForEvent, 
    unregisterFromEvent 
  }
}
