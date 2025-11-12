// Server-side service for authorization and permission management
import { createClient } from '@/lib/supabase/server'
import { companyMemberService } from './company-member-service'
import { CompanyError, CompanyErrorCodes } from '@/types/company'
import { NextRequest, NextResponse } from 'next/server'
import { User } from '@supabase/supabase-js'

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
 * Service class for managing authorization and permissions
 * Handles role checking, permission validation, and resource ownership
 */
class AuthorizationService {
  /**
   * Check if a user is a platform admin
   * @param userId User ID
   * @returns True if user is platform admin
   */
  async isPlatformAdmin(userId: string): Promise<boolean> {
    const cacheKey = `admin:${userId}`
    const cached = getCachedData(cacheKey)
    if (cached !== null) {
      return cached as boolean
    }

    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    const isAdmin = profile?.is_admin || false
    setCachedData(cacheKey, isAdmin)
    return isAdmin
  }

  /**
   * Check if a user is a company owner
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user is company owner
   */
  async isCompanyOwner(userId: string, companyId: string): Promise<boolean> {
    const cacheKey = `owner:${userId}:${companyId}`
    const cached = getCachedData(cacheKey)
    if (cached !== null) {
      return cached as boolean
    }

    const member = await companyMemberService.checkMembership(userId, companyId)
    const isOwner = member?.role === 'owner'
    setCachedData(cacheKey, isOwner)
    return isOwner
  }

  /**
   * Check if a user is a company admin (owner or admin role)
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user is company owner or admin
   */
  async isCompanyAdmin(userId: string, companyId: string): Promise<boolean> {
    const cacheKey = `companyAdmin:${userId}:${companyId}`
    const cached = getCachedData(cacheKey)
    if (cached !== null) {
      return cached as boolean
    }

    const member = await companyMemberService.checkMembership(userId, companyId)
    const isAdmin = member?.role === 'owner' || member?.role === 'admin'
    setCachedData(cacheKey, isAdmin)
    return isAdmin
  }

  /**
   * Check if a user is a company member (any role)
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user is a member of the company
   */
  async isCompanyMember(userId: string, companyId: string): Promise<boolean> {
    const member = await companyMemberService.checkMembership(userId, companyId)
    return member !== null
  }

  /**
   * Check if a user can create events for a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can create events
   */
  async canCreateEvent(userId: string, companyId: string): Promise<boolean> {
    const cacheKey = `canCreateEvent:${userId}:${companyId}`
    const cached = getCachedData(cacheKey)
    if (cached !== null) {
      return cached as boolean
    }

    const member = await companyMemberService.checkMembership(userId, companyId)
    if (!member) {
      return false
    }

    // Owner, admin, and editor can create events
    const canCreate = ['owner', 'admin', 'editor'].includes(member.role)
    setCachedData(cacheKey, canCreate)
    return canCreate
  }

  /**
   * Check if a user can edit a specific event
   * @param userId User ID
   * @param eventId Event ID
   * @returns True if user can edit the event
   */
  async canEditEvent(userId: string, eventId: string): Promise<boolean> {
    const supabase = await createClient()

    // Get event details
    const { data: event, error } = await supabase
      .from('events')
      .select('id, company_id, created_by')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return false
    }

    // Event creator can always edit
    if (event.created_by === userId) {
      return true
    }

    // Company owner or admin can edit
    if (event.company_id) {
      return await this.isCompanyAdmin(userId, event.company_id)
    }

