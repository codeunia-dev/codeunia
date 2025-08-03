'use client'

import React from 'react'
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Star,
  Loader2
} from 'lucide-react'

export function GlobalScoreCard() {
  const {
    userRank,
    userPoints,
    userBadge,
    pointsToNextBadge,
    loading,
    getBadgeInfo,
    getAllBadges
  } = useGlobalLeaderboard()

  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Global Score & Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const badgeInfo = userBadge ? getBadgeInfo(userBadge) : null
  const allBadges = getAllBadges()
  const nextBadge = allBadges.find(b => b.minPoints > userPoints)
  const progressToNextBadge = nextBadge 
    ? ((userPoints - (userBadge ? getBadgeInfo(userBadge)?.minPoints || 0 : 0)) / (nextBadge.minPoints - (userBadge ? getBadgeInfo(userBadge)?.minPoints || 0 : 0))) * 100
    : 100

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Global Score & Rank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score and Rank Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Points
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {userRank ? `#${userRank.toLocaleString()}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Global Rank
            </div>
          </div>
        </div>

        {/* Badge Display */}
        {badgeInfo && (
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg">
            <div className="text-3xl mb-2">{badgeInfo.icon}</div>
            <div className="font-semibold text-lg" style={{ color: badgeInfo.color }}>
              {badgeInfo.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {badgeInfo.description}
            </div>
          </div>
        )}

        {/* Progress to Next Badge */}
        {nextBadge && pointsToNextBadge > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextBadge.name}</span>
              <span className="font-semibold">{pointsToNextBadge} points needed</span>
            </div>
            <Progress value={progressToNextBadge} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(progressToNextBadge)}% complete
            </p>
          </div>
        )}

        {/* Badge System Overview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            Badge System
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {allBadges.map((badge) => {
              const isEarned = userPoints >= badge.minPoints
              const isCurrent = userBadge === badge.type
              
              return (
                <div
                  key={badge.type}
                  className={`flex items-center gap-2 p-2 rounded text-xs ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-300'
                      : isEarned
                      ? 'bg-green-50 dark:bg-green-950/20'
                      : 'bg-gray-50 dark:bg-gray-900/20'
                  }`}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{badge.name}</div>
                    <div className="text-xs text-gray-500">
                      {badge.minPoints}+ pts
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('/leaderboard', '_blank')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('/protected/profile/activity', '_blank')}
          >
            <Target className="h-4 w-4 mr-2" />
            Activity Log
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
            <div className="font-semibold">Daily Login</div>
            <div className="text-gray-500">+5 pts</div>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
            <div className="font-semibold">Test Complete</div>
            <div className="text-gray-500">+10 pts</div>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
            <div className="font-semibold">Top 3 Rank</div>
            <div className="text-gray-500">+15 pts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 