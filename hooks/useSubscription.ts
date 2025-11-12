'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface SubscriptionUsage {
  events_this_month: number
  team_members: number
  limits: {
    events_per_month: number | null
    team_members: number | null
    auto_approval: boolean
    api_access: boolean
    custom_branding: boolean
    priority_support: boolean
  }
  can_create_event: boolean
  can_add_team_member: boolean
  events_remaining: number | null
  team_members_remaining: number | null
  subscription_expires_soon: boolean
  days_until_expiry: number | null
}

export function useSubscription(companySlug: string | undefined) {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companySlug) {
      setLoading(false)
      return
    }

    fetchUsage()
  }, [companySlug])

  const fetchUsage = async () => {
    if (!companySlug) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${companySlug}/subscription/usage`)

      if (!response.ok) {
        throw new Error('Failed to fetch subscription usage')
      }

      const data = await response.json()
      setUsage(data.usage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription'
      setError(errorMessage)
      console.error('Error fetching subscription usage:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLimit = (action: 'create_event' | 'add_team_member'): boolean => {
    if (!usage) return false

    if (action === 'create_event') {
      return usage.can_create_event
    }

    if (action === 'add_team_member') {
      return usage.can_add_team_member
    }

    return false
  }

  const showUpgradePrompt = (action: 'create_event' | 'add_team_member') => {
    if (!usage) return

    const limitType = action === 'create_event' ? 'events' : 'team members'
    const limit =
      action === 'create_event'
        ? usage.limits.events_per_month
        : usage.limits.team_members
    const current =
      action === 'create_event' ? usage.events_this_month : usage.team_members

    toast.error(`You've reached your ${limitType} limit`, {
      description: `Current usage: ${current} / ${limit}. Upgrade your plan to continue.`,
      action: {
        label: 'Upgrade',
        onClick: () => {
          window.location.href = `/dashboard/company/${companySlug}/subscription`
        },
      },
    })
  }

  return {
    usage,
    loading,
    error,
    checkLimit,
    showUpgradePrompt,
    refetch: fetchUsage,
  }
}
