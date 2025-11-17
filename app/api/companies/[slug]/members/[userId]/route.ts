import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'
import { z } from 'zod'
import { getRoleChangeEmail, sendCompanyEmail } from '@/lib/email/company-emails'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

// Validation schema for role update
const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'editor', 'viewer'], {
    errorMap: () => ({ message: 'Role must be owner, admin, editor, or viewer' }),
  }),
})

/**
 * PUT /api/companies/[slug]/members/[userId]
 * Update a team member's role
 * Requires authentication and company owner role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const { slug, userId } = await params

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

    // Check if user is owner (only owners can update roles)
    const requestingMember = await companyMemberService.checkMembership(user.id, company.id)

    if (!requestingMember || requestingMember.role !== 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner role required to update member roles',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateRoleSchema.safeParse(body)

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

    const { role } = validation.data

    // Get the member to update
    const targetMember = await companyMemberService.checkMembership(userId, company.id)

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Member not found in this company',
        },
        { status: 404 }
      )
    }

    // Store old role for email notification
    const oldRole = targetMember.role

    // Update member role
    const updatedMember = await companyMemberService.updateMemberRole(
      targetMember.id,
      role
    )

    // Get member's profile information for email
    const { data: memberProfile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single()

    // Get requesting user's name for email
    const { data: requestingUserProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const changedByName = requestingUserProfile?.first_name 
      ? `${requestingUserProfile.first_name} ${requestingUserProfile.last_name || ''}`.trim()
      : 'a team administrator'

    // Send role change notification email
    if (memberProfile?.email && oldRole !== role) {
      const memberName = memberProfile.first_name || memberProfile.email.split('@')[0]
      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://codeunia.com'}/dashboard/company/${company.slug}`
      
      const emailContent = getRoleChangeEmail({
        memberName,
        companyName: company.name,
        oldRole,
        newRole: role,
        changedBy: changedByName,
        dashboardUrl,
      })

      // Send email asynchronously (don't wait for it)
      console.log(`📧 Sending role change email to ${memberProfile.email}: ${oldRole} → ${role}`)
      sendCompanyEmail({
        to: memberProfile.email,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch(error => {
        console.error('❌ Failed to send role change email:', error)
        // Don't fail the request if email fails
      })
    }

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: 'Member role updated successfully',
        member: updatedMember,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PUT /api/companies/[slug]/members/[userId]:', error)

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

/**
 * DELETE /api/companies/[slug]/members/[userId]
 * Remove a team member from the company
 * Requires authentication and company owner role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const { slug, userId } = await params

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

    // Check if user is owner (only owners can remove members)
    const requestingMember = await companyMemberService.checkMembership(user.id, company.id)

    if (!requestingMember || requestingMember.role !== 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner role required to remove members',
        },
        { status: 403 }
      )
    }

    // Get the member to remove
    const targetMember = await companyMemberService.checkMembership(userId, company.id)

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Member not found in this company',
        },
        { status: 404 }
      )
    }

    // Prevent owner from removing themselves if they're the last owner
    if (userId === user.id && targetMember.role === 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot remove yourself as the last owner. Assign another owner first.',
        },
        { status: 400 }
      )
    }

    // Remove member
    await companyMemberService.removeMember(targetMember.id)

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: 'Member removed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/companies/[slug]/members/[userId]:', error)

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
