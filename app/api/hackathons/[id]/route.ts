import { NextRequest, NextResponse } from 'next/server'
import { hackathonsService } from '@/lib/services/hackathons'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// GET: Fetch a single hackathon by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const hackathon = await hackathonsService.getHackathonBySlug(id)

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(hackathon)
  } catch (error) {
    console.error('Error in GET /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hackathon' },
      { status: 500 }
    )
  }
}

// PUT: Update a hackathon
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const hackathonData = await request.json()

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get the existing hackathon to check company_id
    const existingHackathon = await hackathonsService.getHackathonByIdOrSlug(id)

    if (!existingHackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

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
        { error: 'Unauthorized: You must be a company member or admin to update this hackathon' },
        { status: 401 }
      )
    }

    const hackathon = await hackathonsService.updateHackathon(id, hackathonData, user.id)

    return NextResponse.json({ hackathon })
  } catch (error) {
    console.error('Error in PUT /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update hackathon' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a hackathon
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    console.log('🗑️ DELETE request for hackathon:', id)

    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Get the existing hackathon to check company_id
    const existingHackathon = await hackathonsService.getHackathonByIdOrSlug(id)

    if (!existingHackathon) {
      console.error('❌ Hackathon not found:', id)
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    console.log('✅ Hackathon found:', existingHackathon.id, existingHackathon.title)

    let isAuthorized = false

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin) {
      isAuthorized = true
      console.log('✅ User is admin')
    }

    // If not admin, check if user is a company owner or admin (not editor/viewer)
    if (!isAuthorized && existingHackathon.company_id) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', existingHackathon.company_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (membership && ['owner', 'admin'].includes(membership.role)) {
        isAuthorized = true
        console.log('✅ User is company owner/admin with role:', membership.role)
      } else if (membership) {
        console.log('❌ User has insufficient role:', membership.role)
      }
    }

    if (!isAuthorized) {
      console.error('❌ User not authorized to delete hackathon')
      return NextResponse.json(
        { error: 'Insufficient permissions: Owner or Admin role required to delete hackathons' },
        { status: 403 }
      )
    }

    console.log('🗑️ Attempting to delete hackathon...')
    await hackathonsService.deleteHackathon(id)
    console.log('✅ Hackathon deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Hackathon deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error in DELETE /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete hackathon' },
      { status: 500 }
    )
  }
}
