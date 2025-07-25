export interface Profile {
  id: string
  created_at: string
  updated_at: string
  
  // Basic profile info
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  
  // Contact information
  phone?: string
  
  // Social links
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  
  // Professional info
  current_position?: string
  company?: string
  location?: string
  skills?: string[]
  
  // Settings
  is_public: boolean
  email_notifications: boolean
  
  // Metadata
  profile_completion_percentage: number
}

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  phone?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  current_position?: string
  company?: string
  location?: string
  skills?: string[]
  is_public?: boolean
  email_notifications?: boolean
}
