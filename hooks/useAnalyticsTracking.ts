import { useEffect, useRef } from 'react'

interface UseAnalyticsTrackingOptions {
  eventSlug?: string
  hackathonId?: string
  trackView?: boolean
  trackClick?: boolean
}

export function useAnalyticsTracking({
  eventSlug,
  hackathonId,
  trackView = true,
  trackClick = false,
}: UseAnalyticsTrackingOptions) {
  const viewTracked = useRef(false)
  const clickTracked = useRef(false)

  // Track view on mount
  useEffect(() => {
    if (!trackView || viewTracked.current) return

    const trackViewAsync = async () => {
      try {
        if (eventSlug) {
          await fetch(`/api/events/${eventSlug}/track-view`, {
            method: 'POST',
          })
          viewTracked.current = true
        } else if (hackathonId) {
          await fetch(`/api/hackathons/${hackathonId}/track-view`, {
            method: 'POST',
          })
          viewTracked.current = true
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    // Track view after a short delay to avoid tracking bots
    const timer = setTimeout(trackViewAsync, 1000)

    return () => clearTimeout(timer)
  }, [eventSlug, hackathonId, trackView])

  // Function to track click
  const trackClickEvent = async () => {
    if (clickTracked.current) return

    try {
      if (eventSlug) {
        await fetch(`/api/events/${eventSlug}/track-click`, {
          method: 'POST',
        })
        clickTracked.current = true
      } else if (hackathonId) {
        await fetch(`/api/hackathons/${hackathonId}/track-click`, {
          method: 'POST',
        })
        clickTracked.current = true
      }
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  return { trackClick: trackClickEvent }
}
