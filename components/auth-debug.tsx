"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { testSupabaseConnection } from '@/lib/supabase/test-connection'
import type { Session, User } from '@supabase/supabase-js'

export function AuthDebug() {
  const [authState, setAuthState] = useState<{
    loading: boolean
    error: string | null
    session: Session | null
    user: User | null
    connectionStatus: string
  }>({
    loading: true,
    error: null,
    session: null,
    user: null,
    connectionStatus: 'Unknown'
  })

  useEffect(() => {
    const debugAuth = async () => {
      try {
        console.log('🔍 Debug: Starting auth debug...')
        
        // Test connection first
        const connectionTest = await testSupabaseConnection()
        console.log('🔍 Debug: Connection test:', connectionTest)
        
        if (!connectionTest.success) {
          setAuthState(prev => ({ 
            ...prev, 
            error: connectionTest.error || 'Connection failed', 
            loading: false,
            connectionStatus: 'Failed'
          }))
          return
        }

        setAuthState(prev => ({ ...prev, connectionStatus: 'Connected' }))

        const supabase = createClient()
        
        console.log('🔍 Debug: Creating Supabase client...')
        
        // Try to get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('🔍 Debug: Session check:', { session: !!session, error: sessionError })
        
        if (sessionError) {
          console.error('🔍 Debug: Session error:', sessionError)
          setAuthState(prev => ({ ...prev, error: sessionError.message, loading: false }))
          return
        }

        // Try to get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('🔍 Debug: User check:', { user: !!user, error: userError })
        
        if (userError) {
          console.error('🔍 Debug: User error:', userError)
          setAuthState(prev => ({ ...prev, error: userError.message, loading: false }))
          return
        }

        setAuthState({
          loading: false,
          error: null,
          session,
          user,
          connectionStatus: 'Connected'
        })

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('🔍 Debug: Auth state change:', event, { user: !!session?.user })
            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user || null
            }))
          }
        )

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('🔍 Debug: Auth initialization error:', error)
        setAuthState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false
        }))
      }
    }

    debugAuth()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>Connection: {authState.connectionStatus}</div>
        <div>Loading: {authState.loading ? 'Yes' : 'No'}</div>
        <div>Session: {authState.session ? 'Yes' : 'No'}</div>
        <div>User: {authState.user ? 'Yes' : 'No'}</div>
        {authState.error && (
          <div className="text-red-400">Error: {authState.error}</div>
        )}
        {authState.user && (
          <div>Email: {authState.user.email}</div>
        )}
      </div>
    </div>
  )
} 