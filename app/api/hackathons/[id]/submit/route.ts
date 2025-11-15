import { NextRequest, NextResponse } from 'next/server'
import { hackathonsService } from '@/lib/services/hackathons'
import { createClient } from '@/lib/supabase/server'
import { UnifiedCache } from '@/lib/unified-cache-system'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// POST: Submit hackathon for approval
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get existing hackathon
    const existingHackathon = await hackathonsService.getHackathonBySlug(id)

    if (!existingHackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Check authorization - user must be a member of the company
    let isAuthorized = false

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (profile?.is_admin) {
      isAuthorized = true
    }

    // If not admin, check if user is a member of the company
    if (!isAuthorized && existingHackathon.company_id) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', existingHackathon.company_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      if (membership) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You do not have permission to submit this hackathon' },
        { status: 403 }
      )
    }

    // Check if hackathon is already submitted or approved
    if (existingHackathon.approval_status === 'pending') {
      return NextResponse.json(
        { error: 'Hackathon is already pending approval' },
        { status: 400 }
      )
    }

    if (existingHackathon.approval_status === 'approved') {
      return NextResponse.json(
        { error: 'Hackathon is already approved' },
        { status: 400 }
      )
    }

    // Update approval status to pending and status to published
    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .update({
        approval_status: 'pending',
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('slug', id)
      .select()
      .single()

    if (error) {
      console.error('Error submitting hackathon:', error)
      return NextResponse.json(
        { error: 'Failed to submit hackathon for approval' },
        { status: 500 }
      )
    }

    // Invalidate caches
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      { 
        message: 'Hackathon submitted for approval successfully', 
        hackathon 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in POST /api/hackathons/[id]/submit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
