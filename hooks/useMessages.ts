import { useState, useEffect, useCallback } from 'react'
import { messageService } from '@/lib/services/messageService'
import type { Message, SendMessageData } from '@/types/messaging'
import { createClient } from '@/lib/supabase/client'

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await messageService.getMessages(conversationId)
      setMessages(data)
      
      // Mark messages as read
      await messageService.markAsRead(conversationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return

    const supabase = createClient()
    
    console.log('📡 Setting up message subscription for conversation:', conversationId)
    
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('🔔 New message received via realtime:', payload)
          
          // Fetch the complete message with sender details
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id (
                id,
                first_name,
                last_name,
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            console.log('📨 Fetched complete message data:', data)
            
            // Decrypt the message content
            const decryptResponse = await fetch('/api/messages/decrypt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ encrypted: data.content })
            })
            
            const { decrypted } = await decryptResponse.json()
            const decryptedMessage = { ...data, content: decrypted }
            
            console.log('🔓 Decrypted message:', decrypted)

            setMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(msg => msg.id === data.id)
              if (exists) {
                console.log('⚠️ Message already exists, skipping')
                return prev
              }
              console.log('✅ Adding new message to state')
              return [...prev, decryptedMessage as Message]
            })
            // Mark as read
            await messageService.markAsRead(conversationId)
          }
        }
      )
      .subscribe((status) => {
        console.log('Message subscription status:', status)
      })

    return () => {
      console.log('🔌 Unsubscribing from messages')
      subscription.unsubscribe()
    }
  }, [conversationId])

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return

    try {
      setSending(true)
      setError(null)
      
      const messageData: SendMessageData = {
        conversation_id: conversationId,
        content: content.trim()
      }

      const newMessage = await messageService.sendMessage(messageData)
      
      // Optimistically add the message immediately
      setMessages(prev => {
        // Check if message already exists (from real-time subscription)
        const exists = prev.some(msg => msg.id === newMessage.id)
        if (exists) return prev
        return [...prev, newMessage]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('Error sending message:', err)
      throw err
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_deleted: true, content: 'This message was deleted' }
            : msg
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
      console.error('Error deleting message:', err)
    }
  }

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    deleteMessage,
    refresh: fetchMessages
  }
}
