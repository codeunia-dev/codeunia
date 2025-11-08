import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, getStatusUpdateEmail } from '@/lib/email/support-emails'

// GET single ticket
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

    // Get ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url')
      .eq('id', ticket.user_id)
      .single()

    // Get reply history
    const { data: replies } = await supabase
      .from('support_ticket_replies')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    // Get admin and user profiles for replies
    const adminIds = [...new Set(replies?.map(r => r.admin_id).filter(id => id) || [])]
    const userIds = [...new Set(replies?.map(r => r.user_id).filter(id => id) || [])]
    const allProfileIds = [...adminIds, ...userIds]
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url')
      .in('id', allProfileIds)

    // Map admin and user data to replies
    const repliesWithAuthors = replies?.map(reply => ({
      ...reply,
      admin: reply.admin_id ? profiles?.find(p => p.id === reply.admin_id) || null : null,
      user: reply.user_id ? profiles?.find(p => p.id === reply.user_id) || null : null
    })) || []

    // Combine ticket with user data and replies
    const ticketWithUser = {
      ...ticket,
      user: userProfile || null,
      replies: repliesWithAuthors
    }

    return NextResponse.json({ ticket: ticketWithUser })
  } catch (error) {
    console.error('Error in GET ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH update ticket status
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

    const { status: newStatus } = await request.json()

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current ticket to check old status
    const { data: currentTicket, error: currentTicketError } = await supabase
      .from('support_tickets')
      .select('status, user_id, subject')
      .eq('id', id)
      .single()

    if (currentTicketError) {
      console.error('Error fetching current ticket:', currentTicketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const oldStatus = currentTicket.status

    // Update ticket status
    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // Send email notification if status has changed
    if (newStatus !== oldStatus) {
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('id', currentTicket.user_id)
          .single()

        if (userProfile?.email) {
          const userName = userProfile.first_name || 'User'
          const { subject, html } = getStatusUpdateEmail({
            userName,
            ticketId: id,
            subject: currentTicket.subject,
            oldStatus,
            newStatus,
          })
          
          await sendEmail({
            to: userProfile.email,
            subject,
            html,
          })
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Do not fail the request if email fails, just log it
      }
    }

    return NextResponse.json({ ticket: updatedTicket, success: true })
  } catch (error) {
    console.error('Error in PATCH ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
