import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/support-emails'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  console.log('📧 Reply API called for ticket:', id)
  
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, first_name, last_name')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
    }

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError)
      return NextResponse.json({ error: 'Ticket not found', details: ticketError.message }, { status: 404 })
    }

    if (!ticket) {
      console.error('Ticket not found in database:', id)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get user information
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', ticket.user_id)
      .single()

    if (!userProfile?.email) {
      console.error('User email not found for ticket:', id)
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    console.log('✅ Ticket found:', { id: ticket.id, userEmail: userProfile.email })

    // Prepare email
    const userName = userProfile.first_name || userProfile.email.split('@')[0] || 'User'
    const adminName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Support Team'
    
    const emailHtml = getAdminReplyEmail({
      userName,
      adminName,
      ticketId: ticket.id,
      ticketSubject: ticket.subject,
      replyMessage: message
    })

    // Send email to user
    console.log('📧 Sending reply email to:', userProfile.email)
    
    const emailResult = await sendEmail({
      to: userProfile.email,
      subject: `Re: [Ticket #${ticket.id.substring(0, 8)}] ${ticket.subject}`,
      html: emailHtml
    })

    if (!emailResult.success) {
      console.error('❌ Failed to send reply email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send email', details: emailResult.error }, { status: 500 })
    }

    console.log('✅ Reply email sent successfully')

    // TODO: Save reply to database (for reply history)
    // This would go in a support_ticket_replies table

    return NextResponse.json({ 
      success: true, 
      message: 'Reply sent successfully' 
    })
  } catch (error) {
    console.error('Error in reply API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Email template for admin reply
function getAdminReplyEmail(params: {
  userName: string
  adminName: string
  ticketId: string
  ticketSubject: string
  replyMessage: string
}) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Response to your support ticket
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.userName},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      ${params.adminName} from our support team has responded to your ticket:
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Ticket ID: ${params.ticketId}
      </p>
      <p style="margin: 0 0 5px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.ticketSubject}
      </p>
    </div>
    
    <div style="background-color: #eff6ff; border: 1px solid #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        ${params.adminName} replied:
      </p>
      <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
        ${params.replyMessage}
      </p>
    </div>
    
    <p style="margin: 20px 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      If you have any follow-up questions, please reply to this email or create a new ticket.
    </p>
    
    <a href="https://codeunia.com/protected/help" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      View Help Center
    </a>
  `
  
  return getEmailTemplate(content)
}

// Base email template
function getEmailTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codeunia Support</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Codeunia Support</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Need help? Reply to this email or visit our <a href="https://codeunia.com/protected/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Codeunia. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
