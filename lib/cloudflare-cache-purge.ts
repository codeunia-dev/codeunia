/**
 * CLOUDFLARE CACHE PURGE SYSTEM
 * Handles cache invalidation for:
 * - New deployments
 * - Content updates (events, hackathons)
 * - Manual purge requests
 */

// interface CloudflarePurgeRequest {
//   purge_everything?: boolean
//   files?: string[]
//   tags?: string[]
//   hosts?: string[]
// }

interface CloudflarePurgeResponse {
  success: boolean
  errors: unknown[]
  messages: unknown[]
  result: {
    id: string
  }
}

export class CloudflareCachePurge {
  private static readonly API_BASE = 'https://api.cloudflare.com/client/v4'
  private static readonly ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
  private static readonly API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
  
  private static getHeaders(): HeadersInit {
    if (!this.API_TOKEN) {
      throw new Error('CLOUDFLARE_API_TOKEN environment variable is required')
    }
    
    return {
      'Authorization': `Bearer ${this.API_TOKEN}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Purge entire cache (use sparingly - only on major deployments)
   */
  static async purgeEverything(): Promise<boolean> {
    if (!this.ZONE_ID) {
      console.warn('CLOUDFLARE_ZONE_ID not set, skipping cache purge')
      return false
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/zones/${this.ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ purge_everything: true }),
        }
      )

      const result: CloudflarePurgeResponse = await response.json()
      
      if (result.success) {
        console.log('✅ Cloudflare: Purged entire cache')
        return true
      } else {
        console.error('❌ Cloudflare purge failed:', result.errors)
        return false
      }
    } catch (error) {
      console.error('❌ Cloudflare purge error:', error)
      return false
    }
  }

  /**
   * Purge specific URLs
   */
  static async purgeUrls(urls: string[]): Promise<boolean> {
    if (!this.ZONE_ID || urls.length === 0) {
      console.warn('CLOUDFLARE_ZONE_ID not set or no URLs provided')
      return false
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/zones/${this.ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ files: urls }),
        }
      )

      const result: CloudflarePurgeResponse = await response.json()
      
      if (result.success) {
        console.log(`✅ Cloudflare: Purged ${urls.length} URLs`)
        return true
      } else {
        console.error('❌ Cloudflare purge failed:', result.errors)
        return false
      }
    } catch (error) {
      console.error('❌ Cloudflare purge error:', error)
      return false
    }
  }

  /**
   * Purge by cache tags (requires Cloudflare Enterprise)
   */
  static async purgeTags(tags: string[]): Promise<boolean> {
    if (!this.ZONE_ID || tags.length === 0) {
      console.warn('CLOUDFLARE_ZONE_ID not set or no tags provided')
      return false
    }

    try {
      const response = await fetch(
        `${this.API_BASE}/zones/${this.ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ tags }),
        }
      )

      const result: CloudflarePurgeResponse = await response.json()
      
      if (result.success) {
        console.log(`✅ Cloudflare: Purged tags: ${tags.join(', ')}`)
        return true
      } else {
        console.error('❌ Cloudflare purge failed:', result.errors)
        return false
      }
    } catch (error) {
      console.error('❌ Cloudflare purge error:', error)
      return false
    }
  }

  /**
   * Smart purge for events/hackathons
   */
  static async purgeEvents(): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'
    
    const urlsToPurge = [
      `${baseUrl}/hackathons`,
      `${baseUrl}/events`,
      `${baseUrl}/api/hackathons`,
      `${baseUrl}/api/events`,
      `${baseUrl}/api/hackathons/featured`,
      `${baseUrl}/opportunities`,
    ]

    // Try tag-based purge first (if Enterprise)
    const tagPurgeSuccess = await this.purgeTags(['events', 'hackathons', 'api-events', 'api-hackathons'])
    
    if (tagPurgeSuccess) {
      return true
    }

    // Fallback to URL-based purge
    return await this.purgeUrls(urlsToPurge)
  }

  /**
   * Purge on deployment
   */
  static async purgeOnDeploy(): Promise<boolean> {
    console.log('🚀 Deployment detected, purging cache...')
    
    // For deployments, we want to purge dynamic content but keep static assets
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'
    
    const urlsToPurge = [
      `${baseUrl}/`,
      `${baseUrl}/hackathons`,
      `${baseUrl}/events`,
      `${baseUrl}/leaderboard`,
      `${baseUrl}/opportunities`,
      `${baseUrl}/api/hackathons`,
      `${baseUrl}/api/events`,
      `${baseUrl}/api/leaderboard/stats`,
    ]

    // Try tag-based purge first
    const tagPurgeSuccess = await this.purgeTags(['pages', 'events', 'hackathons', 'api'])
    
    if (tagPurgeSuccess) {
      return true
    }

    // Fallback to URL-based purge
    return await this.purgeUrls(urlsToPurge)
  }
}

/**
 * Webhook handler for automatic cache purging
 */
export async function handleCachePurgeWebhook(
  action: 'deploy' | 'event_created' | 'event_updated' | 'hackathon_created' | 'hackathon_updated' | 'purge_all',
  data?: unknown
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Cache purge webhook triggered:', action, data)
    let success = false
    let message = ''

    switch (action) {
      case 'deploy':
        success = await CloudflareCachePurge.purgeOnDeploy()
        message = success ? 'Deployment cache purge completed' : 'Deployment cache purge failed'
        break

      case 'event_created':
      case 'event_updated':
      case 'hackathon_created':
      case 'hackathon_updated':
        success = await CloudflareCachePurge.purgeEvents()
        message = success ? 'Event/hackathon cache purge completed' : 'Event/hackathon cache purge failed'
        break

      case 'purge_all':
        success = await CloudflareCachePurge.purgeEverything()
        message = success ? 'Full cache purge completed' : 'Full cache purge failed'
        break

      default:
        return { success: false, message: 'Unknown action' }
    }

    return { success, message }
  } catch (error) {
    console.error('Cache purge webhook error:', error)
    return { 
      success: false, 
      message: `Cache purge failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Manual cache management for admin panel
 */
export class CacheManager {
  static async getStatus() {
    return {
      cloudflareConfigured: !!(process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN),
      environment: process.env.NODE_ENV,
      lastPurge: process.env.LAST_CACHE_PURGE || 'Never',
      buildId: process.env.BUILD_ID || 'Unknown',
    }
  }

  static async manualPurge(type: 'all' | 'events' | 'pages'): Promise<{ success: boolean; message: string }> {
    try {
      let success = false
      let message = ''

      switch (type) {
        case 'all':
          success = await CloudflareCachePurge.purgeEverything()
          message = 'Full cache purge'
          break

        case 'events':
          success = await CloudflareCachePurge.purgeEvents()
          message = 'Events/hackathons cache purge'
          break

        case 'pages':
          success = await CloudflareCachePurge.purgeTags(['pages'])
          message = 'Pages cache purge'
          break
      }

      if (success) {
        // Update last purge timestamp
        process.env.LAST_CACHE_PURGE = new Date().toISOString()
      }

      return {
        success,
        message: `${message} ${success ? 'completed successfully' : 'failed'}`
      }
    } catch (error) {
      return {
        success: false,
        message: `Cache purge failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}
