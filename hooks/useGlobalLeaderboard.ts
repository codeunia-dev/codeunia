import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { globalLeaderboardService } from '@/lib/services/global-leaderboard'
import { 
  LeaderboardEntry, 
  BadgeType, 
  GlobalLeaderboardStats, 
  LeaderboardFilters,
  UserActivityLog,
  ActivityType
} from '@/types/global-leaderboard'

export function useGlobalLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<GlobalLeaderboardStats | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userPoints, setUserPoints] = useState(0)
  const [userBadge, setUserBadge] = useState<BadgeType | null>(null)
  const [pointsToNextBadge, setPointsToNextBadge] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeRange: 'all'
  })

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (
    page: number = 1,
    limit: number = 20,
    newFilters?: LeaderboardFilters
  ) => {
    try {
      setLoading(true)
      setError(null)

      const currentFilters = newFilters || filters
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        timeRange: currentFilters.timeRange || 'all'
      })
      
      if (currentFilters.badge) {
        params.append('badge', currentFilters.badge)
      }

      const response = await fetch(`/api/leaderboard?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(data.entries)
      
      // Update filters if provided
      if (newFilters) {
        setFilters(newFilters)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch user's rank and points
  const fetchUserRankAndPoints = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/leaderboard/user/${user.id}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('User points API returned error:', response.status, errorData.error)
        // Set default values for new users or API errors
        setUserRank(null)
        setUserPoints(0)
        setUserBadge('bronze')
        setPointsToNextBadge(100)
        return
      }

      const data = await response.json()
      setUserRank(data.rank)
      setUserPoints(data.points)
      setUserBadge(data.badge)
      setPointsToNextBadge(data.pointsToNextBadge)
    } catch (err) {
      console.error('Error fetching user rank and points:', err)
      // Set default values on error
      setUserRank(null)
      setUserPoints(0)
      setUserBadge('bronze')
      setPointsToNextBadge(100)
    }
  }, [user?.id])

  // Fetch global statistics
  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      const globalStats: GlobalLeaderboardStats = {
        totalUsers: data.totalUsers,
        totalPoints: data.totalPoints,
        averagePoints: data.averagePoints,
        topRankedUser: data.topRankedUser,
        userRank: null,
        userPoints: 0,
        userBadge: null,
        pointsToNextBadge: 0
      }
      
      // Update stats with user-specific data
      if (user?.id) {
        try {
          const userResponse = await fetch(`/api/leaderboard/user/${user.id}`)
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            globalStats.userRank = userData.rank
            globalStats.userPoints = userData.points
            globalStats.userBadge = userData.badge
            globalStats.pointsToNextBadge = userData.pointsToNextBadge
          } else {
            // Set default values for new users
            globalStats.userRank = null
            globalStats.userPoints = 0
            globalStats.userBadge = 'bronze'
            globalStats.pointsToNextBadge = 100
          }
        } catch (err) {
          console.error('Error fetching user data for stats:', err)
          // Set default values on error
          globalStats.userRank = null
          globalStats.userPoints = 0
          globalStats.userBadge = 'bronze'
          globalStats.pointsToNextBadge = 100
        }
      }

      setStats(globalStats)
    } catch (err) {
      console.error('Error fetching global stats:', err)
    }
  }, [user?.id])

  // Award points for an activity
  const awardPoints = useCallback(async (
    activityType: ActivityType,
    relatedId?: string
  ) => {
    if (!user?.id) return false

    try {
      const success = await globalLeaderboardService.awardPoints(
        user.id,
        activityType,
        relatedId
      )

      if (success) {
        // Refresh user data
        await fetchUserRankAndPoints()
        await fetchGlobalStats()
      }

      return success
    } catch (err) {
      console.error('Error awarding points:', err)
      return false
    }
  }, [user?.id, fetchUserRankAndPoints, fetchGlobalStats])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<LeaderboardFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    fetchLeaderboard(1, 20, updatedFilters)
  }, [filters, fetchLeaderboard])

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchLeaderboard(),
      fetchUserRankAndPoints(),
      fetchGlobalStats()
    ])
  }, [fetchLeaderboard, fetchUserRankAndPoints, fetchGlobalStats])

  // Load data on mount or user change
  useEffect(() => {
    // Always fetch leaderboard and stats, even for non-authenticated users
    const loadData = async () => {
      try {
        await Promise.all([
          fetchLeaderboard(),
          fetchGlobalStats()
        ])
        
        // Only fetch user-specific data if authenticated
        if (user?.id) {
          await fetchUserRankAndPoints()
        }
      } catch (error) {
        console.error('Error loading leaderboard data:', error)
      }
    }
    
    loadData()
  }, [user?.id, fetchLeaderboard, fetchGlobalStats, fetchUserRankAndPoints])

  return {
    // Data
    leaderboard,
    stats,
    userRank,
    userPoints,
    userBadge,
    pointsToNextBadge,
    filters,
    
    // State
    loading,
    error,
    
    // Actions
    fetchLeaderboard,
    fetchUserRankAndPoints,
    fetchGlobalStats,
    awardPoints,
    updateFilters,
    refresh,
    
    // Helper methods
    getBadgeInfo: globalLeaderboardService.getBadgeInfo.bind(globalLeaderboardService),
    getAllBadges: globalLeaderboardService.getAllBadges.bind(globalLeaderboardService)
  }
}

// Hook for user activity log
export function useUserActivityLog(userId: string | null) {
  const [activities, setActivities] = useState<UserActivityLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchActivityLog = useCallback(async (
    page: number = 1,
    limit: number = 20
  ) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const { activities: activityData, total: totalCount } = 
        await globalLeaderboardService.getUserActivityLog(userId, page, limit)

      setActivities(activityData)
      setTotal(totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity log')
      console.error('Error fetching activity log:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchActivityLog()
    } else {
      setActivities([])
      setTotal(0)
      setLoading(false)
    }
  }, [userId, fetchActivityLog])

  return {
    activities,
    total,
    loading,
    error,
    refresh: fetchActivityLog
  }
}