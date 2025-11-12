// Company registration confirmation email template

interface CompanyRegistrationConfirmationParams {
  companyName: string
  contactEmail: string
  dashboardUrl: string
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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">CodeUnia</h1>
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

export const getCompanyRegistrationConfirmationEmail = (
  params: CompanyRegistrationConfirmationParams
) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 Thank You for Registering!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for registering <strong>${params.companyName}</strong> on CodeUnia! We're excited to have you join our community of event organizers.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        📋 What's Next?
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
        Your company registration is currently under review. Our team will verify your information and documentation within 24-48 hours.
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>During the review process, we will:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Verify your company information and documentation</li>
      <li>Confirm your company's legitimacy and website</li>
      <li>Review your company profile details</li>
      <li>Send you a notification once verification is complete</li>
    </ul>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>⏱️ Average Review Time:</strong> 24-48 hours<br>
        You'll receive an email notification as soon as your company is verified.
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>Once verified, you'll be able to:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Create and host events and hackathons</li>
      <li>Invite team members to collaborate</li>
      <li>Access your company dashboard and analytics</li>
      <li>Reach thousands of developers in our community</li>
    </ul>
    
    <a href="${params.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      View Registration Status
    </a>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have any questions or need assistance, please don't hesitate to reach out to our support team.
    </p>
  `

  return {
    subject: `Welcome to CodeUnia - ${params.companyName} Registration Received`,
    html: getEmailTemplate(content),
  }
}
