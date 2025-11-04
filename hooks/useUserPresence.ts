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
        .single()

      if (data) {
        setPresence({
          userId: data.user_id,
          isOnline: data.is_online,
          lastSeen: data.last_seen
        })
      }
      setLoading(false)
    }

    fetchPresence()

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newData = payload.new as any
          if (newData) {
            setPresence({
              userId: newData.user_id,
              isOnline: newData.is_online,
              lastSeen: newData.last_seen
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
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
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: true,
          last_seen: new Date().toISOString()
        })
    }

    // Set user as offline
    const setOffline = async () => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString()
        })
    }

    // Update presence every 30 seconds
    const updatePresence = async () => {
      if (document.visibilityState === 'visible') {
        await setOnline()
      }
    }

    // Set online on mount
    setOnline()

    // Update presence periodically
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
