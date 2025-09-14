"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth as useAuthStore, useAuthActions, initializeAuth, setupAuthListener } from "@/lib/stores/auth-store"

/**
 * Legacy useAuth hook that wraps the Zustand store for backward compatibility
 * @deprecated Use useAuthStore and useAuthActions directly for new code
 */
export function useAuth() {
  const { user, profile, loading, initialized, isLoggedIn, isAdmin } = useAuthStore()
  const { refreshSession } = useAuthActions()
  const initializationStarted = useRef(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only initialize once, even if the component re-renders
    if (!initialized && !initializationStarted.current && isHydrated) {
      initializationStarted.current = true
      initializeAuth()
      setupAuthListener()
    }
  }, [initialized, isHydrated])

  // Return loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return {
      user: null,
      profile: null,
      loading: true,
      initialized: false,
      isLoggedIn: false,
      is_admin: false,
      error: null,
    }
  }

  return {
    user,
    profile,
    loading,
    initialized,
    isLoggedIn,
    is_admin: isAdmin,
    // Legacy compatibility
    error: null, // Errors are now handled in the store actions
  }
} 