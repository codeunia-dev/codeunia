// API route for admin to verify a company
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCompanyVerificationApprovedEmail,
  sendCompanyEmail,
} from '@/lib/email/company-emails'

/**
 * POST /api/admin/companies/[id]/verify
 * Verify a company (admin only)
 * Body: { notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: companyId } = await params

    // Check authentication
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

    // Check if user is platform admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { notes } = body

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (company.verification_status === 'verified') {
      return NextResponse.json(
        { success: false, error: 'Company is already verified' },
        { status: 400 }
      )
    }

    // Update company verification status
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify company' },
        { status: 500 }
      )
    }

    // Send verification approved email to company
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/dashboard/company`
    
    const emailTemplate = getCompanyVerificationApprovedEmail({
      companyName: company.name,
      dashboardUrl,
    })

    await sendCompanyEmail({
      to: company.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    // Log the verification action
    console.log('✅ Company verified:', {
      companyId,
      companyName: company.name,
      verifiedBy: user.id,
      notes,
    })

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Company verified successfully',
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/companies/[id]/verify:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
