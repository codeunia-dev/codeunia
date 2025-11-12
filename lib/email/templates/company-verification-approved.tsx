// Company verification approved email template

interface CompanyVerificationApprovedParams {
  companyName: string
  dashboardUrl: string
  createEventUrl: string
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

export const getCompanyVerificationApprovedEmail = (
  params: CompanyVerificationApprovedParams
) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 Your Company Has Been Verified!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Congratulations! Your company <strong>${params.companyName}</strong> has been successfully verified on CodeUnia.
    </p>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        ✓ Your company profile is now live<br>
        ✓ You can start creating and hosting events<br>
        ✓ Your events will be visible to the community<br>
        ✓ You can invite team members to collaborate
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>Get Started with These Next Steps:</strong>
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; color: #3b82f6; font-size: 16px; font-weight: 600;">
            1. Complete Your Profile
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Add your company logo, banner, and social links to make your profile stand out.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; color: #3b82f6; font-size: 16px; font-weight: 600;">
            2. Create Your First Event
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Share your hackathons, workshops, or tech talks with our developer community.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 15px; background-color: #f9fafb; border-radius: 6px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; color: #3b82f6; font-size: 16px; font-weight: 600;">
            3. Invite Your Team
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
            Add team members to help manage events and collaborate on your initiatives.
          </p>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.createEventUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 0 5px;">
        Create Your First Event
      </a>
      <a href="${params.dashboardUrl}" style="display: inline-block; background-color: #ffffff; color: #3b82f6; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; border: 2px solid #3b82f6; margin: 0 5px;">
        Go to Dashboard
      </a>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        💡 Pro Tip
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
        Events submitted for approval are typically reviewed within 24 hours. Make sure to include clear descriptions and high-quality images for faster approval.
      </p>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have any questions or need assistance getting started, our support team is here to help!
    </p>
  `

  return {
    subject: `🎉 ${params.companyName} has been verified on CodeUnia!`,
    html: getEmailTemplate(content),
  }
}
