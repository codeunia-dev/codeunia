import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { 
  UserPoints, 
  UserActivityLog, 
  ActivityType, 
  PointSystem, 
  LeaderboardEntry, 
  BadgeType,
  BadgeInfo,
  GlobalLeaderboardStats,
  LeaderboardFilters
} from '@/types/global-leaderboard'

// Default point system configuration
const DEFAULT_POINT_SYSTEM: PointSystem = {
  daily_login: 5,
  test_registration: 5,
  test_completion: 10,
  hackathon_registration: 5,
  hackathon_participation: 10,
  blog_read: 2,
  blog_like: 1,
  blog_share: 5,
  profile_update: 2,
  certificate_earned: 15,
  top_3_rank: 15,
  user_referral: 10
}

// Badge system configuration
const BADGE_SYSTEM: BadgeInfo[] = [
  {
    type: 'bronze',
    name: 'Bronze',
    description: 'Getting started on Codeunia',
    minPoints: 0,
    color: '#cd7f32',
    icon: '🥉'
  },
  {
    type: 'silver',
    name: 'Silver',
    description: 'Active community member',
    minPoints: 100,
    color: '#c0c0c0',
    icon: '🥈'
  },
  {
    type: 'gold',
    name: 'Gold',
    description: 'Dedicated contributor',
    minPoints: 500,
    color: '#ffd700',
    icon: '🥇'
  },
  {
    type: 'platinum',
    name: 'Platinum',
    description: 'Elite community leader',
    minPoints: 1000,
    color: '#e5e4e2',
    icon: '💎'
  },
  {
    type: 'diamond',
    name: 'Diamond',
    description: 'Legendary status',
    minPoints: 2500,
    color: '#b9f2ff',
    icon: '💎'
  }
]

export class GlobalLeaderboardService {
  private supabase = createClient()
  private pointSystem: PointSystem = DEFAULT_POINT_SYSTEM

  // Only create admin client on server side
  private get supabaseAdmin() {
    if (typeof window === 'undefined') {
      // Server side - we can use service role key
      return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    } else {
      // Client side - fall back to regular client
      return this.supabase
    }
  }

