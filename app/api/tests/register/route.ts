import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    const { testId, userId, userEmail, userMetadata } = await request.json()

    if (!testId || !userId) {
      return NextResponse.json(
        { error: 'Test ID and User ID are required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if already registered
    const { data: existingRegistration } = await serviceSupabase
      .from('test_registrations')
      .select('id')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'User is already registered for this test' },
        { status: 400 }
      )
    }

    // Ensure profile exists to prevent trigger failure
    try {
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create a minimal one
        const { error: createError } = await serviceSupabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            first_name: userMetadata?.first_name || userMetadata?.given_name || '',
            last_name: userMetadata?.last_name || userMetadata?.family_name || '',
            is_public: true,
            email_notifications: true,
            profile_completion_percentage: 0,
            is_admin: false,
            username_editable: true,
            username_set: false,
            profile_complete: false
          })
        
        if (createError) {
          console.error('Error creating profile:', createError)
          // Continue anyway, the trigger might still work
        }
      }
    } catch (profileException) {
      console.error('Exception during profile check/creation:', profileException)
      // Continue with registration
    }

    // Prepare registration data with proper fallbacks for the trigger
    const fullName = userMetadata?.full_name || 
                    userMetadata?.name || 
                    (userMetadata?.first_name && userMetadata?.last_name ? 
                      `${userMetadata.first_name} ${userMetadata.last_name}` : 
                      null);

    // Register for the test
    const { data, error } = await serviceSupabase
      .from('test_registrations')
      .insert([{
        test_id: testId,
        user_id: userId,
        status: 'registered',
        attempt_count: 0,
        registration_date: new Date().toISOString(),
        full_name: fullName,
        email: userEmail || null,
        phone: null,
        institution: null,
        department: null,
        year_of_study: null,
        experience_level: null,
        registration_data: {
          registered_via: 'api_tests_register',
          registration_timestamp: new Date().toISOString(),
          user_metadata: userMetadata
        }
      }])
      .select()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: 'Failed to register for test', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error in test registration API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
