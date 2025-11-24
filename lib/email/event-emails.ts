// Email templates for event registration notifications

import { Resend } from 'resend'

interface EmailParams {
    to: string
    subject: string
    html: string
}

// Base email template matching existing Codeunia style
const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codeunia</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Codeunia</h1>
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
                Need help? Contact us at <a href="mailto:support@codeunia.com" style="color: #3b82f6; text-decoration: none;">support@codeunia.com</a>
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

// User confirmation email template
export const getEventRegistrationConfirmationEmail = (params: {
    userName: string
    eventTitle: string
    eventDate: string
    eventTime: string
    eventLocation: string
    eventSlug: string
    organizer?: string
}) => {
    const eventUrl = `https://codeunia.com/events/${params.eventSlug}`
    const calendarUrl = `https://codeunia.com/events/${params.eventSlug}/calendar`

    const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      ✅ Registration Confirmed!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.userName},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Great news! You're successfully registered for <strong>${params.eventTitle}</strong>.
    </p>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        ✓ Your registration is confirmed<br>
        ✓ You'll receive event updates via email<br>
        ✓ Add this event to your calendar
      </p>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Event Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">
            <strong>📅 Date:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${new Date(params.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>🕐 Time:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.eventTime}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>📍 Location:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.eventLocation}
          </td>
        </tr>
        ${params.organizer ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>👤 Organizer:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.organizer}
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${calendarUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-right: 10px;">
        📅 Add to Calendar
      </a>
      <a href="${eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
        View Event Details
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 14px;">📝 What's Next?</h4>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
        <li>Mark your calendar for ${new Date(params.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</li>
        <li>Check your email for event updates and reminders</li>
        <li>Prepare any materials or questions for the event</li>
        <li>Join our community to connect with other attendees</li>
      </ul>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      Looking forward to seeing you at the event!
    </p>
    
    <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">
      Best regards,<br>
      <strong>Codeunia Team</strong>
    </p>
  `

    return {
        subject: `✅ Registration Confirmed: ${params.eventTitle}`,
        html: getEmailTemplate(content)
    }
}

// Organizer notification email template
export const getEventOrganizerNotificationEmail = (params: {
    eventTitle: string
    eventSlug: string
    participantName: string
    participantEmail: string
    currentRegistrations: number
    capacity: number
}) => {
    const eventUrl = `https://codeunia.com/events/${params.eventSlug}`
    const dashboardUrl = `https://codeunia.com/dashboard/company`
    const registrationsUrl = `${eventUrl}/registrations`

    const percentageFilled = Math.round((params.currentRegistrations / params.capacity) * 100)

    const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 New Event Registration!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Great news! Someone just registered for your event <strong>${params.eventTitle}</strong>.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">Participant Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">
            <strong>Name:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.participantName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Email:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            <a href="mailto:${params.participantEmail}" style="color: #3b82f6; text-decoration: none;">${params.participantEmail}</a>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px;">Registration Status</h3>
      <p style="margin: 0 0 10px 0; color: #065f46; font-size: 24px; font-weight: bold;">
        ${params.currentRegistrations} / ${params.capacity}
      </p>
      <div style="background-color: #ffffff; border-radius: 4px; height: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: ${percentageFilled}%;"></div>
      </div>
      <p style="margin: 10px 0 0 0; color: #065f46; font-size: 14px;">
        ${percentageFilled}% filled • ${params.capacity - params.currentRegistrations} spots remaining
      </p>
    </div>
    
    ${percentageFilled >= 80 ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        ⚠️ <strong>Almost Full!</strong> Your event is ${percentageFilled}% full. Consider increasing capacity or preparing a waitlist.
      </p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${registrationsUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-right: 10px;">
        View All Registrations
      </a>
      <a href="${dashboardUrl}" style="display: inline-block; background: #6b7280; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
        Go to Dashboard
      </a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      Keep up the great work! Your event is attracting interest.
    </p>
  `

    return {
        subject: `🎉 New Registration: ${params.eventTitle} (${params.currentRegistrations}/${params.capacity})`,
        html: getEmailTemplate(content)
    }
}

// Send event registration emails
export async function sendEventRegistrationEmails(params: {
    userEmail: string
    userName: string
    event: {
        title: string
        date: string
        time: string
        location: string
        slug: string
        organizer?: string
        capacity?: number
        registered?: number
        organizerEmail?: string
    }
    registrationId: string
}) {
    try {
        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ RESEND_API_KEY not configured. Emails not sent:', {
                userEmail: params.userEmail,
                eventTitle: params.event.title,
            })
            return { success: false, error: 'Email service not configured' }
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        // Send confirmation email to user
        const confirmationTemplate = getEventRegistrationConfirmationEmail({
            userName: params.userName,
            eventTitle: params.event.title,
            eventDate: params.event.date,
            eventTime: params.event.time,
            eventLocation: params.event.location,
            eventSlug: params.event.slug,
            organizer: params.event.organizer
        })

        const { data: confirmationData, error: confirmationError } = await resend.emails.send({
            from: 'Codeunia <connect@codeunia.com>',
            to: params.userEmail,
            subject: confirmationTemplate.subject,
            html: confirmationTemplate.html,
        })

        if (confirmationError) {
            console.error('❌ Failed to send confirmation email:', confirmationError)
        } else {
            console.log('✅ Confirmation email sent:', {
                to: params.userEmail,
                eventTitle: params.event.title,
                id: confirmationData?.id
            })
        }

        // Send notification to organizer (if email is available)
        if (params.event.organizerEmail && params.event.capacity && params.event.registered !== undefined) {
            const organizerTemplate = getEventOrganizerNotificationEmail({
                eventTitle: params.event.title,
                eventSlug: params.event.slug,
                participantName: params.userName,
                participantEmail: params.userEmail,
                currentRegistrations: params.event.registered,
                capacity: params.event.capacity
            })

            const { data: organizerData, error: organizerError } = await resend.emails.send({
                from: 'Codeunia <connect@codeunia.com>',
                to: params.event.organizerEmail,
                subject: organizerTemplate.subject,
                html: organizerTemplate.html,
            })

            if (organizerError) {
                console.error('❌ Failed to send organizer notification:', organizerError)
            } else {
                console.log('✅ Organizer notification sent:', {
                    to: params.event.organizerEmail,
                    eventTitle: params.event.title,
                    id: organizerData?.id
                })
            }
        }

        return {
            success: true,
            confirmationSent: !confirmationError,
            organizerNotified: params.event.organizerEmail ? !confirmationError : false
        }
    } catch (error) {
        console.error('❌ Error sending event registration emails:', error)
        return { success: false, error: String(error) }
    }
}

// Send email function (generic)
export async function sendEventEmail(params: EmailParams) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('⚠️ RESEND_API_KEY not configured. Email not sent:', {
                to: params.to,
                subject: params.subject,
            })
            return { success: false, error: 'Email service not configured' }
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: 'Codeunia <connect@codeunia.com>',
            to: params.to,
            subject: params.subject,
            html: params.html,
        })

        if (error) {
            console.error('❌ Failed to send event email:', error)
            return { success: false, error: error.message }
        }

        console.log('✅ Event email sent successfully:', {
            to: params.to,
            subject: params.subject,
            id: data?.id
        })

        return { success: true, data }
    } catch (error) {
        console.error('❌ Error sending event email:', error)
        return { success: false, error: String(error) }
    }
}
