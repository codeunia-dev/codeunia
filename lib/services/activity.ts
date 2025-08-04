import { createClient } from '@/lib/supabase/client'
import { UserActivity, ActivityType, ContributionGraphData, ActivityData } from '@/types/profile'
import { globalLeaderboardService } from './global-leaderboard'

export class ActivityService {
  private supabase = createClient()

  // Log a new user activity
  async logActivity(
    userId: string, 
    activityType: ActivityType, 
    activityData?: Record<string, unknown>
  ): Promise<UserActivity | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_activity')
        .insert([{
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData,
          activity_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) {
        console.error('Error logging activity:', error)
        return null
      }

      // Also award global leaderboard points
      try {
        const globalActivityType = this.mapToGlobalActivityType(activityType)
        if (globalActivityType) {
          console.log(`🎯 Awarding global points for ${activityType} -> ${globalActivityType}`)
          const success = await globalLeaderboardService.awardPoints(userId, globalActivityType as any)
          if (success) {
            console.log(`✅ Global points awarded for ${activityType}`)
          } else {
            console.log(`❌ Global points not awarded for ${activityType}`)
          }
        }
      } catch (globalError) {
        console.error('❌ Global leaderboard error:', globalError)
        // Don't fail the main activity logging if global points fail
      }

      return data
    } catch (error) {
      console.error('Error logging activity:', error)
      return null
    }
  }

  // Get user activity for contribution graph (current year)
  async getUserActivity(userId: string): Promise<ContributionGraphData> {
    try {
      const currentYear = new Date().getFullYear()
      const startDate = new Date(currentYear, 0, 1) // January 1st
      const endDate = new Date(currentYear, 11, 31) // December 31st

      const { data: activities, error } = await this.supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .lte('activity_date', endDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true })

      if (error) {
        console.error('Error fetching user activity:', error)
        return this.getEmptyContributionData()
      }

      return this.processActivityData(activities || [])
    } catch (error) {
      console.error('Error fetching user activity:', error)
      return this.getEmptyContributionData()
    }
  }

  // Get user activity filtered by type (current year)
  async getUserActivityByType(
    userId: string, 
    activityType: ActivityType
  ): Promise<ContributionGraphData> {
    try {
      const currentYear = new Date().getFullYear()
      const startDate = new Date(currentYear, 0, 1) // January 1st
      const endDate = new Date(currentYear, 11, 31) // December 31st

      const { data: activities, error } = await this.supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .lte('activity_date', endDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true })

      if (error) {
        console.error('Error fetching user activity by type:', error)
        return this.getEmptyContributionData()
      }

      return this.processActivityData(activities || [])
    } catch (error) {
      console.error('Error fetching user activity by type:', error)
      return this.getEmptyContributionData()
    }
  }

  // Process raw activity data into contribution graph format
  private processActivityData(activities: UserActivity[]): ContributionGraphData {
    const activityByDate: Record<string, ActivityData> = {}
    const activityByType: Record<ActivityType, number> = {
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

    // Group activities by date and type
    activities.forEach(activity => {
      const date = activity.activity_date
      
      if (!activityByDate[date]) {
        activityByDate[date] = {
          date,
          count: 0,
          activities: []
        }
      }
      
      activityByDate[date].count++
      activityByDate[date].activities.push(activity)
      activityByType[activity.activity_type]++
    })

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(activityByDate)

    return {
      total_activities: activities.length,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      activity_by_date: Object.values(activityByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      activity_by_type: activityByType
    }
  }

  // Calculate current and longest streaks
  private calculateStreaks(activityByDate: Record<string, ActivityData>): {
    currentStreak: number
    longestStreak: number
  } {
    const dates = Object.keys(activityByDate).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate current streak (consecutive days from today)
    const today = new Date().toISOString().split('T')[0]
    const currentDate = new Date(today)
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (activityByDate[dateStr] && activityByDate[dateStr].count > 0) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    for (let i = 0; i < dates.length; i++) {
      if (activityByDate[dates[i]].count > 0) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    return { currentStreak, longestStreak }
  }

  // Get empty contribution data
  private getEmptyContributionData(): ContributionGraphData {
    return {
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
    }
  }

  // Log daily login activity (call this when user logs in)
  async logDailyLogin(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Check if already logged today
      const { data: existing, error: checkError } = await this.supabase
        .from('user_activity')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', 'daily_login')
        .eq('activity_date', today)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing daily login:', checkError)
        return
      }

      if (!existing) {
        await this.logActivity(userId, 'daily_login')
      }
    } catch (error) {
      console.error('Error in logDailyLogin:', error)
    }
  }

  // Log profile update activity
  async logProfileUpdate(userId: string): Promise<void> {
    await this.logActivity(userId, 'profile_update')
  }

  // Log MCQ practice activity
  async logMcqPractice(userId: string, questionCount: number): Promise<void> {
    await this.logActivity(userId, 'mcq_practice', { question_count: questionCount })
  }

  // Map contribution graph activity types to global leaderboard activity types
  private mapToGlobalActivityType(activityType: ActivityType): string | null {
    const mapping: Record<ActivityType, string | null> = {
      test_registration: 'test_registration',
      test_attempt: 'test_completion',
      test_completion: 'test_completion',
      hackathon_registration: 'hackathon_registration',
      hackathon_participation: 'hackathon_participation',
      daily_login: 'daily_login',
      profile_update: 'profile_update',
      certificate_earned: 'certificate_earned',
      mcq_practice: null, // No global points for MCQ practice
      blog_like: 'blog_like',
      blog_read: 'blog_read'
    }
    
    return mapping[activityType] || null
  }
}

export const activityService = new ActivityService() 