// API route for admin moderation queue - list pending hackathons
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/moderation/hackathons
 * Get pending hackathons for moderation
 * Requires: Platform admin access
 */
export const GET = withPlatformAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Get pending hackathons
    const { data: hackathons, error, count } = await supabase
      .from('hackathons')
      .select(`
        *,
        company:companies(*)
      `, { count: 'exact' })
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        hackathons: hackathons || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Error fetching hackathon moderation queue:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch moderation queue',
      },
      { status: 500 }
    )
  }
})
