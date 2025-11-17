import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  UserPlus,
  UserMinus,
  CreditCard,
  LucideIcon
} from 'lucide-react'
import type { NotificationType } from '@/types/notifications'

export function getNotificationIcon(type: NotificationType): LucideIcon {
  const iconMap: Record<NotificationType, LucideIcon> = {
    company_verified: CheckCircle2,
    company_rejected: XCircle,
    event_approved: CheckCircle2,
    event_rejected: XCircle,
    event_changes_requested: AlertCircle,
    event_updated: AlertCircle,
    event_status_changed: AlertCircle,
    hackathon_approved: CheckCircle2,
    hackathon_rejected: XCircle,
    hackathon_changes_requested: AlertCircle,
    hackathon_updated: AlertCircle,
    hackathon_status_changed: AlertCircle,
    new_event_registration: Calendar,
    new_hackathon_registration: Calendar,
    team_member_invited: UserPlus,
    team_member_joined: Users,
    team_member_removed: UserMinus,
    subscription_expiring: CreditCard,
    subscription_expired: AlertCircle
  }

  return iconMap[type] || AlertCircle
}

export function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    company_verified: 'text-green-500',
    company_rejected: 'text-red-500',
    event_approved: 'text-green-500',
    event_rejected: 'text-red-500',
    event_changes_requested: 'text-yellow-500',
    event_updated: 'text-orange-500',
    event_status_changed: 'text-yellow-500',
    hackathon_approved: 'text-green-500',
    hackathon_rejected: 'text-red-500',
    hackathon_changes_requested: 'text-yellow-500',
    hackathon_updated: 'text-orange-500',
    hackathon_status_changed: 'text-yellow-500',
    new_event_registration: 'text-blue-500',
    new_hackathon_registration: 'text-blue-500',
    team_member_invited: 'text-blue-500',
    team_member_joined: 'text-green-500',
    team_member_removed: 'text-orange-500',
    subscription_expiring: 'text-yellow-500',
    subscription_expired: 'text-red-500'
  }

  return colorMap[type] || 'text-gray-500'
}
