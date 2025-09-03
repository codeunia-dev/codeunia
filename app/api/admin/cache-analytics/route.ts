import { NextRequest } from 'next/server'
import { cacheAnalytics } from '@/lib/cache-analytics-server'
import { createCachedApiResponse } from '@/lib/production-cache'

/**
 * API endpoint for cache analytics - Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const user = await getUser(request)
    // if (!user?.isAdmin) {
    //   return new Response('Unauthorized', { status: 401 })
    // }
    
    const url = new URL(request.url)
    const period = url.searchParams.get('period')
    const format = url.searchParams.get('format') as 'json' | 'csv' | null
    
    // Default to 24 hours
    const periodMs = period ? parseInt(period) * 1000 : 24 * 60 * 60 * 1000
    
    if (format === 'csv') {
      const csvData = cacheAnalytics.exportMetrics('csv', periodMs)
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="cache-analytics.csv"'
        }
      })
    }
    
    const analytics = cacheAnalytics.getDetailedAnalytics(periodMs)
    
    return createCachedApiResponse(analytics, 'API_REALTIME')
  } catch (error) {
    console.error('Cache analytics API error:', error)
    return createCachedApiResponse(
      { error: 'Failed to fetch cache analytics' },
      'USER_PRIVATE'
    )
  }
}
