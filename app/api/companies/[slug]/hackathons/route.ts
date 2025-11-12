import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UnifiedCache } from '@/lib/unified-cache-system'

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
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Try to get from cache first
    const cacheKey = `company:${slug}:hackathons:${JSON.stringify({ search, limit, offset })}`
    const cached = await UnifiedCache.get(cacheKey)

    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD')
    }

    const supabase = await createClient()

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

    // Build the query for hackathons
    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .eq('approval_status', 'approved')
      .order('start_date', { ascending: false })

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

    // Cache the result
    await UnifiedCache.set(cacheKey, result, 'API_STANDARD')

    return UnifiedCache.createResponse(result, 'API_STANDARD')
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
