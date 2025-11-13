import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/services/analytics-service'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * POST /api/events/[slug]/track-view
 * Track a view for an event with session-based deduplication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get session ID from request body (generated on client)
    const body = await request.json()
    const sessionId = body.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if this session has already viewed this event
    // We rely on client-side sessionStorage to prevent duplicates
    // The client will only send the request once per session
    
    // Track the view
    await AnalyticsService.trackEventView(slug)

    return NextResponse.json(
      { success: true, message: 'View tracked successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error tracking event view:', error)
    
    // Don't fail the request if view tracking fails
    // Just log the error and return success
    return NextResponse.json(
      { success: true, message: 'View tracking skipped' },
      { status: 200 }
    )
  }
}
