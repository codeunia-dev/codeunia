'use client'

import { formatDistanceToNow } from 'date-fns'
import { Check, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'
import Link from 'next/link'
import { getNotificationIcon } from './notification-utils'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true
  })

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.action_url) {
      onClose()
    }
  }

  const content = (
    <div
      className={cn(
        'flex gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer group',
        !notification.read && 'bg-accent/30'
      )}
      onClick={handleClick}
    >
      <div className={cn(
        'flex-shrink-0 mt-1',
        !notification.read ? 'text-primary' : 'text-muted-foreground'
      )}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium leading-tight',
            !notification.read && 'font-semibold'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
                title="Mark as read"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {notification.action_url && notification.action_label && (
          <div className="pt-2">
            <span className="inline-flex items-center text-xs font-medium text-primary hover:underline">
              {notification.action_label}
              <ExternalLink className="h-3 w-3 ml-1" />
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    )
  }

  return content
}
