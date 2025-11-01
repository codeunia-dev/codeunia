import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  // Initialize Resend only when needed
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Resend API key not configured" },
      { status: 500 }
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { subject, content } = await request.json()

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Fetch active subscribers
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscriptions")
      .select("email, unsubscribe_token")
      .eq("status", "subscribed")

    if (error || !subscribers) {
      console.error("Fetch subscribers error:", error)
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      )
    }

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 400 }
      )
    }

    // Send emails in batches
    const batchSize = 50
    let sentCount = 0
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://codeunia.com"

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      const emailPromises = batch.map(async (subscriber) => {
        const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">
                Codeunia
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Empowering the next generation of coders
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- CTA Section (Optional) -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${siteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                Visit Codeunia
              </a>
            </td>
          </tr>
          
          <!-- Social Links -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; font-weight: 600;">
                Connect with us
              </p>
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://github.com/Codeunia" style="display: inline-block; width: 36px; height: 36px; background-color: #24292e; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                      <span style="color: #ffffff; font-size: 18px;">G</span>
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://x.com/codeunia" style="display: inline-block; width: 36px; height: 36px; background-color: #1DA1F2; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                      <span style="color: #ffffff; font-size: 18px;">𝕏</span>
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.linkedin.com/company/codeunia" style="display: inline-block; width: 36px; height: 36px; background-color: #0077b5; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                      <span style="color: #ffffff; font-size: 18px;">in</span>
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://www.instagram.com/codeunia" style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none;">
                      <span style="color: #ffffff; font-size: 18px;">📷</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                You're receiving this email because you subscribed to Codeunia newsletter.
              </p>
              <p style="margin: 0; font-size: 13px;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                <span style="color: #d1d5db; margin: 0 8px;">|</span>
                <a href="${siteUrl}/contact" style="color: #9ca3af; text-decoration: underline;">Contact Us</a>
              </p>
              <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Codeunia. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `

        try {
          await resend.emails.send({
            from: "Codeunia <newsletter@codeunia.com>",
            to: subscriber.email,
            subject: subject,
            html: htmlContent,
          })
          return true
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error)
          return false
        }
      })

      const results = await Promise.all(emailPromises)
      sentCount += results.filter(Boolean).length

      // Small delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return NextResponse.json({
      message: "Newsletter sent successfully",
      sent: sentCount,
      total: subscribers.length,
    })
  } catch (error) {
    console.error("Send newsletter error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
