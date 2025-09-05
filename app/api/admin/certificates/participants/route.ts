import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseClient();
    // Fetch all types of participants
    const [testAttempts, testRegistrations, hackathons, events] = await Promise.all([
      // Test attempts (including in-progress ones)
      supabaseAdmin
        .from('test_attempts')
        .select(`
          id,
          user_id,
          test_id,
          passed,
          status,
          score,
          created_at,
          tests!inner(title)
        `)
        .not('user_id', 'is', null),
      
      // Test registrations
      supabaseAdmin
        .from('test_registrations')
        .select(`
          id,
          user_id,
          test_id,
          registered_at,
          tests!inner(title)
        `)
        .not('user_id', 'is', null),
      
      // Hackathons (events with participants)
      supabaseAdmin
        .from('hackathons')
        .select(`
          id,
          title,
          registered,
          participants,
          created_at
        `)
        .gt('registered', 0),
      
      // Events (general events)
      supabaseAdmin
        .from('events')
        .select(`
          id,
          title,
          registered,
          participants,
          created_at
        `)
        .gt('registered', 0)
    ]);

    // Combine all participants
    interface Participant {
      id: string;
      user_id: string | null;
      event_type: string;
      event_title: string;
      status: string;
      passed: boolean | null;
      score: number | null;
      created_at: string;
      eligible: boolean;
      participants_count?: number;
    }

    const allParticipants: Participant[] = [];
    
    // Add test attempts
    if (testAttempts.data) {
      testAttempts.data.forEach((attempt) => {
        allParticipants.push({
          id: attempt.id,
          user_id: attempt.user_id,
          event_type: 'test',
          event_title: attempt.tests?.[0]?.title || 'Unknown Test',
          status: attempt.status,
          passed: attempt.passed,
          score: attempt.score,
          created_at: attempt.created_at,
          eligible: attempt.passed === true && attempt.status === 'submitted'
        });
      });
    }

    // Add test registrations (if not already in attempts)
    if (testRegistrations.data) {
      testRegistrations.data.forEach((registration) => {
        const existingAttempt = allParticipants.find(p => 
          p.user_id === registration.user_id && 
          p.event_type === 'test' && 
          p.event_title === registration.tests?.[0]?.title
        );
        
        if (!existingAttempt) {
          allParticipants.push({
            id: registration.id,
            user_id: registration.user_id,
            event_type: 'test',
            event_title: registration.tests?.[0]?.title || 'Unknown Test',
            status: 'registered',
            passed: null,
            score: null,
            created_at: registration.registered_at,
            eligible: false
          });
        }
      });
    }

    // Add hackathons
    if (hackathons.data) {
      hackathons.data.forEach((hackathon) => {
        allParticipants.push({
          id: hackathon.id,
          user_id: null, // Hackathons don't have individual user records
          event_type: 'hackathon',
          event_title: hackathon.title,
          status: 'completed',
          passed: true,
          score: null,
          created_at: hackathon.created_at,
          eligible: true,
          participants_count: hackathon.participants || hackathon.registered
        });
      });
    }

    // Add events
    if (events.data) {
      events.data.forEach((event) => {
        allParticipants.push({
          id: event.id,
          user_id: null, // Events don't have individual user records
          event_type: 'event',
          event_title: event.title,
          status: 'completed',
          passed: true,
          score: null,
          created_at: event.created_at,
          eligible: true,
          participants_count: event.participants || event.registered
        });
      });
    }

    return NextResponse.json(allParticipants);
  } catch (error) {
    console.error('Error fetching certificate participants:', error);
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
  }
} 