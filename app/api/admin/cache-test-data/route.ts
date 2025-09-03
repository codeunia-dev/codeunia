import { NextRequest } from 'next/server'
import { cacheAnalytics } from '@/lib/cache-analytics-server'
import { createCachedApiResponse } from '@/lib/production-cache'

const routes = [
  '/api/hackathons',
  '/api/users/profile', 
  '/api/leaderboard/stats',
  '/api/internships/apply',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/hackathons',
  '/leaderboard',
  '/internship',
  '/admin'
]

const strategies = ['STATIC_ASSETS', 'API_REALTIME', 'API_STANDARD', 'PAGES_DYNAMIC'] as const

/**
 * Generate test cache events for development/demo purposes
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return new Response('Not available in production', { status: 403 })
    }
    
    const { events = 100 } = await request.json().catch(() => ({ events: 100 }))
    
    console.log(`🔄 Generating ${events} cache test events...`)
    
    // Generate random cache events
    for (let i = 0; i < events; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)]
      const strategy = strategies[Math.floor(Math.random() * strategies.length)]
      const isHit = Math.random() > 0.15 // 85% hit rate
      const responseTime = Math.floor(Math.random() * 200) + 10 // 10-210ms
      
      cacheAnalytics.recordEvent({
        type: isHit ? 'hit' : 'miss',
        strategy,
        route,
        responseTime,
        buildId: process.env.BUILD_ID || 'dev-build',
        userAgent: 'test-generator',
        region: 'us-east-1'
      })
    }
    
    // Generate some invalidation events
    for (let i = 0; i < 5; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)]
      
      cacheAnalytics.recordEvent({
        type: 'invalidation',
        strategy: 'API_REALTIME',
        route,
        buildId: process.env.BUILD_ID || 'dev-build'
      })
    }
    
    // Generate a few error events
    for (let i = 0; i < 3; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)]
      
      cacheAnalytics.recordEvent({
        type: 'error',
        strategy: 'API_REALTIME', 
        route,
        buildId: process.env.BUILD_ID || 'dev-build'
      })
    }
    
    const totalGenerated = events + 5 + 3
    console.log(`✅ Generated ${totalGenerated} cache events successfully!`)
    
    // Return current analytics data
    const analytics = cacheAnalytics.getDetailedAnalytics()
    
    return createCachedApiResponse({
      success: true,
      message: `Generated ${totalGenerated} cache events`,
      analytics
    }, 'API_REALTIME')
    
  } catch (error) {
    console.error('Error generating cache test data:', error)
    return createCachedApiResponse(
      { 
        success: false,
        error: 'Failed to generate cache test data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      'USER_PRIVATE'
    )
  }
}
