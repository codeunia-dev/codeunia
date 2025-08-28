import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface InternshipApplicationEmailData {
    applicantName: string
    applicantEmail: string
    internshipTitle: string
    internshipId: string
    domain: string
    level: string
    duration: number
    isPaid: boolean
    amountPaid?: number
    coverNote?: string
}



// Email templates
const getApplicantConfirmationTemplate = (data: InternshipApplicationEmailData) => {
    const { applicantName, internshipTitle, domain, level, duration, isPaid, amountPaid } = data

    return {
        subject: `✅ Application Confirmed: ${internshipTitle}`,
        html: `
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
              
              <p>Hi ${applicantName},</p>
              
              <p>Great news! Your application for <strong>${internshipTitle}</strong> has been successfully submitted and confirmed.</p>
              
              <div class="details-card">
                <h3 style="margin-top: 0; color: #1f2937;">Application Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Internship:</span>
                  <span class="detail-value">${internshipTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Domain:</span>
                  <span class="detail-value">${domain}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Level:</span>
                  <span class="detail-value">${level}</span>
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
}



export async function sendInternshipApplicationEmails(data: InternshipApplicationEmailData & { applicationId: string }) {
    try {
        // Send confirmation email to applicant only
        const applicantTemplate = getApplicantConfirmationTemplate(data)
        const applicantResult = await resend.emails.send({
            from: 'Codeunia <connect@codeunia.com>',
            to: [data.applicantEmail],
            subject: applicantTemplate.subject,
            html: applicantTemplate.html,
        })

        return {
            success: true,
            result: applicantResult
        }
    } catch (error) {
        console.error('Failed to send internship application email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}