'use client'

import React, { useState } from 'react'
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Trophy, 
  TrendingUp, 
  Search, 
  Filter,
  Crown,
  Medal,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { BadgeType } from '@/types/global-leaderboard'

export function GlobalLeaderboard() {
  const {
    leaderboard,
    stats,
    userRank,
    userPoints,
    userBadge,
    loading,
    error,
    updateFilters,
    refresh,
    getBadgeInfo
  } = useGlobalLeaderboard()

  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all')
  const [badgeFilter, setBadgeFilter] = useState<BadgeType | 'all'>('all')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateFilters({ search: query })
  }

  const handleTimeRangeChange = (range: 'all' | 'month' | 'week') => {
    setTimeRange(range)
    updateFilters({ timeRange: range })
  }

  const handleBadgeFilterChange = (badge: BadgeType | 'all') => {
    setBadgeFilter(badge)
    updateFilters({ badge: badge === 'all' ? undefined : badge })
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>
    return <Badge variant="secondary">#{rank}</Badge>
  }

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalUsers?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalPoints?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats?.averagePoints?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-600">Average Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {userRank ? `#${userRank.toLocaleString()}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Your Rank</div>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={badgeFilter} onValueChange={handleBadgeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Badges</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="text-red-600 dark:text-red-400">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Global Leaderboard
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {error ? 'Leaderboard Coming Soon!' : 'Be the First to Join!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error 
                  ? 'The leaderboard system is being set up. Check back soon!'
                  : 'No users have earned points yet. Start participating to climb the leaderboard!'
                }
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {error 
                  ? 'Database tables are being configured for the global leaderboard.'
                  : 'Complete tests, read blogs, and engage with the community to earn points.'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const badgeInfo = entry.badge ? getBadgeInfo(entry.badge) : null
                const isCurrentUser = false // TODO: Compare with actual user ID from auth context
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      isCurrentUser 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/20'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(entry.rank)}
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        {(entry.username || `User ${entry.rank}`).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {entry.username || `User #${entry.rank}`}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      {badgeInfo && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>{badgeInfo.icon}</span>
                          <span>{badgeInfo.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {entry.total_points.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Current Status */}
      {userRank && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    #{userRank.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Your Rank</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Your Points</div>
                </div>
                
                {userBadge && (
                  <div className="text-center">
                    <div className="text-2xl">
                      {getBadgeInfo(userBadge)?.icon}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getBadgeInfo(userBadge)?.name}
                    </div>
                  </div>
                )}
              </div>
              
              <Button variant="outline">
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}