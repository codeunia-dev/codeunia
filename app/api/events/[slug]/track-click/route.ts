import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    // Get event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, company_id, clicks')
      .eq('slug', slug)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Increment click count
    const { error: updateError } = await supabase
      .from('events')
      .update({ clicks: (event.clicks || 0) + 1 })
      .eq('id', event.id)

    if (updateError) {
      console.error('Error updating click count:', updateError)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    // Update company analytics if event has a company
    if (event.company_id) {
      const today = new Date().toISOString().split('T')[0]

      // Upsert daily analytics
      const { error: analyticsError } = await supabase.rpc(
        'increment_company_analytics',
        {
          p_company_id: event.company_id,
          p_date: today,
          p_field: 'total_clicks',
          p_increment: 1
        }
      )

      if (analyticsError) {
        console.error('Error updating company analytics:', analyticsError)
        // Don't fail the request if analytics update fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
