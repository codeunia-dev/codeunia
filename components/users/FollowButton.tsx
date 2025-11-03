'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, UserMinus, Users } from 'lucide-react'
import { connectionService } from '@/lib/services/connectionService'
import { useAuth } from '@/lib/hooks/useAuth'

interface FollowButtonProps {
  userId: string
  showConnectionStatus?: boolean
}

export function FollowButton({ userId, showConnectionStatus = true }: FollowButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollower, setIsFollower] = useState(false)
  const [isMutual, setIsMutual] = useState(false)

  const fetchConnectionStatus = async () => {
    try {
      setLoading(true)
      const status = await connectionService.getConnectionStatus(userId)
      setIsFollowing(status.isFollowing)
      setIsFollower(status.isFollower)
      setIsMutual(status.isMutual)
    } catch (error) {
      console.error('Error fetching connection status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && userId && user.id !== userId) {
      fetchConnectionStatus()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId])

  const handleFollow = async () => {
    try {
      setActionLoading(true)
      await connectionService.followUser(userId)
      await fetchConnectionStatus()
    } catch (error) {
      console.error('Error following user:', error)
      alert(error instanceof Error ? error.message : 'Failed to follow user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnfollow = async () => {
    try {
      setActionLoading(true)
      await connectionService.unfollowUser(userId)
      await fetchConnectionStatus()
    } catch (error) {
      console.error('Error unfollowing user:', error)
      alert(error instanceof Error ? error.message : 'Failed to unfollow user')
    } finally {
      setActionLoading(false)
    }
  }

  // Don't show button for own profile
  if (!user || user.id === userId) {
    return null
  }

  if (loading) {
    return (
      <Button disabled variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isFollowing ? (
        <Button
          onClick={handleUnfollow}
          disabled={actionLoading}
          variant="outline"
          className="gap-2"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserMinus className="h-4 w-4" />
          )}
          {isMutual ? 'Unfollow' : 'Following'}
        </Button>
      ) : (
        <Button
          onClick={handleFollow}
          disabled={actionLoading}
          className="gap-2"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Follow
        </Button>
      )}

      {showConnectionStatus && (
        <>
          {isMutual && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              Connected
            </Badge>
          )}
          {!isMutual && isFollower && (
            <Badge variant="outline" className="gap-1">
              Follows you
            </Badge>
          )}
        </>
      )}
    </div>
  )
}
