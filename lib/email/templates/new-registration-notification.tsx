// Admin notification for new company registration

interface NewRegistrationNotificationParams {
  companyName: string
  companyEmail: string
  website: string
  industry: string
  companySize: string
  companyId: string
  registeredBy: string
  verificationUrl: string
}

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeUnia Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">CodeUnia Admin</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
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

const getCompanySizeLabel = (size: string): string => {
  const labels: Record<string, string> = {
    startup: 'Startup (1-10 employees)',
    small: 'Small (11-50 employees)',
    medium: 'Medium (51-200 employees)',
    large: 'Large (201-1000 employees)',
    enterprise: 'Enterprise (1000+ employees)',
  }
  return labels[size.toLowerCase()] || size
}

export const getNewRegistrationNotificationEmail = (
  params: NewRegistrationNotificationParams
) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🏢 New Company Registration
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      A new company has registered on CodeUnia and is awaiting verification.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
        Company Information
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px; vertical-align: top;">
            <strong>Company Name:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.companyName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Email:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            <a href="mailto:${params.companyEmail}" style="color: #3b82f6; text-decoration: none;">${params.companyEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Website:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            <a href="${params.website}" target="_blank" style="color: #3b82f6; text-decoration: none;">${params.website}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Industry:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.industry}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Company Size:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${getCompanySizeLabel(params.companySize)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Registered By:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.registeredBy}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">
            <strong>Company ID:</strong>
          </td>
          <td style="padding: 8px 0; color: #6b7280; font-size: 12px; font-family: monospace;">
            ${params.companyId}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #92400e; font-size: 14px; font-weight: 600;">
        ⚠️ Action Required
      </p>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        Please review the company information and verification documents to approve or reject this registration. The company is waiting for verification to start hosting events.
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>Verification Checklist:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Verify company website is legitimate and accessible</li>
      <li>Check that email domain matches the company website</li>
      <li>Review uploaded verification documents</li>
      <li>Confirm company information is accurate</li>
      <li>Check for any red flags or suspicious activity</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Review Company Registration
      </a>
    </div>
    
    <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">
        Quick Actions
      </p>
      <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
        From the admin panel, you can approve, reject, or request additional information from the company.
      </p>
    </div>
  `

  return {
    subject: `[New Registration] ${params.companyName} - Pending Verification`,
    html: getEmailTemplate(content),
  }
}
