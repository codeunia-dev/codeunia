import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: replies } = await supabase
      .from('support_ticket_replies')
      .select('id, admin_id, message, created_at')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    const adminIds = [...new Set(replies?.map(r => r.admin_id) || [])]
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .in('id', adminIds)

    const repliesWithAdmins = replies?.map(reply => ({
      ...reply,
      admin: adminProfiles?.find(p => p.id === reply.admin_id) || null
    })) || []

    const ticketWithReplies = {
      ...ticket,
      replies: repliesWithAdmins
    }

    return NextResponse.json({ ticket: ticketWithReplies })
  } catch (error) {
    console.error('Error in GET ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
