'use client'

import React, { useState } from 'react'
import { useUserActivityLog } from '@/hooks/useGlobalLeaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Award,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface UserActivityLogProps {
  userId: string
}

export function UserActivityLog({ userId }: UserActivityLogProps) {
  const {
    activities,
    total,
    loading,
    error,
    refresh
  } = useUserActivityLog(userId)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'daily_login':
        return '🌅'
      case 'test_registration':
        return '📝'
      case 'test_completion':
        return '✅'
      case 'hackathon_registration':
        return '🏆'
      case 'hackathon_participation':
        return '🎯'
      case 'blog_read':
        return '📖'
      case 'blog_like':
        return '❤️'
      case 'blog_share':
        return '📤'
      case 'profile_update':
        return '👤'
      case 'certificate_earned':
        return '🏅'
      case 'top_3_rank':
        return '🥇'
      case 'user_referral':
        return '👥'
      default:
        return '📊'
    }
  }

  const getActivityDescription = (activityType: string) => {
    switch (activityType) {
      case 'daily_login':
        return 'Daily Login'
      case 'test_registration':
        return 'Test Registration'
      case 'test_completion':
        return 'Test Completion'
      case 'hackathon_registration':
        return 'Hackathon Registration'
      case 'hackathon_participation':
        return 'Hackathon Participation'
      case 'blog_read':
        return 'Blog Read'
      case 'blog_like':
        return 'Blog Like'
      case 'blog_share':
        return 'Blog Share'
      case 'profile_update':
        return 'Profile Update'
      case 'certificate_earned':
        return 'Certificate Earned'
      case 'top_3_rank':
        return 'Top 3 Rank'
      case 'user_referral':
        return 'User Referral'
      default:
        return activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {activities.reduce((sum, activity) => sum + activity.points_awarded, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Points Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {activities.length > 0 ? Math.round(activities.reduce((sum, activity) => sum + activity.points_awarded, 0) / activities.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Points/Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Activity List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found.</p>
              <p className="text-sm">Start engaging with the platform to see your activity log!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                >
                  {/* Activity Icon */}
                  <div className="text-2xl">
                    {getActivityIcon(activity.activity_type)}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">
                      {getActivityDescription(activity.activity_type)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(activity.created_at)}
                    </div>
                    {activity.related_id && (
                      <div className="text-xs text-gray-500">
                        Related ID: {activity.related_id}
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <Badge variant="secondary" className="text-sm">
                      +{activity.points_awarded} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} activities
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              activities.reduce((acc, activity) => {
                acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([activityType, count]) => (
              <div key={activityType} className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl mb-1">
                  {getActivityIcon(activityType)}
                </div>
                <div className="font-semibold text-sm">
                  {getActivityDescription(activityType)}
                </div>
                <div className="text-xs text-gray-600">
                  {count} {count === 1 ? 'time' : 'times'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 