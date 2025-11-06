'use client'

import React, { useEffect, useState } from 'react'
import { connectionService } from '@/lib/services/connectionService'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Users, UserPlus } from 'lucide-react'

export function ConnectionStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    following: 0,
    followers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      try {
        const [following, followers] = await Promise.all([
          connectionService.getFollowingCount(user.id),
          connectionService.getFollowerCount(user.id)
        ])
        setStats({ following, followers })
      } catch (error) {
        console.error('Error loading connection stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2" />
          <div className="h-8 bg-muted rounded w-12" />
        </Card>
        <Card className="p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2" />
          <div className="h-8 bg-muted rounded w-12" />
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <UserPlus className="h-4 w-4" />
          <span className="text-sm">Following</span>
        </div>
        <p className="text-2xl font-bold">{stats.following}</p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Users className="h-4 w-4" />
          <span className="text-sm">Followers</span>
        </div>
        <p className="text-2xl font-bold">{stats.followers}</p>
      </Card>
    </div>
  )
}
