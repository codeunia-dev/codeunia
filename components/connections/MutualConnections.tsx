'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { connectionService } from '@/lib/services/connectionService'

interface MutualConnectionsProps {
  userId: string
  className?: string
}

interface MutualUser {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
}

export function MutualConnections({ userId, className = '' }: MutualConnectionsProps) {
  const [mutualData, setMutualData] = useState<{
    count: number
    users: MutualUser[]
  }>({ count: 0, users: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMutualConnections = async () => {
      try {
        const data = await connectionService.getMutualConnections(userId)
        setMutualData(data)
      } catch (error) {
        console.error('Error loading mutual connections:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMutualConnections()
  }, [userId])

  if (loading || mutualData.count === 0) {
    return null
  }

  const displayUsers = mutualData.users.slice(0, 3)
  const remainingCount = mutualData.count - displayUsers.length

  const getName = (user: MutualUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.username
  }

  const getInitials = (user: MutualUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user.username.slice(0, 2).toUpperCase()
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Users className="h-4 w-4 flex-shrink-0" />
      <div className="flex items-center gap-1">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {displayUsers.map((user) => (
            <Avatar key={user.id} className="w-6 h-6 border-2 border-background">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={getName(user)} />}
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        {/* Text */}
        <span className="ml-2">
          Connected with{' '}
          <span className="font-medium text-foreground">
            {displayUsers[0] && getName(displayUsers[0])}
          </span>
          {displayUsers.length > 1 && (
            <>
              {' '}and{' '}
              <span className="font-medium text-foreground">
                {remainingCount > 0 
                  ? `${displayUsers.length - 1 + remainingCount} others`
                  : displayUsers.length === 2
                  ? getName(displayUsers[1])
                  : `${displayUsers.length - 1} others`
                }
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  )
}