  // Get or create user points record
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      // Use admin client to bypass RLS
      const { data, error } = await this.supabaseAdmin
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User points don't exist, create them
          return await this.createUserPoints(userId)
        }
        if (error.code === '42P01') {
          // Table doesn't exist
          console.log('User points table not found')
          return null
        }
        console.error('Error fetching user points:', error)
        console.error('User points fetch failed:', error.message)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user points:', error)
      return null
    }
  }

  // Create new user points record
  private async createUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      // Use admin client to bypass RLS
      const { data, error } = await this.supabaseAdmin
        .from('user_points')
        .insert([{
          user_id: userId,
          total_points: 0,
          rank: 0
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating user points:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating user points:', error)
      return null
    }
  }

  // Check if required tables exist
  private async checkTablesExist(): Promise<boolean> {
    try {
      // Check user_points table using admin client
      const { error: pointsError } = await this.supabaseAdmin
        .from('user_points')
        .select('count')
        .limit(1)
      
      if (pointsError) {
        console.log('user_points table not available:', pointsError.message)
        return false
      }

      // Check user_activity_log table using admin client
      const { error: activityError } = await this.supabaseAdmin
        .from('user_activity_log')
        .select('count')
        .limit(1)
      
      if (activityError) {
        console.log('user_activity_log table not available:', activityError.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking tables:', error)
      return false
    }
  }

  // Award points for an activity
  async awardPoints(
    userId: string, 
    activityType: ActivityType, 
    relatedId?: string
  ): Promise<boolean> {
    try {
      // Check if required tables exist
      const tablesExist = await this.checkTablesExist()
      if (!tablesExist) {
        console.log('Global leaderboard tables do not exist - skipping points award')
        return false
      }

      const points = this.pointSystem[activityType]
      if (!points) {
        console.error(`No points configured for activity type: ${activityType}`)
        return false
      }

      // Ensure user has a points record
      let userPoints = await this.getUserPoints(userId)
      if (!userPoints) {
        userPoints = await this.createUserPoints(userId)
        if (!userPoints) {
          console.error('Failed to create user points record')
          return false
        }
      }

      // Log the activity using admin client
      const { error: logError } = await this.supabaseAdmin
        .from('user_activity_log')
        .insert([{
          user_id: userId,
          activity_type: activityType,
          related_id: relatedId,
          points_awarded: points
        }])

      if (logError) {
        console.error('Error logging activity:', logError)
        return false
      }

      // Update user points using admin client
      const { error: updateError } = await this.supabaseAdmin
        .from('user_points')
        .update({
          total_points: userPoints.total_points + points,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating user points:', updateError)
        console.error('User ID:', userId, 'Points to add:', points, 'Current points:', userPoints.total_points)
        return false
      }

      // Trigger rank recalculation (this would be done via database trigger in production)
      await this.recalculateRanks()

      return true
    } catch (error) {
      console.error('Error awarding points:', error)
      return false
    }
  }

  // Get global leaderboard
  async getLeaderboard(
    page: number = 1,
    limit: number = 20,
    filters?: LeaderboardFilters
  ): Promise<{ entries: LeaderboardEntry[], total: number }> {
    try {
      // Use admin client to bypass RLS
      let query = this.supabaseAdmin
        .from('user_points')
        .select('*', { count: 'exact' })
        .order('total_points', { ascending: false })
        .order('last_updated', { ascending: false })

      // Apply filters
      if (filters?.timeRange && filters.timeRange !== 'all') {
        const now = new Date()
        let startDate: Date
        
        if (filters.timeRange === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else { // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        
        query = query.gte('last_updated', startDate.toISOString())
      }

      if (filters?.badge) {
        const badgeInfo = BADGE_SYSTEM.find(b => b.type === filters.badge)
        if (badgeInfo) {
          query = query.gte('total_points', badgeInfo.minPoints)
        }
      }

      // Note: Search functionality disabled due to missing relationship
      // if (filters?.search) {
      //   query = query.ilike('profiles.username', `%${filters.search}%`)
      // }

      const offset = (page - 1) * limit
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        // If it's a table doesn't exist error, return empty data
        if (error.code === '42P01') {
          console.log('Leaderboard tables not found, returning empty data')
          return { entries: [], total: 0 }
        }
        // For other errors, still return empty data but log the error
        console.error('Leaderboard fetch failed:', error.message)
        return { entries: [], total: 0 }
      }

      const entries: LeaderboardEntry[] = (data || []).map((item, index) => ({
        rank: offset + index + 1,
        user_id: item.user_id,
        username: 'Anonymous', // Will be fetched separately if needed
        total_points: item.total_points,
        avatar_url: undefined, // Not available in current profile schema
        badge: this.getBadgeForPoints(item.total_points),
        last_activity: item.last_updated
      }))

      return { entries, total: count || 0 }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return { entries: [], total: 0 }
    }
  }

  // Get user's rank and points
  async getUserRankAndPoints(userId: string): Promise<{
    rank: number | null;
    points: number;
    badge: BadgeType | null;
    pointsToNextBadge: number;
  }> {
    try {
      const userPoints = await this.getUserPoints(userId)
      if (!userPoints) {
        return { rank: null, points: 0, badge: null, pointsToNextBadge: 0 }
      }

      // Get user's rank using admin client
      const { count } = await this.supabaseAdmin
        .from('user_points')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', userPoints.total_points)

      const rank = (count || 0) + 1
      const badge = this.getBadgeForPoints(userPoints.total_points)
      const pointsToNextBadge = this.getPointsToNextBadge(userPoints.total_points)

      return {
        rank,
        points: userPoints.total_points,
        badge,
        pointsToNextBadge
      }
    } catch (error) {
      console.error('Error getting user rank and points:', error)
      return { rank: null, points: 0, badge: null, pointsToNextBadge: 0 }
    }
  }

  // Get global leaderboard statistics
  async getGlobalStats(): Promise<GlobalLeaderboardStats> {
    try {
      // Get total users and points using admin client
      const { data: stats, error: statsError } = await this.supabaseAdmin
        .from('user_points')
        .select('total_points')

      if (statsError) {
        console.error('Error fetching stats:', statsError)
        // If it's a table doesn't exist error, return empty stats
        if (statsError.code === '42P01') {
          console.log('Leaderboard tables not found, returning empty stats')
          return this.getEmptyStats()
        }
        // For other errors, still return empty stats but log the error
        console.error('Stats fetch failed:', statsError.message)
        return this.getEmptyStats()
      }

      const totalUsers = stats?.length || 0
      const totalPoints = stats?.reduce((sum, item) => sum + item.total_points, 0) || 0
      const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0

      // Get top ranked user using admin client
      const { data: topUser } = await this.supabaseAdmin
        .from('user_points')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(1)
        .single()

      const topRankedUser = topUser ? {
        rank: 1,
        user_id: topUser.user_id,
        username: 'Anonymous', // Will be fetched separately if needed
        total_points: topUser.total_points,
        avatar_url: undefined, // Not available in current profile schema
        badge: this.getBadgeForPoints(topUser.total_points)
      } : null

      return {
        totalUsers,
        totalPoints,
        averagePoints,
        topRankedUser,
        userRank: null, // Will be set by caller
        userPoints: 0, // Will be set by caller
        userBadge: null, // Will be set by caller
        pointsToNextBadge: 0 // Will be set by caller
      }
    } catch (error) {
      console.error('Error fetching global stats:', error)
      return this.getEmptyStats()
    }
  }

  // Get user activity log
  async getUserActivityLog(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ activities: UserActivityLog[], total: number }> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabaseAdmin
        .from('user_activity_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching activity log:', error)
        return { activities: [], total: 0 }
      }

      return { activities: data || [], total: count || 0 }
    } catch (error) {
      console.error('Error fetching activity log:', error)
      return { activities: [], total: 0 }
    }
  }

  // Helper methods
  private getBadgeForPoints(points: number): BadgeType | null {
    const badge = BADGE_SYSTEM
      .filter(b => points >= b.minPoints)
      .sort((a, b) => b.minPoints - a.minPoints)[0]
    
    return badge?.type || null
  }

  private getPointsToNextBadge(points: number): number {
    const nextBadge = BADGE_SYSTEM
      .filter(b => b.minPoints > points)
      .sort((a, b) => a.minPoints - b.minPoints)[0]
    
    return nextBadge ? nextBadge.minPoints - points : 0
  }

  private getEmptyStats(): GlobalLeaderboardStats {
    return {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      topRankedUser: null,
      userRank: null,
      userPoints: 0,
      userBadge: null,
      pointsToNextBadge: 0
    }
  }

  // Recalculate all user ranks (should be called periodically or via trigger)
  private async recalculateRanks(): Promise<void> {
    try {
      // This would typically be done via a database function/trigger
      // For now, we'll use a simple approach
      const { data: users, error } = await this.supabaseAdmin
        .from('user_points')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })

      if (error || !users) return

      // Update ranks in batches
      const batchSize = 100
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        const updates = batch.map((user, index) => ({
          user_id: user.user_id,
          rank: i + index + 1
        }))

        await this.supabaseAdmin
          .from('user_points')
          .upsert(updates, { onConflict: 'user_id' })
      }
    } catch (error) {
      console.error('Error recalculating ranks:', error)
    }
  }

  // Get badge information
  getBadgeInfo(badgeType: BadgeType): BadgeInfo | null {
    return BADGE_SYSTEM.find(b => b.type === badgeType) || null
  }

  // Get all badge information
  getAllBadges(): BadgeInfo[] {
    return BADGE_SYSTEM
  }

  // Update point system (admin only)
  updatePointSystem(newPointSystem: Partial<PointSystem>): void {
    this.pointSystem = { ...this.pointSystem, ...newPointSystem }
  }
}

// Export singleton instance
export const globalLeaderboardService = new GlobalLeaderboardService()