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
    const existingHackathon = await hackathonsService.getHackathonBySlug(id)
    
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
    
    const hackathon = await hackathonsService.updateHackathon(id, hackathonData)
    
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
    const existingHackathon = await hackathonsService.getHackathonBySlug(id)
    
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
        { error: 'Unauthorized: You must be a company member or admin to delete this hackathon' },
        { status: 401 }
      )
    }
    
    await hackathonsService.deleteHackathon(id)
    
    return NextResponse.json({ message: 'Hackathon deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/hackathons/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete hackathon' },
      { status: 500 }
    )
  }
}
