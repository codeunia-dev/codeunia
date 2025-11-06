'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, UserMinus, UserPlus } from 'lucide-react'
import { connectionService } from '@/lib/services/connectionService'
import { conversationService } from '@/lib/services/conversationService'
import { useRouter } from 'next/navigation'

interface UserCardProps {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    username: string
    avatar_url: string | null
    bio?: string | null
  }
  connectionStatus?: {
    isFollowing: boolean
    isFollower: boolean
    isMutual: boolean
  }
  onConnectionChange?: () => void
  showMessageButton?: boolean
}

export function UserCard({ user, connectionStatus, onConnectionChange, showMessageButton = true }: UserCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [localStatus, setLocalStatus] = useState(connectionStatus)

  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase()

  const handleFollow = async () => {
    try {
      setLoading(true)
      await connectionService.followUser(user.id)
      setLocalStatus(prev => prev ? { ...prev, isFollowing: true, isMutual: prev.isFollower } : undefined)
      onConnectionChange?.()
    } catch (error) {
      console.error('Error following user:', error)
      alert(error instanceof Error ? error.message : 'Failed to follow user')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfollow = async () => {
    try {
      setLoading(true)
      await connectionService.unfollowUser(user.id)
      setLocalStatus(prev => prev ? { ...prev, isFollowing: false, isMutual: false } : undefined)
      onConnectionChange?.()
    } catch (error) {
      console.error('Error unfollowing user:', error)
      alert(error instanceof Error ? error.message : 'Failed to unfollow user')
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async () => {
    try {
      setLoading(true)
      const { canMessage, reason } = await conversationService.canMessageUser(user.id)
      
      if (!canMessage) {
        alert(reason || 'Cannot message this user')
        return
      }
      
      const conversation = await conversationService.getOrCreateConversation(user.id)
      router.push(`/protected/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert(error instanceof Error ? error.message : 'Failed to create conversation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <Avatar className="w-12 h-12 flex-shrink-0">
        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={name} />}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              {localStatus?.isMutual && (
                <Badge variant="secondary" className="text-xs">
                  Connected
                </Badge>
              )}
              {!localStatus?.isMutual && localStatus?.isFollower && (
                <Badge variant="outline" className="text-xs">
                  Follows you
                </Badge>
              )}
            </div>
            {user.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {showMessageButton && localStatus?.isMutual && (
              <Button
                onClick={handleMessage}
                disabled={loading}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Message</span>
              </Button>
            )}
            
            {localStatus?.isFollowing ? (
              <Button
                onClick={handleUnfollow}
                disabled={loading}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <UserMinus className="h-3 w-3" />
                <span className="hidden sm:inline">Unfollow</span>
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={loading}
                size="sm"
                className="gap-1"
              >
                <UserPlus className="h-3 w-3" />
                <span className="hidden sm:inline">Follow</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
