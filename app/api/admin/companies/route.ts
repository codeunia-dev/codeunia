// API route for admin to list all companies
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CompanyFilters } from '@/types/company'

/**
 * GET /api/admin/companies
 * List all companies with filtering (admin only)
 * Query params: search, industry, company_size, verification_status, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters: CompanyFilters = {
      search: searchParams.get('search') || undefined,
      industry: searchParams.get('industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      verification_status: searchParams.get('verification_status') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    // Build query
    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size)
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status)
    }

    // Apply pagination
    query = query.range(
      filters.offset || 0,
      (filters.offset || 0) + (filters.limit || 20) - 1
    )

    const { data: companies, error, count } = await query

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        companies: companies || [],
        total: count || 0,
        hasMore: (count || 0) > (filters.offset || 0) + (filters.limit || 20),
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/companies:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
