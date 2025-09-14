import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  username?: string
  phone?: string
  company?: string
  current_position?: string
  location?: string
  bio?: string
  website?: string
  github?: string
  linkedin?: string
  twitter?: string
  is_admin?: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  // State
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, userData: { first_name: string; last_name: string; username: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  
  // Profile actions
  fetchProfile: (userId: string) => Promise<Profile | null>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  
  // Utility actions
  refreshSession: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      loading: false,
      initialized: false,

      // Basic setters
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      // Auth actions
      login: async (email, password) => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }

          if (data.user) {
            set({ user: data.user, loading: false })
            // Fetch profile after successful login
            const profile = await get().fetchProfile(data.user.id)
            set({ profile })
            return { success: true }
          }

          set({ loading: false })
          return { success: false, error: 'Login failed' }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      signup: async (email, password, userData) => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData,
            },
          })

          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }

          if (data.user) {
            set({ user: data.user, loading: false })
            return { success: true }
          }

          set({ loading: false })
          return { success: false, error: 'Signup failed' }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          const supabase = createClient()
          await supabase.auth.signOut()
          set({ user: null, profile: null, loading: false })
        } catch (error) {
          console.error('Logout error:', error)
          set({ loading: false })
        }
      },

      resetPassword: async (email) => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.resetPasswordForEmail(email)

          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }

          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      updatePassword: async (currentPassword, newPassword) => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })

          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }

          set({ loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      // Profile actions
      fetchProfile: async (userId) => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return null
          }

          return data as Profile
        } catch (error) {
          console.error('Error fetching profile:', error)
          return null
        }
      },

      updateProfile: async (updates) => {
        set({ loading: true })
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            set({ loading: false })
            return { success: false, error: 'User not authenticated' }
          }

          const { data, error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            set({ loading: false })
            return { success: false, error: error.message }
          }

          set({ profile: data, loading: false })
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'An unexpected error occurred' }
        }
      },

      // Utility actions
      refreshSession: async () => {
        try {
          const supabase = createClient()
          const { data, error } = await supabase.auth.refreshSession()

          if (error) {
            console.error('Error refreshing session:', error)
            set({ user: null, profile: null })
            return
          }

          if (data.user) {
            set({ user: data.user })
            // Fetch profile if we don't have it
            if (!get().profile) {
              const profile = await get().fetchProfile(data.user.id)
              set({ profile })
            }
          }
        } catch (error) {
          console.error('Error refreshing session:', error)
          set({ user: null, profile: null })
        }
      },

      clearAuth: () => {
        set({ user: null, profile: null, loading: false, initialized: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        initialized: state.initialized,
      }),
    }
  )
)

// Initialize auth state on app start
export const initializeAuth = async () => {
  const { setUser, setProfile, setInitialized, fetchProfile } = useAuthStore.getState()
  
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      setUser(session.user)
      const profile = await fetchProfile(session.user.id)
      setProfile(profile)
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
  } finally {
    setInitialized(true)
  }
}

// Listen for auth state changes
export const setupAuthListener = () => {
  const supabase = createClient()
  const { setUser, setProfile, fetchProfile } = useAuthStore.getState()

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      setUser(session.user)
      const profile = await fetchProfile(session.user.id)
      setProfile(profile)
    } else if (event === 'SIGNED_OUT') {
      setUser(null)
      setProfile(null)
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      setUser(session.user)
    }
  })
}

// Selectors for common use cases
export const useAuth = () => {
  const { user, profile, loading, initialized } = useAuthStore()
  return {
    user,
    profile,
    loading,
    initialized,
    isLoggedIn: !!user,
    isAdmin: profile?.is_admin || false,
  }
}

export const useAuthActions = () => {
  const {
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
  } = useAuthStore()

  return {
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
  }
}
