import puppeteer from 'puppeteer';

interface MembershipCardData {
  name: string;
  memberId: string;
  membershipType: 'free' | 'premium';
  joinDate: string;
  email: string;
}

export interface InternshipOfferLetterData {
  applicantName: string
  applicantEmail: string
  internshipTitle: string
  domain: string
  level: string
  duration: number
  startDate: string
  endDate: string
  isPaid: boolean
  amountPaid?: number
  repoUrl?: string
  remarks?: string
}

export async function generateInternshipOfferLetterPDF(data: InternshipOfferLetterData): Promise<Buffer> {
  const {
    applicantName,
    applicantEmail,
    internshipTitle,
    domain,
    level,
    duration,
    startDate,
    endDate,
    isPaid,
    amountPaid,
    repoUrl,
    remarks
  } = data

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 40px;
          width: 210mm;
          min-height: 297mm;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .container {
          max-width: 180mm;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #10b981;
        }
        
        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 8px;
        }
        
        .company-info {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .document-title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 30px 0 20px 0;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .date-section {
          text-align: right;
          margin-bottom: 30px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .recipient-section {
          margin-bottom: 30px;
        }
        
        .recipient-name {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .recipient-email {
          font-size: 14px;
          color: #6b7280;
        }
        
        .content {
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        
        .content p {
          margin-bottom: 16px;
        }
        
        .highlight {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #10b981;
          margin: 20px 0;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .details-table th,
        .details-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .details-table th {
          background: #10b981;
          color: white;
          font-weight: 600;
        }
        
        .details-table tr:last-child td {
          border-bottom: none;
        }
        
        .benefits {
          margin: 30px 0;
        }
        
        .benefits h3 {
          font-size: 20px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 16px;
        }
        
        .benefits ul {
          list-style: none;
          padding: 0;
        }
        
        .benefits li {
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
        }
        
        .benefits li:before {
          content: "✅";
          position: absolute;
          left: 0;
        }
        
        .next-steps {
          background: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
        
        .next-steps h3 {
          color: #1e40af;
          margin-bottom: 12px;
        }
        
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-line {
          border-top: 2px solid #1f2937;
          margin-bottom: 8px;
          margin-top: 40px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(16, 185, 129, 0.05);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="watermark">CODEUNIA</div>
      
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">🚀 Codeunia</div>
          <div class="company-info">Building the Next Generation of Developers</div>
          <div class="company-info">connect@codeunia.com | www.codeunia.com</div>
        </div>
        
        <!-- Document Title -->
        <div class="document-title">Internship Offer Letter</div>
        
        <!-- Date -->
        <div class="date-section">
          Date: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
        </div>
        
        <!-- Recipient -->
        <div class="recipient-section">
          <div class="recipient-name">${applicantName}</div>
          <div class="recipient-email">${applicantEmail}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <p>Dear ${applicantName},</p>
          
          <p>
            Congratulations! We are delighted to offer you the position of <strong>${internshipTitle}</strong> 
            intern at Codeunia. After careful review of your application and qualifications, we believe 
            you will be a valuable addition to our team.
          </p>
          
          <div class="highlight">
            <p style="margin: 0; font-weight: 600; color: #10b981;">
              🎉 Welcome to the Codeunia family! We're excited to have you join our mission of 
              empowering the next generation of developers.
            </p>
          </div>
          
          <p>
            This offer is contingent upon your acceptance of the terms and conditions outlined in this letter.
          </p>
        </div>
        
        <!-- Internship Details -->
        <table class="details-table">
          <thead>
            <tr>
              <th colspan="2">Internship Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Position</strong></td>
              <td>${internshipTitle}</td>
            </tr>
            <tr>
              <td><strong>Domain</strong></td>
              <td>${domain}</td>
            </tr>
            <tr>
              <td><strong>Level</strong></td>
              <td>${level}</td>
            </tr>
            <tr>
              <td><strong>Duration</strong></td>
              <td>${duration} weeks</td>
            </tr>
            <tr>
              <td><strong>Start Date</strong></td>
              <td>${new Date(startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>End Date</strong></td>
              <td>${new Date(endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Type</strong></td>
              <td>${isPaid ? `Paid Internship (₹${amountPaid})` : 'Unpaid Internship'}</td>
            </tr>
            ${repoUrl ? `
              <tr>
                <td><strong>Project Repository</strong></td>
                <td>${repoUrl}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
        
        <!-- Benefits -->
        <div class="benefits">
          <h3>What You'll Get</h3>
          <ul>
            <li>Hands-on experience with real-world projects</li>
            <li>One-on-one mentorship from industry professionals</li>
            <li>Weekly code reviews and feedback sessions</li>
            <li>Certificate of completion upon successful internship</li>
            <li>Letter of recommendation (based on performance)</li>
            <li>Access to exclusive Codeunia community and events</li>
            <li>Portfolio projects to showcase your skills</li>
            <li>Networking opportunities with fellow developers</li>
            ${isPaid ? '<li>Competitive stipend for your contributions</li>' : ''}
          </ul>
        </div>
        
        <!-- Next Steps -->
        <div class="next-steps">
          <h3>Next Steps</h3>
          <p><strong>To accept this offer:</strong></p>
          <ul style="margin: 12px 0; padding-left: 20px;">
            <li>Reply to this email confirming your acceptance</li>
            <li>Join our Discord community for onboarding</li>
            <li>Complete the intern onboarding checklist</li>
            <li>Attend the orientation session (details will be shared)</li>
          </ul>
          <p>
            Please confirm your acceptance by replying to this email within <strong>7 days</strong> 
            of receiving this offer.
          </p>
        </div>
        
        ${remarks ? `
          <div class="highlight">
            <h4 style="color: #10b981; margin-bottom: 8px;">Additional Notes</h4>
            <p style="margin: 0; font-style: italic;">${remarks}</p>
          </div>
        ` : ''}
        
        <div class="content">
          <p>
            We look forward to working with you and supporting your growth as a developer. 
            If you have any questions about this offer or the internship program, please don't 
            hesitate to reach out to us.
          </p>
          
          <p>Welcome aboard!</p>
        </div>
        
        <!-- Signature -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div><strong>Codeunia Team</strong></div>
            <div>Internship Program</div>
            <div>connect@codeunia.com</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div><strong>Accepted by</strong></div>
            <div>${applicantName}</div>
            <div>Date: ___________</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div>
            This offer letter is confidential and intended solely for the named recipient.
          </div>
          <div style="margin-top: 8px;">
            © ${new Date().getFullYear()} Codeunia. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    return Buffer.from(pdfBuffer)

  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function generateMembershipCardPDF(data: MembershipCardData): Promise<Buffer> {
  const { name, memberId, membershipType, joinDate, email } = data;
  const isPremium = membershipType === 'premium';

  // Create HTML content for the membership card
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 20px;
          width: 210mm;
          min-height: 297mm;
        }
        
        .container {
          max-width: 180mm;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px 0;
        }
        
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 8px;
        }
        
        .tagline {
          font-size: 16px;
          color: #4f46e5;
          font-weight: 600;
        }
        
        .thank-you {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .thank-you h2 {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 8px;
        }
        
        .thank-you .subtitle {
          font-size: 14px;
          color: #f59e0b;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .membership-card {
          background: ${isPremium ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'};
          border-radius: 20px;
          padding: 30px;
          color: white;
          margin: 30px 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-title {
          font-size: 24px;
          font-weight: bold;
        }
        
        .member-type {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .member-info {
          margin-bottom: 20px;
        }
        
        .member-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .member-id {
          font-size: 18px;
          font-family: 'Courier New', monospace;
          background: rgba(255,255,255,0.2);
          padding: 8px 12px;
          border-radius: 8px;
          display: inline-block;
          margin-bottom: 8px;
        }
        
        .member-details {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .qr-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .benefits {
          margin: 30px 0;
        }
        
        .benefits h3 {
          font-size: 20px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 16px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .benefit-item {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid ${isPremium ? '#f59e0b' : '#6366f1'};
        }
        
        .benefit-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .benefit-description {
          color: #6b7280;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">🚀 Codeunia</div>
          <div class="tagline">Empowering the Next Generation of Coders</div>
        </div>
        
        <!-- Thank You Section -->
        <div class="thank-you">
          <h2>THANK YOU</h2>
          <div class="subtitle">FOR BEING A VALUED MEMBER</div>
          <p style="color: #6b7280; font-size: 14px;">
            You are now an official Codeunia Member! Welcome to our global, student-led tech community.
          </p>
        </div>
        
        <!-- Membership Card -->
        <div class="membership-card">
          <div class="card-header">
            <div class="card-title">CODEUNIA</div>
            <div class="member-type">${isPremium ? '👑 Premium' : '🌟 Student'} Member</div>
          </div>
          
          <div class="member-info">
            <div class="member-name">${name}</div>
            <div class="member-id">Member ID: ${memberId}</div>
            <div class="member-details">
              📧 ${email}<br>
              📅 Member since: ${new Date(joinDate).toLocaleDateString()}<br>
              ⭐ Status: Active Member
            </div>
          </div>
        </div>
        
        <!-- Benefits -->
        <div class="benefits">
          <h3>🎯 Your ${isPremium ? 'Premium ' : ''}Membership Benefits</h3>
          <div class="benefits-grid">
            ${isPremium ? `
              <div class="benefit-item">
                <div class="benefit-title">Golden Username & ID</div>
                <div class="benefit-description">Stand out with premium branding</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">3x Points Multiplier</div>
                <div class="benefit-description">Accelerate your leaderboard progress</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">Free Event Access</div>
                <div class="benefit-description">Join all paid events at no cost</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">Priority Support</div>
                <div class="benefit-description">Get help and mentorship first</div>
              </div>
            ` : `
              <div class="benefit-item">
                <div class="benefit-title">Community Access</div>
                <div class="benefit-description">Join discussions and collaborate</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">Free Events</div>
                <div class="benefit-description">Participate in community events</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">Learning Resources</div>
                <div class="benefit-description">Access to tutorials and guides</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-title">Profile Customization</div>
                <div class="benefit-description">Personalize your member profile</div>
              </div>
            `}
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div>
            This digital card serves as proof of your active membership and access to exclusive benefits.
          </div>
          <div style="margin-top: 8px;">
            © ${new Date().getFullYear()} Codeunia. All rights reserved.
          </div>
          <div style="margin-top: 8px;">
            Questions? Contact us at connect@codeunia.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return Buffer.from(pdfBuffer);

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
