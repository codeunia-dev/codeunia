import { useEffect, useRef } from 'react'

interface UseAnalyticsTrackingOptions {
  eventSlug?: string
  hackathonId?: string
  trackView?: boolean
}

// Helper to get or create session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Helper to check if already viewed in this session
const hasViewedInSession = (slug: string, type: 'event' | 'hackathon'): boolean => {
  if (typeof window === 'undefined') return false
  
  const key = `viewed_${type}s`
  const viewed = JSON.parse(sessionStorage.getItem(key) || '[]')
  return viewed.includes(slug)
}

// Helper to mark as viewed in this session
const markAsViewed = (slug: string, type: 'event' | 'hackathon'): void => {
  if (typeof window === 'undefined') return
  
  const key = `viewed_${type}s`
  const viewed = JSON.parse(sessionStorage.getItem(key) || '[]')
  if (!viewed.includes(slug)) {
    viewed.push(slug)
    sessionStorage.setItem(key, JSON.stringify(viewed))
  }
}

export function useAnalyticsTracking({
  eventSlug,
  hackathonId,
  trackView = true,
}: UseAnalyticsTrackingOptions) {
  const viewTracked = useRef(false)

  console.log('[Analytics Hook] Initialized with:', { eventSlug, hackathonId, trackView })

  // Track view on mount with session-based deduplication
  useEffect(() => {
    console.log('[Analytics Hook] useEffect triggered', { trackView, viewTracked: viewTracked.current })
    if (!trackView || viewTracked.current) {
      console.log('[Analytics Hook] Skipping - trackView:', trackView, 'viewTracked:', viewTracked.current)
      return
    }

    const trackViewAsync = async () => {
      try {
        const sessionId = getSessionId()
        if (!sessionId) {
          console.log('[Analytics] No session ID available')
          return
        }

        if (eventSlug) {
          console.log('[Analytics] Tracking view for event:', eventSlug)
          
          // Check if already viewed in this session
          if (hasViewedInSession(eventSlug, 'event')) {
            console.log('[Analytics] Event already viewed in this session')
            viewTracked.current = true
            return
          }

          console.log('[Analytics] Sending track-view request...')
          const response = await fetch(`/api/events/${eventSlug}/track-view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          })

          console.log('[Analytics] Track-view response:', response.status, response.ok)

          if (response.ok) {
            markAsViewed(eventSlug, 'event')
            viewTracked.current = true
            console.log('[Analytics] View tracked successfully')
          } else {
            console.error('[Analytics] Failed to track view:', await response.text())
          }
        } else if (hackathonId) {
          // Check if already viewed in this session
          if (hasViewedInSession(hackathonId, 'hackathon')) {
            viewTracked.current = true
            return
          }

          const response = await fetch(`/api/hackathons/${hackathonId}/track-view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          })

          if (response.ok) {
            markAsViewed(hackathonId, 'hackathon')
            viewTracked.current = true
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    // Track view after a short delay to avoid tracking bots and ensure real engagement
    const timer = setTimeout(trackViewAsync, 2000)

    return () => clearTimeout(timer)
  }, [eventSlug, hackathonId, trackView])
}
