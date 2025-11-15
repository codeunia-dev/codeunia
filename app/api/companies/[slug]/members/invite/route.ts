import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { subscriptionService } from '@/lib/services/subscription-service'
import { CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'
import { z } from 'zod'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

// Validation schema for invite request
const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    errorMap: () => ({ message: 'Role must be admin, editor, or viewer' }),
  }),
})

/**
 * POST /api/companies/[slug]/members/invite
 * Invite a new team member to the company
 * Requires authentication and company owner/admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get company
    const company = await companyService.getCompanyBySlug(slug)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      )
    }

    // Check if user has permission to invite members (owner or admin)
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner or admin role required to invite members',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, role } = validation.data

    // Check subscription limits
    const limitCheck = await subscriptionService.checkSubscriptionLimit(
      company.id,
      'add_team_member'
    )

    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: limitCheck.reason,
          upgrade_required: limitCheck.upgrade_required,
          current_usage: limitCheck.current_usage,
          limit: limitCheck.limit,
        },
        { status: 403 }
      )
    }

    // Invite member
    const newMember = await companyMemberService.inviteMember(
      company.id,
      email,
      role,
      user.id
    )

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: 'Team member invited successfully',
        member: newMember,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/companies/[slug]/members/invite:', error)

    if (error instanceof CompanyError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
