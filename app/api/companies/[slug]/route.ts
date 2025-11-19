import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]
 * Get company profile by slug
 * Public endpoint for verified companies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Try to get from cache first
    const cacheKey = `company:${slug}`
    const cached = await UnifiedCache.get(cacheKey)

    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD')
    }

    // Fetch company
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

    // Only show verified companies to public
    if (company.verification_status !== 'verified') {
      // Check if user is a member of this company
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const member = await companyMemberService.checkMembership(user.id, company.id)
        if (!member) {
          return NextResponse.json(
            {
              success: false,
              error: 'Company not found',
            },
            { status: 404 }
          )
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Company not found',
          },
          { status: 404 }
        )
      }
    }

    // Get count of approved events and hackathons for this company
    const supabase = await createClient()
    const { count: approvedEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('approval_status', 'approved')

    const { count: approvedHackathonsCount } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('approval_status', 'approved')

    // Get total participants from events
    const { data: events } = await supabase
      .from('events')
      .select('registered')
      .eq('company_id', company.id)
      .eq('approval_status', 'approved')

    // Get total participants from hackathons
    const { data: hackathons } = await supabase
      .from('hackathons')
      .select('registered')
      .eq('company_id', company.id)
      .eq('approval_status', 'approved')

    const eventParticipants = events?.reduce((sum, event) => sum + (event.registered || 0), 0) || 0
    const hackathonParticipants = hackathons?.reduce((sum, hackathon) => sum + (hackathon.registered || 0), 0) || 0

    // Add calculated fields to company object
    const enrichedCompany = {
      ...company,
      approved_events_count: approvedEventsCount || 0,
      approved_hackathons_count: approvedHackathonsCount || 0,
      total_participants: eventParticipants + hackathonParticipants,
    }

    // Cache the result
    await UnifiedCache.set(cacheKey, { company: enrichedCompany }, 'API_STANDARD')

    return UnifiedCache.createResponse({ company: enrichedCompany }, 'API_STANDARD')
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]:', error)

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

/**
 * PUT /api/companies/[slug]
 * Update company profile
 * Requires authentication and company owner/admin role
 */
export async function PUT(
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
        { error: 'Unauthorized: Authentication required' },
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

    // Check if user is owner or admin
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner or admin role required',
        },
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
      verification_status: _verification_status,
      verified_at: _verified_at,
      verified_by: _verified_by,
      subscription_tier: _subscription_tier,
      subscription_status: _subscription_status,
      subscription_started_at: _subscription_started_at,
      subscription_expires_at: _subscription_expires_at,
      total_events: _total_events,
      total_hackathons: _total_hackathons,
      total_participants: _total_participants,
      ...updateData
    } = body
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Update company
    const updatedCompany = await companyService.updateCompany(company.id, updateData)

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: 'Company updated successfully',
        company: updatedCompany,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PUT /api/companies/[slug]:', error)

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

/**
 * DELETE /api/companies/[slug]
 * Delete (soft delete) a company
 * Requires authentication and company owner role
 */
export async function DELETE(
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
        { error: 'Unauthorized: Authentication required' },
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

    // Check if user is owner
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member || member.role !== 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner role required',
        },
        { status: 403 }
      )
    }

    // Delete company (soft delete)
    await companyService.deleteCompany(company.id)

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: 'Company deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/companies/[slug]:', error)

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
