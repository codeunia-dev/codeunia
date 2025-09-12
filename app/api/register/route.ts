import { NextRequest, NextResponse } from 'next/server';
import { masterRegistrationsService, RegistrationRequest } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// POST: Universal registration endpoint for any activity type
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: RegistrationRequest = await request.json();
    
    // Validate required fields
    if (!body.activity_type || !body.activity_id) {
      return NextResponse.json(
        { error: 'Activity type and activity ID are required' },
        { status: 400 }
      );
    }

    // Validate activity type
    const validActivityTypes = [
      'hackathon', 'event', 'internship', 'test', 'round', 
      'volunteer', 'sponsorship', 'mentor', 'judge', 'collaboration'
    ];

    if (!validActivityTypes.includes(body.activity_type)) {
      return NextResponse.json(
        { error: `Invalid activity type. Must be one of: ${validActivityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const isRegistered = await masterRegistrationsService.isRegistered(
      user.id,
      body.activity_type,
      body.activity_id
    );

    if (isRegistered) {
      return NextResponse.json(
        { error: 'You are already registered for this activity' },
        { status: 400 }
      );
    }

    // Enhance registration data with user information (profile data will be fetched in the service)
    const enhancedRequest: RegistrationRequest = {
      ...body,
      full_name: body.full_name || user.user_metadata?.full_name,
      email: body.email || user.email,
      phone: body.phone || user.user_metadata?.phone,
    };

    const registration = await masterRegistrationsService.register(enhancedRequest, user.id);

    return NextResponse.json({
      success: true,
      data: registration,
      message: `Successfully registered for ${body.activity_type}`
    });

  } catch (error) {
    console.error('Error registering for activity:', error);
    return NextResponse.json(
      { error: 'Failed to register for activity' },
      { status: 500 }
    );
  }
}
