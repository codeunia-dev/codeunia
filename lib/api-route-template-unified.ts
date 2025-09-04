/**
 * UNIFIED API ROUTE TEMPLATE
 * 
 * Use this template for all new API routes to ensure
 * consistent caching behavior.
 */

import { NextRequest } from 'next/server'
import { UnifiedCache } from '@/lib/unified-cache-system'

// === BASIC API ROUTE TEMPLATE ===

export async function GET(request: NextRequest) {
  try {
    // Extract any parameters for cache key
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const category = searchParams.get('category') || 'all'
    
    // Create unique cache key
    const cacheKey = `api-route-${page}-${category}`
    
    // Use cached query with appropriate strategy
    const data = await UnifiedCache.cachedQuery(
      cacheKey,
      async () => {
        // Your actual data fetching logic here
        return await fetchDataFromDatabase()
      },
      'API_STANDARD' // Choose appropriate strategy
    )
    
    // Return with unified cache headers
    return UnifiedCache.createResponse(data, 'API_STANDARD')
    
  } catch (error) {
    console.error('API Error:', error)
    
    // Don't cache errors
    return UnifiedCache.createResponse(
      { error: 'Internal Server Error' },
      'USER_PRIVATE'
    )
  }
}

// === REAL-TIME API ROUTE ===

export async function POST() {
  try {
    const data = await processRealTimeData()
    
    // Use real-time strategy for fast-changing data
    return UnifiedCache.createResponse(data, 'REALTIME')
    
  } catch {
    return UnifiedCache.createResponse(
      { error: 'Processing failed' },
      'USER_PRIVATE'
    )
  }
}

// === USER-SPECIFIC API ROUTE ===

export async function PUT(request: NextRequest) {
  try {
    // Check authentication first
    const user = await getCurrentUser(request)
    if (!user) {
      return UnifiedCache.createResponse(
        { error: 'Unauthorized' },
        'USER_PRIVATE' // Never cache auth errors
      )
    }
    
    const data = await updateUserData(user?.id || '')
    
    // User-specific data should not be cached at CDN level
    return UnifiedCache.createResponse(data, 'USER_PRIVATE')
    
  } catch {
    return UnifiedCache.createResponse(
      { error: 'Update failed' },
      'USER_PRIVATE'
    )
  }
}

// === CACHE INVALIDATION EXAMPLE ===

export async function DELETE() {
  try {
    await deleteContent()
    
    // Invalidate related caches
    await UnifiedCache.purgeByTags(['content', 'api'])
    
    return UnifiedCache.createResponse(
      { success: true },
      'USER_PRIVATE'
    )
    
  } catch {
    return UnifiedCache.createResponse(
      { error: 'Delete failed' },
      'USER_PRIVATE'
    )
  }
}

// === HELPER FUNCTIONS ===

async function fetchDataFromDatabase() {
  // Your database logic here
  return { message: 'Data from DB' }
}

async function processRealTimeData() {
  // Real-time processing logic
  return { timestamp: Date.now() }
}

async function updateUserData(userId: string) {
  // User data update logic
  return { userId, updated: true }
}

async function deleteContent() {
  // Deletion logic
}

async function getCurrentUser(request: NextRequest): Promise<{ id: string } | null> {
  // Authentication logic - implementation needed
  console.log('Authentication for:', request.url)
  return null
}

// === CACHE STRATEGY SELECTION GUIDE ===

/*
Choose the right strategy for your use case:

STATIC_IMMUTABLE:
- Static files, images, fonts
- Content that never changes
- 1 year cache

DYNAMIC_CONTENT:
- Blog posts, events, hackathons
- Content that changes occasionally
- 1 min CDN + 5 min SWR

API_STANDARD:
- Most API endpoints
- Data that changes moderately
- 30s CDN + 2 min SWR

DATABASE_QUERIES:
- Expensive database queries
- App cache only (no CDN)
- 5 minutes cache

REALTIME:
- Live data, AI responses
- Minimal caching
- 5s CDN + 1 min SWR

USER_PRIVATE:
- User-specific data
- Authentication required
- No caching
*/
