'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/notifications'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (updateError) throw updateError

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }, [supabase])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (updateError) throw updateError

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      throw err
    }
  }, [supabase])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) throw deleteError

      // Update local state
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId)
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1))
        }
        return prev.filter(n => n.id !== notificationId)
      })
    } catch (err) {
      console.error('Error deleting notification:', err)
      throw err
    }
  }, [supabase])

  // Set up realtime subscription
  useEffect(() => {
    let channel: RealtimeChannel | null = null

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Subscribe to new notifications
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updatedNotification = payload.new as Notification
            setNotifications(prev =>
              prev.map(n =>
                n.id === updatedNotification.id ? updatedNotification : n
              )
            )
            // Recalculate unread count
            setNotifications(current => {
              setUnreadCount(current.filter(n => !n.read).length)
              return current
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const deletedId = payload.old.id
            setNotifications(prev => {
              const notification = prev.find(n => n.id === deletedId)
              if (notification && !notification.read) {
                setUnreadCount(count => Math.max(0, count - 1))
              }
              return prev.filter(n => n.id !== deletedId)
            })
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}
