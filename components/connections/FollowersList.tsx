'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserCard } from './UserCard'
import { Loader2, Users } from 'lucide-react'
import { connectionService } from '@/lib/services/connectionService'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  bio: string | null
}

export function FollowersList() {
  const { user } = useAuth()
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, { isFollowing: boolean; isFollower: boolean; isMutual: boolean }>>({})
  const [loading, setLoading] = useState(true)

  const loadFollowers = React.useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          follower_id,
          profiles:follower_id (
            id,
            first_name,
            last_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const users = (data || [])
        .map(item => item.profiles as unknown)
        .filter((profile: unknown): profile is UserProfile => 
          profile !== null && 
          typeof profile === 'object' && 
          'id' in profile
        )
      
      setFollowers(users)

      // Load connection statuses for all followers
      const statuses: Record<string, { isFollowing: boolean; isFollower: boolean; isMutual: boolean }> = {}
      await Promise.all(
        users.map(async (profile) => {
          const status = await connectionService.getConnectionStatus(profile.id)
          statuses[profile.id] = status
        })
      )
      setConnectionStatuses(statuses)
    } catch (error) {
      console.error('Error loading followers:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFollowers()
  }, [loadFollowers])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (followers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No followers yet</h3>
        <p className="text-muted-foreground">
          When people follow you, they&apos;ll appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {followers.map((profile) => (
        <UserCard
          key={profile.id}
          user={profile}
          connectionStatus={connectionStatuses[profile.id]}
          onConnectionChange={loadFollowers}
        />
      ))}
    </div>
  )
}
