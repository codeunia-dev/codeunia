// Server-side service for company management
import { createClient } from '@/lib/supabase/server'
import {
  Company,
  CompanyRegistrationData,
  CompanyFilters,
  CompanyError,
  CompanyErrorCodes,
  SUBSCRIPTION_LIMITS,
  CompanyAnalytics,
} from '@/types/company'

// Simple in-memory cache for development
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

function clearCache() {
  cache.clear()
}

/**
 * Service class for managing company operations
 * Handles CRUD operations, verification, and subscription management
 */
class CompanyService {
  /**
   * Create a new company with validation
   * @param data Company registration data
   * @param userId ID of the user creating the company
   * @returns Created company
   */
  async createCompany(
    data: CompanyRegistrationData,
    userId: string
  ): Promise<Company> {
    const supabase = await createClient()

    // Validate required fields
    if (!data.name || !data.email || !data.website) {
      throw new CompanyError(
        'Missing required fields: name, email, and website are required',
        CompanyErrorCodes.INVALID_DOCUMENTS,
        400
      )
    }

    // Generate slug from company name
    const slug = this.generateSlug(data.name)

    // Check if slug already exists
    const existingCompany = await this.getCompanyBySlug(slug)
    if (existingCompany) {
      throw new CompanyError(
        'A company with this name already exists',
        CompanyErrorCodes.ALREADY_EXISTS,
        409
      )
    }

    // Prepare company data
    const companyData: Record<string, unknown> = {
      slug,
      name: data.name,
      legal_name: data.legal_name,
      description: data.description,
      email: data.email,
      website: data.website,
      industry: data.industry,
      company_size: data.company_size,
      phone: data.phone,
      verification_status: 'pending' as const,
      subscription_tier: 'free' as const,
      status: 'active' as const,
      total_events: 0,
      total_hackathons: 0,
      total_registrations: 0,
    }

    // Add address fields if provided
    if (data.address) {
      companyData.address_street = data.address.street
      companyData.address_city = data.address.city
      companyData.address_state = data.address.state
      companyData.address_country = data.address.country
      companyData.address_zip = data.address.zip
    }

    // Add social links if provided
    if (data.socials) {
      companyData.linkedin_url = data.socials.linkedin
      companyData.twitter_url = data.socials.twitter
      companyData.facebook_url = data.socials.facebook
      companyData.instagram_url = data.socials.instagram
    }

    const { data: company, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      throw new CompanyError(
        'Failed to create company',
        CompanyErrorCodes.ALREADY_EXISTS,
        500
      )
    }

    // Create company member record for the creator as owner
    const { error: memberError } = await supabase
      .from('company_members')
      .insert([
        {
          company_id: company.id,
          user_id: userId,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        },
      ])

    if (memberError) {
      console.error('Error creating company member:', memberError)
      // Rollback company creation
      await supabase.from('companies').delete().eq('id', company.id)
      throw new CompanyError(
        'Failed to create company membership',
        CompanyErrorCodes.ALREADY_EXISTS,
        500
      )
    }

    clearCache()
    return company as Company
  }

