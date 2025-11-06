'use client'

import React, { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMessages } from '@/hooks/useMessages'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'
import { useAuth } from '@/lib/hooks/useAuth'
import { MessageSquare } from 'lucide-react'

interface ConversationViewProps {
  conversationId: string | null
  conversationName?: string
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const { user } = useAuth()
  const { messages, loading, sending, sendMessage } = useMessages(conversationId)
  const { typingUsers, sendTypingEvent } = useTypingIndicator(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black">
        <div className="p-6 rounded-full bg-zinc-900 mb-6">
          <MessageSquare className="h-16 w-16 text-zinc-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">Select a conversation</h3>
        <p className="text-zinc-400">
          Choose a conversation from the list to start messaging
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn('flex gap-3', i % 2 === 0 && 'flex-row-reverse')}>
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-zinc-900 mb-4">
              <MessageSquare className="h-12 w-12 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">No messages yet</h3>
            <p className="text-sm text-zinc-400">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator usernames={typingUsers.map(u => u.username)} />
      )}

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-zinc-800">
        <MessageInput 
          onSend={sendMessage} 
          disabled={sending}
          onTyping={sendTypingEvent}
        />
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
