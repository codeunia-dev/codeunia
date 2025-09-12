import { NextRequest, NextResponse } from 'next/server';
import { masterRegistrationsService } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// POST: Register for an event (backward compatible)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check environment variables before creating Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity, registered, registration_required, price, payment')
      .eq('slug', slug)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if registration is required
    if (!event.registration_required) {
      return NextResponse.json(
        { error: 'Registration not required for this event' },
        { status: 400 }
      );
    }

    // Check if event requires payment
    if (event.payment === 'Required' || event.payment === 'Paid') {
      return NextResponse.json(
        { error: 'This event requires payment. Please use the payment flow.' },
        { status: 400 }
      );
    }

    // Check if event is at capacity
    if (event.registered >= event.capacity) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      );
    }

    // Check if user is already registered using master system
    const isRegistered = await masterRegistrationsService.isRegistered(
      user.id,
      'event',
      event.id.toString()
    );

    if (isRegistered) {
      return NextResponse.json(
        { error: 'You are already registered for this event' },
        { status: 400 }
      );
    }

    // Register using master system
    const registration = await masterRegistrationsService.register({
      activity_type: 'event',
      activity_id: event.id.toString(),
      status: 'registered',
      payment_status: 'not_applicable'
    }, user.id);

    // Update event registration count
    await supabase
      .from('events')
      .update({ 
        registered: event.registered + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for event'
    });

  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// DELETE: Unregister from an event (backward compatible)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check environment variables before creating Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, registered')
      .eq('slug', slug)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Unregister using master system
    await masterRegistrationsService.unregister(
      user.id,
      'event',
      event.id.toString()
    );

    // Update event registration count
    await supabase
      .from('events')
      .update({ 
        registered: Math.max(0, event.registered - 1),
        updated_at: new Date().toISOString()
      })
      .eq('id', event.id);

    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from event'
    });

  } catch (error) {
    console.error('Error unregistering from event:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from event' },
      { status: 500 }
    );
  }
}