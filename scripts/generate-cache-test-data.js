/**
 * Generate test cache events to populate the analytics dashboard
 * This should be run from the Next.js API context or server
 */

import { cacheAnalytics } from '../lib/cache-analytics-server.ts'

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

const strategies = ['STATIC_ASSETS', 'API_REALTIME', 'API_STANDARD', 'PAGES_DYNAMIC']

export function generateCacheEvents() {
  console.log('🔄 Generating cache test events...')
  
  // Generate 100 random cache events
  for (let i = 0; i < 100; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)]
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    const isHit = Math.random() > 0.15 // 85% hit rate
    const responseTime = Math.floor(Math.random() * 200) + 10 // 10-210ms
    
    cacheAnalytics.recordEvent({
      type: isHit ? 'hit' : 'miss',
      strategy,
      route,
      responseTime,
      buildId: process.env.BUILD_ID || 'test-build',
      userAgent: 'test-script',
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
      buildId: process.env.BUILD_ID || 'test-build'
    })
  }
  
  // Generate a few error events
  for (let i = 0; i < 3; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)]
    
    cacheAnalytics.recordEvent({
      type: 'error',
      strategy: 'API_REALTIME', 
      route,
      buildId: process.env.BUILD_ID || 'test-build'
    })
  }
  
  console.log('✅ Generated 108 cache events successfully!')
  return cacheAnalytics.getDetailedAnalytics()
}
