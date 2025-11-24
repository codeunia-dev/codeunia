import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CompanyNotificationPreferences } from '@/types/company'

// GET - Fetch notification preferences
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, email_new_registration, email_event_approved, email_event_rejected, email_team_member_joined, email_subscription_expiring')
      .eq('slug', slug)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if user is a member of the company
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this company' },
        { status: 403 }
      )
    }

    // Only owners and admins can view notification preferences
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const preferences: CompanyNotificationPreferences = {
      email_new_registration: company.email_new_registration ?? true,
      email_event_approved: company.email_event_approved ?? true,
      email_event_rejected: company.email_event_rejected ?? true,
      email_team_member_joined: company.email_team_member_joined ?? true,
      email_subscription_expiring: company.email_subscription_expiring ?? true,
    }

    return NextResponse.json({ data: preferences }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update notification preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if user is a member of the company
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You are not a member of this company' },
        { status: 403 }
      )
    }

    // Only owners and admins can update notification preferences
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const preferences: Partial<CompanyNotificationPreferences> = {}

    // Validate and sanitize input
    if (typeof body.email_new_registration === 'boolean') {
      preferences.email_new_registration = body.email_new_registration
    }
    if (typeof body.email_event_approved === 'boolean') {
      preferences.email_event_approved = body.email_event_approved
    }
    if (typeof body.email_event_rejected === 'boolean') {
      preferences.email_event_rejected = body.email_event_rejected
    }
    if (typeof body.email_team_member_joined === 'boolean') {
      preferences.email_team_member_joined = body.email_team_member_joined
    }
    if (typeof body.email_subscription_expiring === 'boolean') {
      preferences.email_subscription_expiring = body.email_subscription_expiring
    }

    // Update company notification preferences
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)

    if (updateError) {
      console.error('Error updating notification preferences:', updateError)
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Notification preferences updated successfully',
        data: preferences,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
