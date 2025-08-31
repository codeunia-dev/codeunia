import { Resend } from 'resend'
import { generateInternshipOfferLetterPDF } from '@/lib/pdf-generator'

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

export interface StatusUpdateEmailData {
    applicantName: string
    applicantEmail: string
    internshipTitle: string
    internshipId: string
    domain: string
    level: string
    duration: number
    oldStatus: string
    newStatus: string
    remarks?: string
    repoUrl?: string
    startDate?: string
    endDate?: string
}



// Email templates
const getApplicantConfirmationTemplate = (data: InternshipApplicationEmailData) => {
    const { applicantName, internshipTitle, domain, level, duration, isPaid, amountPaid } = data

    return {
        subject: `✅ Application Submitted: ${internshipTitle}`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Submitted</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 30px 20px; }
            .details-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .detail-label { font-weight: bold; color: #000000; margin-right: 6px; }
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
              <h1>Application Submitted!</h1>
              <p>Welcome to Codeunia Internships</p>
            </div>
            
            <div class="content">
              <p>Hi ${applicantName},</p>
              
             <p>Great news! Your application for <strong>${internshipTitle}</strong> has been successfully submitted and is under review.</p>
              
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
                  <span class="detail-value" style="color: #667eea; font-weight: 600;">Under Review</span>
                </div>
              </div>
              
              <div class="next-steps">
                <h3>What happens next?</h3>
                <ul>
    <li><strong>Application Review:</strong> Our team will carefully review your application within 2-3 business days</li>
    <li><strong>Notification:</strong> You’ll be informed of the decision via email</li>
    <li><strong>Onboarding:</strong> Once approved, you’ll receive detailed onboarding instructions</li>
    <li><strong>Mentor Connect:</strong> You’ll be introduced to your assigned mentor for guidance throughout the internship</li>
  </ul>
              </div>
              
              <p>In the meantime, feel free to:</p>
              <ul>
  <li>Join our <a href="https://whatsapp.com/channel/0029VbAx4slKgsNpQoYM5N2P" style="color: #667eea;">WhatsApp community</a> to stay connected with peers and mentors</li>
  <li>Join our <a href="https://discord.gg/6HXKJemk" style="color: #667eea;">Discord community</a> for discussions and resources</li>
  <li>Follow us on <a href="https://linkedin.com/company/codeunia" style="color: #667eea;">LinkedIn</a> for the latest updates and announcements</li>
  <li>Explore our <a href="https://codeunia.com/blog" style="color: #667eea;">website</a> for learning resources and insights</li>
</ul>
              
              <p>If you have any questions, feel free to contact us at <a href="mailto:support@codeunia.in" style="color: #2563eb; text-decoration: underline;">support@codeunia.in</a></p>
              
              <p>Best regards,<br>
              <strong>Codeunia Team</strong></p>
            </div>
            
            <div class="footer">
              <p> 2025 Codeunia. All rights reserved.</p>
              <p>Empowering the Next Generation of Coders</p>
            </div>
          </div>
        </body>
      </html>
    `
    }
}

const getStatusUpdateTemplate = (data: StatusUpdateEmailData) => {
    const { applicantName, internshipTitle, domain, level, duration, newStatus, remarks, repoUrl, startDate, endDate } = data
    
    // Status-specific content
    const getStatusContent = () => {
        switch (newStatus) {
            case 'accepted':
                return {
                    headerColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    title: 'Congratulations! Your Application is Accepted',
                    message: `Fantastic news! Your application for <strong>${internshipTitle}</strong> has been <strong>accepted</strong>. Welcome to the Codeunia family!`,
                    nextSteps: [
                        '<strong>Share on LinkedIn:</strong> Post your attached offer letter on LinkedIn and tag <strong>Codeunia</strong> in your post',
                        '<strong>Join WhatsApp Group:</strong> Connect with peers and mentors by joining our official WhatsApp group <a href="https://chat.whatsapp.com/Blr6nmJ71EoKX0HXUDHzeh?mode=ems_copy_t" target="_blank">here</a>',
                        '<strong>Mentor Connect:</strong> Kindly follow your assigned mentors on LinkedIn for guidance and updates <a href="https://www.linkedin.com/in/848deepak/" target="_blank">Mentor 1</a>, <a href="https://www.linkedin.com/in/akshaykumar0611/" target="_blank">Mentor 2</a>',
                        '<strong>Follow Us:</strong> Stay updated by following <a href="https://linkedin.com/company/codeunia" target="_blank">Codeunia on LinkedIn</a> and our <a href="https://github.com/Codeunia" target="_blank">GitHub organization</a>',
                        '<strong>Guidelines:</strong> Please follow the internship guidelines that will be shared in the WhatsApp group throughout the program'
                    ]                                              
                }
            case 'rejected':
                return {
                    headerColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
    
    return {
        subject: `${statusContent.badgeText || ''} ${internshipTitle} - Application Update`,
        html: `
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
                        .status-badge { background: ${statusContent.badgeColor || '#6b7280'}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 500; margin-bottom: 20px; }
                        .details-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${
                            newStatus === 'accepted' ? '#10b981' : 
                            newStatus === 'rejected' ? '#ef4444' : 
                            (statusContent.badgeColor || '#6b7280')
                        }; }
                        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
                        .detail-label { font-weight: bold; color: #000000; margin-right: 6px; }
                        .detail-value { color: #1f2937; }
                        .next-steps { background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .next-steps h3 { margin-top: 0; color: #1e40af; }
                        .next-steps ul { margin: 0; padding-left: 20px; }
                        .next-steps li { margin: 8px 0; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                        .cta-button { background: ${statusContent.badgeColor || '#6b7280'}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: 500; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${statusContent.title}</h1>
                            <p>Codeunia Internships</p>
                        </div>
                        
                        <div class="content">
                            ${statusContent.badgeText ? `<div class="status-badge">${statusContent.badgeText}</div>` : ''}
                            
                            <p>Hi ${applicantName},</p>
                            
                            <p>${statusContent.message}</p>
                            
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
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value" style="color: ${
                                        newStatus === 'accepted' ? '#34C759' : 
                                        newStatus === 'rejected' ? '#EF4444' : 
                                        (statusContent.badgeColor || '#6b7280')
                                    }; font-weight: 600; text-transform: capitalize;">${newStatus}</span>
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
                            
                            ${repoUrl ? `
                                <div class="details-card" style="border-left-color: ${
                                    newStatus === 'accepted' ? '#10b981' : 
                                    newStatus === 'rejected' ? '#ef4444' : 
                                    (statusContent.badgeColor || '#6b7280')
                                };">
                                    <h4 style="margin-top: 0; color: #1f2937;">Project Repository</h4>
                                    <p><a href="${repoUrl}" style="color: ${
                                        newStatus === 'accepted' ? '#10b981' : 
                                        newStatus === 'rejected' ? '#ef4444' : 
                                        (statusContent.badgeColor || '#6b7280')
                                    }; text-decoration: none;">🔗 ${repoUrl}</a></p>
                                </div>
                            ` : ''}
                            
                            <div class="next-steps">
                                <h3>What's Next?</h3>
                                <ul>
                                    ${statusContent.nextSteps.map(step => `<li>${step}</li>`).join('')}
                                </ul>
                            </div>
                            
                            ${newStatus === 'accepted' ? `
                                <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                                    <h4 style="margin-top: 0; color: #92400e;">📎 Offer Letter Attached</h4>
                                    <p style="margin-bottom: 0; font-size: 14px;">
                                        Please find your official internship offer letter attached to this email. 
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="https://discord.gg/codeunia" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">Join Our Discord Community</a>
                                </div>
                            ` : ''}
                            
                           <p>If you have any questions, feel free to contact us at <a href="mailto:support@codeunia.in" style="color: #2563eb; text-decoration: underline;">support@codeunia.in</a></p>
                            
                            <p>Best regards,<br>
                            <strong>Codeunia Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p> 2025 Codeunia. All rights reserved.</p>
                            <p>Empowering the Next Generation of Coders</p>
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

export async function sendStatusUpdateEmail(data: StatusUpdateEmailData) {
    try {
        // Don't send email if status hasn't actually changed
        if (data.oldStatus === data.newStatus) {
            return {
                success: true,
                skipped: true,
                message: 'Status unchanged, no email sent'
            }
        }
        
        const statusTemplate = getStatusUpdateTemplate(data)
        
        // Prepare email data
        const emailData: any = {
            from: 'Codeunia <connect@codeunia.com>',
            to: [data.applicantEmail],
            subject: statusTemplate.subject,
            html: statusTemplate.html,
        }
        
        // Generate and attach offer letter PDF if status is accepted
        if (data.newStatus === 'accepted' && data.startDate && data.endDate) {
            try {
                console.log('🎯 Generating offer letter PDF for accepted application...')
                console.log('Environment details:', {
                    nodeEnv: process.env.NODE_ENV,
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version
                })
                
                // Map internship ID to title for PDF
                const internshipTitles: Record<string, string> = {
                    'free-basic': 'Codeunia Starter Internship',
                    'paid-pro': 'Codeunia Pro Internship'
                }
                
                const offerLetterPDF = await generateInternshipOfferLetterPDF({
                    applicantName: data.applicantName,
                    applicantEmail: data.applicantEmail,
                    internshipTitle: internshipTitles[data.internshipId] || data.internshipId,
                    domain: data.domain,
                    level: data.level,
                    duration: data.duration,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isPaid: data.internshipId === 'paid-pro',
                    amountPaid: data.internshipId === 'paid-pro' ? 999 : undefined,
                    repoUrl: data.repoUrl,
                    remarks: data.remarks
                })
                
                console.log('PDF generated successfully, size:', offerLetterPDF.length, 'bytes')
                
                // Add PDF attachment
                emailData.attachments = [
                    {
                        filename: `Codeunia_Internship_Offer_Letter_${data.applicantName.replace(/\s+/g, '_')}.pdf`,
                        content: offerLetterPDF,
                        type: 'application/pdf',
                        disposition: 'attachment'
                    }
                ]
                
                console.log('✅ Offer letter PDF generated and attached')
            } catch (pdfError) {
                console.error('❌ Failed to generate offer letter PDF:', pdfError)
                console.error('PDF Error Details:', {
                    message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
                    stack: pdfError instanceof Error ? pdfError.stack?.substring(0, 500) : undefined,
                    environment: process.env.NODE_ENV,
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version
                })
                // Continue sending email without PDF attachment
            }
        }
        
        const result = await resend.emails.send(emailData)

        return {
            success: true,
            result,
            attachedOfferLetter: data.newStatus === 'accepted' && emailData.attachments?.length > 0
        }
    } catch (error) {
        console.error('Failed to send status update email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}