import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Register for a round
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_id, round_id, user_id } = body;

    // Validate required fields
    if (!test_id || !round_id || !user_id) {
      return NextResponse.json(
        { error: 'Test ID, round ID, and user ID are required' },
        { status: 400 }
      );
    }

    // Check if round exists and is active
    const { data: round, error: roundError } = await supabase
      .from('test_rounds')
      .select('*')
      .eq('id', round_id)
      .eq('test_id', test_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Check if round is currently active
    const now = new Date();
    const startDate = new Date(round.start_date);
    const endDate = new Date(round.end_date);

    if (now < startDate) {
      return NextResponse.json(
        { error: 'Round has not started yet' },
        { status: 400 }
      );
    }

    if (now > endDate) {
      return NextResponse.json(
        { error: 'Round has already ended' },
        { status: 400 }
      );
    }

    // Check if user is already registered for this round
    const { data: existingRegistration, error: checkError } = await supabase
      .from('round_registrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('round_id', round_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this round' },
        { status: 400 }
      );
    }

    // Create round registration
    const { data: registration, error: registrationError } = await supabase
      .from('round_registrations')
      .insert({
        test_id,
        round_id,
        user_id,
        status: 'registered'
      })
      .select()
      .single();

    if (registrationError) throw registrationError;

    return NextResponse.json({ 
      message: 'Successfully registered for round',
      registration 
    });
  } catch (error) {
    console.error('Error registering for round:', error);
    return NextResponse.json(
      { error: 'Failed to register for round' },
      { status: 500 }
    );
  }
}

// GET: Get user's round registrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const testId = searchParams.get('testId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('round_registrations')
      .select(`
        *,
        test_rounds(
          id,
          round_number,
          name,
          description,
          start_date,
          end_date,
          round_type,
          is_elimination_round
        )
      `)
      .eq('user_id', userId);

    if (testId) {
      query = query.eq('test_id', testId);
    }

    const { data: registrations, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ registrations: registrations || [] });
  } catch (error) {
    console.error('Error fetching round registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch round registrations' },
      { status: 500 }
    );
  }
} 