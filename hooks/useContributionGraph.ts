import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { activityService } from '@/lib/services/activity'
import { ContributionGraphData, ActivityType } from '@/types/profile'

export function useContributionGraph() {
  const { user } = useAuth()
  const [data, setData] = useState<ContributionGraphData>({
    total_activities: 0,
    current_streak: 0,
    longest_streak: 0,
    activity_by_date: [],
    activity_by_type: {
      test_registration: 0,
      test_attempt: 0,
      test_completion: 0,
      hackathon_registration: 0,
      hackathon_participation: 0,
      daily_login: 0,
      profile_update: 0,
      certificate_earned: 0,
      mcq_practice: 0,
      blog_like: 0,
      blog_read: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all')

  // Fetch activity data
  const fetchActivityData = useCallback(async (filter?: ActivityType | 'all') => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      let activityData: ContributionGraphData
      
      if (filter && filter !== 'all') {
        activityData = await activityService.getUserActivityByType(user.id, filter)
      } else {
        activityData = await activityService.getUserActivity(user.id)
      }

      setData(activityData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity data')
      console.error('Error fetching activity data:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Handle filter change
  const handleFilterChange = useCallback((filter: ActivityType | 'all') => {
    setSelectedFilter(filter)
    fetchActivityData(filter)
  }, [fetchActivityData])

  // Refresh data
  const refresh = useCallback(() => {
    fetchActivityData(selectedFilter)
  }, [fetchActivityData, selectedFilter])

  // Log daily login activity
  const logDailyLogin = useCallback(async () => {
    if (!user?.id) return

    try {
      await activityService.logDailyLogin(user.id)
      // Refresh data to show the new login activity
      refresh()
    } catch (err) {
      console.error('Error logging daily login:', err)
    }
  }, [user?.id, refresh])

  // Log profile update activity
  const logProfileUpdate = useCallback(async () => {
    if (!user?.id) return

    try {
      await activityService.logProfileUpdate(user.id)
      // Refresh data to show the new profile update activity
      refresh()
    } catch (err) {
      console.error('Error logging profile update:', err)
    }
  }, [user?.id, refresh])

  // Log MCQ practice activity
  const logMcqPractice = useCallback(async (questionCount: number) => {
    if (!user?.id) return

    try {
      await activityService.logMcqPractice(user.id, questionCount)
      // Refresh data to show the new MCQ practice activity
      refresh()
    } catch (err) {
      console.error('Error logging MCQ practice:', err)
    }
  }, [user?.id, refresh])

  // Load data on mount or user change
  useEffect(() => {
    if (user?.id) {
      fetchActivityData()
    } else {
      setData({
        total_activities: 0,
        current_streak: 0,
        longest_streak: 0,
        activity_by_date: [],
        activity_by_type: {
          test_registration: 0,
          test_attempt: 0,
          test_completion: 0,
          hackathon_registration: 0,
          hackathon_participation: 0,
          daily_login: 0,
          profile_update: 0,
          certificate_earned: 0,
          mcq_practice: 0,
          blog_like: 0,
          blog_read: 0
        }
      })
      setLoading(false)
    }
  }, [user?.id, fetchActivityData])

  // Log daily login on component mount (if user is logged in)
  useEffect(() => {
    if (user?.id) {
      logDailyLogin()
    }
  }, [user?.id, logDailyLogin])

  return {
    data,
    loading,
    error,
    selectedFilter,
    handleFilterChange,
    refresh,
    logDailyLogin,
    logProfileUpdate,
    logMcqPractice
  }
} 