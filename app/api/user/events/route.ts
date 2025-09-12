import { NextResponse } from 'next/server';
import { masterRegistrationsService } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET: Fetch user's event registrations (updated to use master system)
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's event registrations from master system
    const registrations = await masterRegistrationsService.getUserRegistrations({
      user_id: user.id,
      activity_type: 'event'
    });

    // Get event details for each registration
    const registrationsWithDetails = await Promise.all(
      registrations.map(async (reg) => {
        const { data: event } = await supabase
          .from('events')
          .select(`
            id,
            slug,
            title,
            excerpt,
            organizer,
            date,
            time,
            location,
            category,
            featured,
            image
          `)
          .eq('id', reg.activity_id)
          .single();

        return {
          id: reg.id,
          registrationDate: reg.registration_date,
          status: reg.status,
          paymentStatus: reg.payment_status,
          notes: reg.metadata?.notes,
          event: event ? {
            id: event.id,
            slug: event.slug,
            title: event.title,
            excerpt: event.excerpt,
            organizer: event.organizer,
            date: event.date,
            time: event.time,
            location: event.location,
            category: event.category,
            featured: event.featured,
            image: event.image
          } : null
        };
      })
    );

    // Filter out registrations where event was not found
    const validRegistrations = registrationsWithDetails.filter(reg => reg.event !== null);

    return NextResponse.json({
      registrations: validRegistrations,
      total: validRegistrations.length
    });

  } catch (error) {
    console.error('Error in GET /api/user/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
