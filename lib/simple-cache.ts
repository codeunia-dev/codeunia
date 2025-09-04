/**
 * Simple Cache Configuration
 * 
 * This provides basic cache headers without complex interactions
 * that could cause middleware conflicts.
 */

import { NextResponse } from 'next/server'

export const SIMPLE_CACHE_HEADERS = {
  // No cache for development
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  
  // Short cache for API responses
  API_SHORT: {
    'Cache-Control': 'public, max-age=0, s-maxage=30, must-revalidate',
  },
  
  // Static assets with long cache
  STATIC_LONG: {
    'Cache-Control': 'public, max-age=2592000, immutable',
  },
  
  // Dynamic content with CDN cache
  DYNAMIC: {
    'Cache-Control': 'public, max-age=0, s-maxage=60, must-revalidate',
  },
} as const

/**
 * Apply simple cache headers to a response
 */
export function applySimpleCache(
  response: NextResponse, 
  cacheType: keyof typeof SIMPLE_CACHE_HEADERS
): NextResponse {
  const headers = SIMPLE_CACHE_HEADERS[cacheType]
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Create a cached API response
 */
export function createCachedResponse(
  data: unknown, 
  cacheType: keyof typeof SIMPLE_CACHE_HEADERS = 'API_SHORT'
): Response {
  const headers = SIMPLE_CACHE_HEADERS[cacheType]
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}
