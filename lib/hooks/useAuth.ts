"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [is_admin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

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
            
            // Check admin status from profiles table
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single()
              
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
              
              // Check admin status from profiles table
              if (session?.user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('is_admin')
                  .eq('id', session.user.id)
                  .single()
                
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
  }, [isHydrated])

  // Return loading state during hydration
  if (!isHydrated) {
    return { user: null, loading: true, error: null, is_admin: false }
  }

  return { 
    user, 
    loading, 
    error,
    is_admin
  }
} 