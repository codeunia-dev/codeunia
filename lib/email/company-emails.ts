// Email templates for company-related notifications

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

// Company verification approved email
export const getCompanyVerificationApprovedEmail = (params: {
  companyName: string
  dashboardUrl: string
}) => {
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
        ✓ Your events will be visible to the community
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>What's next?</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Complete your company profile with logo and banner</li>
      <li>Create your first event or hackathon</li>
      <li>Invite team members to collaborate</li>
      <li>Track your event analytics and registrations</li>
    </ul>
    
    <a href="${params.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      Go to Dashboard
    </a>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  `
  
  return {
    subject: `🎉 ${params.companyName} has been verified on CodeUnia!`,
    html: getEmailTemplate(content)
  }
}

// Company verification rejected email
export const getCompanyVerificationRejectedEmail = (params: {
  companyName: string
  rejectionReason: string
  resubmitUrl: string
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Company Verification Update
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Thank you for your interest in hosting events on CodeUnia. After reviewing your company registration for <strong>${params.companyName}</strong>, we need additional information before we can proceed with verification.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
        Reason for Review:
      </p>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
        ${params.rejectionReason}
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>How to proceed:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      <li>Review the feedback provided above</li>
      <li>Update your company information or documentation</li>
      <li>Resubmit your application for review</li>
    </ul>
    
    <a href="${params.resubmitUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      Update Company Information
    </a>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have questions about this decision or need clarification, please contact our support team at <a href="mailto:support@codeunia.com" style="color: #3b82f6; text-decoration: none;">support@codeunia.com</a>.
    </p>
  `
  
  return {
    subject: `Company Verification Update - ${params.companyName}`,
    html: getEmailTemplate(content)
  }
}

// Admin notification for new company registration
export const getNewCompanyRegistrationNotification = (params: {
  companyName: string
  companyEmail: string
  website: string
  industry: string
  companySize: string
  companyId: string
}) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🏢 New Company Registration
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      A new company has registered on CodeUnia and is awaiting verification.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">
            <strong>Company:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.companyName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Email:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.companyEmail}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Website:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            <a href="${params.website}" style="color: #3b82f6; text-decoration: none;">${params.website}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Industry:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.industry}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Size:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.companySize}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Please review the company information and verification documents to approve or reject this registration.
    </p>
    
    <a href="https://codeunia.com/admin/companies/${params.companyId}/verify" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      Review Company Registration
    </a>
  `
  
  return {
    subject: `[New Registration] ${params.companyName} - Pending Verification`,
    html: getEmailTemplate(content)
  }
}

// Role change notification email
export const getRoleChangeEmail = (params: {
  memberName: string
  companyName: string
  oldRole: string
  newRole: string
  changedBy: string
  dashboardUrl: string
}) => {
  const rolePermissions: Record<string, string[]> = {
    owner: [
      'Full control over company settings',
      'Manage all team members and roles',
      'Create, edit, and delete all events',
      'Access billing and subscription',
      'View all analytics and reports'
    ],
    admin: [
      'Create, edit, and publish events',
      'Manage team members (except owners)',
      'View analytics and reports',
      'Manage company profile'
    ],
    editor: [
      'Create and edit draft events',
      'View published events',
      'View basic analytics'
    ],
    viewer: [
      'View company events',
      'View basic analytics',
      'Read-only access'
    ]
  }

  const permissions = rolePermissions[params.newRole.toLowerCase()] || []
  
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      Your Role Has Been Updated
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.memberName},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Your role at <strong>${params.companyName}</strong> has been updated by ${params.changedBy}.
    </p>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">
            <strong>Previous Role:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            ${params.oldRole.charAt(0).toUpperCase() + params.oldRole.slice(1)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
            <strong>New Role:</strong>
          </td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px;">
            <span style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 4px 12px; border-radius: 4px; font-weight: 600;">
              ${params.newRole.charAt(0).toUpperCase() + params.newRole.slice(1)}
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>Your new permissions include:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      ${permissions.map(perm => `<li>${perm}</li>`).join('')}
    </ul>
    
    <a href="${params.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
      Go to Dashboard
    </a>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      If you have questions about your new role or permissions, please contact your team administrator.
    </p>
  `
  
  return {
    subject: `Your role at ${params.companyName} has been updated`,
    html: getEmailTemplate(content)
  }
}

// Send email function using Resend
export async function sendCompanyEmail(params: EmailParams) {
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
      from: process.env.COMPANY_FROM_EMAIL || 'CodeUnia <noreply@codeunia.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    if (error) {
      console.error('❌ Failed to send company email:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Company email sent successfully:', {
      to: params.to,
      subject: params.subject,
      id: data?.id
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error sending company email:', error)
    return { success: false, error: String(error) }
  }
}
