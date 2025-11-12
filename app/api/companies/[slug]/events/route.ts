import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]/events
 * Get all events for a company
 * Public endpoint (returns only approved events for public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    // Get company
    const company = await companyService.getCompanyBySlug(slug)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      )
    }

    // Parse query parameters
    const status = searchParams.get('status') || 'approved'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check authentication for non-approved events
    let isCompanyMember = false
    const supabase = await createClient()
    
    if (status !== 'approved') {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: Authentication required to view non-approved events',
          },
          { status: 401 }
        )
      }

      // Check if user is a member of this company
      const { data: member } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', company.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!member) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Not a company member',
          },
          { status: 403 }
        )
      }

      isCompanyMember = true
    }

    // Try to get from cache (only for approved events)
    if (status === 'approved') {
      const cacheKey = `company:${slug}:events:${status}:${limit}:${offset}`
      const cached = await UnifiedCache.get(cacheKey)

      if (cached) {
        return UnifiedCache.createResponse(cached, 'API_STANDARD')
      }
    }

    // Fetch events
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .order('date', { ascending: true })
      .range(offset, offset + limit - 1)

    // Filter by approval status
    if (status === 'approved') {
      query = query.eq('approval_status', 'approved')
    } else if (status === 'all' && isCompanyMember) {
      // Return all events for company members
      // No filter needed
    } else if (isCompanyMember) {
      query = query.eq('approval_status', status)
    }

    const { data: events, error, count } = await query

    if (error) {
      console.error('Error fetching company events:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch events',
        },
        { status: 500 }
      )
    }

    const total = count || 0
    const hasMore = offset + limit < total

    const result = {
      events: events || [],
      total,
      hasMore,
    }

    // Cache the result (only for approved events)
    if (status === 'approved') {
      const cacheKey = `company:${slug}:events:${status}:${limit}:${offset}`
      await UnifiedCache.set(cacheKey, result, 'API_STANDARD')
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/events:', error)

    if (error instanceof CompanyError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        events: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    )
  }
}
