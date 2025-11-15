export interface Company {
  id: string
  slug: string
  name: string
  legal_name?: string
  description?: string
  logo_url?: string
  banner_url?: string
  website?: string
  industry?: string
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  email: string
  phone?: string
  // Nested address object (for backward compatibility)
  address?: CompanyAddress
  // Flattened address fields (actual database columns)
  address_street?: string
  address_city?: string
  address_state?: string
  address_country?: string
  address_zip?: string
  // Nested socials object (for backward compatibility)
  socials?: CompanySocials
  // Flattened social fields (actual database columns)
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  instagram_url?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verification_documents?: string[]
  verified_at?: string
  verified_by?: string
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'suspended' | 'cancelled'
  subscription_started_at?: string
  subscription_expires_at?: string
  settings?: Record<string, unknown>
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  updated_at: string
  created_by?: string
  total_events: number
  total_hackathons: number
  total_participants: number
}

export interface CompanyAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  zip?: string
}

export interface CompanySocials {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
}

export interface CompanyMember {
  id: string
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  permissions?: Record<string, boolean>
  status: 'active' | 'pending' | 'suspended'
  invited_by?: string
  invited_at?: string
  joined_at: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

export interface CompanyAnalytics {
  id: string
  company_id: string
  date: string
  events_created: number
  events_published: number
  hackathons_created: number
  hackathons_published: number
  total_views: number
  total_clicks: number
  total_registrations: number
  total_participants: number
  revenue_generated: number
  created_at: string
}

export interface CompanyRegistrationData {
  name: string
  legal_name?: string
  email: string
  website: string
  industry: string
  company_size: string
  description: string
  phone?: string
  address?: CompanyAddress
  socials?: CompanySocials
}

export interface CompanyFilters {
  search?: string
  industry?: string
  company_size?: string
  verification_status?: string
  limit?: number
  offset?: number
}

export interface SubscriptionTierLimits {
  events_per_month: number | null // null = unlimited
  team_members: number | null
  auto_approval: boolean
  api_access: boolean
  custom_branding: boolean
  priority_support: boolean
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionTierLimits> = {
  free: {
    events_per_month: 2,
    team_members: 3, // Allow 3 team members on free tier (owner + 2 invites)
    auto_approval: false,
    api_access: false,
    custom_branding: false,
    priority_support: false,
  },
  basic: {
    events_per_month: 10,
    team_members: 3,
    auto_approval: false,
    api_access: false,
    custom_branding: true,
    priority_support: false,
  },
  pro: {
    events_per_month: null,
    team_members: 10,
    auto_approval: true,
    api_access: true,
    custom_branding: true,
    priority_support: true,
  },
  enterprise: {
    events_per_month: null,
    team_members: null,
    auto_approval: true,
    api_access: true,
    custom_branding: true,
    priority_support: true,
  },
}

// Error types for company operations
export class CompanyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'CompanyError'
  }
}

export const CompanyErrorCodes = {
  NOT_FOUND: 'COMPANY_NOT_FOUND',
  ALREADY_EXISTS: 'COMPANY_ALREADY_EXISTS',
  UNAUTHORIZED: 'COMPANY_UNAUTHORIZED',
  VERIFICATION_PENDING: 'COMPANY_VERIFICATION_PENDING',
  VERIFICATION_REJECTED: 'COMPANY_VERIFICATION_REJECTED',
  SUBSCRIPTION_LIMIT_REACHED: 'SUBSCRIPTION_LIMIT_REACHED',
  INVALID_DOCUMENTS: 'INVALID_VERIFICATION_DOCUMENTS',
}

// Error types for moderation operations
export class EventModerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'EventModerationError'
  }
}

export const ModerationErrorCodes = {
  ALREADY_APPROVED: 'EVENT_ALREADY_APPROVED',
  ALREADY_REJECTED: 'EVENT_ALREADY_REJECTED',
  NOT_PENDING: 'EVENT_NOT_PENDING',
  FAILED_VALIDATION: 'EVENT_FAILED_VALIDATION',
  DUPLICATE_DETECTED: 'DUPLICATE_EVENT_DETECTED',
}

export interface ModerationLog {
  id: string
  event_id?: string
  hackathon_id?: string
  action: 'submitted' | 'approved' | 'rejected' | 'edited' | 'deleted'
  performed_by: string
  reason?: string
  notes?: string
  created_at: string
}
