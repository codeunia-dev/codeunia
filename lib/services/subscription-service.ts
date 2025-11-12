// Server-side service for subscription management
import { createClient } from '@/lib/supabase/server'
import {
  Company,
  SUBSCRIPTION_LIMITS,
  SubscriptionTierLimits,
  CompanyError,
  CompanyErrorCodes,
} from '@/types/company'
import { companyService } from './company-service'

export interface SubscriptionUsage {
  events_this_month: number
  team_members: number
  limits: SubscriptionTierLimits
  can_create_event: boolean
  can_add_team_member: boolean
  events_remaining: number | null
  team_members_remaining: number | null
  subscription_expires_soon: boolean
  days_until_expiry: number | null
}

export interface SubscriptionCheckResult {
  allowed: boolean
  reason?: string
  upgrade_required: boolean
  current_usage?: number
  limit?: number
}

/**
 * Service class for managing subscription operations
 * Handles limit checks, usage tracking, and subscription updates
 */
class SubscriptionService {
  /**
   * Get current subscription usage for a company
   * @param companyId Company ID
   * @returns Subscription usage details
   */
  async getSubscriptionUsage(companyId: string): Promise<SubscriptionUsage> {
    const supabase = await createClient()

    // Get company
    const company = await companyService.getCompanyById(companyId)
    if (!company) {
      throw new CompanyError(
        'Company not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    const limits = SUBSCRIPTION_LIMITS[company.subscription_tier]

    // Get events created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', startOfMonth.toISOString())

    if (eventsError) {
      console.error('Error counting events:', eventsError)
      throw new CompanyError(
        'Failed to get subscription usage',
        CompanyErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
        500
      )
    }

    // Get active team members
    const { count: membersCount, error: membersError } = await supabase
      .from('company_members')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')

    if (membersError) {
      console.error('Error counting team members:', membersError)
      throw new CompanyError(
        'Failed to get subscription usage',
        CompanyErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
        500
      )
    }

    const events_this_month = eventsCount || 0
    const team_members = membersCount || 0

    // Calculate remaining allowances
    const events_remaining =
      limits.events_per_month === null
        ? null
        : Math.max(0, limits.events_per_month - events_this_month)

    const team_members_remaining =
      limits.team_members === null
        ? null
        : Math.max(0, limits.team_members - team_members)

    // Check if subscription expires soon (within 7 days)
    let subscription_expires_soon = false
    let days_until_expiry: number | null = null

    if (company.subscription_expires_at) {
      const expiryDate = new Date(company.subscription_expires_at)
      const now = new Date()
      const daysUntil = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      days_until_expiry = daysUntil
      subscription_expires_soon = daysUntil <= 7 && daysUntil > 0
    }

    return {
      events_this_month,
      team_members,
      limits,
      can_create_event:
        limits.events_per_month === null || events_this_month < limits.events_per_month,
      can_add_team_member:
        limits.team_members === null || team_members < limits.team_members,
      events_remaining,
      team_members_remaining,
      subscription_expires_soon,
      days_until_expiry,
    }
  }

  /**
   * Check if an action is allowed under current subscription
   * @param companyId Company ID
   * @param action Action to check
   * @returns Check result with details
   */
  async checkSubscriptionLimit(
    companyId: string,
    action: 'create_event' | 'add_team_member'
  ): Promise<SubscriptionCheckResult> {
    const usage = await this.getSubscriptionUsage(companyId)

    if (action === 'create_event') {
      if (usage.can_create_event) {
        return {
          allowed: true,
          upgrade_required: false,
        }
      }

      return {
        allowed: false,
        reason: `You've reached your monthly event limit of ${usage.limits.events_per_month} events`,
        upgrade_required: true,
        current_usage: usage.events_this_month,
        limit: usage.limits.events_per_month || 0,
      }
    }

    if (action === 'add_team_member') {
      if (usage.can_add_team_member) {
        return {
          allowed: true,
          upgrade_required: false,
        }
      }

      return {
        allowed: false,
        reason: `You've reached your team member limit of ${usage.limits.team_members} members`,
        upgrade_required: true,
        current_usage: usage.team_members,
        limit: usage.limits.team_members || 0,
      }
    }

    return {
      allowed: true,
      upgrade_required: false,
    }
  }

  /**
   * Update company subscription tier
   * @param companyId Company ID
   * @param tier New subscription tier
   * @param expiresAt Optional expiry date
   * @returns Updated company
   */
  async updateSubscriptionTier(
    companyId: string,
    tier: 'free' | 'basic' | 'pro' | 'enterprise',
    expiresAt?: Date
  ): Promise<Company> {
    const supabase = await createClient()

    const updateData: Partial<Company> = {
      subscription_tier: tier,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }

    // Set expiry date if provided
    if (expiresAt) {
      updateData.subscription_expires_at = expiresAt.toISOString()
    } else if (tier !== 'free') {
      // Set default expiry to 1 year from now for paid tiers
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      updateData.subscription_expires_at = oneYearFromNow.toISOString()
    }

    // If upgrading from free, set subscription start date
    const company = await companyService.getCompanyById(companyId)
    if (company?.subscription_tier === 'free' && tier !== 'free') {
      updateData.subscription_started_at = new Date().toISOString()
    }

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      throw new CompanyError(
        'Failed to update subscription',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return updatedCompany as Company
  }

  /**
   * Cancel company subscription (downgrade to free)
   * @param companyId Company ID
   * @returns Updated company
   */
  async cancelSubscription(companyId: string): Promise<Company> {
    const supabase = await createClient()

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        subscription_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error cancelling subscription:', error)
      throw new CompanyError(
        'Failed to cancel subscription',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return updatedCompany as Company
  }

  /**
   * Suspend company subscription
   * @param companyId Company ID
   * @returns Updated company
   */
  async suspendSubscription(companyId: string): Promise<Company> {
    const supabase = await createClient()

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        subscription_status: 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error suspending subscription:', error)
      throw new CompanyError(
        'Failed to suspend subscription',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return updatedCompany as Company
  }

  /**
   * Reactivate suspended subscription
   * @param companyId Company ID
   * @returns Updated company
   */
  async reactivateSubscription(companyId: string): Promise<Company> {
    const supabase = await createClient()

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error reactivating subscription:', error)
      throw new CompanyError(
        'Failed to reactivate subscription',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return updatedCompany as Company
  }

  /**
   * Get companies with expiring subscriptions
   * @param daysThreshold Number of days before expiry to check
   * @returns Array of companies with expiring subscriptions
   */
  async getExpiringSubscriptions(daysThreshold: number = 7): Promise<Company[]> {
    const supabase = await createClient()

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('subscription_status', 'active')
      .neq('subscription_tier', 'free')
      .lte('subscription_expires_at', thresholdDate.toISOString())
      .gte('subscription_expires_at', new Date().toISOString())

    if (error) {
      console.error('Error fetching expiring subscriptions:', error)
      throw new CompanyError(
        'Failed to fetch expiring subscriptions',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return (companies || []) as Company[]
  }

  /**
   * Get recommended upgrade tier based on usage
   * @param companyId Company ID
   * @returns Recommended tier or null if no upgrade needed
   */
  async getRecommendedUpgrade(
    companyId: string
  ): Promise<{ tier: string; reason: string } | null> {
    const usage = await this.getSubscriptionUsage(companyId)
    const company = await companyService.getCompanyById(companyId)

    if (!company) {
      return null
    }

    const currentTier = company.subscription_tier

    // If on free tier and hitting limits
    if (currentTier === 'free') {
      if (!usage.can_create_event || !usage.can_add_team_member) {
        return {
          tier: 'basic',
          reason: 'Upgrade to Basic for more events and team members',
        }
      }
    }

    // If on basic tier and hitting limits
    if (currentTier === 'basic') {
      if (!usage.can_create_event || !usage.can_add_team_member) {
        return {
          tier: 'pro',
          reason: 'Upgrade to Pro for unlimited events and auto-approval',
        }
      }
    }

    // If on pro tier and need more team members
    if (currentTier === 'pro') {
      if (!usage.can_add_team_member) {
        return {
          tier: 'enterprise',
          reason: 'Upgrade to Enterprise for unlimited team members',
        }
      }
    }

    return null
  }
}

export const subscriptionService = new SubscriptionService()