    return false
  }

  /**
   * Check if a user can delete a specific event
   * @param userId User ID
   * @param eventId Event ID
   * @returns True if user can delete the event
   */
  async canDeleteEvent(userId: string, eventId: string): Promise<boolean> {
    const supabase = await createClient()

    // Get event details
    const { data: event, error } = await supabase
      .from('events')
      .select('id, company_id, created_by')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return false
    }

    // Only company owner or admin can delete events
    if (event.company_id) {
      return await this.isCompanyAdmin(userId, event.company_id)
    }

    return false
  }

  /**
   * Check if a user can manage team members for a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can manage team
   */
  async canManageTeam(userId: string, companyId: string): Promise<boolean> {
    return await companyMemberService.canManageTeam(userId, companyId)
  }

  /**
   * Check if a user can view analytics for a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can view analytics
   */
  async canViewAnalytics(userId: string, companyId: string): Promise<boolean> {
    // All company members can view analytics
    return await this.isCompanyMember(userId, companyId)
  }

  /**
   * Check if a user can edit company profile
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can edit company
   */
  async canEditCompany(userId: string, companyId: string): Promise<boolean> {
    // Only company owner can edit company profile
    return await this.isCompanyOwner(userId, companyId)
  }

  /**
   * Get the owner information for an event
   * @param eventId Event ID
   * @returns Object with companyId and userId
   */
  async getEventOwner(
    eventId: string
  ): Promise<{ companyId: string | null; userId: string | null }> {
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select('company_id, created_by')
      .eq('id', eventId)
      .single()

    if (error || !event) {
      return { companyId: null, userId: null }
    }

    return {
      companyId: event.company_id || null,
      userId: event.created_by || null,
    }
  }

  /**
   * Get the role of a user in a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns Role string or null if not a member
   */
  async getCompanyRole(
    userId: string,
    companyId: string
  ): Promise<string | null> {
    const member = await companyMemberService.checkMembership(userId, companyId)
    return member?.role || null
  }

  /**
   * Verify that a user has permission to perform an action
   * Throws an error if permission is denied
   * @param userId User ID
   * @param permission Permission check function
   * @param errorMessage Custom error message
   */
  async requirePermission(
    userId: string,
    permission: () => Promise<boolean>,
    errorMessage: string = 'Insufficient permissions'
  ): Promise<void> {
    const hasPermission = await permission()
    if (!hasPermission) {
      throw new CompanyError(
        errorMessage,
        CompanyErrorCodes.UNAUTHORIZED,
        403
      )
    }
  }

  /**
   * Clear authorization cache
   * Should be called when roles or memberships change
   */
  clearAuthCache(): void {
    clearCache()
  }
}

export const authorizationService = new AuthorizationService()

// ============================================
// Middleware Functions for API Routes
// ============================================

/**
 * Middleware to require authentication
 * Returns the authenticated user or throws 401
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new CompanyError('Unauthorized', CompanyErrorCodes.UNAUTHORIZED, 401)
  }

  return user
}

/**
 * Middleware to require platform admin access
 * Returns the authenticated admin user or throws 403
 */
export async function requirePlatformAdmin(): Promise<User> {
  const user = await requireAuth()

  const isAdmin = await authorizationService.isPlatformAdmin(user.id)
  if (!isAdmin) {
    throw new CompanyError(
      'Platform admin access required',
      CompanyErrorCodes.UNAUTHORIZED,
      403
    )
  }

  return user
}

/**
 * Middleware to require company membership
 * Returns the authenticated user and their role or throws 403
 */
export async function requireCompanyMembership(
  companyId: string,
  requiredRoles?: Array<'owner' | 'admin' | 'editor' | 'member'>
): Promise<{ user: User; role: string }> {
  const user = await requireAuth()

  const member = await companyMemberService.checkMembership(user.id, companyId)
  if (!member) {
    throw new CompanyError(
      'Not a member of this company',
      CompanyErrorCodes.UNAUTHORIZED,
      403
    )
  }

  if (requiredRoles && !requiredRoles.includes(member.role as 'owner' | 'admin' | 'editor' | 'member')) {
    throw new CompanyError(
      `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}`,
      CompanyErrorCodes.UNAUTHORIZED,
      403
    )
  }

  return { user, role: member.role }
}

/**
 * Middleware to require company owner access
 * Returns the authenticated owner user or throws 403
 */
