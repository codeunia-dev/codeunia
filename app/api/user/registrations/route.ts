import { NextRequest, NextResponse } from 'next/server';
import { masterRegistrationsService } from '@/lib/services/master-registrations';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET: Fetch user's all registrations across all activity types
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const activityType = searchParams.get('activity_type');

    // Get user's registrations from master system
    const registrations = await masterRegistrationsService.getUserRegistrations({
      user_id: user.id,
      activity_type: activityType as "test" | "internship" | "round" | "event" | "hackathon" | "volunteer" | "sponsorship" | "mentor" | "judge" | "collaboration" | undefined
    });

    // Get activity details for each registration
    const registrationsWithDetails = await Promise.all(
      registrations.map(async (reg) => {
        let activity = null;
        
        try {
          // Get activity details based on type
          switch (reg.activity_type) {
            case 'event':
              const { data: event } = await supabase
                .from('events')
                .select('id, slug, title, excerpt, organizer, date, time, location, category, featured, image')
                .eq('id', reg.activity_id)
                .single();
              activity = event;
              break;
              
            case 'hackathon':
              const { data: hackathon } = await supabase
                .from('hackathons')
                .select('id, slug, title, excerpt, organizer, date, time, location, category, featured, image')
                .eq('id', reg.activity_id)
                .single();
              activity = hackathon;
              break;
              
            case 'test':
              const { data: test } = await supabase
                .from('tests')
                .select('id, title, description, duration, difficulty, category')
                .eq('id', reg.activity_id)
                .single();
              activity = test;
              break;
              
            case 'internship':
              const { data: internship } = await supabase
                .from('internships')
                .select('id, title, company, location, duration, domain, level')
                .eq('id', reg.activity_id)
                .single();
              activity = internship;
              break;
              
            case 'round':
              const { data: round } = await supabase
                .from('test_rounds')
                .select('id, title, description, start_date, end_date, test_id')
                .eq('id', reg.activity_id)
                .single();
              activity = round;
              break;
              
            default:
              // For other activity types, just return basic info
              activity = {
                id: reg.activity_id,
                title: `${reg.activity_type} #${reg.activity_id}`,
                type: reg.activity_type
              };
          }
        } catch (error) {
          console.error(`Error fetching ${reg.activity_type} details:`, error);
          activity = {
            id: reg.activity_id,
            title: `${reg.activity_type} #${reg.activity_id}`,
            type: reg.activity_type,
            error: 'Activity not found'
          };
        }

        return {
          id: reg.id,
          activityType: reg.activity_type,
          activityId: reg.activity_id,
          registrationDate: reg.registration_date,
          status: reg.status,
          paymentStatus: reg.payment_status,
          paymentAmount: reg.payment_amount,
          paymentCurrency: reg.payment_currency,
          fullName: reg.full_name,
          email: reg.email,
          phone: reg.phone,
          institution: reg.institution,
          department: reg.department,
          yearOfStudy: reg.year_of_study,
          experienceLevel: reg.experience_level,
          metadata: reg.metadata,
          createdAt: reg.created_at,
          updatedAt: reg.updated_at,
          activity: activity
        };
      })
    );

    // Group registrations by activity type
    const groupedRegistrations = registrationsWithDetails.reduce((acc, reg) => {
      if (!acc[reg.activityType]) {
        acc[reg.activityType] = [];
      }
      acc[reg.activityType].push(reg);
      return acc;
    }, {} as Record<string, unknown[]>);

    // Get statistics
    const stats = await masterRegistrationsService.getRegistrationStats();

    return NextResponse.json({
      success: true,
      data: {
        registrations: registrationsWithDetails,
        grouped: groupedRegistrations,
        stats: {
          total: stats.total,
          byActivityType: stats.by_activity_type,
          byStatus: stats.by_status,
          byPaymentStatus: stats.by_payment_status
        }
      },
      count: registrationsWithDetails.length
    });

  } catch (error) {
    console.error('Error in GET /api/user/registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
