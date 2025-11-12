// API route for admin moderation queue - list pending events
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { moderationService } from '@/lib/services/moderation-service'

/**
 * GET /api/admin/moderation/events
 * Get pending events for moderation
 * Requires: Platform admin access
 */
export const GET = withPlatformAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get pending events from moderation service
    const { events, total } = await moderationService.getPendingEvents({
      limit,
      offset,
    })

    // Run automated checks for each event
    const eventsWithChecks = await Promise.all(
      events.map(async (event) => {
        const checks = await moderationService.runAutomatedChecks(event)
        return {
          ...event,
          automated_checks: checks,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithChecks,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching moderation queue:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch moderation queue',
      },
      { status: 500 }
    )
  }
})
