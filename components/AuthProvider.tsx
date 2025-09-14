"use client"

import { useEffect } from 'react'
import { initializeAuth, setupAuthListener } from '@/lib/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Initialize auth state and set up listeners
    initializeAuth()
    setupAuthListener()
  }, [])

  return <>{children}</>
}
