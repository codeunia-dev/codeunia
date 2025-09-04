/**
 * GitHub Webhook Handler
 * 
 * Handles GitHub webhook events:
 * - Push events (trigger deployment/cache purge)
 * - Release events
 * - Pull request events
 */

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { handleCachePurgeWebhook } from '@/lib/cloudflare-cache-purge'

interface GitHubWebhookPayload {
  action?: string
  ref?: string
  repository?: {
    name: string
    full_name: string
    default_branch: string
  }
  pusher?: {
    name: string
    email: string
  }
  head_commit?: {
    id: string
    message: string
    author: {
      name: string
      email: string
    }
  }
  pull_request?: {
    number: number
    title: string
    state: string
    merged: boolean
  }
  release?: {
    tag_name: string
    name: string
    draft: boolean
    prerelease: boolean
  }
}

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest('hex')}`
  
  // Check buffer lengths before comparison to prevent Node.js errors
  if (signature.length !== digest.length) return false
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')
    const delivery = request.headers.get('x-github-delivery')
    
    if (!signature || !event) {
      return new Response('Missing required headers', { status: 400 })
    }

    const payload = await request.text()
    const webhookSecret = process.env.WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Verify signature
    if (!verifyGitHubSignature(payload, signature, webhookSecret)) {
      console.error('Invalid GitHub webhook signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const data: GitHubWebhookPayload = JSON.parse(payload)
    
    console.log(`📨 GitHub webhook received: ${event} (${delivery})`)

    // Initialize response object
    const response = {
      success: true,
      message: `Processed ${event} event`,
      event,
      delivery,
    }

    // Handle different GitHub events
    switch (event) {
      case 'push':
        // Handle push events (trigger deployment and cache purge)
        if (data.ref === `refs/heads/${data.repository?.default_branch}`) {
          console.log(`🚀 Push to main branch detected, triggering cache purge...`)
          
          const cacheResult = await handleCachePurgeWebhook('deploy', {
            source: 'github',
            ref: data.ref,
            commit: data.head_commit?.id,
            message: data.head_commit?.message,
            author: data.head_commit?.author,
            repository: data.repository?.full_name,
          })
          
          response.message = `Push processed: ${cacheResult.message}`
          
          // Log deployment info
          console.log(`✅ Deployment triggered for commit: ${data.head_commit?.id?.substring(0, 7)}`)
          console.log(`📝 Commit message: ${data.head_commit?.message}`)
          console.log(`👤 Author: ${data.head_commit?.author?.name}`)
        } else {
          console.log(`📝 Push to non-main branch: ${data.ref}`)
          response.message = `Push to ${data.ref} (no action taken)`
        }
        break

      case 'pull_request':
        // Handle pull request events
        if (data.action === 'opened') {
          console.log(`🔀 New PR opened: #${data.pull_request?.number} - ${data.pull_request?.title}`)
        } else if (data.action === 'closed' && data.pull_request?.merged) {
          console.log(`🎉 PR merged: #${data.pull_request?.number}`)
          // Could trigger cache purge for merged PRs if needed
        }
        response.message = `PR ${data.action}: #${data.pull_request?.number}`
        break

      case 'release':
        // Handle release events
        if (data.action === 'published' && !data.release?.draft && !data.release?.prerelease) {
          console.log(`🎉 New release published: ${data.release?.tag_name}`)
          
          // Trigger cache purge for releases
          const cacheResult = await handleCachePurgeWebhook('deploy', {
            source: 'github-release',
            tag: data.release?.tag_name,
            name: data.release?.name,
          })
          
          response.message = `Release processed: ${cacheResult.message}`
        }
        break

      case 'ping':
        // GitHub webhook test
        console.log(`🏓 GitHub webhook ping received`)
        response.message = 'Webhook endpoint is working!'
        break

      default:
        console.log(`ℹ️  Unhandled GitHub event: ${event}`)
        response.message = `Event ${event} received but not processed`
    }

    return new Response(JSON.stringify({
      ...response,
      timestamp: new Date().toISOString(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('❌ GitHub webhook error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'github-webhook',
    webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/github`,
    events_supported: ['push', 'pull_request', 'release', 'ping'],
    timestamp: new Date().toISOString(),
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// HEAD method for lightweight health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Webhook-Status': 'active',
      'X-Service': 'github-webhook',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
