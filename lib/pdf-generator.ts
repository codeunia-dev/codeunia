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
          border-bottom: 3px solid #007AFF;
        }
        
        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #007AFF;
          margin-bottom: 8px;
        }
        
        .company-info {
          font-size: 14px;
          color: #000000;
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
          color: #000000;
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
        
        .internship-details {
          margin-top: 20px;
        }
        
        .internship-details h3 {
          font-size: 20px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 16px;
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
          content: "•";
          position: absolute;
          left: 0;
          font-size: 20px;
          line-height: 1;
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
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">Codeunia</div>
          <div class="company-info">Empowering the Next Generation of Coders</div>
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
        
        <!-- Content -->
        <div class="content">
          <p>Dear <strong>${applicantName}</strong>,</p>
          
          <p>
            Congratulations! We are delighted to offer you the position of <strong>${internshipTitle}</strong> 
            intern at Codeunia. After careful review of your application and qualifications, we believe 
            you will be a valuable addition to our team.
          </p>

          <p>
            We are pleased to offer you this <strong>${duration}-week</strong> internship in the <strong>${domain}</strong> domain at the <strong>${level}</strong> level, 
            starting from <strong>${new Date(startDate).toLocaleDateString('en-GB')}</strong> to <strong>${new Date(endDate).toLocaleDateString('en-GB')}</strong>.
          </p>
          
          <p>
            ${remarks || 'We are excited to have you join our team and look forward to your contributions.'}
          </p>
        </div>
        
        <!-- Benefits -->
        <div class="benefits">
          <h3>What You'll Get</h3>
        <ul>
  <li>Hands-on experience with real-world projects</li>
  <li>Certificate of completion upon successful internship</li>
  <li>Regular mentorship and feedback through weekly code reviews with industry professionals</li>
  ${isPaid ? `
    <li>One-on-one mentorship from industry professionals</li>
    <li>Letter of recommendation (based on performance)</li>
  ` : ''}
</ul>
        </div>   
        
        ${remarks ? `
          <div class="highlight">
            <h4 style="color: #10b981; margin-bottom: 8px;">Additional Notes</h4>
            <p style="margin: 0; font-style: italic;">${remarks}</p>
          </div>
        ` : ''}
        
        <div class="content" style="margin-bottom: 15px;">
          <p>
            We look forward to working with you and supporting your growth as a developer. 
            If you have any questions about this offer or the internship program, please don't 
            hesitate to reach out to us.
          </p>
          
          <p style="margin-bottom: 8px;">Welcome aboard!</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div>
            This offer letter is confidential and intended solely for the named recipient.
          </div>
          <div style="margin-top: 8px;">
            &copy; ${new Date().getFullYear()} Codeunia. All rights reserved.
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
            &copy; ${new Date().getFullYear()} Codeunia. All rights reserved.
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
