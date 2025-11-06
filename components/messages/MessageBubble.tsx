'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import type { Message } from '@/types/messaging'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const getInitials = () => {
    if (!message.sender) return 'U'
    const first = message.sender.first_name?.[0] || ''
    const last = message.sender.last_name?.[0] || ''
    return (first + last).toUpperCase() || 'U'
  }

  const getName = () => {
    if (!message.sender) return 'Unknown'
    return `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || message.sender.username || 'Unknown'
  }

  return (
    <div className={cn('flex gap-3 mb-4', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          {message.sender?.avatar_url && (
            <AvatarImage src={message.sender.avatar_url} alt={getName()} />
          )}
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start', 'max-w-[70%]')}>
        {!isOwn && (
          <span className="text-xs font-medium text-zinc-400 mb-1">
            {getName()}
          </span>
        )}
        
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words shadow-lg',
            isOwn
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              : 'bg-zinc-900 text-white border border-zinc-800',
            message.is_deleted && 'italic opacity-60'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {message.is_edited && !message.is_deleted && (
            <span className="text-xs opacity-70 ml-2">(edited)</span>
          )}
        </div>

        <span className="text-xs text-zinc-500 mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
