/**
 * Cache Management API
 * 
 * Provides endpoints for:
 * - Manual cache purging
 * - Cache status monitoring
 * - Webhook handling for automatic purges
 */

import { NextRequest } from 'next/server'
import { handleCachePurgeWebhook, CacheManager } from '@/lib/cloudflare-cache-purge'
import { UnifiedCache } from '@/lib/unified-cache-system'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // TODO: Add admin authentication
    // const user = await getUser(_request)
    // if (!user?.isAdmin) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    const status = await CacheManager.getStatus()
    
    return UnifiedCache.createResponse(status, 'USER_PRIVATE')
  } catch (error) {
    console.error('Cache status error:', error)
    return UnifiedCache.createResponse(
      { error: 'Failed to get cache status' },
      'USER_PRIVATE'
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication
    // const user = await getUser(request)
    // if (!user?.isAdmin) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    const { action, type } = await request.json()

    if (action === 'purge') {
      const result = await CacheManager.manualPurge(type)
      return UnifiedCache.createResponse(result, 'USER_PRIVATE')
    }

    if (action === 'webhook') {
      const { webhookAction, data } = await request.json()
      const result = await handleCachePurgeWebhook(webhookAction, data)
      return UnifiedCache.createResponse(result, 'USER_PRIVATE')
    }

    return UnifiedCache.createResponse(
      { success: false, message: 'Invalid action' },
      'USER_PRIVATE'
    )
  } catch (error) {
    console.error('Cache management error:', error)
    return UnifiedCache.createResponse(
      { error: 'Cache management failed' },
      'USER_PRIVATE'
    )
  }
}
