import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, getAdminReplyEmail, getSupportTeamNotificationEmail } from '@/lib/email/support-emails'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, first_name, last_name, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (profile.is_admin) {
      // Admin reply logic
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', ticket.user_id)
        .single()

      if (!userProfile?.email) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 })
      }

      const userName = userProfile.first_name || 'User'
      const adminName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Support Team'
      
      const { subject, html } = getAdminReplyEmail({
        userName,
        adminName,
        ticketId: ticket.id,
        ticketSubject: ticket.subject,
        replyMessage: message
      })

      await sendEmail({
        to: userProfile.email,
        subject,
        html,
      })

      const { data: reply, error: replyError } = await supabase
        .from('support_ticket_replies')
        .insert({
          ticket_id: ticket.id,
          admin_id: user.id,
          message: message.trim()
        })
        .select()
        .single()

      if (replyError) {
        console.error('Error saving admin reply:', replyError)
        return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 })
      }

      return NextResponse.json({ success: true, reply })

    } else {
      // User reply logic
      if (ticket.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const supportEmail = process.env.SUPPORT_EMAIL
      if (supportEmail) {
        const { subject, html } = getSupportTeamNotificationEmail({
          ticketId: ticket.id,
          ticketType: ticket.type,
          subject: `New reply on: ${ticket.subject}`,
          message,
          userEmail: profile.email,
          userName: profile.first_name || 'User',
        })
        await sendEmail({
          to: supportEmail,
          subject,
          html,
        })
      }

      const { data: reply, error: replyError } = await supabase
        .from('support_ticket_replies')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message: message.trim()
        })
        .select()
        .single()

      if (replyError) {
        console.error('Error saving user reply:', replyError)
        return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 })
      }

      return NextResponse.json({ success: true, reply })
    }
  } catch (error) {
    console.error('Error in POST ticket reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
