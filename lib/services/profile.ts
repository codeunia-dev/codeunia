import { createClient } from '@/lib/supabase/client'
import { Profile, ProfileUpdateData } from '@/types/profile'

export class ProfileService {
  private supabase = createClient()

  // Get user profile by ID
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        return await this.createProfile(userId)
      }
      console.error('Error fetching profile:', error)
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  }

  // Create a new profile
  async createProfile(userId: string): Promise<Profile> {
    const { data: user } = await this.supabase.auth.getUser()
    
    const profileData = {
      id: userId,
      first_name: user.user?.user_metadata?.first_name || '',
      last_name: user.user?.user_metadata?.last_name || '',
      display_name: user.user?.user_metadata?.first_name 
        ? `${user.user.user_metadata.first_name} ${user.user.user_metadata.last_name || ''}`.trim()
        : user.user?.email?.split('@')[0] || '',
      is_public: true,
      email_notifications: true,
      profile_completion_percentage: 0
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw new Error(`Failed to create profile: ${error.message}`)
    }

    return data
  }

  // Update user profile
  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<Profile> {
    // Calculate profile completion percentage
    const completionPercentage = this.calculateProfileCompletion(updates)
    
    const updateData = {
      ...updates,
      profile_completion_percentage: completionPercentage,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  }

  // Calculate profile completion percentage
  private calculateProfileCompletion(profile: Partial<Profile>): number {
    const fields = [
      'first_name',
      'last_name',
      'bio',
      'phone',
      'github_url',
      'linkedin_url',
      'current_position',
      'company',
      'location',
      'skills'
    ]

    const filledFields = fields.filter(field => {
      const value = profile[field as keyof Profile]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value && value.toString().trim() !== ''
    })

    return Math.round((filledFields.length / fields.length) * 100)
  }


  // Get public profile (for viewing other users)
  async getPublicProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_public', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Profile not found or not public
      }
      console.error('Error fetching public profile:', error)
      throw new Error(`Failed to fetch public profile: ${error.message}`)
    }

    return data
  }

  // Search public profiles
  async searchProfiles(query: string, limit: number = 10): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,skills.cs.{${query}}`)
      .limit(limit)

    if (error) {
      console.error('Error searching profiles:', error)
      throw new Error(`Failed to search profiles: ${error.message}`)
    }

    return data || []
  }
}

// Export singleton instance
export const profileService = new ProfileService()
