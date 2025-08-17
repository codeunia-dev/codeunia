import puppeteer from 'puppeteer';

interface MembershipCardData {
  name: string;
  memberId: string;
  membershipType: 'free' | 'premium';
  joinDate: string;
  email: string;
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
