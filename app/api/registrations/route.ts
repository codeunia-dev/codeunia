import { NextRequest, NextResponse } from 'next/server';
import { masterRegistrationsService, RegistrationRequest, RegistrationFilters } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// GET: Get user's registrations with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters: RegistrationFilters = {
      user_id: user.id,
      activity_type: searchParams.get('activity_type') as "test" | "internship" | "round" | "event" | "hackathon" | "volunteer" | "sponsorship" | "mentor" | "judge" | "collaboration" | undefined,
      activity_id: searchParams.get('activity_id') || undefined,
      status: searchParams.get('status') as "pending" | "registered" | "completed" | "approved" | "rejected" | "cancelled" | "attended" | "no_show" | "disqualified" | undefined,
      payment_status: searchParams.get('payment_status') as "pending" | "paid" | "failed" | "refunded" | undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const registrations = await masterRegistrationsService.getUserRegistrations(filters);

    return NextResponse.json({
      success: true,
      data: registrations,
      count: registrations.length
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// POST: Register for any activity type
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

    // Get user profile for additional data
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone, company, current_position')
      .eq('id', user.id)
      .single();

    // Enhance registration data with profile information
    const enhancedRequest: RegistrationRequest = {
      ...body,
      full_name: body.full_name || (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined),
      email: body.email || profile?.email || user.email,
      phone: body.phone || profile?.phone,
      institution: body.institution || profile?.company,
      department: body.department || profile?.current_position,
    };

    const registration = await masterRegistrationsService.register(enhancedRequest, user.id);

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for activity'
    });

  } catch (error) {
    console.error('Error registering for activity:', error);
    return NextResponse.json(
      { error: 'Failed to register for activity' },
      { status: 500 }
    );
  }
}
