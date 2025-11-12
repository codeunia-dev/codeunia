// Event rejected email template

interface EventRejectedParams {
  eventTitle: string
  companyName: string
  rejectionReason: string
  editEventUrl: string
  supportEmail: string
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

export const getEventRejectedEmail = (params: EventRejectedParams) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Event Review Update
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for submitting your event <strong>${params.eventTitle}</strong>. After reviewing your submission, we need you to make some changes before we can approve it.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
        📋 Reason for Review:
      </p>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
        ${params.rejectionReason}
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>How to Proceed:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Review the feedback provided above carefully</li>
      <li>Update your event information to address the concerns</li>
      <li>Ensure all event details are accurate and complete</li>
      <li>Resubmit your event for review</li>
    </ul>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        💡 Tips for Approval:
      </p>
      <ul style="margin: 5px 0 0 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
        <li>Use clear, professional language in your description</li>
        <li>Include high-quality images (minimum 1200x630px)</li>
        <li>Provide accurate date, time, and location information</li>
        <li>Ensure your event complies with our community guidelines</li>
        <li>Include all relevant details participants need to know</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.editEventUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Edit and Resubmit Event
      </a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have questions about this decision or need clarification on what changes are needed, please contact our support team at <a href="mailto:${params.supportEmail}" style="color: #3b82f6; text-decoration: none;">${params.supportEmail}</a>. We're here to help you get your event approved!
    </p>
  `

  return {
    subject: `Event Review Required: ${params.eventTitle}`,
    html: getEmailTemplate(content),
  }
}
