import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get hackathon by slug (id param is actually the slug)
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, company_id, clicks')
      .eq('slug', id)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    console.log('Tracking click for hackathon:', {
      hackathonId: hackathon.id,
      currentClicks: hackathon.clicks,
      newClicks: (hackathon.clicks || 0) + 1
    })

    // Increment click count using service role client to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: updatedHackathon, error: updateError } = await supabaseAdmin
      .from('hackathons')
      .update({ 
        clicks: (hackathon.clicks || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', hackathon.id)
      .select('clicks')
      .single()

    if (updateError) {
      console.error('Error updating click count:', updateError)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    console.log('Successfully updated click count to:', updatedHackathon?.clicks)

    // Update company analytics if hackathon has a company
    if (hackathon.company_id) {
      const today = new Date().toISOString().split('T')[0]

      // Upsert daily analytics
      const { error: analyticsError } = await supabase.rpc(
        'increment_company_analytics',
        {
          p_company_id: hackathon.company_id,
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
