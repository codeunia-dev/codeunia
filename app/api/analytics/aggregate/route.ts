import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint should be called by a cron job daily
// In production, use Vercel Cron Jobs or similar service
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (e.g., cron job)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get yesterday's date (we aggregate the previous day's data)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]

    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .eq('status', 'active')

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    const results = []

    // Aggregate data for each company
    for (const company of companies) {
      try {
        // Get events created yesterday
        const { count: eventsCreated } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        // Get events published yesterday (approved)
        const { count: eventsPublished } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('approval_status', 'approved')
          .gte('approved_at', `${dateStr}T00:00:00`)
          .lt('approved_at', `${dateStr}T23:59:59`)

        // Get hackathons created yesterday
        const { count: hackathonsCreated } = await supabase
          .from('hackathons')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        // Get hackathons published yesterday
        const { count: hackathonsPublished } = await supabase
          .from('hackathons')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .eq('approval_status', 'approved')
          .gte('approved_at', `${dateStr}T00:00:00`)
          .lt('approved_at', `${dateStr}T23:59:59`)

        // Update or insert analytics record
        // Note: views, clicks, and registrations are already tracked in real-time
        // This aggregation is mainly for events/hackathons created/published counts
        const { error: upsertError } = await supabase
          .from('company_analytics')
          .upsert(
            {
              company_id: company.id,
              date: dateStr,
              events_created: eventsCreated || 0,
              events_published: eventsPublished || 0,
              hackathons_created: hackathonsCreated || 0,
              hackathons_published: hackathonsPublished || 0,
            },
            {
              onConflict: 'company_id,date',
              ignoreDuplicates: false,
            }
          )

        if (upsertError) {
          console.error(
            `Error upserting analytics for company ${company.id}:`,
            upsertError
          )
        } else {
          results.push({
            company_id: company.id,
            date: dateStr,
            success: true,
          })
        }
      } catch (error) {
        console.error(
          `Error processing company ${company.id}:`,
          error
        )
        results.push({
          company_id: company.id,
          date: dateStr,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Error in analytics aggregation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow GET for testing purposes (remove in production)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  // Run the aggregation
  return POST(request)
}
