/**
 * Test API Route for Unified Cache System
 * This verifies the new cache system works correctly
 */

import { UnifiedCache } from '@/lib/unified-cache-system'

export async function GET() {
  try {
    // Test the unified cache system
    const data = await UnifiedCache.cachedQuery(
      'cache-test-api',
      async () => {
        return {
          message: 'Unified cache system working!',
          timestamp: new Date().toISOString(),
          buildId: process.env.BUILD_ID,
          testPassed: true
        }
      },
      'API_STANDARD'
    )
    
    return UnifiedCache.createResponse(data, 'API_STANDARD')
    
  } catch (error) {
    console.error('Cache test error:', error)
    return UnifiedCache.createResponse(
      { error: 'Cache test failed', testPassed: false },
      'USER_PRIVATE'
    )
  }
}
