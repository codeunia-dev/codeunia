"use client"

import { useEffect, useRef } from "react"
import { useAuth as useAuthStore, useAuthActions, initializeAuth, setupAuthListener } from "@/lib/stores/auth-store"

/**
 * Legacy useAuth hook that wraps the Zustand store for backward compatibility
 * @deprecated Use useAuthStore and useAuthActions directly for new code
 */
export function useAuth() {
  const { user, profile, loading, initialized, isLoggedIn, isAdmin } = useAuthStore()
  const { refreshSession } = useAuthActions()
  const initializationStarted = useRef(false)

  useEffect(() => {
    // Only initialize once, even if the component re-renders
    if (!initialized && !initializationStarted.current) {
      initializationStarted.current = true
      initializeAuth()
      setupAuthListener()
    }
  }, [initialized])

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