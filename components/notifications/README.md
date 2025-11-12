# Notifications System

This directory contains the notification system components for the multi-company event hosting platform.

## Components

### NotificationCenter
The main notification dropdown component that displays in the dashboard header. Shows a bell icon with an unread count badge and opens a popover with the notification list.

**Features:**
- Real-time notification updates via Supabase Realtime
- Unread count badge
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Click to navigate to related content

**Usage:**
```tsx
import { NotificationCenter } from '@/components/notifications'

<NotificationCenter />
```

### NotificationItem
Individual notification item component that displays notification details and actions.

**Features:**
- Icon based on notification type
- Unread indicator
- Time ago display
- Action buttons (mark as read, delete)
- Click to navigate to action URL
- Hover effects

### NotificationPreferences
Settings component for managing notification preferences.

**Features:**
- Toggle email notifications
- Toggle push notifications
- Configure notification types (company updates, event updates, team updates, registration updates)
- Save preferences to user profile

**Usage:**
```tsx
import { NotificationPreferences } from '@/components/notifications'

<NotificationPreferences />
```

## Hooks

### useNotifications
Custom hook for managing notifications state and real-time updates.

**Features:**
- Fetch notifications
- Real-time subscription to new notifications
- Mark as read functionality
- Mark all as read functionality
- Delete notifications
- Unread count tracking

**Usage:**
```tsx
import { useNotifications } from '@/hooks/useNotifications'

const {
  notifications,
  loading,
  error,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  refetch
} = useNotifications()
```

## Services

### NotificationService
Server-side service for creating and managing notifications.

**Methods:**
- `createNotification(params)` - Create a single notification
- `notifyCompanyMembers(companyId, params)` - Notify all company members
- `notifyEventRegistration(eventId, companyId, participantName)` - Notify about new event registration
- `notifyTeamMemberJoined(companyId, memberName, memberEmail)` - Notify about new team member
- `markAsRead(notificationId, userId)` - Mark notification as read
- `markAllAsRead(userId)` - Mark all notifications as read
- `deleteNotification(notificationId, userId)` - Delete notification
- `getUnreadCount(userId)` - Get unread notification count

**Usage:**
```tsx
import { NotificationService } from '@/lib/services/notification-service'

await NotificationService.createNotification({
  user_id: userId,
  type: 'event_approved',
  title: 'Event Approved!',
  message: 'Your event has been approved',
  company_id: companyId,
  action_url: '/events/my-event',
  action_label: 'View Event'
})
```

## Database

### notifications table
Stores all notifications for users.

**Columns:**
- `id` - UUID primary key
- `user_id` - User who receives the notification
- `company_id` - Related company (optional)
- `type` - Notification type (enum)
- `title` - Notification title
- `message` - Notification message
- `action_url` - URL to navigate to (optional)
- `action_label` - Label for action button (optional)
- `event_id` - Related event (optional)
- `hackathon_id` - Related hackathon (optional)
- `read` - Whether notification has been read
- `read_at` - When notification was read
- `metadata` - Additional JSON data
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### Database Triggers
Automatic notifications are created via database triggers for:
- Company verification approved/rejected
- Event approved/rejected/changes requested
- Hackathon approved/rejected/changes requested

## Notification Types

- `company_verified` - Company has been verified
- `company_rejected` - Company verification rejected
- `event_approved` - Event has been approved
- `event_rejected` - Event has been rejected
- `event_changes_requested` - Changes requested for event
- `hackathon_approved` - Hackathon has been approved
- `hackathon_rejected` - Hackathon has been rejected
- `hackathon_changes_requested` - Changes requested for hackathon
- `new_event_registration` - New registration for event
- `new_hackathon_registration` - New registration for hackathon
- `team_member_invited` - Team member has been invited
- `team_member_joined` - Team member has joined
- `team_member_removed` - Team member has been removed
- `subscription_expiring` - Subscription is expiring soon
- `subscription_expired` - Subscription has expired

## API Routes

### GET /api/notifications
Fetch notifications for the current user.

**Query Parameters:**
- `limit` - Number of notifications to fetch (default: 50)
- `offset` - Offset for pagination (default: 0)
- `unread_only` - Only fetch unread notifications (default: false)

### PATCH /api/notifications/[id]
Update a notification (mark as read/unread).

**Body:**
```json
{
  "read": true
}
```

### DELETE /api/notifications/[id]
Delete a notification.

### POST /api/notifications/mark-all-read
Mark all notifications as read for the current user.

## Real-time Updates

The notification system uses Supabase Realtime to provide instant updates:

1. **INSERT events** - New notifications appear immediately
2. **UPDATE events** - Notification status updates in real-time
3. **DELETE events** - Deleted notifications are removed from the list

The subscription is automatically set up in the `useNotifications` hook and cleaned up on unmount.

## Styling

The notification components use Tailwind CSS and follow the existing design system:
- Dark theme compatible
- Responsive design
- Smooth animations
- Accessible (ARIA labels, keyboard navigation)

## Future Enhancements

Potential improvements for the notification system:
- Push notifications via service workers
- Email notification templates
- Notification grouping (e.g., "3 new registrations")
- Notification sound effects
- Notification preferences per notification type
- Notification history page
- Notification search and filtering
