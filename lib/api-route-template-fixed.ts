/**
 * API Route Template with Unified Cache System
 * 
 * This template demonstrates how to use the unified cache system for
 * cache behavior and immediate updates on deployment.
 */

import { UnifiedCache } from '@/lib/unified-cache-system'

// Example API route implementation
async function handleApiRequest(): Promise<unknown> {
  // Your API logic here
  return {
    message: 'Hello World',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
}

// Example with cached query
export async function GET() {
  try {
    const data = await UnifiedCache.cachedQuery(
      'example-api-key',
      handleApiRequest,
      'API_STANDARD'
    )

    return UnifiedCache.createResponse(data, 'API_STANDARD')
  } catch (error) {
    console.error('API error:', error)
    return UnifiedCache.createResponse(
      { error: 'Internal server error' },
      'USER_PRIVATE'
    )
  }
}

// Example with direct response
export async function POST() {
  try {
    const data = await handleApiRequest()
    
    return UnifiedCache.createResponse(data, 'USER_PRIVATE')
  } catch (error) {
    console.error('API error:', error)
    return UnifiedCache.createResponse(
      { error: 'Internal server error' },
      'USER_PRIVATE'
    )
  }
}
