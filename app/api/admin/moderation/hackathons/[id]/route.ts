// API route for hackathon moderation actions
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { createClient } from '@/lib/supabase/server'
import { UnifiedCache } from '@/lib/unified-cache-system'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/admin/moderation/hackathons/[id]
 * Approve or reject a hackathon
 * Requires: Platform admin access
 */
export async function POST(request: NextRequest, context: RouteContext) {
  return withPlatformAdmin(async () => {
    try {
      const { id } = await context.params
      const body = await request.json()
      const { action, reason } = body

      if (!action || !['approve', 'reject', 'delete'].includes(action)) {
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
      }

      if (action === 'reject' && !reason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get the hackathon
      const { data: hackathon, error: fetchError } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !hackathon) {
        return NextResponse.json(
          { success: false, error: 'Hackathon not found' },
          { status: 404 }
        )
      }

      // Update hackathon based on action
      const updateData: {
        updated_at: string
        approval_status?: string
        approved_by?: string
        approved_at?: string
        status?: string
        rejection_reason?: string | null
      } = {
        updated_at: new Date().toISOString(),
      }

      if (action === 'approve') {
        updateData.approval_status = 'approved'
        updateData.approved_by = user.id
        updateData.approved_at = new Date().toISOString()
        updateData.status = 'live'
        updateData.rejection_reason = null
      } else if (action === 'reject') {
        updateData.approval_status = 'rejected'
        updateData.rejection_reason = reason
        updateData.status = 'draft'
      } else if (action === 'delete') {
        // Permanently delete the hackathon
        const { error: deleteError } = await supabase
          .from('hackathons')
          .delete()
          .eq('id', id)

        if (deleteError) {
          throw deleteError
        }

        // Invalidate caches
        await UnifiedCache.purgeByTags(['content', 'api'])

        return NextResponse.json({
          success: true,
          message: 'Hackathon permanently deleted',
        })
      }

      const { error: updateError } = await supabase
        .from('hackathons')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Invalidate caches
      await UnifiedCache.purgeByTags(['content', 'api'])

      return NextResponse.json({
        success: true,
        message: `Hackathon ${action}d successfully`,
      })
    } catch (error) {
      console.error('Error in hackathon moderation action:', error)
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute action',
        },
        { status: 500 }
      )
    }
  })(request)
}
