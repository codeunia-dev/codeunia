// API route for admin to reject a company verification
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCompanyVerificationRejectedEmail,
  sendCompanyEmail,
} from '@/lib/email/company-emails'

/**
 * POST /api/admin/companies/[id]/reject
 * Reject a company verification (admin only)
 * Body: { reason: string, notes?: string }
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
    const { reason, notes } = body

    // Validate required fields
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

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

    // Check if already rejected
    if (company.verification_status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Company is already rejected' },
        { status: 400 }
      )
    }

    // Update company verification status
    const verificationNotes = notes 
      ? `${reason}\n\nNotes: ${notes}` 
      : reason

    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        verification_status: 'rejected',
        verification_notes: verificationNotes,
        verified_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to reject company' },
        { status: 500 }
      )
    }

    // Send rejection email to company
    const resubmitUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/companies/register?resubmit=${companyId}`
    
    const emailTemplate = getCompanyVerificationRejectedEmail({
      companyName: company.name,
      rejectionReason: reason,
      resubmitUrl,
    })

    await sendCompanyEmail({
      to: company.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    // Log the rejection action
    console.log('❌ Company verification rejected:', {
      companyId,
      companyName: company.name,
      rejectedBy: user.id,
      reason,
      notes,
    })

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Company verification rejected',
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/companies/[id]/reject:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
