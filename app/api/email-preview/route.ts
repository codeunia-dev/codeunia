import { NextRequest, NextResponse } from 'next/server';

// Email preview endpoint - create this at /app/api/email-preview/route.ts
// This lets you see how emails look without sending them

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'free'; // 'free' or 'premium'
  
  const isPremium = type === 'premium';
  const name = "Test User";
  const membershipId = isPremium ? "PREM-001-2025" : "FREE-001-2025";
  const cardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/membership/${membershipId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Codeunia Membership Card</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            
            .header {
                background: ${isPremium ? 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'};
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .tagline {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 300;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #2d3436;
            }
            
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #636e72;
                line-height: 1.8;
            }
            
            .membership-info {
                background: ${isPremium ? 'linear-gradient(135deg, #fdcb6e 0%, #e84393 100%)' : 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)'};
                padding: 25px;
                border-radius: 15px;
                margin: 30px 0;
                color: white;
                text-align: center;
            }
            
            .membership-type {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .membership-id {
                font-size: 24px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                background: rgba(255,255,255,0.2);
                padding: 10px 20px;
                border-radius: 8px;
                display: inline-block;
                margin: 10px 0;
            }
            
            .benefits {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 15px;
                margin: 30px 0;
            }
            
            .benefits-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #2d3436;
            }
            
            .benefits-list {
                list-style: none;
                padding: 0;
            }
            
            .benefits-list li {
                padding: 8px 0;
                color: #636e72;
                position: relative;
                padding-left: 25px;
            }
            
            .benefits-list li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: ${isPremium ? '#e84393' : '#00b894'};
                font-weight: bold;
                font-size: 16px;
            }
            
            .cta-button {
                display: inline-block;
                background: ${isPremium ? 'linear-gradient(135deg, #fdcb6e 0%, #e84393 100%)' : 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'};
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                display: block;
                margin: 30px auto;
                max-width: 250px;
                transition: transform 0.3s ease;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            .footer {
                background: #2d3436;
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            
            .crown {
                display: inline-block;
                font-size: 24px;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    🚀 Codeunia
                    ${isPremium ? '<span class="crown">👑</span>' : ''}
                </div>
                <div class="tagline">Empowering Coders, Building Futures</div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Welcome to Codeunia, ${name}! 🎉
                </div>
                
                <div class="message">
                    Thank you for joining our amazing community of developers! Your ${isPremium ? 'Premium ' : ''}membership is now active and we're excited to have you on board.
                </div>
                
                <div class="membership-info">
                    <div class="membership-type">
                        ${isPremium ? '👑 Premium Member' : '🌟 Free Member'}
                    </div>
                    <div>Your Membership ID</div>
                    <div class="membership-id">${membershipId}</div>
                    <div style="font-size: 14px; margin-top: 10px; opacity: 0.9;">
                        Keep this ID safe - you'll need it for events and verification
                    </div>
                </div>
                
                <div class="benefits">
                    <div class="benefits-title">
                        🎯 Your ${isPremium ? 'Premium ' : ''}Benefits Include:
                    </div>
                    <ul class="benefits-list">
                        ${isPremium ? `
                            <li>Golden username & Codeunia ID</li>
                            <li>3x leaderboard points multiplier</li>
                            <li>Free access to all paid events</li>
                            <li>Priority support & mentorship</li>
                            <li>Exclusive premium resources</li>
                            <li>Early access to new features</li>
                            <li>Premium badge on profile</li>
                        ` : `
                            <li>Access to community discussions</li>
                            <li>Participate in free events</li>
                            <li>Standard leaderboard access</li>
                            <li>Basic learning resources</li>
                            <li>Profile customization</li>
                        `}
                    </ul>
                </div>
                
                <a href="${cardUrl}" class="cta-button">
                    🎫 View Your Digital Card
                </a>
                
                <div class="message">
                    Your digital membership card is ready! Click the button above to view and download your official Codeunia membership card. You can also share it on social media to show off your new membership!
                </div>
                
                ${!isPremium ? `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                        <div style="color: #856404; font-weight: 600; margin-bottom: 10px;">
                            🚀 Ready to Level Up?
                        </div>
                        <div style="color: #856404; font-size: 14px; margin-bottom: 15px;">
                            Upgrade to Premium and unlock exclusive features, 3x points, and priority support!
                        </div>
                        <a href="/premium" style="background: linear-gradient(135deg, #fdcb6e 0%, #e84393 100%); color: white; text-decoration: none; padding: 10px 20px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                            Upgrade to Premium 👑
                        </a>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <div>
                    Questions? We're here to help! Reply to this email or contact us anytime.
                </div>
                
                <div style="margin-top: 20px; opacity: 0.8; font-size: 12px;">
                    © ${new Date().getFullYear()} Codeunia. All rights reserved.<br>
                    Questions? Contact us at <a href="mailto:support@codeunia.com" style="color: #74b9ff;">support@codeunia.com</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
