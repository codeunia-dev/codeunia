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
        { error: 'Only company owners can cancel subscriptions' },
        { status: 403 }
      )
    }

    // Cancel subscription
    const updatedCompany = await subscriptionService.cancelSubscription(company.id)

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Subscription cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
