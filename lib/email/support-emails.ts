// Email templates and sending functions for support tickets

interface EmailParams {
  to: string
  subject: string
  html: string
}

// Base email template
const getEmailTemplate = (content: string) => `
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

// 1. User confirmation email
export const getUserConfirmationEmail = (params: {
  userName: string
  ticketId: string
  ticketType: 'contact' | 'bug'
  subject: string
  message: string
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      We've received your ${params.ticketType === 'bug' ? 'bug report' : 'support request'}
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.userName},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for contacting Codeunia Support. We've received your ${params.ticketType === 'bug' ? 'bug report' : 'message'} and our team will review it shortly.
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Ticket ID: ${params.ticketId}
      </p>
      <p style="margin: 0 0 5px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.subject}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
        ${params.message.substring(0, 200)}${params.message.length > 200 ? '...' : ''}
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>What happens next?</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Our support team will review your ${params.ticketType === 'bug' ? 'report' : 'request'}</li>
      <li>You'll receive updates via email as we work on it</li>
      <li>Average response time: 24-48 hours</li>
    </ul>
    
    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      You can track your ticket status in your <a href="https://codeunia.com/protected/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>.
    </p>
  `
  
  return {
    subject: `[Ticket #${params.ticketId.substring(0, 8)}] We've received your ${params.ticketType === 'bug' ? 'bug report' : 'support request'}`,
    html: getEmailTemplate(content)
  }
}

// 2. Support team notification email
export const getSupportTeamNotificationEmail = (params: {
  ticketId: string
  ticketType: 'contact' | 'bug'
  subject: string
  message: string
  userEmail: string
  userName: string
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      New ${params.ticketType === 'bug' ? 'Bug Report' : 'Support Ticket'}
    </h2>
    
    <div style="background-color: ${params.ticketType === 'bug' ? '#fef2f2' : '#eff6ff'}; border-left: 4px solid ${params.ticketType === 'bug' ? '#ef4444' : '#3b82f6'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Ticket ID: ${params.ticketId}
      </p>
      <p style="margin: 0 0 5px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.subject}
      </p>
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
        ${params.message}
      </p>
    </div>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">
          <strong>From:</strong>
        </td>
        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
          ${params.userName} (${params.userEmail})
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
          <strong>Type:</strong>
        </td>
        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
          ${params.ticketType === 'bug' ? 'Bug Report' : 'Support Request'}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
          <strong>Status:</strong>
        </td>
        <td style="padding: 8px 0; color: #111827; font-size: 14px;">
          <span style="background-color: #fef2f2; color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">OPEN</span>
        </td>
      </tr>
    </table>
    
    <a href="https://codeunia.com/admin/support/${params.ticketId}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      View Ticket in Admin Panel
    </a>
  `
  
  return {
    subject: `[New Ticket] ${params.ticketType === 'bug' ? '🐛 Bug Report' : '💬 Support Request'}: ${params.subject}`,
    html: getEmailTemplate(content)
  }
}

// 3. Status update email to user
export const getStatusUpdateEmail = (params: {
  userName: string
  ticketId: string
  subject: string
  oldStatus: string
  newStatus: string
}) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: '#fef2f2', text: '#ef4444' },
    in_progress: { bg: '#fef3c7', text: '#f59e0b' },
    resolved: { bg: '#d1fae5', text: '#10b981' },
    closed: { bg: '#f3f4f6', text: '#6b7280' }
  }
  
  const statusColor = statusColors[params.newStatus] || statusColors.open
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Your ticket status has been updated
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.userName},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      We wanted to let you know that your support ticket has been updated.
    </p>
    
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        Ticket ID: ${params.ticketId}
      </p>
      <p style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.subject}
      </p>
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
        Status changed from:
      </p>
      <p style="margin: 0;">
        <span style="background-color: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 4px; font-size: 14px; text-transform: capitalize;">
          ${params.oldStatus.replace('_', ' ')}
        </span>
        <span style="margin: 0 10px; color: #6b7280;">→</span>
        <span style="background-color: ${statusColor.bg}; color: ${statusColor.text}; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; text-transform: capitalize;">
          ${params.newStatus.replace('_', ' ')}
        </span>
      </p>
    </div>
    
    ${params.newStatus === 'resolved' || params.newStatus === 'closed' ? `
      <p style="margin: 20px 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
        ${params.newStatus === 'resolved' ? 'We believe this issue has been resolved. If you still need assistance, please reply to this email.' : 'This ticket has been closed. If you need further assistance, feel free to create a new ticket.'}
      </p>
    ` : ''}
    
    <a href="https://codeunia.com/protected/help" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      View Ticket Details
    </a>
  `
  
  return {
    subject: `[Ticket #${params.ticketId.substring(0, 8)}] Status Updated: ${params.newStatus.replace('_', ' ')}`,
    html: getEmailTemplate(content)
  }
}

// Send email function using Resend
export async function sendEmail(params: EmailParams) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent:', {
        to: params.to,
        subject: params.subject,
      })
      return { success: false, error: 'Email service not configured' }
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const { data, error } = await resend.emails.send({
      from: process.env.SUPPORT_FROM_EMAIL || 'Codeunia Support <support@codeunia.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    if (error) {
      console.error('❌ Failed to send email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Email sent successfully:', {
      to: params.to,
      subject: params.subject,
      id: data?.id
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error: String(error) }
  }
}
