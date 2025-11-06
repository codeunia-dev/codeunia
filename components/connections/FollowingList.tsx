'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserCard } from './UserCard'
import { Loader2, Users } from 'lucide-react'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  bio: string | null
}

export function FollowingList() {
  const { user } = useAuth()
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const loadFollowing = React.useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          following_id,
          profiles:following_id (
            id,
            first_name,
            last_name,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const users = (data || [])
        .map(item => item.profiles as unknown)
        .filter((profile: unknown): profile is UserProfile => 
          profile !== null && 
          typeof profile === 'object' && 
          'id' in profile
        )
      
      setFollowing(users)
    } catch (error) {
      console.error('Error loading following:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFollowing()
  }, [loadFollowing])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (following.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
        <p className="text-muted-foreground">
          Start following users to build your network
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {following.map((profile) => (
        <UserCard
          key={profile.id}
          user={profile}
          connectionStatus={{
            isFollowing: true,
            isFollower: false,
            isMutual: false
          }}
          onConnectionChange={loadFollowing}
        />
      ))}
    </div>
  )
}
