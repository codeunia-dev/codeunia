import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { subscriptionService } from '@/lib/services/subscription-service'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company
    const company = await companyService.getCompanyBySlug(slug)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if user is owner
    const { data: membership } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only company owners can upgrade subscriptions' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { tier } = body

    // Validate tier
    if (!['free', 'basic', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    // Update subscription
    const updatedCompany = await subscriptionService.updateSubscriptionTier(
      company.id,
      tier
    )

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: `Successfully upgraded to ${tier} plan`,
    })
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}
