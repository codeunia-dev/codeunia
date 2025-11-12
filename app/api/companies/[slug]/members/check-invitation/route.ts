import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies/[slug]/members/check-invitation
 * Check if the current user has an invitation to this company
 * Requires authentication
 */
export async function GET(
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

    // Check if user has a membership (any status)
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .single()

    if (membershipError) {
      if (membershipError.code === 'PGRST116') {
        // No membership found
        return NextResponse.json({
          success: true,
          membership: null,
        })
      }
      throw membershipError
    }

    return NextResponse.json({
      success: true,
      membership,
    })
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/members/check-invitation:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
