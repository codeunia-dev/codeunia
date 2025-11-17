// API route for approving events
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { moderationService, ModerationError } from '@/lib/services/moderation-service'
import { sendEmail } from '@/lib/email/support-emails'

/**
 * POST /api/admin/moderation/events/[id]/approve
 * Approve an event
 * Requires: Platform admin access
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withPlatformAdmin(async (req: NextRequest, user) => {
    try {
      const params = await context.params
      const eventId = parseInt(params.id)
      if (isNaN(eventId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid event ID' },
          { status: 400 }
        )
      }

      // Parse request body for optional notes
      let notes: string | undefined
      try {
        const body = await req.json()
        notes = body.notes
      } catch {
        // Body is optional
      }

      // Approve the event
      const approvedEvent = await moderationService.approveEvent(
        eventId,
        user.id,
        notes
      )

      // Get creator's email from profiles table
      let creatorEmail: string | null = null
      let creatorName: string | null = null
      
      if (approvedEvent.created_by) {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', approvedEvent.created_by)
          .single()
        
        if (creatorProfile) {
          creatorEmail = creatorProfile.email
          creatorName = creatorProfile.first_name 
            ? `${creatorProfile.first_name} ${creatorProfile.last_name || ''}`.trim()
            : null
        }
      }

      // Prepare email content
      const emailContent = getEventApprovedEmail({
        eventTitle: approvedEvent.title,
        companyName: approvedEvent.company?.name || 'Your Company',
        eventUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/events/${approvedEvent.slug}`,
        publishDate: new Date().toLocaleDateString(),
        notes: notes || '',
        creatorName: creatorName || undefined,
      })

      // Send notification email to event creator (primary)
      if (creatorEmail) {
        console.log(`📧 Sending event approval email to creator: ${creatorEmail}`)
        await sendEmail({
          to: creatorEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch(error => {
          console.error('❌ Failed to send approval email to creator:', error)
        })
      }

      // Also send to company email if different from creator
      if (approvedEvent.company?.email && approvedEvent.company.email !== creatorEmail) {
        console.log(`📧 Sending event approval email to company: ${approvedEvent.company.email}`)
        await sendEmail({
          to: approvedEvent.company.email,
          subject: emailContent.subject,
          html: emailContent.html,
        }).catch(error => {
          console.error('❌ Failed to send approval email to company:', error)
        })
      }

      return NextResponse.json({
        success: true,
        data: approvedEvent,
        message: 'Event approved successfully',
      })
    } catch (error) {
      console.error('Error approving event:', error)

      if (error instanceof ModerationError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to approve event',
        },
        { status: 500 }
      )
    }
  })(request)
}

// Email template for event approval
function getEventApprovedEmail(params: {
  eventTitle: string
  companyName: string
  eventUrl: string
  publishDate: string
  notes: string
  creatorName?: string
}) {
  const greeting = params.creatorName ? `Hi ${params.creatorName},` : 'Hello,'
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 Your Event is Live!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      ${greeting}
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Great news! Your event has been approved and is now live on CodeUnia.
    </p>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.eventTitle}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Published on ${params.publishDate}
      </p>
    </div>
    
    ${params.notes ? `
      <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
          Admin Notes
        </p>
        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
          ${params.notes}
        </p>
      </div>
    ` : ''}
    
    <p style="margin: 20px 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>What's next?</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Your event is now visible to all CodeUnia users</li>
      <li>Participants can register for your event</li>
      <li>You'll receive notifications when users register</li>
      <li>Track your event performance in the dashboard</li>
    </ul>
    
    <a href="${params.eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 10px 10px 10px 0;">
      View Event
    </a>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/dashboard/company" style="display: inline-block; background-color: #f3f4f6; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 10px 0;">
      Go to Dashboard
    </a>
  `
  
  const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Approved - CodeUnia</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">CodeUnia</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Need help? Visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/protected/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} CodeUnia. All rights reserved.
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

  return {
    subject: `🎉 Your Event "${params.eventTitle}" is Now Live!`,
    html: getEmailTemplate(content),
  }
}
