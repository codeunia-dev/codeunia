// Server-side service for company member management
import { createClient } from '@/lib/supabase/server'
import {
  CompanyMember,
  CompanyError,
  CompanyErrorCodes,
  SUBSCRIPTION_LIMITS,
} from '@/types/company'
import { sendEmail } from '@/lib/email/support-emails'

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
 * Service class for managing company member operations
 * Handles team member invitations, role management, and permissions
 */
class CompanyMemberService {
  /**
   * Invite a new member to the company
   * @param companyId Company ID
   * @param email Email of the user to invite
   * @param role Role to assign to the member
   * @param invitedBy ID of the user sending the invitation
   * @returns Created company member record
   */
  async inviteMember(
    companyId: string,
    email: string,
    role: 'admin' | 'editor' | 'member',
    invitedBy: string
  ): Promise<CompanyMember> {
    const supabase = await createClient()

    // Validate role
    if (!['admin', 'editor', 'member'].includes(role)) {
      throw new CompanyError(
        'Invalid role. Must be admin, editor, or member',
        CompanyErrorCodes.UNAUTHORIZED,
        400
      )
    }

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug, subscription_tier')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      throw new CompanyError(
        'Company not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check subscription limits
    const limits = SUBSCRIPTION_LIMITS[company.subscription_tier]
    if (limits.team_members !== null) {
      const { count } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active')

      if ((count || 0) >= limits.team_members) {
        throw new CompanyError(
          `Team member limit reached for ${company.subscription_tier} tier`,
          CompanyErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
          403
        )
      }
    }

    // Check if user exists by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('email', email)
      .single()

    if (!profile) {
      throw new CompanyError(
        'User with this email not found. They must create an account first.',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_id', profile.id)
      .single()

    if (existingMember) {
      throw new CompanyError(
        'User is already a member of this company',
        CompanyErrorCodes.ALREADY_EXISTS,
        409
      )
    }

    // Create member record with pending status
    const memberData = {
      company_id: companyId,
      user_id: profile.id,
      role,
      status: 'pending' as const,
      invited_by: invitedBy,
      invited_at: new Date().toISOString(),
    }

    const { data: member, error: memberError } = await supabase
      .from('company_members')
      .insert([memberData])
      .select()
      .single()

    if (memberError) {
      console.error('Error creating company member:', memberError)
      throw new CompanyError(
        `Failed to invite member: ${memberError.message}`,
        CompanyErrorCodes.ALREADY_EXISTS,
        500
      )
    }

    // Send invitation email
    await this.sendInvitationEmail(
      email,
      profile.first_name || 'there',
      company.name,
      role,
      company.slug
    )

    clearCache()

    // Return member with user info
    return {
      ...member,
      user: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: undefined,
      },
    } as CompanyMember
  }

  /**
   * Accept a company invitation
   * @param companyId Company ID
   * @param userId User ID accepting the invitation
   * @returns Updated company member record
   */
  async acceptInvitation(
    companyId: string,
    userId: string
  ): Promise<CompanyMember> {
    const supabase = await createClient()

    // Check if invitation exists
    const { data: member, error: fetchError } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !member) {
      throw new CompanyError(
        'Invitation not found or already accepted',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Update member status to active
    const { data: updatedMember, error: updateError } = await supabase
      .from('company_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error accepting invitation:', updateError)
      throw new CompanyError(
        'Failed to accept invitation',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
    return updatedMember as CompanyMember
  }

  /**
   * Update a member's role
   * @param memberId Member ID
   * @param role New role to assign
   * @returns Updated company member record
   */
  async updateMemberRole(
    memberId: string,
    role: 'owner' | 'admin' | 'editor' | 'member'
  ): Promise<CompanyMember> {
    const supabase = await createClient()

    // Validate role
    if (!['owner', 'admin', 'editor', 'member'].includes(role)) {
      throw new CompanyError(
        'Invalid role. Must be owner, admin, editor, or member',
        CompanyErrorCodes.UNAUTHORIZED,
        400
      )
    }

    // Check if member exists
    const { data: member, error: fetchError } = await supabase
      .from('company_members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (fetchError || !member) {
      throw new CompanyError(
        'Member not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Prevent changing the last owner's role
    if (member.role === 'owner' && role !== 'owner') {
      const { count } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', member.company_id)
        .eq('role', 'owner')
        .eq('status', 'active')

      if ((count || 0) <= 1) {
        throw new CompanyError(
          'Cannot change role of the last owner. Assign another owner first.',
          CompanyErrorCodes.UNAUTHORIZED,
          403
        )
      }
    }

    // Update member role
    const { data: updatedMember, error: updateError } = await supabase
      .from('company_members')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member role:', updateError)
      throw new CompanyError(
        'Failed to update member role',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
    return updatedMember as CompanyMember
  }

  /**
   * Remove a member from the company
   * @param memberId Member ID
   */
  async removeMember(memberId: string): Promise<void> {
    const supabase = await createClient()

    // Check if member exists
    const { data: member, error: fetchError } = await supabase
      .from('company_members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (fetchError || !member) {
      throw new CompanyError(
        'Member not found',
        CompanyErrorCodes.NOT_FOUND,
        404
      )
    }

    // Prevent removing the last owner
    if (member.role === 'owner') {
      const { count } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', member.company_id)
        .eq('role', 'owner')
        .eq('status', 'active')

      if ((count || 0) <= 1) {
        throw new CompanyError(
          'Cannot remove the last owner. Assign another owner first.',
          CompanyErrorCodes.UNAUTHORIZED,
          403
        )
      }
    }

    // Delete member record
    const { error: deleteError } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      throw new CompanyError(
        'Failed to remove member',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    clearCache()
  }

  /**
   * Get all members of a company
   * @param companyId Company ID
   * @returns Array of company members with user info
   */
  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    const cacheKey = `company:members:${companyId}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as CompanyMember[]
    }

    const supabase = await createClient()

    // Fetch members first
    const { data: members, error } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching company members:', error)
      throw new CompanyError(
        'Failed to fetch company members',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    // Fetch user profiles separately
    const userIds = members?.map(m => m.user_id) || []
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Combine members with their user profiles
    const result = (members || []).map(member => ({
      ...member,
      user: profiles?.find(p => p.id === member.user_id) || null,
    })) as unknown as CompanyMember[]

    setCachedData(cacheKey, result)
    return result
  }

  /**
   * Get all companies a user is a member of
   * @param userId User ID
   * @returns Array of companies with member info
   */
  async getUserCompanies(userId: string): Promise<
    Array<{
      company: {
        id: string
        slug: string
        name: string
        logo_url?: string
        verification_status: string
      }
      role: string
      status: string
    }>
  > {
    const cacheKey = `user:companies:${userId}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Array<{
        company: {
          id: string
          slug: string
          name: string
          logo_url?: string
          verification_status: string
        }
        role: string
        status: string
      }>
    }

    const supabase = await createClient()

    // Fetch memberships first
    const { data: memberships, error } = await supabase
      .from('company_members')
      .select('role, status, company_id')
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user companies:', error)
      throw new CompanyError(
        'Failed to fetch user companies',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    // Fetch company details separately
    const companyIds = memberships?.map(m => m.company_id) || []
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, slug, name, logo_url, verification_status')
      .in('id', companyIds)

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
    }

    // Combine memberships with company details
    const result = (memberships || []).map(membership => ({
      role: membership.role,
      status: membership.status,
      company: companies?.find(c => c.id === membership.company_id) || {
        id: membership.company_id,
        slug: '',
        name: 'Unknown',
        verification_status: 'pending',
      },
    })) as Array<{
      company: {
        id: string
        slug: string
        name: string
        logo_url?: string
        verification_status: string
      }
      role: string
      status: string
    }>

    setCachedData(cacheKey, result)
    return result
  }

  /**
   * Check if a user is a member of a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns Company member record or null
   */
  async checkMembership(
    userId: string,
    companyId: string
  ): Promise<CompanyMember | null> {
    const cacheKey = `membership:${userId}:${companyId}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as CompanyMember | null
    }

    const supabase = await createClient()

    const { data: member, error } = await supabase
      .from('company_members')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        setCachedData(cacheKey, null)
        return null // Member not found
      }
      console.error('Error checking membership:', error)
      throw new CompanyError(
        'Failed to check membership',
        CompanyErrorCodes.NOT_FOUND,
        500
      )
    }

    setCachedData(cacheKey, member)
    return member as CompanyMember
  }

  /**
   * Check if a user has a specific permission for a company
   * @param userId User ID
   * @param companyId Company ID
   * @param permission Permission to check
   * @returns True if user has permission, false otherwise
   */
  async hasPermission(
    userId: string,
    companyId: string,
    permission: 'manage_events' | 'manage_team' | 'view_analytics' | 'edit_company'
  ): Promise<boolean> {
    const member = await this.checkMembership(userId, companyId)
    if (!member) {
      return false
    }

    // Define role-based permissions
    const rolePermissions: Record<
      string,
      Record<string, boolean>
    > = {
      owner: {
        manage_events: true,
        manage_team: true,
        view_analytics: true,
        edit_company: true,
      },
      admin: {
        manage_events: true,
        manage_team: true,
        view_analytics: true,
        edit_company: false,
      },
      editor: {
        manage_events: true,
        manage_team: false,
        view_analytics: true,
        edit_company: false,
      },
      member: {
        manage_events: false,
        manage_team: false,
        view_analytics: true,
        edit_company: false,
      },
    }

    const permissions = rolePermissions[member.role] || rolePermissions.member
    return permissions[permission] || false
  }

  /**
   * Check if a user can manage events for a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can manage events
   */
  async canManageEvents(userId: string, companyId: string): Promise<boolean> {
    return this.hasPermission(userId, companyId, 'manage_events')
  }

  /**
   * Check if a user can manage team members for a company
   * @param userId User ID
   * @param companyId Company ID
   * @returns True if user can manage team
   */
  async canManageTeam(userId: string, companyId: string): Promise<boolean> {
    return this.hasPermission(userId, companyId, 'manage_team')
  }

  /**
   * Send invitation email to a new team member
   * @param email Recipient email
   * @param userName Recipient name
   * @param companyName Company name
   * @param role Role assigned
   * @param companySlug Company slug for invitation link
   */
  private async sendInvitationEmail(
    email: string,
    userName: string,
    companyName: string,
    role: string,
    companySlug: string
  ): Promise<void> {
    const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/dashboard/company/${companySlug}/accept-invitation`

    const emailContent = this.getInvitationEmailTemplate({
      userName,
      companyName,
      role,
      invitationUrl,
    })

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${companyName} on CodeUnia`,
      html: emailContent,
    })
  }

  /**
   * Generate invitation email template
   * @param params Email template parameters
   * @returns HTML email content
   */
  private getInvitationEmailTemplate(params: {
    userName: string
    companyName: string
    role: string
    invitationUrl: string
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Team Invitation</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">
                You've been invited to join ${params.companyName}
              </h2>
              
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                Hi ${params.userName},
              </p>
              
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                You've been invited to join <strong>${params.companyName}</strong> on CodeUnia as a <strong>${params.role}</strong>.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                  <strong>Your Role:</strong> ${params.role.charAt(0).toUpperCase() + params.role.slice(1)}
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong>Company:</strong> ${params.companyName}
                </p>
              </div>
              
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                Click the button below to accept the invitation and start collaborating with your team.
              </p>
              
              <a href="${params.invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px;">
                Accept Invitation
              </a>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Need help? Visit our <a href="https://codeunia.com/protected/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} CodeUnia. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

export const companyMemberService = new CompanyMemberService()
