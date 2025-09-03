import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { jsPDF } from 'jspdf';

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

// Fallback PDF generation using jsPDF for serverless environments
async function generateOfferLetterFallback(data: InternshipOfferLetterData): Promise<Buffer> {
  const {
    applicantName,
    internshipTitle,
    domain,
    level,
    duration,
    startDate,
    endDate,
    isPaid,
    remarks
  } = data

  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(0, 123, 255)
  doc.text('Codeunia', 20, 30)

  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  doc.text('Internship Offer Letter', 20, 50)

  // Date
  doc.setFontSize(12)
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, 20, 70)

  // Content
  doc.setFontSize(14)
  doc.text(`Dear ${applicantName},`, 20, 90)

  const content = [
    '',
    'Congratulations! We are delighted to offer you the position of',
    `${internshipTitle} intern at Codeunia.`,
    '',
    `We are pleased to offer you this ${duration}-week internship in the`,
    `${domain} domain at the ${level} level, starting from`,
    `${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}.`,
    '',
    'What You\'ll Get:',
    '• Hands-on experience with real-world projects',
    '• Certificate of completion upon successful internship',
    '• Regular mentorship and feedback through weekly code reviews',
    ...(isPaid ? [
      '• One-on-one mentorship from industry professionals',
      '• Letter of recommendation (based on performance)'
    ] : []),
    '',
    remarks || 'We are excited to have you join our team and look forward to your contributions.',
    '',
    'Welcome aboard!',
    '',
    'Best regards,',
    'Codeunia Team'
  ]

  let yPosition = 110
  content.forEach(line => {
    if (line.startsWith('•')) {
      doc.setFontSize(12)
    } else {
      doc.setFontSize(14)
    }

    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    doc.text(line, 20, yPosition)
    yPosition += line === '' ? 5 : 8
  })

  // Footer
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Mohali, Punjab, India | +91-8699025107 | connect@codeunia.com', 20, 280)

  return Buffer.from(doc.output('arraybuffer'))
}

