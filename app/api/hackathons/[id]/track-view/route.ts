import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get hackathon by slug (id param is actually the slug)
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, company_id, views')
      .eq('slug', id)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('hackathons')
      .update({ views: (hackathon.views || 0) + 1 })
      .eq('id', hackathon.id)

    if (updateError) {
      console.error('Error updating view count:', updateError)
      return NextResponse.json(
        { error: 'Failed to track view' },
        { status: 500 }
      )
    }

    // Update company analytics if hackathon has a company
    if (hackathon.company_id) {
      const today = new Date().toISOString().split('T')[0]

      // Upsert daily analytics
      const { error: analyticsError } = await supabase.rpc(
        'increment_company_analytics',
        {
          p_company_id: hackathon.company_id,
          p_date: today,
          p_field: 'total_views',
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
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
