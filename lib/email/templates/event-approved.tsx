// Event approved email template

interface EventApprovedParams {
  eventTitle: string
  eventDate: string
  companyName: string
  eventUrl: string
  dashboardUrl: string
  notes?: string
}

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeUnia</title>
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
                Need help? Contact us at <a href="mailto:support@codeunia.com" style="color: #3b82f6; text-decoration: none;">support@codeunia.com</a>
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

export const getEventApprovedEmail = (params: EventApprovedParams) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 Your Event Has Been Approved!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Great news! Your event <strong>${params.eventTitle}</strong> has been approved and is now live on CodeUnia.
    </p>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        ✓ Your event is now visible to the community<br>
        ✓ Participants can register for your event<br>
        ✓ Event analytics are being tracked<br>
        ✓ You'll receive notifications for new registrations
      </p>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        Event Details:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 5px 0; color: #6b7280; font-size: 14px; width: 100px;">
            <strong>Event:</strong>
          </td>
          <td style="padding: 5px 0; color: #111827; font-size: 14px;">
            ${params.eventTitle}
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">
            <strong>Date:</strong>
          </td>
          <td style="padding: 5px 0; color: #111827; font-size: 14px;">
            ${params.eventDate}
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #6b7280; font-size: 14px;">
            <strong>Company:</strong>
          </td>
          <td style="padding: 5px 0; color: #111827; font-size: 14px;">
            ${params.companyName}
          </td>
        </tr>
      </table>
    </div>
    
    ${
      params.notes
        ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px; font-weight: 600;">
        📝 Note from our team:
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        ${params.notes}
      </p>
    </div>
    `
        : ''
    }
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>Next Steps to Maximize Your Event:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Share your event link on social media</li>
      <li>Monitor registrations in your dashboard</li>
      <li>Engage with participants through event updates</li>
      <li>Track analytics to measure event performance</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.eventUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 5px;">
        View Live Event
      </a>
      <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #ffffff; color: #3b82f6; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 2px solid #3b82f6; margin: 0 5px;">
        Go to Dashboard
      </a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      Thank you for hosting your event on CodeUnia. We're excited to see your event succeed!
    </p>
  `

  return {
    subject: `🎉 Event Approved: ${params.eventTitle}`,
    html: getEmailTemplate(content),
  }
}
