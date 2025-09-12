/**
 * Enhanced Hackathons API with Production Caching
 */

import { NextRequest } from 'next/server'
import { UnifiedCache } from '@/lib/unified-cache-system'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const featured = url.searchParams.get('featured') === 'true'
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    // Create cache key based on parameters
    const cacheKey = `hackathons:${featured ? 'featured' : 'all'}:${limit}`
    
    // Use cached query with 5-minute TTL
    const hackathons = await UnifiedCache.cachedQuery(
      cacheKey,
      async () => {
        const supabase = await createClient()
        
        let query = supabase
          .from('hackathons')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (featured) {
          query = query.eq('featured', true)
        }

        const { data, error } = await query
        
        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }
        
        return data || []
      },
      'DATABASE_QUERIES'
    )

    return UnifiedCache.createResponse(
      {
        hackathons,
        count: hackathons.length,
        featured,
        timestamp: new Date().toISOString(),
      },
      'DYNAMIC_CONTENT'
    )
  } catch (error) {
    console.error('Hackathons API error:', error)
    return UnifiedCache.createResponse(
      { 
        error: 'Failed to fetch hackathons',
        hackathons: [],
        count: 0,
      },
      'USER_PRIVATE'
    )
  }
}
