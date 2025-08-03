import { createClient } from '@/lib/supabase/client'
import { UserSetupStatus } from '@/types/profile'

export class UnifiedSetupService {
  private supabase = createClient()

  // Get user setup status
  async getUserSetupStatus(userId: string): Promise<UserSetupStatus | null> {
    const { data, error } = await this.supabase
      .rpc('get_user_setup_status', { user_id: userId })

    if (error) {
      console.error('Error getting user setup status:', error)
      throw new Error(`Failed to get setup status: ${error.message}`)
    }

    return data
  }

  // Check if user setup is complete
  async isUserSetupComplete(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('is_user_setup_complete', { user_id: userId })

    if (error) {
      console.error('Error checking user setup completion:', error)
      throw new Error(`Failed to check setup completion: ${error.message}`)
    }

    return data
  }

  // Mark email as confirmed
  async markEmailConfirmed(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('mark_email_confirmed', { user_id: userId })

    if (error) {
      console.error('Error marking email as confirmed:', error)
      throw new Error(`Failed to mark email as confirmed: ${error.message}`)
    }

    return data
  }

  // Mark setup as completed
  async markSetupCompleted(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('mark_setup_completed', { user_id: userId })

    if (error) {
      console.error('Error marking setup as completed:', error)
      throw new Error(`Failed to mark setup as completed: ${error.message}`)
    }

    return data
  }

  // Set username (this also marks setup as completed)
  async setUsername(userId: string, username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('set_username', { 
        user_id: userId, 
        new_username: username 
      })

    if (error) {
      console.error('Error setting username:', error)
      throw new Error(`Failed to set username: ${error.message}`)
    }

    return data
  }

  // Create OAuth profile
  async createOAuthProfile(
    userId: string, 
    email: string, 
    authProvider: string, 
    userMetadata: any = {}
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('create_oauth_profile', {
        user_id: userId,
        email: email,
        auth_provider: authProvider,
        user_metadata: userMetadata
      })

    if (error) {
      console.error('Error creating OAuth profile:', error)
      throw new Error(`Failed to create OAuth profile: ${error.message}`)
    }

    return data
  }

  // Create email profile
  async createEmailProfile(
    userId: string, 
    email: string, 
    userMetadata: any = {}
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('create_email_profile', {
        user_id: userId,
        email: email,
        user_metadata: userMetadata
      })

    if (error) {
      console.error('Error creating email profile:', error)
      throw new Error(`Failed to create email profile: ${error.message}`)
    }

    return data
  }

  // Check username availability
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('check_username_availability', { username_param: username })

    if (error) {
      console.error('Error checking username availability:', error)
      throw new Error(`Failed to check username availability: ${error.message}`)
    }

    return data
  }

  // Generate safe username
  async generateSafeUsername(): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('generate_safe_username')

    if (error) {
      console.error('Error generating safe username:', error)
      throw new Error(`Failed to generate safe username: ${error.message}`)
    }

    return data
  }

  // Get incomplete setups (for admin purposes)
  async getIncompleteSetups() {
    const { data, error } = await this.supabase
      .from('incomplete_setups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting incomplete setups:', error)
      throw new Error(`Failed to get incomplete setups: ${error.message}`)
    }

    return data
  }

  // Get setup statistics (for admin purposes)
  async getSetupStatistics() {
    const { data, error } = await this.supabase
      .from('setup_statistics')
      .select('*')
      .single()

    if (error) {
      console.error('Error getting setup statistics:', error)
      throw new Error(`Failed to get setup statistics: ${error.message}`)
    }

    return data
  }
}

// Export singleton instance
export const unifiedSetupService = new UnifiedSetupService() 