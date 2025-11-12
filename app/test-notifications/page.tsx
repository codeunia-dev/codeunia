'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationCenter } from '@/components/notifications'
import { NotificationPreferences } from '@/components/notifications'
import { useNotifications } from '@/hooks/useNotifications'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export default function TestNotificationsPage() {
  const { notifications, unreadCount, refetch } = useNotifications()
  const [creating, setCreating] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const createTestNotification = async () => {
    try {
      setCreating(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create test notifications',
          variant: 'destructive'
        })
        return
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'event_approved',
          title: 'Test Notification',
          message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
          action_url: '/test-notifications',
          action_label: 'View Test Page'
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Test notification created!',
        variant: 'default'
      })

      // Refetch notifications
      setTimeout(() => refetch(), 500)
    } catch (error) {
      console.error('Error creating test notification:', error)
      toast({
        title: 'Error',
        description: 'Failed to create test notification',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification System Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the notification system functionality
          </p>
        </div>
        <NotificationCenter />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Stats</CardTitle>
            <CardDescription>Current notification statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Notifications:</span>
              <span className="text-2xl font-bold">{notifications.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Unread Count:</span>
              <span className="text-2xl font-bold text-primary">{unreadCount}</span>
            </div>
            <div className="pt-4">
              <Button
                onClick={createTestNotification}
                disabled={creating}
                className="w-full"
              >
                {creating ? 'Creating...' : 'Create Test Notification'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Your latest notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications yet. Create a test notification to see it here.
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NotificationPreferences />

      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
          <CardDescription>How the notification system works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Features Implemented:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Real-time notifications via Supabase Realtime</li>
              <li>Notification badge with unread count</li>
              <li>Mark as read/unread functionality</li>
              <li>Mark all as read</li>
              <li>Delete notifications</li>
              <li>Notification preferences</li>
              <li>Database triggers for automatic notifications</li>
              <li>API routes for notification management</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Notification Types:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Company verified/rejected</li>
              <li>Event approved/rejected/changes requested</li>
              <li>Hackathon approved/rejected/changes requested</li>
              <li>New event/hackathon registrations</li>
              <li>Team member invited/joined/removed</li>
              <li>Subscription expiring/expired</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
