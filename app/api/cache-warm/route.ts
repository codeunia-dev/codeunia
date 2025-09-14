import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { UnifiedCache } from '@/lib/unified-cache-system'
import { ApiSuccess, ApiErrors } from '@/lib/api/error'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

class CacheWarmer {
  private supabase = createServiceClient()
  private warmedEndpoints: string[] = []
  private errors: string[] = []

  async warmCriticalEndpoints() {
    console.log('🔥 Starting cache warming process...')
    
    try {
      // Warm up events cache
      await this.warmEventsCache()
      
      // Warm up hackathons cache
      await this.warmHackathonsCache()
      
      // Warm up featured content
      await this.warmFeaturedContent()
      
      // Warm up leaderboard data
      await this.warmLeaderboardCache()
      
      // Warm up user statistics
      await this.warmUserStats()
      
      console.log(`✅ Cache warming completed successfully!`)
      console.log(`📊 Warmed ${this.warmedEndpoints.length} endpoints`)
      
      if (this.errors.length > 0) {
        console.log(`⚠️  ${this.errors.length} errors occurred during warming:`)
        this.errors.forEach(error => console.log(`   - ${error}`))
      }
      
      return {
        success: true,
        warmedEndpoints: this.warmedEndpoints.length,
        errors: this.errors.length,
        details: {
          warmed: this.warmedEndpoints,
          errors: this.errors
        }
      }
      
    } catch (error) {
      console.error('❌ Cache warming failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async warmEventsCache() {
    console.log('📅 Warming events cache...')
    
    try {
      const eventFilters = [
        { limit: 10, offset: 0 },
        { limit: 20, offset: 0 },
        { status: 'live', limit: 10 },
        { featured: true, limit: 5 },
        { dateFilter: 'upcoming', limit: 10 },
        { category: 'workshop', limit: 10 },
        { category: 'competition', limit: 10 },
        { category: 'seminar', limit: 10 }
      ]

      for (const filters of eventFilters) {
        const cacheKey = `events:${JSON.stringify(filters)}`
        
        try {
          let query = this.supabase
            .from('events')
            .select('*', { count: 'exact' })

          // Apply filters
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
          }
          if (filters.category) {
            query = query.eq('category', filters.category)
          }
          if (filters.status) {
            query = query.eq('status', filters.status)
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured)
          }
          if (filters.dateFilter === 'upcoming') {
            const today = new Date().toISOString().split('T')[0]
            query = query.gte('date', today)
          } else if (filters.dateFilter === 'past') {
            const today = new Date().toISOString().split('T')[0]
            query = query.lt('date', today)
          }

          const limit = filters.limit || 10
          const offset = filters.offset || 0
          query = query.range(offset, offset + limit - 1)

          const { data: events, count } = await query

          const result = {
            events: events || [],
            total: count || 0,
            hasMore: (count || 0) > offset + limit
          }

          await UnifiedCache.set(cacheKey, result, 'API_STANDARD')
          this.warmedEndpoints.push(`events:${JSON.stringify(filters)}`)
          
        } catch (error) {
          this.errors.push(`Events filter ${JSON.stringify(filters)}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      console.log('✅ Events cache warmed')
      
    } catch (error) {
      this.errors.push(`Events cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async warmHackathonsCache() {
    console.log('🏆 Warming hackathons cache...')
    
    try {
      const hackathonFilters = [
        { limit: 10, offset: 0 },
        { limit: 20, offset: 0 },
        { status: 'live', limit: 10 },
        { featured: true, limit: 5 },
        { dateFilter: 'upcoming', limit: 10 },
        { category: 'web-development', limit: 10 },
        { category: 'mobile-development', limit: 10 },
        { category: 'ai-ml', limit: 10 }
      ]

      for (const filters of hackathonFilters) {
        const cacheKey = `hackathons:${JSON.stringify(filters)}`
        
        try {
          let query = this.supabase
            .from('hackathons')
            .select('*', { count: 'exact' })

          // Apply filters
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
          }
          if (filters.category) {
            query = query.eq('category', filters.category)
          }
          if (filters.status) {
            query = query.eq('status', filters.status)
          }
          if (filters.featured !== undefined) {
            query = query.eq('featured', filters.featured)
          }
          if (filters.dateFilter === 'upcoming') {
            const today = new Date().toISOString().split('T')[0]
            query = query.gte('date', today)
          }

          const limit = filters.limit || 10
          const offset = filters.offset || 0
          query = query.range(offset, offset + limit - 1)

          const { data: hackathons, count } = await query

          const result = {
            hackathons: hackathons || [],
            total: count || 0,
            hasMore: (count || 0) > offset + limit
          }

          await UnifiedCache.set(cacheKey, result, 'API_STANDARD')
          this.warmedEndpoints.push(`hackathons:${JSON.stringify(filters)}`)
          
        } catch (error) {
          this.errors.push(`Hackathons filter ${JSON.stringify(filters)}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      console.log('✅ Hackathons cache warmed')
      
    } catch (error) {
      this.errors.push(`Hackathons cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async warmFeaturedContent() {
    console.log('⭐ Warming featured content cache...')
    
    try {
      // Warm up featured events
      const { data: featuredEvents } = await this.supabase
        .from('events')
        .select('*')
        .eq('featured', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5)

      await UnifiedCache.set('featured_events:5', featuredEvents || [], 'DATABASE_QUERIES')
      this.warmedEndpoints.push('featured_events:5')

      // Warm up featured hackathons
      const { data: featuredHackathons } = await this.supabase
        .from('hackathons')
        .select('*')
        .eq('featured', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(5)

      await UnifiedCache.set('featured_hackathons:5', featuredHackathons || [], 'DATABASE_QUERIES')
      this.warmedEndpoints.push('featured_hackathons:5')
      
      console.log('✅ Featured content cache warmed')
      
    } catch (error) {
      this.errors.push(`Featured content cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async warmLeaderboardCache() {
    console.log('🏅 Warming leaderboard cache...')
    
    try {
      // Warm up global leaderboard
      const { data: leaderboard } = await this.supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .order('total_points', { ascending: false })
        .limit(100)

      await UnifiedCache.set('leaderboard:global:100', leaderboard || [], 'DATABASE_QUERIES')
      this.warmedEndpoints.push('leaderboard:global:100')

      // Warm up monthly leaderboard
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: monthlyLeaderboard } = await this.supabase
        .from('user_activity_logs')
        .select(`
          user_id,
          points_earned,
          profiles!inner(
            first_name,
            last_name,
            username
          )
        `)
        .gte('timestamp', startOfMonth.toISOString())
        .order('points_earned', { ascending: false })
        .limit(50)

      await UnifiedCache.set('leaderboard:monthly:50', monthlyLeaderboard || [], 'DATABASE_QUERIES')
      this.warmedEndpoints.push('leaderboard:monthly:50')
      
      console.log('✅ Leaderboard cache warmed')
      
    } catch (error) {
      this.errors.push(`Leaderboard cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async warmUserStats() {
    console.log('📊 Warming user statistics cache...')
    
    try {
      // Get total user count
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get active users (logged in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: activeUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString())

      // Get total events
      const { count: totalEvents } = await this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      // Get total hackathons
      const { count: totalHackathons } = await this.supabase
        .from('hackathons')
        .select('*', { count: 'exact', head: true })

      const stats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalEvents: totalEvents || 0,
        totalHackathons: totalHackathons || 0,
        lastUpdated: new Date().toISOString()
      }

      await UnifiedCache.set('stats:global', stats, 'DATABASE_QUERIES')
      this.warmedEndpoints.push('stats:global')
      
      console.log('✅ User statistics cache warmed')
      
    } catch (error) {
      this.errors.push(`User statistics cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if cache warming is enabled
    const isEnabled = process.env.CACHE_WARMING_ENABLED !== 'false'
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isEnabled) {
      return ApiErrors.BAD_REQUEST('Cache warming is disabled')
    }

    if (!isProduction && process.env.CACHE_WARMING_DEV !== 'true') {
      return ApiErrors.BAD_REQUEST('Cache warming is only enabled in production or when CACHE_WARMING_DEV=true')
    }

    // Optional: Add authentication check for production
    if (isProduction) {
      const authHeader = request.headers.get('authorization')
      const expectedToken = process.env.CACHE_WARMING_TOKEN
      
      if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        return ApiErrors.UNAUTHORIZED('Invalid cache warming token')
      }
    }

    const warmer = new CacheWarmer()
    const result = await warmer.warmCriticalEndpoints()
    
    if (result.success) {
      return ApiSuccess.OK(result, 'Cache warming completed successfully')
    } else {
      return ApiErrors.INTERNAL_ERROR(`Cache warming failed: ${result.error}`)
    }

  } catch (error) {
    console.error('Cache warming API error:', error)
    return ApiErrors.INTERNAL_ERROR('Cache warming failed')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return cache warming status
    const isEnabled = process.env.CACHE_WARMING_ENABLED !== 'false'
    const isProduction = process.env.NODE_ENV === 'production'
    
    return ApiSuccess.OK({
      enabled: isEnabled,
      environment: process.env.NODE_ENV,
      production: isProduction,
      devEnabled: process.env.CACHE_WARMING_DEV === 'true',
      timestamp: new Date().toISOString()
    }, 'Cache warming status')

  } catch (error) {
    console.error('Cache warming status error:', error)
    return ApiErrors.INTERNAL_ERROR('Failed to get cache warming status')
  }
}
