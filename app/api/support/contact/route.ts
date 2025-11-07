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

    const { subject, message } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Insert contact request into database
    const { error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        type: 'contact',
        subject,
        message,
        status: 'open',
      })

    if (insertError) {
      console.error('Error creating support ticket:', insertError)
      return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Contact request submitted successfully' })
  } catch (error) {
    console.error('Error in contact API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