export async function generateInternshipOfferLetterPDF(data: InternshipOfferLetterData): Promise<Buffer> {
  const {
    applicantName,
    internshipTitle,
    domain,
    level,
    duration,
    startDate,
    endDate,
    isPaid,
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
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      font-family: Arial, sans-serif;
      font-size: 15px;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
    
    .document-title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin: -5px 0 15px 0;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .date-section {
      text-align: right;
      margin-bottom: 20px;
      font-size: 14px;
      color: #000000;
    }
    
    .content {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    
    .content p {
      margin-bottom: 15px;
    }
    
    .benefits {
      margin: 20px 0;
    }
    
    .benefits h3 {
      font-size: 20px;
      font-weight: bold;
      color: #10b981;
      margin-bottom: 15px;
    }
    
    .benefits ul {
      list-style: none;
      padding: 0;
    }
    
    .benefits li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
      font-size: 15px;
    }
    
    .benefits li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-size: 20px;
      line-height: 1;
      color: #10b981;
    }
    
    .highlight {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#ffffff" cellpadding="0" cellspacing="0" style="margin:0;padding:0;font-family:Arial,sans-serif;height:100vh;">
    <tr>
      <td style="padding:0;height:100%;">
        <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;height:100%;">
          <!-- Header Bar -->
          <tr>
            <td colspan="2" bgcolor="#007bff" style="height:25px;"></td>
          </tr>
          <!-- Header Content -->
          <tr>
            <td style="padding:25px 30px 15px 30px;vertical-align:top;">
              <img src="https://ocnorlktyfswjqgvzrve.supabase.co/storage/v1/object/public/public-assets/codeunialogo.jpg" width="40" height="40" alt="Codeunia Logo" style="display:inline-block;vertical-align:middle;border-radius:12px;background:#007aff;">
              <span style="font-size:24px;color:#007aff;font-weight:bold;font-family:Arial,sans-serif;vertical-align:middle;margin-left:12px;">Codeunia</span>
            </td>
            <td style="padding:25px 30px 15px 0;text-align:right;vertical-align:top;font-size:14px;font-family:Arial,sans-serif;color:#111;">
              <b style="color:#000;">Phone:</b> <a href="tel:+918699025107" style="color:#007bff;text-decoration:none;">+91-8699025107</a><br>
              <b style="color:#000;">Web:</b> <a href="https://codeunia.com" style="color:#007bff;text-decoration:none;">codeunia.com</a><br>
              <b style="color:#000;">Address:</b> Mohali, Punjab, India
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td colspan="2" style="padding:0 30px;">
              <hr style="border:0;border-top:2px solid #007bff;margin:5px 0 -5px 0;">
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td colspan="2" style="padding:0px 30px 25px 30px;">
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
                  If you have any questions, please reach out.
                </p>
                
                <p style="margin-bottom: 8px;"><strong>Welcome aboard!</strong></p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td colspan="2" style="padding:20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;font-family:Arial,sans-serif;color:#222;">
                    <span style="font-size:16px;">📍</span> Mohali, Punjab, India
                  </td>
                  <td style="font-size:14px;font-family:Arial,sans-serif;color:#222;text-align:center;">
                    <span style="font-size:16px;">📞</span> +91-8699025107
                  </td>
                  <td style="font-size:14px;font-family:Arial,sans-serif;color:#222;text-align:right;">
                    <span style="font-size:16px;">✉️</span> connect@codeunia.com
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer Bar -->
          <tr>
            <td colspan="2" bgcolor="#007bff" style="height:20px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  let browser
  try {
    // Use serverless-compatible Chrome for production
    const isProduction = process.env.NODE_ENV === 'production'

    console.log('PDF Generation Environment:', {
      isProduction,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      chromiumAvailable: !!chromium,
      memoryUsage: process.memoryUsage(),
      env: {
        VERCEL: process.env.VERCEL,
        AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
        NETLIFY: process.env.NETLIFY
      }
    })

    let executablePath
    let browserArgs

    // Use @sparticuz/chromium only on Linux platforms (serverless environments)
    const isLinux = process.platform === 'linux'
    const useChromium = isProduction && isLinux

    if (useChromium) {
      try {
        executablePath = await chromium.executablePath()
        browserArgs = chromium.args
        console.log('✅ Using @sparticuz/chromium for Linux production')
      } catch (error) {
        console.warn('❌ Failed to get chromium executable path:', error)
        executablePath = puppeteer.executablePath()
        browserArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    } else {
      executablePath = puppeteer.executablePath()
      browserArgs = ['--no-sandbox', '--disable-setuid-sandbox']
      console.log(`✅ Using regular Puppeteer (platform: ${process.platform}, production: ${isProduction})`)
    }

    const launchOptions = {
      args: browserArgs,
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
      timeout: 30000, // 30 second timeout
    }

    console.log('Puppeteer launch options:', {
      argsLength: launchOptions.args?.length,
      executablePath: typeof launchOptions.executablePath === 'string' ? 'custom' : 'default',
      headless: launchOptions.headless,
      timeout: launchOptions.timeout
    })

    // Launch browser with enhanced error handling
    console.log('🚀 Attempting to launch browser...')
    browser = await puppeteer.launch(launchOptions)
    console.log('✅ Browser launched successfully')

    console.log('📄 Creating new page...')
    const page = await browser.newPage()

    // Set a reasonable timeout
    page.setDefaultTimeout(30000)

    console.log('🔧 Setting page content...')
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('📋 Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      timeout: 30000
    })

    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    return Buffer.from(pdfBuffer)

  } catch (error) {
    console.error('❌ Puppeteer PDF generation failed, using fallback')
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 1000) : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as { code?: string })?.code,
      errno: (error as { errno?: number })?.errno,
      syscall: (error as { syscall?: string })?.syscall
    })

    // Use fallback PDF generation
    console.log('🔄 Switching to jsPDF fallback...')
    return await generateOfferLetterFallback(data)
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
    // Use serverless-compatible Chrome for production
    const isProduction = process.env.NODE_ENV === 'production'

    let executablePath
    let browserArgs

    // Use @sparticuz/chromium only on Linux platforms (serverless environments)
    const isLinux = process.platform === 'linux'
    const useChromium = isProduction && isLinux

    if (useChromium) {
      try {
        executablePath = await chromium.executablePath()
        browserArgs = chromium.args
      } catch (error) {
        console.warn('Failed to get chromium executable path, using default:', error)
        executablePath = puppeteer.executablePath()
        browserArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    } else {
      executablePath = puppeteer.executablePath()
      browserArgs = ['--no-sandbox', '--disable-setuid-sandbox']
    }

    const launchOptions = {
      args: browserArgs,
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
      timeout: 30000,
    }

    browser = await puppeteer.launch(launchOptions)

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

  } catch (error) {
    console.error('Puppeteer membership card PDF generation failed:', error)
    // For membership cards, we don't have a fallback, so we'll throw the error
    throw error
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
