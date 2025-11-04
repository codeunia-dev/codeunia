'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { UserStatusIndicator } from './UserStatusIndicator'
import { formatDistanceToNow } from 'date-fns'
import type { ConversationWithDetails } from '@/types/messaging'
import { cn } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface ConversationListProps {
  conversations: ConversationWithDetails[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
}

export function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  // Debug: Log conversations data (must be before any returns)
  React.useEffect(() => {
    if (!loading && conversations.length > 0) {
      console.log('ConversationList conversations:', conversations.map(c => ({
        id: c.id,
        is_group: c.is_group,
        other_user: c.other_user ? {
          id: c.other_user.id,
          username: c.other_user.username
        } : null
      })))
    }
  }, [conversations, loading])

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a new conversation to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.other_user
        const name = conversation.is_group
          ? conversation.group_name || 'Group Chat'
          : otherUser
          ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() || otherUser.username
          : 'Unknown User'

        const initials = conversation.is_group
          ? 'GC'
          : otherUser
          ? `${otherUser.first_name?.[0] || ''}${otherUser.last_name?.[0] || ''}`.toUpperCase() || 'U'
          : 'U'

        const avatarUrl = conversation.is_group
          ? conversation.group_avatar_url
          : otherUser?.avatar_url

        const isSelected = conversation.id === selectedId

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
              'hover:bg-muted',
              isSelected && 'bg-muted'
            )}
          >
            <div className="relative">
              <Avatar className="w-12 h-12 flex-shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!conversation.is_group && otherUser && otherUser.id && (
                <div className="absolute bottom-0 right-0">
                  <UserStatusIndicator userId={otherUser.id} size="sm" />
                </div>
              )}
              {!conversation.is_group && !otherUser && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full" title="No user data" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={cn('font-semibold truncate', conversation.unread_count > 0 && 'text-primary')}>
                  {name}
                </span>
                {conversation.last_message_at && (
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className={cn(
                  'text-sm truncate',
                  conversation.unread_count > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                  {conversation.last_message_content || 'No messages yet'}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="default" className="ml-2 flex-shrink-0">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
