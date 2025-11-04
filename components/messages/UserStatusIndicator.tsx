'use client'

import React from 'react'
import { useUserPresence } from '@/hooks/useUserPresence'
import { formatDistanceToNow } from 'date-fns'

interface UserStatusIndicatorProps {
  userId: string
  showLastSeen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function UserStatusIndicator({ 
  userId, 
  showLastSeen = false,
  size = 'md' 
}: UserStatusIndicatorProps) {
  const { presence, loading } = useUserPresence(userId)

  if (loading || !presence) return null

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const getLastSeenText = () => {
    if (!presence.lastSeen) return 'Last seen: Unknown'
    
    try {
      const lastSeenDate = new Date(presence.lastSeen)
      return `Last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`
    } catch {
      return 'Last seen: Unknown'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full ${
            presence.isOnline
              ? 'bg-green-500'
              : 'bg-gray-400'
          }`}
          title={presence.isOnline ? 'Online' : getLastSeenText()}
        />
        {presence.isOnline && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
          />
        )}
      </div>
      {showLastSeen && !presence.isOnline && (
        <span className="text-xs text-muted-foreground">
          {getLastSeenText()}
        </span>
      )}
      {showLastSeen && presence.isOnline && (
        <span className="text-xs text-green-600 font-medium">
          Online
        </span>
      )}
    </div>
  )
}
