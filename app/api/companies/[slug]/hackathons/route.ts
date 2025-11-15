import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]/hackathons
 * Get all hackathons for a specific company
 * Public endpoint - only returns approved hackathons
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // First, get the company by slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .eq('verification_status', 'verified')
      .eq('status', 'active')
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
          hackathons: [],
          total: 0,
          hasMore: false,
        },
        { status: 404 }
      )
    }

    // Check if user is a member of the company
    let isCompanyMember = false
    if (user) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', company.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      if (membership) {
        isCompanyMember = true
      }
    }

    // Build the query for hackathons
    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)

    // If user is not a company member, only show approved hackathons
    if (!isCompanyMember) {
      query = query.eq('approval_status', 'approved')
    } else if (status === 'all') {
      // Company members can see all hackathons
      // No additional filter needed
    } else {
      // Default: show all for company members
      // No additional filter needed
    }

    query = query.order('date', { ascending: false })

    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: hackathons, error: hackathonsError, count } = await query

    if (hackathonsError) {
      console.error('Error fetching hackathons:', hackathonsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch hackathons',
          hackathons: [],
          total: 0,
          hasMore: false,
        },
        { status: 500 }
      )
    }

    const result = {
      success: true,
      hackathons: hackathons || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/hackathons:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        hackathons: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    )
  }
}
