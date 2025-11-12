'use client'

import { useState, useEffect, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import type { NotificationPreferences as NotificationPreferencesType } from '@/types/notifications'

const defaultPreferences: NotificationPreferencesType = {
  email_notifications: true,
  push_notifications: false,
  company_updates: true,
  event_updates: true,
  team_updates: true,
  registration_updates: true
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferencesType>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data?.notification_preferences) {
        setPreferences({ ...defaultPreferences, ...data.notification_preferences })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const savePreferences = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferencesType, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications about your company and events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="company-updates">Company Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Verification status and company changes
                </p>
              </div>
              <Switch
                id="company-updates"
                checked={preferences.company_updates}
                onCheckedChange={(checked) => updatePreference('company_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-updates">Event Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Event approval status and moderation feedback
                </p>
              </div>
              <Switch
                id="event-updates"
                checked={preferences.event_updates}
                onCheckedChange={(checked) => updatePreference('event_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="team-updates">Team Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Team member invitations and changes
                </p>
              </div>
              <Switch
                id="team-updates"
                checked={preferences.team_updates}
                onCheckedChange={(checked) => updatePreference('team_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="registration-updates">Registration Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New event and hackathon registrations
                </p>
              </div>
              <Switch
                id="registration-updates"
                checked={preferences.registration_updates}
                onCheckedChange={(checked) => updatePreference('registration_updates', checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
