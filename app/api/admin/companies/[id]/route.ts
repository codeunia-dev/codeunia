// API route for admin to get company details
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/companies/[id]
 * Get company details including verification documents (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: companyId } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is platform admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()
    
    if (companyError || !company) {
      console.error('Error fetching company:', companyError)
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get verified_by profile if exists
    let verified_by_profile = null
    if (company.verified_by) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('id', company.verified_by)
        .single()
      verified_by_profile = profile
    }

    // Get company members count
    const { count: membersCount } = await supabase
      .from('company_members')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Get events count
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Get hackathons count
    const { count: hackathonsCount } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Add counts and profile data to company
    const companyWithStats = {
      ...company,
      verified_by_profile,
      stats: {
        members: membersCount || 0,
        events: eventsCount || 0,
        hackathons: hackathonsCount || 0,
      },
    }

    return NextResponse.json({
      success: true,
      company: companyWithStats,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/companies/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/companies/[id]
 * Update company details (admin only)
 * Body: Partial<Company>
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: companyId } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is platform admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id: _id,
      slug: _slug,
      created_at: _created_at,
      created_by: _created_by,
      verified_at: _verified_at,
      verified_by: _verified_by,
      ...updateData
    } = body
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update company
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update company' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Company updated successfully',
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/admin/companies/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/companies/[id]
 * Delete or suspend a company (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: companyId } = await params

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is platform admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Soft delete by updating status
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error deleting company:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete company' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Company deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/companies/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
