// API route for rejecting events
import { NextRequest, NextResponse } from 'next/server'
import { withPlatformAdmin } from '@/lib/services/authorization-service'
import { moderationService, ModerationError } from '@/lib/services/moderation-service'
import { sendEmail } from '@/lib/email/support-emails'

/**
 * POST /api/admin/moderation/events/[id]/reject
 * Reject an event
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

      // Parse request body for required reason
      let reason: string
      try {
        const body = await req.json()
        reason = body.reason

        if (!reason || reason.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid request body' },
          { status: 400 }
        )
      }

      // Reject the event
      const rejectedEvent = await moderationService.rejectEvent(
        eventId,
        user.id,
        reason
      )

      // Send notification email to company
      if (rejectedEvent.company && rejectedEvent.company.email) {
        const emailContent = getEventRejectedEmail({
          eventTitle: rejectedEvent.title,
          companyName: rejectedEvent.company.name,
          rejectionReason: reason,
          editUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/dashboard/company/events/${rejectedEvent.slug}/edit`,
          guidelines: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/guidelines`,
        })

        await sendEmail({
          to: rejectedEvent.company.email,
          subject: emailContent.subject,
          html: emailContent.html,
        })
      }

      return NextResponse.json({
        success: true,
        data: rejectedEvent,
        message: 'Event rejected successfully',
      })
    } catch (error) {
      console.error('Error rejecting event:', error)

      if (error instanceof ModerationError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to reject event',
        },
        { status: 500 }
      )
    }
  })(request)
}

// Email template for event rejection
function getEventRejectedEmail(params: {
  eventTitle: string
  companyName: string
  rejectionReason: string
  editUrl: string
  guidelines: string
}) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Event Review Update
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for submitting your event to CodeUnia. After review, we're unable to approve your event at this time.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #111827; font-size: 16px; font-weight: 600;">
        ${params.eventTitle}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Status: Rejected
      </p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
        Reason for Rejection
      </p>
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
        ${params.rejectionReason}
      </p>
    </div>
    
    <p style="margin: 20px 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>What you can do:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Review our <a href="${params.guidelines}" style="color: #3b82f6; text-decoration: none;">event guidelines</a></li>
      <li>Make the necessary changes to your event</li>
      <li>Resubmit your event for review</li>
      <li>Contact support if you have questions</li>
    </ul>
    
    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      We want to help you succeed! If you need clarification on the rejection reason or assistance with your event, please don't hesitate to reach out to our support team.
    </p>
    
    <a href="${params.editUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 10px 10px 10px 0;">
      Edit Event
    </a>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/protected/help" style="display: inline-block; background-color: #f3f4f6; color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 10px 0;">
      Contact Support
    </a>
  `
  
  const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Review Update - CodeUnia</title>
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
    subject: `Event Review Update: "${params.eventTitle}"`,
    html: getEmailTemplate(content),
  }
}
