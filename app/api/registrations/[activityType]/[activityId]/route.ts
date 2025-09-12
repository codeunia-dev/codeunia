import { NextRequest, NextResponse } from 'next/server';
import { masterRegistrationsService } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET: Get specific registration details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityType: string; activityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { activityType, activityId } = await params;

    const result = await masterRegistrationsService.getActivityWithRegistration(
      activityType,
      activityId,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching registration details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registration details' },
      { status: 500 }
    );
  }
}

// PUT: Update registration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ activityType: string; activityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { activityType, activityId } = await params;
    const updates = await request.json();

    const registration = await masterRegistrationsService.updateRegistration(
      user.id,
      activityType,
      activityId,
      updates
    );

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Registration updated successfully'
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

// DELETE: Unregister from activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ activityType: string; activityId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { activityType, activityId } = await params;

    await masterRegistrationsService.unregister(user.id, activityType, activityId);

    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from activity'
    });

  } catch (error) {
    console.error('Error unregistering from activity:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from activity' },
      { status: 500 }
    );
  }
}
