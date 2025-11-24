import { createClient } from '@/lib/supabase/server'
import type { CompanyNotificationPreferences } from '@/types/company'

/**
 * Get notification preferences for a company
 */
export async function getCompanyNotificationPreferences(
  companyId: string
): Promise<CompanyNotificationPreferences | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('companies')
      .select(
        'email_new_registration, email_event_approved, email_event_rejected, email_team_member_joined, email_subscription_expiring'
      )
      .eq('id', companyId)
      .single()

    if (error || !data) {
      console.error('Error fetching company notification preferences:', error)
      return null
    }

    return {
      email_new_registration: data.email_new_registration ?? true,
      email_event_approved: data.email_event_approved ?? true,
      email_event_rejected: data.email_event_rejected ?? true,
      email_team_member_joined: data.email_team_member_joined ?? true,
      email_subscription_expiring: data.email_subscription_expiring ?? true,
    }
  } catch (error) {
    console.error('Error in getCompanyNotificationPreferences:', error)
    return null
  }
}

/**
 * Check if a specific notification type is enabled for a company
 */
export async function isNotificationEnabled(
  companyId: string,
  notificationType: keyof CompanyNotificationPreferences
): Promise<boolean> {
  const preferences = await getCompanyNotificationPreferences(companyId)
  
  if (!preferences) {
    // Default to true if we can't fetch preferences
    return true
  }

  return preferences[notificationType] ?? true
}

/**
 * Get company owner and admin emails for notifications
 */
export async function getCompanyNotificationRecipients(
  companyId: string
): Promise<string[]> {
  try {
    const supabase = await createClient()

    // Get all active owners and admins
    const { data: members, error } = await supabase
      .from('company_members')
      .select('user_id')
      .eq('company_id', companyId)
      .in('role', ['owner', 'admin'])
      .eq('status', 'active')

    if (error || !members || members.length === 0) {
      console.error('Error fetching company members:', error)
      return []
    }

    // Get user emails
    const userIds = members.map((m) => m.user_id)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('email')
      .in('id', userIds)

    if (usersError || !users) {
      console.error('Error fetching user emails:', usersError)
      return []
    }

    return users.map((u) => u.email).filter(Boolean)
  } catch (error) {
    console.error('Error in getCompanyNotificationRecipients:', error)
    return []
  }
}

/**
 * Send notification email if enabled
 * This is a helper function that checks preferences before sending
 */
export async function sendCompanyNotificationIfEnabled(
  companyId: string,
  notificationType: keyof CompanyNotificationPreferences,
  emailData: {
    subject: string
    body: string
    recipients?: string[] // Optional: override default recipients
  }
): Promise<boolean> {
  try {
    // Check if notification is enabled
    const isEnabled = await isNotificationEnabled(companyId, notificationType)
    
    if (!isEnabled) {
      console.log(`Notification ${notificationType} is disabled for company ${companyId}`)
      return false
    }

    // Get recipients if not provided
    const recipients = emailData.recipients || await getCompanyNotificationRecipients(companyId)
    
    if (recipients.length === 0) {
      console.log(`No recipients found for company ${companyId}`)
      return false
    }

    // TODO: Integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For now, just log the email
    console.log('Sending notification email:', {
      companyId,
      notificationType,
      recipients,
      subject: emailData.subject,
    })

    // Example integration with email service:
    // await sendEmail({
    //   to: recipients,
    //   subject: emailData.subject,
    //   html: emailData.body,
    // })

    return true
  } catch (error) {
    console.error('Error in sendCompanyNotificationIfEnabled:', error)
    return false
  }
}
