
// Force Node.js runtime for API routes
export const runtime = 'nodejs';

// NextResponse imported but not used in GET handler - keeping for potential future use

// HTML escaping function to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mock data for email preview
const mockData = {
  applicantName: 'John Doe',
  applicantEmail: 'john.doe@example.com',
  internshipTitle: 'Codeunia Pro Internship',
  internshipId: 'paid-pro',
  domain: 'Web Development',
  level: 'Intermediate',
  duration: 6,
  isPaid: true,
  amountPaid: 999,
  coverNote: 'I am passionate about web development and excited to contribute to real-world projects.',
  applicationId: 'app_123456'
}

// Email templates (copied from email service for preview)
const getApplicantConfirmationTemplate = (data: typeof mockData) => {
  const { applicantName, internshipTitle, domain, level, duration, isPaid, amountPaid } = data
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Confirmed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
          .details-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .detail-label { font-weight: 600; color: #4b5563; }
          .detail-value { color: #1f2937; }
          .next-steps { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .next-steps h3 { margin-top: 0; color: #1e40af; }
          .next-steps ul { margin: 0; padding-left: 20px; }
          .next-steps li { margin: 8px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .cta-button { background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Application Confirmed!</h1>
            <p>Welcome to Codeunia Internships</p>
          </div>
          
          <div class="content">
            <div class="success-badge">✅ Successfully Applied</div>
            
            <p>Hi ${escapeHtml(applicantName)},</p>
            
            <p>Great news! Your application for <strong>${escapeHtml(internshipTitle)}</strong> has been successfully submitted and confirmed.</p>
            
            <div class="details-card">
              <h3 style="margin-top: 0; color: #1f2937;">Application Details</h3>
              <div class="detail-row">
                <span class="detail-label">Internship:</span>
                <span class="detail-value">${escapeHtml(internshipTitle)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Domain:</span>
                <span class="detail-value">${escapeHtml(domain)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Level:</span>
                <span class="detail-value">${escapeHtml(level)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration} weeks</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${isPaid ? `Paid (₹${amountPaid})` : 'Free'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: #10b981; font-weight: 600;">Under Review</span>
              </div>
            </div>
            
            <div class="next-steps">
              <h3>What happens next?</h3>
              <ul>
                <li><strong>Review Process:</strong> Our team will review your application within 2-3 business days</li>
                <li><strong>Status Updates:</strong> You'll receive email notifications about any status changes</li>
                <li><strong>Getting Started:</strong> Once approved, you'll receive detailed onboarding instructions</li>
                <li><strong>Mentor Assignment:</strong> You'll be paired with an experienced mentor in your domain</li>
              </ul>
            </div>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Join our <a href="https://discord.gg/codeunia" style="color: #667eea;">Discord community</a></li>
              <li>Follow us on <a href="https://linkedin.com/company/codeunia" style="color: #667eea;">LinkedIn</a> for updates</li>
              <li>Check out our <a href="https://codeunia.com/blog" style="color: #667eea;">blog</a> for learning resources</li>
            </ul>
            
            <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:support@codeunia.com" style="color: #667eea;">support@codeunia.com</a></p>
            
            <p>Best regards,<br>
            <strong>The Codeunia Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Codeunia. All rights reserved.</p>
            <p>Building the next generation of developers, one internship at a time.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/*
// Unused function - keeping for potential future use
const getAdminNotificationTemplate = (data: typeof mockData) => {
  const { applicantName, applicantEmail, internshipTitle, domain, level, duration, isPaid, amountPaid, coverNote, applicationId } = data
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Internship Application</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .alert-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
          .applicant-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .detail-label { font-weight: 600; color: #4b5563; }
          .detail-value { color: #1f2937; }
          .cover-note { background: #eff6ff; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .actions { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .cta-button { background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 5px; font-weight: 500; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Application</h1>
            <p>Internship Application Received</p>
          </div>
          
          <div class="content">
            <div class="alert-badge">🆕 Requires Review</div>
            
            <p>A new internship application has been submitted and requires your attention.</p>
            
            <div class="applicant-card">
              <h3 style="margin-top: 0; color: #1f2937;">Applicant Information</h3>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${applicantName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${applicantEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">${applicationId}</span>
              </div>
            </div>
            
            <div class="applicant-card">
              <h3 style="margin-top: 0; color: #1f2937;">Application Details</h3>
              <div class="detail-row">
                <span class="detail-label">Internship:</span>
                <span class="detail-value">${escapeHtml(internshipTitle)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Domain:</span>
                <span class="detail-value">${escapeHtml(domain)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Level:</span>
                <span class="detail-value">${escapeHtml(level)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${duration} weeks</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value" style="color: ${isPaid ? '#10b981' : '#6b7280'}; font-weight: 600;">
                  ${isPaid ? `💰 Paid (₹${amountPaid})` : '🆓 Free'}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Applied:</span>
                <span class="detail-value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            
            ${coverNote ? `
              <div class="cover-note">
                <h4 style="margin-top: 0; color: #1e40af;">Cover Note</h4>
                <p style="margin-bottom: 0; font-style: italic;">"${coverNote}"</p>
              </div>
            ` : ''}
            
            <div class="actions">
              <h3 style="margin-top: 0; color: #166534;">Quick Actions</h3>
              <p>Review this application in the admin panel:</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/internship-applications" class="cta-button">
                📋 Review Application
              </a>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the applicant's profile and background</li>
              <li>Assess fit for the selected domain and level</li>
              <li>Update application status (accept/reject/review)</li>
              <li>Assign mentor if accepted</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 Codeunia Admin Panel</p>
            <p>This is an automated notification from the internship application system.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
*/

const getStatusUpdateTemplate = (data: {
  applicantName: string
  internshipTitle: string
  domain: string
  level: string
  duration: number
  newStatus: string
  remarks?: string
  repoUrl?: string
  startDate?: string
  endDate?: string
}) => {
  const { applicantName, internshipTitle, domain, level, duration, newStatus, remarks, repoUrl, startDate, endDate } = data
  
  // Status-specific content
  const getStatusContent = () => {
    switch (newStatus) {
      case 'accepted':
        return {
          headerColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          badgeColor: '#10b981',
          badgeText: '🎉 Accepted',
          title: 'Congratulations! Your Application is Accepted',
          message: `Fantastic news! Your application for <strong>${internshipTitle}</strong> has been <strong>accepted</strong>. Welcome to the Codeunia family!`,
          nextSteps: [
            '<strong>Onboarding:</strong> You\'ll receive detailed onboarding instructions within 24 hours',
            '<strong>Mentor Assignment:</strong> You\'ll be paired with an experienced mentor in your domain',
            '<strong>Project Setup:</strong> Access to your project repository and development environment',
            '<strong>Schedule:</strong> Weekly check-ins and milestone reviews will be scheduled',
            '<strong>Community Access:</strong> Join our exclusive intern Discord channels'
          ]
        }
      case 'rejected':
        return {
          headerColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          badgeColor: '#ef4444',
          badgeText: '❌ Not Selected',
          title: 'Application Update',
          message: `Thank you for your interest in <strong>${internshipTitle}</strong>. After careful consideration, we have decided not to move forward with your application at this time.`,
          nextSteps: [
            '<strong>Feedback:</strong> Use this experience to strengthen your skills and portfolio',
            '<strong>Future Opportunities:</strong> Keep an eye on our website for future internship openings',
            '<strong>Skill Development:</strong> Continue building projects and contributing to open source',
            '<strong>Community:</strong> Stay connected with our community for learning resources',
            '<strong>Reapply:</strong> You\'re welcome to apply for future internships'
          ]
        }
      case 'reviewed':
        return {
          headerColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          badgeColor: '#3b82f6',
          badgeText: '👀 Under Review',
          title: 'Application Under Review',
          message: `Good news! Your application for <strong>${internshipTitle}</strong> is now <strong>under review</strong> by our team.`,
          nextSteps: [
            '<strong>Review Process:</strong> Our team is carefully evaluating your application',
            '<strong>Timeline:</strong> You can expect a final decision within 3-5 business days',
            '<strong>Additional Info:</strong> We may reach out if we need any additional information',
            '<strong>Stay Tuned:</strong> You\'ll receive another email once we make a final decision',
            '<strong>Questions:</strong> Feel free to reach out if you have any questions'
          ]
        }
      default:
        return {
          headerColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          badgeColor: '#6b7280',
          badgeText: '📋 Status Updated',
          title: 'Application Status Update',
          message: `Your application for <strong>${internshipTitle}</strong> status has been updated to <strong>${newStatus}</strong>.`,
          nextSteps: [
            '<strong>Status Change:</strong> Your application status has been updated',
            '<strong>Next Steps:</strong> We\'ll keep you informed of any further updates',
            '<strong>Questions:</strong> Feel free to reach out if you have any questions'
          ]
        }
    }
  }
  
  const statusContent = getStatusContent()
  
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Status Update</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: ${statusContent.headerColor}; color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 30px 20px; }
                .status-badge { background: ${statusContent.badgeColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
                .details-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusContent.badgeColor}; }
                .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
                .detail-label { font-weight: 600; color: #4b5563; }
                .detail-value { color: #1f2937; }
                .next-steps { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .next-steps h3 { margin-top: 0; color: #1e40af; }
                .next-steps ul { margin: 0; padding-left: 20px; }
                .next-steps li { margin: 8px 0; }
                .remarks-card { background: #fef3c7; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                .cta-button { background: ${statusContent.badgeColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${statusContent.title}</h1>
                    <p>Codeunia Internships</p>
                </div>
                
                <div class="content">
                    <div class="status-badge">${statusContent.badgeText}</div>
                    
                    <p>Hi ${applicantName},</p>
                    
                    <p>${statusContent.message}</p>
                    
                    <div class="details-card">
                        <h3 style="margin-top: 0; color: #1f2937;">Application Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Internship:</span>
                            <span class="detail-value">${escapeHtml(internshipTitle)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Domain:</span>
                            <span class="detail-value">${escapeHtml(domain)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Level:</span>
                            <span class="detail-value">${escapeHtml(level)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${duration} weeks</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value" style="color: ${statusContent.badgeColor}; font-weight: 600; text-transform: capitalize;">${newStatus}</span>
                        </div>
                        ${startDate ? `
                            <div class="detail-row">
                                <span class="detail-label">Start Date:</span>
                                <span class="detail-value">${new Date(startDate).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        ${endDate ? `
                            <div class="detail-row">
                                <span class="detail-label">End Date:</span>
                                <span class="detail-value">${new Date(endDate).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${remarks ? `
                        <div class="remarks-card">
                            <h4 style="margin-top: 0; color: #92400e;">Additional Notes</h4>
                            <p style="margin-bottom: 0; font-style: italic;">"${remarks}"</p>
                        </div>
                    ` : ''}
                    
                    ${repoUrl ? `
                        <div class="details-card">
                            <h4 style="margin-top: 0; color: #1f2937;">Project Repository</h4>
                            <p><a href="${repoUrl}" style="color: ${statusContent.badgeColor}; text-decoration: none;">🔗 ${repoUrl}</a></p>
                        </div>
                    ` : ''}
                    
                    <div class="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            ${statusContent.nextSteps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${newStatus === 'accepted' ? `
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://discord.gg/codeunia" class="cta-button">Join Our Discord Community</a>
                        </div>
                    ` : ''}
                    
                    <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:connect@codeunia.com" style="color: ${statusContent.badgeColor};">connect@codeunia.com</a></p>
                    
                    <p>Best regards,<br>
                    <strong>The Codeunia Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>© 2024 Codeunia. All rights reserved.</p>
                    <p>Building the next generation of developers, one internship at a time.</p>
                </div>
            </div>
        </body>
    </html>
  `
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'applicant'
  const status = searchParams.get('status') || 'accepted'
  
  let html: string
  
  if (type === 'status') {
    // Mock data for status update email
    const statusMockData = {
      applicantName: 'John Doe',
      applicantEmail: 'john.doe@example.com',
      internshipTitle: 'Codeunia Pro Internship',
      internshipId: 'paid-pro',
      domain: 'Web Development',
      level: 'Intermediate',
      duration: 6,
      oldStatus: 'submitted',
      newStatus: status,
      remarks: status === 'accepted' 
        ? 'Congratulations! Your technical skills and portfolio impressed our team.' 
        : status === 'rejected'
        ? 'While your application was strong, we had limited spots available this round.'
        : 'Your application is progressing well through our review process.',
      repoUrl: status === 'accepted' ? 'https://github.com/codeunia/intern-project-2024' : undefined,
      startDate: status === 'accepted' ? new Date().toISOString() : undefined,
      endDate: status === 'accepted' ? new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }
    
    html = getStatusUpdateTemplate(statusMockData)
  } else {
    html = getApplicantConfirmationTemplate(mockData)
  }
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}