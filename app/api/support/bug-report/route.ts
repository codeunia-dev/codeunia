import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserConfirmationEmail, getSupportTeamNotificationEmail, sendEmail } from '@/lib/email/support-emails'

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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single()

    // Insert bug report into database
    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        type: 'bug',
        subject: title,
        message: description,
        status: 'open',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating bug report:', insertError)
      return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 })
    }

    // Send confirmation email to user
    const userName = profile?.first_name || profile?.email?.split('@')[0] || 'User'
    const userEmail = profile?.email || user.email || ''
    
    const confirmationEmail = getUserConfirmationEmail({
      userName,
      ticketId: ticket.id,
      ticketType: 'bug',
      subject: title,
      message: description
    })
    
    await sendEmail({
      to: userEmail,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html
    })

    // Send notification to support team
    const supportEmail = getSupportTeamNotificationEmail({
      ticketId: ticket.id,
      ticketType: 'bug',
      subject: title,
      message: description,
      userEmail,
      userName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || userName
    })
    
    // Get support email(s) - can be comma-separated for multiple recipients
    const supportEmailAddress = process.env.SUPPORT_EMAIL
    
    if (!supportEmailAddress) {
      console.warn('⚠️ SUPPORT_EMAIL not configured in environment variables')
    } else {
      console.log('📧 Sending support team notification to:', supportEmailAddress)
      
      const supportEmailResult = await sendEmail({
        to: supportEmailAddress,
        subject: supportEmail.subject,
        html: supportEmail.html
      })
      
      if (!supportEmailResult.success) {
        console.error('⚠️ Failed to send support team notification:', supportEmailResult.error)
      }
    }

    return NextResponse.json({ success: true, message: 'Bug report submitted successfully' })
  } catch (error) {
    console.error('Error in bug report API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
