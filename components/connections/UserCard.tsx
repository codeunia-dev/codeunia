'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, UserMinus, UserPlus, Eye, CheckCircle2, UserCheck } from 'lucide-react'
import { connectionService } from '@/lib/services/connectionService'
import { conversationService } from '@/lib/services/conversationService'
import { useRouter } from 'next/navigation'
import { UserProfileModal } from './UserProfileModal'

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
  const [showProfileModal, setShowProfileModal] = useState(false)

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

  const handleViewProfile = () => {
    setShowProfileModal(true)
  }

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
        {/* Clickable Avatar */}
        <div 
          onClick={handleViewProfile}
          className="flex-shrink-0 cursor-pointer"
        >
          <Avatar className="w-12 h-12 ring-2 ring-transparent hover:ring-primary/50 transition-all">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={name} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Clickable Name */}
              <button 
                onClick={handleViewProfile}
                className="text-left group/name"
              >
                <h3 className="font-semibold truncate hover:text-primary transition-colors inline-flex items-center gap-1">
                  {name}
                  <Eye className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                </h3>
              </button>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <button 
                  onClick={handleViewProfile}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  @{user.username}
                </button>
                {localStatus?.isMutual && (
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
                {!localStatus?.isMutual && localStatus?.isFollowing && (
                  <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 gap-1">
                    <UserCheck className="h-3 w-3" />
                    Following
                  </Badge>
                )}
                {!localStatus?.isMutual && localStatus?.isFollower && (
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400 gap-1">
                    <UserPlus className="h-3 w-3" />
                    Follows you
                  </Badge>
                )}
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{user.bio}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* View Profile Button */}
              <Button
                onClick={handleViewProfile}
                size="sm"
                variant="ghost"
                className="gap-1"
                title="View Profile"
              >
                <Eye className="h-3 w-3" />
                <span className="hidden md:inline">View</span>
              </Button>

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

      {/* Profile Preview Modal */}
      <UserProfileModal
        userId={user.id}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onConnectionChange={() => {
          onConnectionChange?.()
          // Refresh local status
          setLocalStatus(prev => prev ? { ...prev } : undefined)
        }}
      />
    </>
  )
}
