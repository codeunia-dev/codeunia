import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { profileService } from '@/lib/services/profile'
import { Profile, ProfileUpdateData } from '@/types/profile'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const profileData = await profileService.getProfile(user.id)
      setProfile(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (updates: ProfileUpdateData): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setUpdating(true)
      setError(null)
      const updatedProfile = await profileService.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      console.error('Error updating profile:', err)
      return false
    } finally {
      setUpdating(false)
    }
  }


  // Refresh profile data
  const refresh = () => {
    fetchProfile()
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Load profile on mount or user change
  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  return {
    profile,
    loading,
    updating,
    error,
    updateProfile,
    refresh,
    clearError,
    isComplete: profile ? profile.profile_completion_percentage >= 80 : false
  }
}

// Hook for getting public profile (for viewing other users)
export function usePublicProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPublicProfile = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const profileData = await profileService.getPublicProfile(userId)
      setProfile(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Error fetching public profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchPublicProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [userId])

  return {
    profile,
    loading,
    error,
    refresh: fetchPublicProfile
  }
}
