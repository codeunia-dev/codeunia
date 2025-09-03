/**
 * Production API Route Template with Smart Caching
 * 
 * Copy this template for all API routes to ensure consistent
 * cache behavior and immediate updates on deployment.
 */

import { withCacheRevalidation, createCachedApiResponse } from '@/lib/production-cache'

// Example API route implementation
async function handleApiRequest(): Promise<unknown> {
  // Your API logic here
  return {
    message: 'Hello World',
    timestamp: new Date().toISOString(),
    buildId: process.env.BUILD_ID,
  }
}

// Export the route with smart caching
export const GET = withCacheRevalidation(handleApiRequest, 'API_STANDARD')
export const POST = withCacheRevalidation(handleApiRequest, 'API_REALTIME')

// For routes that need custom logic, use this pattern:
export async function PUT() { // Removed unused _request parameter
  try {
    // Your custom logic here
    const data = await handleApiRequest()
    
    // Return with appropriate cache headers
    return createCachedApiResponse(data, 'API_REALTIME')
  } catch {
    // Errors should not be cached
    return createCachedApiResponse(
      { error: 'Internal Server Error' }, 
      'USER_PRIVATE'
    )
  }
}
