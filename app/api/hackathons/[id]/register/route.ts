import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: slug } = await params

    // Get hackathon by slug
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, title, slug, status, approval_status, capacity, registered')
      .eq('slug', slug)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    // Check if hackathon is approved and live/published
    if (hackathon.approval_status !== 'approved') {
      return NextResponse.json(
        { error: 'This hackathon is not available for registration' },
        { status: 400 }
      )
    }

    if (hackathon.status !== 'live' && hackathon.status !== 'published') {
      return NextResponse.json(
        { error: 'This hackathon is not currently accepting registrations' },
        { status: 400 }
      )
    }

    // Check capacity
    if (hackathon.capacity && hackathon.registered >= hackathon.capacity) {
      return NextResponse.json(
        { error: 'This hackathon has reached its capacity' },
        { status: 400 }
      )
    }

    // Check if user is already registered using master_registrations
    const { data: existingRegistration } = await supabase
      .from('master_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_type', 'hackathon')
      .eq('activity_id', hackathon.id.toString())
      .maybeSingle()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this hackathon' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', user.id)
      .single()

    const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''

    // Register user in master_registrations table
    const { error: registrationError } = await supabase
      .from('master_registrations')
      .insert({
        user_id: user.id,
        activity_type: 'hackathon',
        activity_id: hackathon.id.toString(),
        status: 'registered',
        full_name: fullName || undefined,
        email: profile?.email || user.email,
        phone: profile?.phone || undefined,
      })

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return NextResponse.json(
        { error: 'Failed to register for hackathon' },
        { status: 500 }
      )
    }

    // Increment registered count using service role client to bypass RLS
    console.log('Attempting to increment registered count:', {
      hackathonId: hackathon.id,
      currentCount: hackathon.registered,
      newCount: (hackathon.registered || 0) + 1
    })

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: updatedHackathon, error: updateError } = await supabaseAdmin
      .from('hackathons')
      .update({ 
        registered: (hackathon.registered || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', hackathon.id)
      .select('registered')
      .single()

    if (updateError) {
      console.error('Error updating registered count:', updateError)
      // Don't fail the registration if count update fails
    } else if (updatedHackathon) {
      console.log('Successfully updated registered count to:', updatedHackathon.registered)
    } else {
      console.error('No hackathon returned from update')
    }

    // Track registration in analytics
    try {
      const { AnalyticsService } = await import('@/lib/services/analytics-service')
      await AnalyticsService.trackHackathonRegistration(hackathon.id)
    } catch (error) {
      console.error('Error tracking registration in analytics:', error)
      // Don't fail the registration if analytics tracking fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for hackathon',
    })
  } catch (error) {
    console.error('Error registering for hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: slug } = await params

    // Get hackathon by slug
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, registered')
      .eq('slug', slug)
      .single()

    if (hackathonError || !hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }

    console.log('Attempting to unregister:', {
      userId: user.id,
      hackathonId: hackathon.id,
      activityType: 'hackathon',
      activityId: hackathon.id.toString()
    })

    // Use the master registrations service which should handle RLS properly
    try {
      const { masterRegistrationsService } = await import('@/lib/services/master-registrations')
      await masterRegistrationsService.unregister(
        user.id,
        'hackathon',
        hackathon.id.toString()
      )
      console.log('Successfully unregistered using service')
    } catch (serviceError) {
      console.error('Error using service, trying direct delete:', serviceError)
      
      // Fallback to direct delete if service fails
      const { data: deletedData, error: deleteError } = await supabase
        .from('master_registrations')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_type', 'hackathon')
        .eq('activity_id', hackathon.id.toString())
        .select()

      if (deleteError) {
        console.error('Error deleting registration:', deleteError)
        return NextResponse.json(
          { error: 'Failed to unregister from hackathon' },
          { status: 500 }
        )
      }

      console.log('Direct delete result:', {
        deletedCount: deletedData?.length || 0,
        deletedData: deletedData
      })

      if (!deletedData || deletedData.length === 0) {
        console.log('No registration found to delete')
        return NextResponse.json({
          success: true,
          message: 'No active registration found',
        })
      }
    }

    // Decrement registered count using service role client to bypass RLS
    console.log('Attempting to decrement registered count:', {
      hackathonId: hackathon.id,
      currentCount: hackathon.registered,
      newCount: Math.max(0, (hackathon.registered || 0) - 1)
    })

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: updatedHackathon, error: updateError } = await supabaseAdmin
      .from('hackathons')
      .update({ 
        registered: Math.max(0, (hackathon.registered || 0) - 1),
        updated_at: new Date().toISOString()
      })
      .eq('id', hackathon.id)
      .select('registered')
      .single()

    if (updateError) {
      console.error('Error updating registered count:', updateError)
      // Don't fail the unregistration if count update fails
    } else if (updatedHackathon) {
      console.log('Successfully updated registered count to:', updatedHackathon.registered)
    } else {
      console.log('No hackathon returned from update')
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from hackathon',
    })
  } catch (error) {
    console.error('Error unregistering from hackathon:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
