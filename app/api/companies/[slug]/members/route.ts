import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]/members
 * Get all team members of a company
 * Requires authentication and company membership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

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

    // Check if user is a member of this company
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Must be a company member to view team',
        },
        { status: 403 }
      )
    }

    // Try to get from cache first
    const cacheKey = `company:${company.id}:members`
    const cached = await UnifiedCache.get(cacheKey)

    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD')
    }

    // Get all company members
    const members = await companyMemberService.getCompanyMembers(company.id)

    // Cache the result
    await UnifiedCache.set(cacheKey, { members }, 'API_STANDARD')

    return UnifiedCache.createResponse(
      {
        success: true,
        members,
      },
      'API_STANDARD'
    )
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/members:', error)

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
      },
      { status: 500 }
    )
  }
}