  /**
   * Get company by slug
   * @param slug Company slug
   * @returns Company or null if not found
   */
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    const cacheKey = `company:slug:${slug}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Company
    }

    const supabase = await createClient()

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Error fetching company by slug:', {
        slug,
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new CompanyError(
        `Failed to fetch company: ${error.message}`,
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    if (!company) {
      console.log(`No company found with slug: ${slug}`)
      return null // Company not found
    }

    setCachedData(cacheKey, company)
    return company as Company
  }

  /**
   * Get company by ID
   * @param id Company ID
   * @returns Company or null if not found
   */
  async getCompanyById(id: string): Promise<Company | null> {
    const cacheKey = `company:id:${id}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Company
    }

    const supabase = await createClient()

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching company by ID:', error)
      throw new CompanyError(
        'Failed to fetch company',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    if (!company) {
      return null // Company not found
    }

    setCachedData(cacheKey, company)
    return company as Company
  }

  /**
   * Update company information
   * @param id Company ID
   * @param data Partial company data to update
   * @returns Updated company
   */
  async updateCompany(
    id: string,
    data: Partial<Company>
  ): Promise<Company> {
    const supabase = await createClient()

    // Remove fields that shouldn't be updated directly
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id: _id,
      created_at,
      created_by,
      verification_status,
      verified_at,
      verified_by,
      ...updateData
    } = data
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Update the updated_at timestamp
    const updatePayload = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    const { data: company, error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      throw new CompanyError(
        'Failed to update company',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
    return company as Company
  }

  /**
   * Delete (soft delete) a company
   * @param id Company ID
   */
  async deleteCompany(id: string): Promise<void> {
    const supabase = await createClient()

    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from('companies')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting company:', error)
      throw new CompanyError(
        'Failed to delete company',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
  }

  /**
   * List companies with filtering and pagination
   * @param filters Company filters
   * @returns Companies and total count
   */
  async listCompanies(
    filters: CompanyFilters = {}
  ): Promise<{ companies: Company[]; total: number; hasMore: boolean }> {
    const cacheKey = `companies:list:${JSON.stringify(filters)}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as { companies: Company[]; total: number; hasMore: boolean }
    }

    const supabase = await createClient()

    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    // Apply filters
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry)
    }

    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size)
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status)
    } else {
      // By default, only show verified companies to public
      query = query.eq('verification_status', 'verified')
    }

    // Apply pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: companies, error, count } = await query

    if (error) {
      console.error('Error listing companies:', error)
      throw new CompanyError(
        'Failed to list companies',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    const total = count || 0
    const hasMore = offset + limit < total

    const result = {
      companies: (companies || []) as Company[],
      total,
      hasMore,
    }

    setCachedData(cacheKey, result)
    return result
  }

  /**
   * Verify a company (admin only)
   * @param id Company ID
   * @param adminId ID of the admin verifying the company
   * @returns Updated company
   */
  async verifyCompany(id: string, adminId: string): Promise<Company> {
    const supabase = await createClient()

    // Check if company exists
    const company = await this.getCompanyById(id)
    if (!company) {
      throw new CompanyError(
        'Company not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if already verified
    if (company.verification_status === 'verified') {
      throw new CompanyError(
        'Company is already verified',
        CompanyErrorCodes.ALREADY_EXISTS,
        400
      )
    }

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error verifying company:', error)
      throw new CompanyError(
        'Failed to verify company',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
    return updatedCompany as Company
  }

  /**
   * Reject a company verification (admin only)
   * @param id Company ID
   * @param adminId ID of the admin rejecting the company
   * @returns Updated company
   */
  async rejectCompany(id: string, adminId: string): Promise<Company> {
    const supabase = await createClient()

    // Check if company exists
    const company = await this.getCompanyById(id)
    if (!company) {
      throw new CompanyError(
        'Company not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        verification_status: 'rejected',
        verified_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting company:', error)
      throw new CompanyError(
        'Failed to reject company',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
    return updatedCompany as Company
  }

  /**
   * Check if a company has reached subscription limits
   * @param companyId Company ID
   * @param action Action to check (e.g., 'create_event', 'add_team_member')
   * @returns True if within limits, false if limit reached
   */
  async checkSubscriptionLimits(
    companyId: string,
    action: 'create_event' | 'add_team_member'
  ): Promise<boolean> {
    const supabase = await createClient()

    // Get company
    const company = await this.getCompanyById(companyId)
    if (!company) {
      throw new CompanyError(
        'Company not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    const limits = SUBSCRIPTION_LIMITS[company.subscription_tier]

    if (action === 'create_event') {
      // Check event creation limit
      if (limits.events_per_month === null) {
        return true // Unlimited
      }

      // Get events created this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', startOfMonth.toISOString())

      if (error) {
        console.error('Error checking event limit:', error)
        throw new CompanyError(
          'Failed to check subscription limits',
          CompanyErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
          500
        )
      }

      return (count || 0) < limits.events_per_month
    }

    if (action === 'add_team_member') {
      // Check team member limit
      if (limits.team_members === null) {
        return true // Unlimited
      }

      const { count, error } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active')

      if (error) {
        console.error('Error checking team member limit:', error)
        throw new CompanyError(
          'Failed to check subscription limits',
          CompanyErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
          500
        )
      }

      return (count || 0) < limits.team_members
    }

    return true
  }

  /**
   * Get company analytics for a date range
   * @param companyId Company ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of analytics records
   */
  async getCompanyAnalytics(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CompanyAnalytics[]> {
    const supabase = await createClient()

    const { data: analytics, error } = await supabase
      .from('company_analytics')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching company analytics:', error)
      throw new CompanyError(
        'Failed to fetch analytics',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    return (analytics || []) as CompanyAnalytics[]
  }

  /**
   * Update company analytics
   * @param companyId Company ID
   * @param metrics Partial analytics metrics to update
   */
  async updateAnalytics(
    companyId: string,
    metrics: Partial<CompanyAnalytics>
  ): Promise<void> {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]

    // Try to update existing record for today
    const { data: existing } = await supabase
      .from('company_analytics')
      .select('*')
      .eq('company_id', companyId)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('company_analytics')
        .update(metrics)
        .eq('company_id', companyId)
        .eq('date', today)

      if (error) {
        console.error('Error updating analytics:', error)
        throw new CompanyError(
          'Failed to update analytics',
          CompanyErrorCodes.NOT_FOUND,
          500
        )
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('company_analytics')
        .insert([
          {
            company_id: companyId,
            date: today,
            ...metrics,
          },
        ])

      if (error) {
        console.error('Error creating analytics:', error)
        throw new CompanyError(
          'Failed to create analytics',
          CompanyErrorCodes.NOT_FOUND,
          500
        )
      }
    }
  }

  /**
   * Generate a URL-friendly slug from company name
   * @param name Company name
   * @returns Slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

export const companyService = new CompanyService()
