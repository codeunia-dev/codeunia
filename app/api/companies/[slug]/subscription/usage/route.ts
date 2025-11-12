import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { subscriptionService } from '@/lib/services/subscription-service'

export async function GET(
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

    // Check if user is a member
    const { data: membership } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a company member' }, { status: 403 })
    }

    // Get subscription usage
    const usage = await subscriptionService.getSubscriptionUsage(company.id)

    return NextResponse.json({
      success: true,
      usage,
    })
  } catch (error) {
    console.error('Error fetching subscription usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription usage' },
      { status: 500 }
    )
  }
}
