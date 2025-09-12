import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


interface EmailData {
  email: string;
  name: string;
  certificateUrl: string;
  certId: string;
  context: 'test' | 'event' | 'hackathon';
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, certificateUrl, certId, context }: EmailData = await request.json();
    
    if (!email || !name || !certificateUrl || !certId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get verification URL
    const verificationUrl = `/verify/cert/${certId}`;

    // Create email content based on context
    const emailContent = createEmailContent(name, certificateUrl, verificationUrl, certId, context);

    // Send email using Supabase Edge Functions or external service
    // For now, we'll use a simple approach with a webhook or email service
    
    // You can integrate with services like:
    // - Resend (resend.com)
    // - SendGrid
    // - Mailgun
    // - Supabase Edge Functions with email service
    
    const emailResult = await sendEmail(email, emailContent);

    if (emailResult.success) {
      // Update certificate record to mark as sent
      const { error: updateError } = await supabase
        .from('certificates')
        .update({ sent_via_email: true })
        .eq('cert_id', certId);

      if (updateError) {
        console.error('Error updating certificate email status:', updateError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Certificate sent successfully' 
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send email');
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send certificate email' },
      { status: 500 }
    );
  }
}

function createEmailContent(
  name: string, 
  certificateUrl: string, 
  verificationUrl: string, 
  certId: string,
  context: 'test' | 'event' | 'hackathon'
) {
  const contextText = {
    test: 'test completion',
    event: 'event participation',
    hackathon: 'hackathon participation'
  }[context];

  const subject = `Your CodeUnia Certificate - ${contextText}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your CodeUnia Certificate</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background-color: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                font-size: 28px;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 10px 5px;
            }
            .button:hover {
                background-color: #1d4ed8;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .verification-info {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                font-size: 14px;
            }
            .qr-code {
                text-align: center;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏆 CodeUnia</div>
                <h1 class="title">Congratulations!</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                
                <p>We're excited to inform you that your certificate for ${contextText} is ready! 🎉</p>
                
                <p>Your certificate has been generated and is now available for download. This certificate represents your achievement and can be shared with employers, added to your portfolio, or used for professional development purposes.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${certificateUrl}" class="button">
                        📄 Download Certificate
                    </a>
                </div>
                
                <div class="verification-info">
                    <h3>🔍 Certificate Verification</h3>
                    <p>Your certificate can be verified online using the following link:</p>
                    <p><a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a></p>
                    <p><strong>Certificate ID:</strong> ${certId}</p>
                </div>
                
                <h3>📱 Share Your Achievement</h3>
                <p>Don't forget to share your achievement on social media! Use the hashtag <strong>#CodeUnia</strong> to connect with our community.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://linkedin.com" class="button" style="background-color: #0077b5;">
                        📘 Share on LinkedIn
                    </a>
                    <a href="https://twitter.com" class="button" style="background-color: #1da1f2;">
                        🐦 Share on Twitter
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for participating in our ${contextText}!</p>
                <p>If you have any questions, please contact us at <a href="mailto:support@codeunia.com" style="color: #2563eb;">support@codeunia.com</a></p>
                <p>© 2024 CodeUnia. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
Congratulations ${name}!

Your CodeUnia certificate for ${contextText} is ready!

Download your certificate: ${certificateUrl}

Certificate Verification:
- URL: ${verificationUrl}
- Certificate ID: ${certId}

Share your achievement on social media using #CodeUnia!

If you have any questions, please contact us at support@codeunia.com

Thank you for participating in our ${contextText}!

© 2024 CodeUnia. All rights reserved.
  `;

  return {
    subject,
    html: htmlContent,
    text: textContent
  };
}

async function sendEmail(email: string, content: { subject: string; html: string; text: string }) {
  try {
    // This is a placeholder implementation
    // In production, you would integrate with an email service
    
    // Example with Resend (you would need to install @resend/node)
    // import { Resend } from '@resend/node';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const result = await resend.emails.send({
    //   from: 'certificates@codeunia.com',
    //   to: email,
    //   subject: content.subject,
    //   html: content.html,
    //   text: content.text
    // });
    
    // Example with SendGrid
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const result = await sgMail.send({
    //   to: email,
    //   from: 'certificates@codeunia.com',
    //   subject: content.subject,
    //   html: content.html,
    //   text: content.text
    // });
    
    // For now, we'll simulate a successful email send
    console.log('Email would be sent to:', email);
    console.log('Subject:', content.subject);
    console.log('Content preview:', content.html.substring(0, 200) + '...');
    
    // Simulate email service response
    return { success: true };
    
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 