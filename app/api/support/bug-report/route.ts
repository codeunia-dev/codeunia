import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Insert bug report into database
    const { error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        type: 'bug',
        subject: title,
        message: description,
        status: 'open',
      })

    if (insertError) {
      console.error('Error creating bug report:', insertError)
      return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Bug report submitted successfully' })
  } catch (error) {
    console.error('Error in bug report API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
