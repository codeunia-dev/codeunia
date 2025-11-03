import { useState, useEffect, useCallback } from 'react'
import { conversationService } from '@/lib/services/conversationService'
import { createClient } from '@/lib/supabase/client'
import type { ConversationWithDetails } from '@/types/messaging'

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await conversationService.getConversations()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Real-time subscription for new messages to update conversation list
  useEffect(() => {
    const supabase = createClient()
    
    const subscription = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh conversations when a new message arrives
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchConversations])

  const refresh = () => {
    fetchConversations()
  }

  return {
    conversations,
    loading,
    error,
    refresh
  }
}
