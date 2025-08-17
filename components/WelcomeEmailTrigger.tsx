"use client"

import { useEffect } from 'react'
import { useMembershipCardEmail } from '@/hooks/useMembershipCardEmail'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export function WelcomeEmailTrigger() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { } = useMembershipCardEmail()

  useEffect(() => {
    // This will automatically trigger the email when conditions are met
    // The useMembershipCardEmail hook handles all the logic
  }, [user, profile])

  // This component doesn't render anything, it just handles the email logic
  return null
}
