import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

interface TypingUser {
  userId: string
  username: string
  timestamp: number
}

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth()
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  useEffect(() => {
    if (!conversationId || !user) return

    const supabase = createClient()
    const channel = supabase.channel(`typing:${conversationId}`)

    // Subscribe to typing events
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, username, isTyping } = payload.payload

        // Ignore own typing events
        if (userId === user.id) return

        if (isTyping) {
          setTypingUsers(prev => {
            const exists = prev.find(u => u.userId === userId)
            if (exists) return prev
            return [...prev, { userId, username, timestamp: Date.now() }]
          })
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId))
        }
      })
      .subscribe()

    // Clean up stale typing indicators (after 5 seconds)
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(u => Date.now() - u.timestamp < 5000)
      )
    }, 1000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
    }
  }, [conversationId, user])

  const sendTypingEvent = useCallback((isTyping: boolean) => {
    if (!conversationId || !user) return

    const supabase = createClient()
    const channel = supabase.channel(`typing:${conversationId}`)

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        username: user.user_metadata?.username || 'User',
        isTyping
      }
    })
  }, [conversationId, user])

  return { typingUsers, sendTypingEvent }
}
