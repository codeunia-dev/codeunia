// API route for fetching event details for moderation
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { moderationService, ModerationError } from '@/lib/services/moderation-service'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/moderation/events/[id]
 * Get event details with automated checks and moderation history
 * Requires: Platform admin access
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withPlatformAdmin(async () => {
    try {
      const params = await context.params
      const eventId = parseInt(params.id)
      if (isNaN(eventId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid event ID' },
          { status: 400 }
        )
      }

      const supabase = await createClient()

      // Fetch event with company details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(
          `
          *,
          company:companies(*)
        `
        )
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        return NextResponse.json(
          { success: false, error: 'Event not found' },
          { status: 404 }
        )
      }

      // Run automated checks
      const automatedChecks = await moderationService.runAutomatedChecks(event)

      // Fetch moderation history
      const moderationHistory = await moderationService.getModerationHistory(eventId)

      return NextResponse.json({
        success: true,
        data: {
          event,
          automatedChecks,
          moderationHistory,
        },
      })
    } catch (error) {
      console.error('Error fetching event details:', error)

      if (error instanceof ModerationError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch event details',
        },
        { status: 500 }
      )
    }
  })(request)
}
