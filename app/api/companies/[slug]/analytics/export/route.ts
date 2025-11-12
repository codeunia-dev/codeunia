import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if user is a member of the company
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Not authorized to view analytics' },
        { status: 403 }
      )
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('company_analytics')
      .select('*')
      .eq('company_id', company.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    // Convert to CSV format
    const csvHeaders = [
      'Date',
      'Events Created',
      'Events Published',
      'Hackathons Created',
      'Hackathons Published',
      'Total Views',
      'Total Clicks',
      'Total Registrations',
      'Total Participants',
      'Revenue Generated',
    ]

    const csvRows = analytics.map((row) => [
      row.date,
      row.events_created,
      row.events_published,
      row.hackathons_created,
      row.hackathons_published,
      row.total_views,
      row.total_clicks,
      row.total_registrations,
      row.total_participants,
      row.revenue_generated,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${company.name}-analytics-${startDate}-to-${endDate}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
