import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyMemberService } from '@/lib/services/company-member-service'

/**
 * GET /api/companies/me
 * Get all companies the current user is a member of
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's companies
    const companies = await companyMemberService.getUserCompanies(user.id)

    return NextResponse.json({
      success: true,
      companies,
    })
  } catch (error) {
    console.error('Error fetching user companies:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
