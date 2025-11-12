export type NotificationType =
  | 'company_verified'
  | 'company_rejected'
  | 'event_approved'
  | 'event_rejected'
  | 'event_changes_requested'
  | 'hackathon_approved'
  | 'hackathon_rejected'
  | 'hackathon_changes_requested'
  | 'new_event_registration'
  | 'new_hackathon_registration'
  | 'team_member_invited'
  | 'team_member_joined'
  | 'team_member_removed'
  | 'subscription_expiring'
  | 'subscription_expired'

export interface Notification {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  company_id?: string
  type: NotificationType
  title: string
  message: string
  action_url?: string
  action_label?: string
  event_id?: string
  hackathon_id?: string
  read: boolean
  read_at?: string
  metadata?: Record<string, unknown>
}

export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  company_updates: boolean
  event_updates: boolean
  team_updates: boolean
  registration_updates: boolean
}

export interface CreateNotificationParams {
  user_id: string
  type: NotificationType
  title: string
  message: string
  company_id?: string
  action_url?: string
  action_label?: string
  event_id?: string
  hackathon_id?: string
  metadata?: Record<string, unknown>
}
