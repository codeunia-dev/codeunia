// Team member invitation email template

interface TeamInvitationParams {
  inviteeName: string
  inviterName: string
  companyName: string
  role: string
  acceptInvitationUrl: string
  companyLogoUrl?: string
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

const getRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    owner: 'Full access to manage all company resources, events, and team members',
    admin: 'Create and manage events, invite team members, and access analytics',
    editor: 'Create draft events and view company analytics',
    member: 'View company events and analytics (read-only access)',
  }
  return descriptions[role.toLowerCase()] || 'Access to company resources'
}

export const getTeamInvitationEmail = (params: TeamInvitationParams) => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
      🎉 You've Been Invited to Join a Team!
    </h2>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      Hi ${params.inviteeName || 'there'},
    </p>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>${params.inviterName}</strong> has invited you to join <strong>${params.companyName}</strong> on CodeUnia as a <strong>${params.role}</strong>.
    </p>
    
    ${
      params.companyLogoUrl
        ? `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${params.companyLogoUrl}" alt="${params.companyName}" style="max-width: 150px; height: auto; border-radius: 8px;">
    </div>
    `
        : ''
    }
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        Your Role: ${params.role.charAt(0).toUpperCase() + params.role.slice(1)}
      </p>
      <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
        ${getRoleDescription(params.role)}
      </p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
      <strong>As a team member, you'll be able to:</strong>
    </p>
    
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
      ${
        params.role === 'owner' || params.role === 'admin'
          ? `
      <li>Create and manage events and hackathons</li>
      <li>Invite and manage team members</li>
      <li>Access company analytics and insights</li>
      <li>Update company profile and settings</li>
      `
          : params.role === 'editor'
            ? `
      <li>Create draft events for review</li>
      <li>View company analytics</li>
      <li>Collaborate with team members</li>
      `
            : `
      <li>View company events and analytics</li>
      <li>Stay updated on company activities</li>
      <li>Collaborate with team members</li>
      `
      }
    </ul>
    
    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        ✓ Collaborate with your team on event management<br>
        ✓ Access company dashboard and resources<br>
        ✓ Help grow your company's presence on CodeUnia
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.acceptInvitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Accept Invitation
      </a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
      This invitation will expire in 7 days. If you didn't expect this invitation or have any questions, please contact <a href="mailto:support@codeunia.com" style="color: #3b82f6; text-decoration: none;">support@codeunia.com</a>.
    </p>
  `

  return {
    subject: `You've been invited to join ${params.companyName} on CodeUnia`,
    html: getEmailTemplate(content),
  }
}
