import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStatusUpdateEmail, sendEmail } from '@/lib/email/support-emails'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Fetch user information
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url')
      .eq('id', ticket.user_id)
      .single()

    const ticketWithUser = {
      ...ticket,
      user: userProfile || null
    }

    return NextResponse.json({ ticket: ticketWithUser })
  } catch (error) {
    console.error('Error in ticket detail API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status } = await request.json()

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current ticket to check old status
    const { data: currentTicket } = await supabase
      .from('support_tickets')
      .select('*, user:profiles!user_id(email, first_name, last_name)')
      .eq('id', id)
      .single()

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const oldStatus = currentTicket.status

    // Update ticket status
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // Send status update email to user (only if status actually changed)
    if (oldStatus !== status && currentTicket.user) {
      const userName = currentTicket.user.first_name || currentTicket.user.email?.split('@')[0] || 'User'
      const userEmail = currentTicket.user.email || ''
      
      const statusEmail = getStatusUpdateEmail({
        userName,
        ticketId: ticket.id,
        subject: ticket.subject,
        oldStatus,
        newStatus: status
      })
      
      await sendEmail({
        to: userEmail,
        subject: statusEmail.subject,
        html: statusEmail.html
      })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in ticket update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
