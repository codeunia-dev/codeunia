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
  Search, 
  Filter,
  Crown,
  Medal,
  Award,
  Loader2,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import { BadgeType } from '@/types/global-leaderboard'

export function GlobalLeaderboard() {
  const {
    leaderboard,
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
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white text-sm font-bold">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-white text-sm font-bold">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white text-sm font-bold">🥉 3rd</Badge>
    return <Badge variant="secondary" className="text-sm font-medium">#{rank}</Badge>
  }

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading TopUnia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User's Current Status - Prominent Display */}
      {userRank && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    #{userRank.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Your Rank</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Your Points</div>
                </div>
                
                {userBadge && (
                  <div className="text-center">
                    <div className="text-3xl">
                      {getBadgeInfo(userBadge)?.icon}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {getBadgeInfo(userBadge)?.name}
                    </div>
                  </div>
                )}
              </div>
              
              <Button variant="outline" className="hidden md:flex">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Trophy className="h-6 w-6 text-yellow-500" />
              TopUnia Rankings
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
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {error ? 'TopUnia Coming Soon!' : 'Be the First to Join!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                {error 
                  ? 'The ranking system is being set up. Check back soon!'
                  : 'No users have earned points yet. Start participating to climb the ranks!'
                }
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                {error 
                  ? 'Database tables are being configured for TopUnia.'
                  : 'Complete tests, read blogs, and engage with the community to earn points.'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const badgeInfo = entry.badge ? getBadgeInfo(entry.badge) : null
                const isCurrentUser = false // TODO: Compare with actual user ID from auth context
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isCurrentUser 
                        ? 'bg-primary/10 border-primary/30 shadow-lg'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:border-primary/20 hover:shadow-md'
                    } ${entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800' : ''}`}
                  >
                    {/* Rank */}
                    <div className="flex items-center gap-3 min-w-[80px]">
                      {getRankIcon(entry.rank)}
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={`h-12 w-12 ${entry.rank <= 3 ? 'ring-2 ring-yellow-400' : ''}`}>
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="font-bold text-lg">
                        {(entry.username || `User ${entry.rank}`).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate">
                        {entry.username || `User #${entry.rank}`}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      {badgeInfo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-lg">{badgeInfo.icon}</span>
                          <span className="font-medium">{badgeInfo.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="font-bold text-2xl text-primary">
                        {entry.total_points.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}