export async function requireCompanyOwner(
  companyId: string
): Promise<User> {
  const { user } = await requireCompanyMembership(companyId, ['owner'])
  return user
}

/**
 * Middleware to require company admin access (owner or admin)
 * Returns the authenticated admin user or throws 403
 */
export async function requireCompanyAdmin(
  companyId: string
): Promise<User> {
  const { user } = await requireCompanyMembership(companyId, ['owner', 'admin'])
  return user
}

/**
 * Middleware wrapper for API routes with authentication
 * Handles errors and returns proper responses
 */
export function withAuth(
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await requireAuth()
      return await handler(request, user)
    } catch (error) {
      if (error instanceof CompanyError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      console.error('Unexpected error in withAuth:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware wrapper for API routes requiring platform admin
 * Handles errors and returns proper responses
 */
export function withPlatformAdmin(
  handler: (request: NextRequest, user: User) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await requirePlatformAdmin()
      return await handler(request, user)
    } catch (error) {
      if (error instanceof CompanyError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      console.error('Unexpected error in withPlatformAdmin:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware wrapper for API routes requiring company membership
 * Handles errors and returns proper responses
 */
export function withCompanyAuth(
  handler: (
    request: NextRequest,
    user: User,
    companyId: string,
    role: string
  ) => Promise<Response>,
  options?: {
    requiredRoles?: Array<'owner' | 'admin' | 'editor' | 'member'>
    getCompanyId?: (request: NextRequest) => string | Promise<string>
  }
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Extract company ID from URL or use custom getter
      let companyId: string
      if (options?.getCompanyId) {
        companyId = await options.getCompanyId(request)
      } else {
        // Default: extract from URL path /api/companies/[slug]/...
        const url = new URL(request.url)
        const pathParts = url.pathname.split('/')
        const companiesIndex = pathParts.indexOf('companies')
        if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) {
          throw new CompanyError(
            'Company ID not found in request',
            CompanyErrorCodes.NOT_FOUND,
            400
          )
        }
        companyId = pathParts[companiesIndex + 1]
      }

      const { user, role } = await requireCompanyMembership(
        companyId,
        options?.requiredRoles
      )
      return await handler(request, user, companyId, role)
    } catch (error) {
      if (error instanceof CompanyError) {
        return NextResponse.json(
          { success: false, error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      console.error('Unexpected error in withCompanyAuth:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper function to check if user can access event
 * Used in event API routes
 */
export async function canAccessEvent(
  userId: string,
  eventId: string,
  requireEdit: boolean = false
): Promise<boolean> {
  if (requireEdit) {
    return await authorizationService.canEditEvent(userId, eventId)
  }

  // For read access, check if event is approved or user is company member
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('id, company_id, approval_status')
    .eq('id', eventId)
    .single()

  if (!event) {
    return false
  }

  // Approved events are public
  if (event.approval_status === 'approved') {
    return true
  }

  // Otherwise, must be company member
  if (event.company_id) {
    return await authorizationService.isCompanyMember(userId, event.company_id)
  }

  return false
}

/**
 * Helper function to check if user can access hackathon
 * Used in hackathon API routes
 */
export async function canAccessHackathon(
  userId: string,
  hackathonId: string,
  requireEdit: boolean = false
): Promise<boolean> {
  const supabase = await createClient()
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, company_id, created_by, approval_status')
    .eq('id', hackathonId)
    .single()

  if (!hackathon) {
    return false
  }

  if (requireEdit) {
    // Creator can edit
    if (hackathon.created_by === userId) {
      return true
    }
    // Company admin can edit
    if (hackathon.company_id) {
      return await authorizationService.isCompanyAdmin(
        userId,
        hackathon.company_id
      )
    }
    return false
  }

  // For read access, approved hackathons are public
  if (hackathon.approval_status === 'approved') {
    return true
  }

  // Otherwise, must be company member
  if (hackathon.company_id) {
    return await authorizationService.isCompanyMember(
      userId,
      hackathon.company_id
    )
  }

  return false
}
