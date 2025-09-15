import { createClient } from '@/lib/supabase/client'
import { Profile, ProfileUpdateData } from '@/types/profile'

export class ProfileService {
  private getSupabaseClient() {
    return createClient()
  }

  // Get user profile by ID
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = this.getSupabaseClient();
    
    try {
      const { data, error } = await supabase
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
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Return null instead of throwing to allow graceful fallback
      return null
    }
  }

  // Create a new profile
  async createProfile(userId: string): Promise<Profile> {
    const { data: user } = await this.getSupabaseClient().auth.getUser()
    
    // Generate a simple codeunia_id if needed
    const codeuniaId = `CU-${userId.slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
    
    // Extract name data from OAuth provider metadata
    const metadata = user.user?.user_metadata || {};
    
    // Extract first name from various OAuth provider formats
    const firstName = metadata.first_name || 
                     metadata.given_name || 
                     metadata.name?.split(' ')[0] || 
                     '';
    
    // Extract last name from various OAuth provider formats  
    const lastName = metadata.last_name || 
                    metadata.family_name || 
                    metadata.name?.split(' ').slice(1).join(' ') || 
                    '';
    
    const profileData = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      is_public: true,
      email_notifications: true,
      profile_completion_percentage: 0,
      codeunia_id: codeuniaId
    }

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
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

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
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
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
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

  // Get public profile by username (for viewing other users)
  async getPublicProfileByUsername(username: string): Promise<Profile | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('is_public', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Profile not found or not public
      }
      console.error('Error fetching public profile by username:', error)
      throw new Error(`Failed to fetch public profile: ${error.message}`)
    }

    return data
  }

  // Search public profiles
  async searchProfiles(query: string, limit: number = 10): Promise<Profile[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,bio.ilike.%${query}%,skills.cs.{${query}}`)
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
