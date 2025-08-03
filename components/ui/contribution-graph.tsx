'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { ContributionGraphData, ActivityType } from '@/types/profile'

interface ContributionGraphProps {
  data: ContributionGraphData
  loading?: boolean
  onFilterChange?: (type: ActivityType | 'all') => void
  onRefresh?: () => void
  className?: string
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  test_registration: 'Test Registration',
  test_attempt: 'Test Attempt',
  test_completion: 'Test Completion',
  hackathon_registration: 'Hackathon Registration',
  hackathon_participation: 'Hackathon Participation',
  daily_login: 'Daily Login',
  profile_update: 'Profile Update',
  certificate_earned: 'Certificate Earned',
  mcq_practice: 'MCQ Practice'
}

const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  test_registration: 'bg-blue-500',
  test_attempt: 'bg-yellow-500',
  test_completion: 'bg-green-500',
  hackathon_registration: 'bg-purple-500',
  hackathon_participation: 'bg-indigo-500',
  daily_login: 'bg-gray-500',
  profile_update: 'bg-orange-500',
  certificate_earned: 'bg-emerald-500',
  mcq_practice: 'bg-pink-500'
}

export function ContributionGraph({
  data,
  loading = false,
  onFilterChange,
  onRefresh,
  className = ''
}: ContributionGraphProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all')
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Generate calendar grid for the current year (Jan 1 to Dec 31)
  const calendarGrid = useMemo(() => {
    const grid = []
    const today = new Date()
    const currentYear = today.getFullYear()
    const startDate = new Date(currentYear, 0, 1) // January 1st of current year
    const endDate = new Date(currentYear, 11, 31) // December 31st of current year

    // Create activity lookup map
    const activityMap = new Map<string, number>()
    data.activity_by_date.forEach(item => {
      activityMap.set(item.date, item.count)
    })

    // Calculate total weeks needed (52-53 weeks for a year)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const totalWeeks = Math.ceil(totalDays / 7)

    // Generate weeks (7 days each)
    for (let week = 0; week < totalWeeks; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + (week * 7) + day)
        
        const dateStr = currentDate.toISOString().split('T')[0]
        const activityCount = activityMap.get(dateStr) || 0
        
        weekData.push({
          date: dateStr,
          count: activityCount,
          isToday: dateStr === today.toISOString().split('T')[0],
          isFuture: currentDate > today,
          isCurrentYear: currentDate.getFullYear() === currentYear
        })
      }
      grid.push(weekData)
    }

    return grid
  }, [data.activity_by_date])

  // Get color intensity based on activity count
  const getColorIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-green-200 dark:bg-green-900'
    if (count === 2) return 'bg-green-300 dark:bg-green-800'
    if (count === 3) return 'bg-green-400 dark:bg-green-700'
    return 'bg-green-500 dark:bg-green-600'
  }

  // Get tooltip content for a date
  const getTooltipContent = (date: string, count: number) => {
    if (count === 0) {
      return `No activities on ${new Date(date).toLocaleDateString()}`
    }
    
    const activities = data.activity_by_date.find(item => item.date === date)?.activities || []
    const activityTypes = activities.map(activity => ACTIVITY_TYPE_LABELS[activity.activity_type])
    
    return (
      <div className="text-sm">
        <div className="font-semibold mb-1">
          {count} {count === 1 ? 'activity' : 'activities'} on {new Date(date).toLocaleDateString()}
        </div>
        {activityTypes.length > 0 && (
          <div className="text-xs text-gray-300">
            {activityTypes.slice(0, 3).join(', ')}
            {activityTypes.length > 3 && ` +${activityTypes.length - 3} more`}
          </div>
        )}
      </div>
    )
  }

  const handleFilterChange = (value: string) => {
    const filter = value as ActivityType | 'all'
    setSelectedFilter(filter)
    onFilterChange?.(filter)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-lg">Activity Graph</CardTitle>
              <CardDescription>
                Your activity in {new Date().getFullYear()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.total_activities}</div>
            <div className="text-xs text-muted-foreground">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{data.current_streak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{data.longest_streak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
        </div>

        {/* Filter */}
        {onFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${ACTIVITY_TYPE_COLORS[type as ActivityType]}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Activity Type Breakdown */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.activity_by_type)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${ACTIVITY_TYPE_COLORS[type as ActivityType]}`} />
                  {ACTIVITY_TYPE_LABELS[type as ActivityType]}: {count}
                </div>
              </Badge>
            ))}
        </div>

        {/* Contribution Graph */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((count) => (
                <div
                  key={count}
                  className={`w-3 h-3 rounded-sm ${getColorIntensity(count)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>

          <TooltipProvider>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {calendarGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            w-3 h-3 rounded-sm cursor-pointer transition-colors
                            ${day.isFuture ? 'bg-gray-50 dark:bg-gray-900' : getColorIntensity(day.count)}
                            ${day.isToday ? 'ring-2 ring-green-500 ring-offset-1' : ''}
                            ${hoveredDate === day.date ? 'ring-2 ring-blue-500' : ''}
                          `}
                          onMouseEnter={() => setHoveredDate(day.date)}
                          onMouseLeave={() => setHoveredDate(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {getTooltipContent(day.date, day.count)}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Legend */}
        <div className="text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center gap-4">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 