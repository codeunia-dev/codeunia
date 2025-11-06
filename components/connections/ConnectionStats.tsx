'use client'

import React, { useEffect, useState } from 'react'
import { connectionService } from '@/lib/services/connectionService'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Users, UserPlus } from 'lucide-react'

interface ConnectionStatsProps {
  onTabChange?: (tab: string) => void
}

export function ConnectionStats({ onTabChange }: ConnectionStatsProps) {
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
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-shimmer" />
            <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse" />
            <div className="h-8 bg-muted rounded w-12 animate-pulse" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card 
        className="p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => onTabChange?.('following')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTabChange?.('following')
          }
        }}
        aria-label={`View following list. You are following ${stats.following} users`}
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Following</span>
        </div>
        <p className="text-2xl font-bold group-hover:text-primary transition-colors animate-countUp">{stats.following}</p>
      </Card>
      <Card 
        className="p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/50 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => onTabChange?.('followers')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTabChange?.('followers')
          }
        }}
        aria-label={`View followers list. You have ${stats.followers} followers`}
      >
        <div className="flex items-center gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
          <Users className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">Followers</span>
        </div>
        <p className="text-2xl font-bold group-hover:text-primary transition-colors animate-countUp">{stats.followers}</p>
      </Card>
    </div>
  )
}
