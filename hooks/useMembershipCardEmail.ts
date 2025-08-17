"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { toast } from "sonner"

export function useMembershipCardEmail() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [emailSent, setEmailSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasTriedAutoSend, setHasTriedAutoSend] = useState(false)

  const sendMembershipCard = async (force = false) => {
    if (!user || !profile || isSending) return
    
    // Skip if already sent (unless forced)
    if (!force && (profile.membership_card_sent || emailSent)) return

    // Get display name (simplified - no profile completion required)
    const name = profile.first_name && profile.last_name 
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.username || user.email?.split('@')[0] || 'Member'

    setIsSending(true)

    try {

      // Check if user has premium status
      const isPremium = profile.is_premium && profile.premium_expires_at && 
        new Date(profile.premium_expires_at) > new Date()

      const membershipType = isPremium ? 'premium' : 'free'
      const membershipId = profile.codeunia_id || `CU-${user.id.slice(-4)}`

      const response = await fetch('/api/membership/send-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name,
          membershipType,
          membershipId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        if (!force) {
          toast.success('🎉 Welcome! Your membership card has been sent to your email!', {
            description: 'Check your inbox for your digital membership card.',
            duration: 5000,
          })
        } else {
          toast.success('📧 Membership card sent successfully!', {
            description: 'Check your email for your updated membership card.',
            duration: 3000,
          })
        }
      } else {
        throw new Error(data.error || 'Failed to send membership card')
      }
    } catch (error) {
      console.error('Error sending membership card:', error)
      toast.error('Failed to send membership card', {
        description: 'Please try again or contact support if the issue persists.',
      })
    } finally {
      setIsSending(false)
    }
  }

  // Reset auto-send flag when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      setHasTriedAutoSend(false);
      setEmailSent(false);
    }
  }, [user]);

  // Auto-send on first login (with protection against infinite loops)
  useEffect(() => {
    const shouldAutoSend = user && profile && 
      !profile.membership_card_sent && 
      !emailSent && 
      !hasTriedAutoSend && 
      !isSending;

    if (shouldAutoSend) {
      console.log('Auto-sending membership card email (first time)...');
      setHasTriedAutoSend(true);
      sendMembershipCard();
    }
  }, [user, profile, emailSent, hasTriedAutoSend, isSending]);

  return {
    sendMembershipCard,
    isSending,
    emailSent: emailSent || profile?.membership_card_sent,
  }
}
