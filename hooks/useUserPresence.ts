import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

interface UserPresence {
  userId: string
  isOnline: boolean
  lastSeen: string | null
}

export function useUserPresence(userId: string | null) {
  const [presence, setPresence] = useState<UserPresence | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle instead of single to handle no results

      if (error) {
        console.error('Error fetching presence:', error)
      }

      if (data) {
        console.log('Fetched presence for user:', userId, data)
        setPresence({
          userId: data.user_id,
          isOnline: data.is_online,
          lastSeen: data.last_seen
        })
      } else {
        // No presence record yet - user is offline
        console.log('No presence record for user:', userId)
        setPresence({
          userId: userId,
          isOnline: false,
          lastSeen: null
        })
      }
      setLoading(false)
    }

    fetchPresence()
    
    // Refresh presence every 10 seconds to catch updates
    const refreshInterval = setInterval(fetchPresence, 10000)

    // Subscribe to presence changes
    const subscription = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 Presence update received for', userId, payload)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newData = payload.new as any
          if (newData) {
            console.log('📡 Updating presence state:', {
              userId: newData.user_id,
              isOnline: newData.is_online,
              lastSeen: newData.last_seen
            })
            setPresence({
              userId: newData.user_id,
              isOnline: newData.is_online,
              lastSeen: newData.last_seen
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status for', userId, ':', status)
      })

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [userId])

  return { presence, loading }
}

// Hook to manage current user's presence
export function useMyPresence() {
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    // Set user as online
    const setOnline = async () => {
      const { error } = await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id'
          }
        )
      
      if (error) {
        console.error('Error setting online:', error)
      } else {
        console.log('✅ Set user online:', user.id)
      }
    }

    // Set user as offline
    const setOffline = async () => {
      const { error } = await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: user.id,
            is_online: false,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id'
          }
        )
      
      if (error) {
        console.error('Error setting offline:', error)
      } else {
        console.log('❌ Set user offline:', user.id)
      }
    }

    // Update presence every 30 seconds
    // More frequent updates ensure status is current
    const updatePresence = async () => {
      if (document.visibilityState === 'visible') {
        await setOnline()
      }
    }

    // Set online immediately on mount
    setOnline()
    
    // Also set online after a short delay to ensure it's registered
    setTimeout(setOnline, 1000)

    // Update presence periodically (every 30 seconds)
    const interval = setInterval(updatePresence, 30000)

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline()
        setIsOnline(true)
      } else {
        setOffline()
        setIsOnline(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Set offline on unmount
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      setOffline()
    }
  }, [user])

  return { isOnline }
}
