import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]/analytics
 * Get company analytics for a date range
 * Requires authentication and company membership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

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

    // Check if user is a member of this company
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Not a company member',
        },
        { status: 403 }
      )
    }

    // Parse date range from query parameters
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')

    // Default to last 30 days if not provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        },
        { status: 400 }
      )
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Start date must be before end date',
        },
        { status: 400 }
      )
    }

    // Fetch analytics
    const analytics = await companyService.getCompanyAnalytics(
      company.id,
      startDate,
      endDate
    )

    // Calculate summary statistics
    const summary = analytics.reduce(
      (acc, record) => ({
        total_events_created: acc.total_events_created + record.events_created,
        total_events_published: acc.total_events_published + record.events_published,
        total_hackathons_created: acc.total_hackathons_created + record.hackathons_created,
        total_hackathons_published:
          acc.total_hackathons_published + record.hackathons_published,
        total_views: acc.total_views + record.total_views,
        total_clicks: acc.total_clicks + record.total_clicks,
        total_registrations: acc.total_registrations + record.total_registrations,
        total_participants: acc.total_participants + record.total_participants,
        total_revenue: acc.total_revenue + parseFloat(record.revenue_generated.toString()),
      }),
      {
        total_events_created: 0,
        total_events_published: 0,
        total_hackathons_created: 0,
        total_hackathons_published: 0,
        total_views: 0,
        total_clicks: 0,
        total_registrations: 0,
        total_participants: 0,
        total_revenue: 0,
      }
    )

    return NextResponse.json(
      {
        success: true,
        analytics,
        summary,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/analytics:', error)

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
