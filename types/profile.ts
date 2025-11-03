export interface Profile {
  id: string
  created_at: string
  updated_at: string
  
  // Basic profile info
  first_name?: string
  last_name?: string
  bio?: string
  avatar_url?: string
  
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
  
  // Username and Codeunia ID system
  username?: string
  username_editable?: boolean
  codeunia_id?: string
  username_set?: boolean
  profile_complete?: boolean
  
  // Unified setup flow fields
  email_confirmed_at?: string
  auth_provider?: string
  setup_completed_at?: string
  
  // Premium membership fields
  is_premium?: boolean
  premium_expires_at?: string
  premium_plan?: string
  premium_purchased_at?: string
  points_multiplier?: number
  
  // Membership card email fields
  membership_card_sent?: boolean
  membership_card_sent_at?: string
  
  // Admin access
  is_admin?: boolean
}

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  username?: string
  bio?: string
  avatar_url?: string
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

// User setup status interface
export interface UserSetupStatus {
  user_id: string
  auth_provider: string
  email_confirmed: boolean
  username_set: boolean
  codeunia_id_set: boolean
  setup_complete: boolean
  can_proceed: boolean
  next_step: 'create_profile' | 'confirm_email' | 'setup_username' | 'setup_complete'
}

// User Activity Types for Contribution Graph
export type ActivityType = 
  | 'test_registration'
  | 'test_attempt'
  | 'test_completion'
  | 'hackathon_registration'
  | 'hackathon_participation'
  | 'daily_login'
  | 'profile_update'
  | 'certificate_earned'
  | 'mcq_practice'
  | 'blog_like'
  | 'blog_read'

export interface UserActivity {
  id: string
  user_id: string
  activity_type: ActivityType
  activity_data?: Record<string, any>
  activity_date: string
  created_at: string
}

export interface ActivityData {
  date: string
  count: number
  activities: UserActivity[]
}

export interface ContributionGraphData {
  total_activities: number
  current_streak: number
  longest_streak: number
  activity_by_date: ActivityData[]
  activity_by_type: Record<ActivityType, number>
}
