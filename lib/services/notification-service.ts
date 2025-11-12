import { createClient } from '@/lib/supabase/server'
import type { CreateNotificationParams, Notification } from '@/types/notifications'

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(
    params: CreateNotificationParams
  ): Promise<Notification | null> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          company_id: params.company_id,
          type: params.type,
          title: params.title,
          message: params.message,
          action_url: params.action_url,
          action_label: params.action_label,
          event_id: params.event_id,
          hackathon_id: params.hackathon_id,
          metadata: params.metadata || {}
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createNotification:', error)
      return null
    }
  }

  /**
   * Create notifications for all company members
   */
  static async notifyCompanyMembers(
    companyId: string,
    params: Omit<CreateNotificationParams, 'user_id'>
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Get all active company members
      const { data: members, error: membersError } = await supabase
        .from('company_members')
        .select('user_id')
        .eq('company_id', companyId)
        .eq('status', 'active')

      if (membersError) {
        console.error('Error fetching company members:', membersError)
        return
      }

      if (!members || members.length === 0) {
        return
      }

      // Create notifications for all members
      const notifications = members.map(member => ({
        user_id: member.user_id,
        company_id: companyId,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.action_url,
        action_label: params.action_label,
        event_id: params.event_id,
        hackathon_id: params.hackathon_id,
        metadata: params.metadata || {}
      }))

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error creating notifications:', insertError)
      }
    } catch (error) {
      console.error('Error in notifyCompanyMembers:', error)
    }
  }

  /**
   * Notify about new event registration
   */
  static async notifyEventRegistration(
    eventId: string,
    companyId: string,
    participantName: string
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, slug')
        .eq('id', eventId)
        .single()

      if (eventError || !event) {
        console.error('Error fetching event:', eventError)
        return
      }

      await this.notifyCompanyMembers(companyId, {
        type: 'new_event_registration',
        title: 'New Event Registration',
        message: `${participantName} registered for "${event.title}"`,
        company_id: companyId,
        action_url: `/dashboard/company/events/${event.slug}`,
        action_label: 'View Event',
        event_id: eventId,
        metadata: {
          event_title: event.title,
          participant_name: participantName
        }
      })
    } catch (error) {
      console.error('Error in notifyEventRegistration:', error)
    }
  }

  /**
   * Notify about team member joining
   */
  static async notifyTeamMemberJoined(
    companyId: string,
    memberName: string,
    memberEmail: string
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name, slug')
        .eq('id', companyId)
        .single()

      if (companyError || !company) {
        console.error('Error fetching company:', companyError)
        return
      }

      await this.notifyCompanyMembers(companyId, {
        type: 'team_member_joined',
        title: 'New Team Member',
        message: `${memberName} (${memberEmail}) has joined your team`,
        company_id: companyId,
        action_url: `/dashboard/company/${company.slug}/team`,
        action_label: 'View Team',
        metadata: {
          member_name: memberName,
          member_email: memberEmail
        }
      })
    } catch (error) {
      console.error('Error in notifyTeamMemberJoined:', error)
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markAsRead:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
      return false
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting notification:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteNotification:', error)
      return false
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = await createClient()

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  }
}
