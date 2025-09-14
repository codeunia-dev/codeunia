"use client"

import { useEffect } from "react"
import { useAuth as useAuthStore, useAuthActions, initializeAuth, setupAuthListener } from "@/lib/stores/auth-store"

/**
 * Legacy useAuth hook that wraps the Zustand store for backward compatibility
 * @deprecated Use useAuthStore and useAuthActions directly for new code
 */
export function useAuth() {
  const { user, profile, loading, initialized, isLoggedIn, isAdmin } = useAuthStore()
  const { refreshSession } = useAuthActions()

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
      setupAuthListener()
    }
  }, [initialized])

  return {
    user,
    profile,
    loading,
    isLoggedIn,
    is_admin: isAdmin,
    // Legacy compatibility
    error: null, // Errors are now handled in the store actions
  }
} 