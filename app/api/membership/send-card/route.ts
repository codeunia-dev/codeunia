import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

// Create Resend client function to avoid build-time initialization
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface MembershipCardEmailData {
  userId: string;
  email: string;
  name: string;
  membershipType: 'free' | 'premium';
  membershipId: string;
}

export async function POST(request: NextRequest) {
  console.log('📧 Email API called at:', new Date().toISOString());
  
  try {
    const { userId, email, name, membershipType, membershipId }: MembershipCardEmailData = await request.json();
    console.log('📧 Request data:', { userId, email, name, membershipType, membershipId });
    
    if (!userId || !email || !name || !membershipType || !membershipId) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔑 Resend API Key present:', !!process.env.RESEND_API_KEY);
    
    const supabase = await createClient();

    // Get user profile for additional details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('❌ User profile not found:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile found:', profile.id);

    console.log('📧 Preparing membership card email with beautiful template...');
    
    // Create email content using the membership card template
    const subject = `Welcome to Codeunia - Your ${profile.is_premium ? 'Premium ' : ''}Membership Card`;
    
    const memberName = profile.first_name || 'Member';
    const memberId = profile.codeunia_id || `CU${Date.now()}`;
    const isPremium = profile.is_premium;
    const getMembershipDuration = (joinDate: string) => {
      const join = new Date(joinDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - join.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
    };

    const membershipDuration = profile.created_at ? getMembershipDuration(profile.created_at) : '1 Year';

    // Create email template using exact structure from MembershipCard PDF content
    const createMembershipCardEmail = () => {
      return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Your Codeunia Membership Card</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
            <tr>
              <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 30px 20px 20px 20px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 32px; font-weight: bold; color: #7c3aed; padding: 8px 0;">Codeunia</td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 18px; color: #2563eb; font-weight: 600;">Empowering the Next Generation of Coders</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Thank You Section -->
                  <tr>
                    <td align="center" style="padding: 0 20px 30px 20px;">
                      <table width="500" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="font-size: 24px; font-weight: bold; color: #2563eb; padding-bottom: 8px;">THANK YOU</td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 14px; color: #f59e0b; font-weight: 600; padding-bottom: 16px;">FOR BEING A VALUED MEMBER</td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 14px; color: #374151; line-height: 1.6; padding-bottom: 16px;">
                            You are now an official Codeunia Member! Welcome to our global, student-led tech community focused on real-world collaboration, innovation, and learning.
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 14px; color: #374151; line-height: 1.6; padding-bottom: 20px;">
                            This digital card serves as proof of your active membership and access to exclusive benefits.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Benefits Section -->
                  <tr>
                    <td style="padding: 0 20px 30px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="50%" style="vertical-align: top; padding-right: 10px;">
                            
                            <h3 style="font-weight: bold; color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Open Community Network</h3>
                            <p style="color: #374151; margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                              Connect with students and professionals globally. Build teams, collaborate on projects, and develop lasting professional relationships across borders.
                            </p>
                            
                            <h4 style="font-weight: bold; color: #2563eb; margin: 0 0 4px 0; font-size: 14px;">Real-World Project Experience</h4>
                            <p style="color: #374151; margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                              Gain hands-on experience through live projects, open-source contributions, and startup collaborations. Turn learning into practical impact.
                            </p>
                            
                            <h4 style="font-weight: bold; color: #2563eb; margin: 0 0 4px 0; font-size: 14px;">Learning Tracks & Tech Events</h4>
                            <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.4;">
                              Access curated paths in AI, web development, and cybersecurity. Join workshops and bootcamps for all skill levels.
                            </p>
                            
                          </td>
                          <td width="50%" style="vertical-align: top; padding-left: 10px;">
                            
                            <h3 style="font-weight: bold; color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Career Readiness Programs</h3>
                            <p style="color: #374151; margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                              Get mock interviews, resume reviews, and job board access. Bridge the gap between your skills and industry opportunities.
                            </p>
                            
                            <h4 style="font-weight: bold; color: #2563eb; margin: 0 0 4px 0; font-size: 14px;">Innovation Challenges & Hackathons</h4>
                            <p style="color: #374151; margin: 0 0 16px 0; font-size: 14px; line-height: 1.4;">
                              Participate in global hackathons and challenges. Push your creativity and teamwork while earning recognition.
                            </p>
                            
                            <h4 style="font-weight: bold; color: #2563eb; margin: 0 0 4px 0; font-size: 14px;">Recognition, Rewards & Growth Paths</h4>
                            <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.4;">
                              Earn badges and leadership roles. Grow as a community ambassador or event lead.
                            </p>
                            
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Membership Card -->
                 <tr>
  <td align="center" style="padding: 0 20px 30px 20px;">
    <table width="500" cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden;">
      <tr>
        <td width="300" style="padding: 20px; background: linear-gradient(to bottom right, #f9fafb, white); vertical-align: top;">
          
          <!-- Member Badge -->
          <div style="margin-bottom: 16px;">
            <span style="display: inline-block; padding: 4px 16px; font-size: 12px; font-weight: bold; border-radius: 20px; border: 1px solid; ${isPremium ? 'background: linear-gradient(to right, #fbbf24, #f59e0b); color: #92400e; border-color: #fcd34d;' : 'background: #dbeafe; color: #1e40af; border-color: #bfdbfe;'}">${isPremium ? 'PREMIUM' : 'STUDENT'} MEMBER</span>
          </div>

          <!-- Organization -->
          <div style="margin-bottom: 16px;">
            <h1 style="font-size: 20px; font-weight: 900; color: #111827; margin: 0; letter-spacing: -0.025em;">CODEUNIA</h1>
            <p style="font-size: 12px; color: #6b7280; font-weight: 500; margin: 0;">ORGANIZATION</p>
          </div>

          <!-- Member Info -->
          <div style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">
            👤 Member: <span style="font-weight: 600; ${isPremium ? 'color: #f59e0b;' : 'color: #2563eb;'}">${memberName}</span>
          </div>

          <div style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">
            Member ID: <span style="font-weight: 600; font-family: monospace; ${isPremium ? 'color: #f59e0b;' : 'color: #2563eb;'}">${memberId}</span>
          </div>

          <!-- Status Badges -->
          <div style="margin-bottom: 20px;">
            <span style="display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; margin-right: 10px;">Active Member</span>
            <span style="display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a;">${new Date().getFullYear()}</span>
          </div>

          <!-- Validity -->
          <div style="font-size: 12px; color: #4b5563;">
            📅 Valued Codeunia Member from ${membershipDuration}
          </div>

        </td>
        <td width="200" style="background: linear-gradient(to bottom right, #7c3aed, #6d28d9); padding: 16px; color: white; text-align: center; vertical-align: top; position: relative;">
          
          <!-- Logo Section -->
          <div style="margin-bottom: 80px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #007AFF; margin: 4px 0 0 0; font-family: Arial, sans-serif;">Codeunia</h2>
            <p style="font-size: 12px; color: #c4b5fd; margin: 4px 0 0 0;">Empowering Coders Globally</p>
          </div>

          <!-- Footer - Positioned Lower -->
          <div style="position: absolute; bottom: 2px; left: 16px; right: 16px; text-align: center;">
            <div style="font-size: 12px; color: #c4b5fd;">Powered by Codeunia</div>
            <div style="font-size: 12px; color: #ddd6fe; margin-top: 2px;">✉️ <a href="mailto:connect@codeunia.com" style="color: #ddd6fe; text-decoration: none;">connect@codeunia.com</a></div>
          </div>

        </td>
      </tr>
    </table>
  </td>
</tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                      <p style="margin: 0 0 10px 0;">Questions? Contact us at <a href="mailto:connect@codeunia.com" style="color: #2563eb;">connect@codeunia.com</a></p>
                      <p style="margin: 0;">© ${new Date().getFullYear()} Codeunia. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    };

    const membershipCardEmailContent = createMembershipCardEmail();

    console.log('📨 Sending beautiful membership card email via Resend...');
    const resend = getResendClient();
    // Send email without PDF attachment, just the beautiful HTML template
    const emailResult = await resend.emails.send({
      from: 'Codeunia <connect@codeunia.com>',
      to: [email],
      subject: subject,
      html: membershipCardEmailContent,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    });

    console.log('📧 Resend result:', emailResult);

    if (emailResult.error) {
      console.log('❌ Resend error:', emailResult.error);
      throw new Error(emailResult.error.message);
    }

    console.log('✅ Email sent successfully, ID:', emailResult.data?.id);

    // Update profile to mark membership card as sent
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        membership_card_sent: true,
        membership_card_sent_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating membership card email status:', updateError);
    }

    console.log('✅ API response: Email sent successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Membership card sent successfully',
      emailId: emailResult.data?.id
    });

  } catch (error) {
    console.error('❌ Membership card email sending error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send membership card email', details: errorMessage },
      { status: 500 }
    );
  }
}
