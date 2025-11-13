import { useEffect, useRef } from 'react'

/**
 * Hook to track event views with session-based deduplication
 * Only tracks once per session per event
 */
export function useViewTracking(eventSlug: string, enabled: boolean = true) {
  const hasTracked = useRef(false)

  useEffect(() => {
    // Don't track if disabled or already tracked
    if (!enabled || hasTracked.current || !eventSlug) {
      return
    }

    // Generate or get session ID
    const getSessionId = () => {
      let sessionId = sessionStorage.getItem('view_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('view_session_id', sessionId)
      }
      return sessionId
    }

    // Check if this event was already viewed in this session
    const viewedEvents = JSON.parse(sessionStorage.getItem('viewed_events') || '[]')
    if (viewedEvents.includes(eventSlug)) {
      hasTracked.current = true
      return
    }

    // Track the view
    const trackView = async () => {
      try {
        const sessionId = getSessionId()
        
        const response = await fetch(`/api/events/${eventSlug}/track-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        })

        if (response.ok) {
          // Mark as viewed in this session
          viewedEvents.push(eventSlug)
          sessionStorage.setItem('viewed_events', JSON.stringify(viewedEvents))
          hasTracked.current = true
        }
      } catch (error) {
        console.error('Failed to track view:', error)
        // Silently fail - don't disrupt user experience
      }
    }

    // Track after a short delay to ensure the user actually viewed the page
    const timer = setTimeout(trackView, 2000) // 2 second delay

    return () => clearTimeout(timer)
  }, [eventSlug, enabled])
}
