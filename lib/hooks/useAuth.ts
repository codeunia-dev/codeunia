"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

// Simple profile cache to avoid repeated database calls
const profileCache = new Map<string, { profile: { is_admin: boolean; first_name?: string; last_name?: string; email?: string; phone?: string; company?: string; current_position?: string }; timestamp: number }>()
const PROFILE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [is_admin, setIsAdmin] = useState(false)

  // Optimized profile fetching with caching
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Check cache first
    const cached = profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_DURATION) {
      return cached.profile
    }

    // Fetch from database
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, first_name, last_name, email, phone, company, current_position')
      .eq('id', userId)
      .single()

    // Cache the result
    if (profile) {
      profileCache.set(userId, { profile, timestamp: Date.now() })
    }

    return profile
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const supabase = createClient()

        // Get initial session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (mounted) {
          if (sessionError) {
            console.error('Session error:', sessionError)
            setError(sessionError.message)
            setIsAdmin(false)
          } else {
            setUser(session?.user ?? null)

            // Check admin status from profiles table with caching
            if (session?.user) {
              const profile = await fetchUserProfile(session.user.id)
              setIsAdmin(profile?.is_admin || false)
            } else {
              setIsAdmin(false)
            }
          }
          setLoading(false)
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (mounted) {
              setUser(session?.user ?? null)

              // Check admin status from profiles table with caching
              if (session?.user) {
                const profile = await fetchUserProfile(session.user.id)
                setIsAdmin(profile?.is_admin || false)
              } else {
                setIsAdmin(false)
              }

              setLoading(false)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err)
          setError(err instanceof Error ? err.message : 'Auth initialization failed')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [fetchUserProfile])

  return {
    user,
    loading,
    error,
    is_admin
  }
} 