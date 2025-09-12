import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: Get rounds for a specific test
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: rounds, error } = await supabase
      .from('test_rounds')
      .select('*')
      .eq('test_id', testId)
      .order('round_number', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ rounds: rounds || [] });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    );
  }
}

// POST: Create a new round
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      test_id,
      round_number,
      name,
      description,
      start_date,
      end_date,
      duration_minutes,
      max_attempts,
      passing_score,
      requirements,
      assessment_criteria,
      round_type,
      is_elimination_round,
      weightage
    } = body;

    // Validate required fields
    if (!test_id || !name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Test ID, name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: round, error } = await supabase
      .from('test_rounds')
      .insert({
        test_id,
        round_number,
        name,
        description: description || '',
        start_date,
        end_date,
        duration_minutes: duration_minutes || null,
        max_attempts: max_attempts || 1,
        passing_score: passing_score || 70,
        requirements: requirements || [],
        assessment_criteria: assessment_criteria || [],
        round_type: round_type || 'submission',
        is_elimination_round: is_elimination_round || false,
        weightage: weightage || 100
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Round created successfully',
      round 
    });
  } catch (error) {
    console.error('Error creating round:', error);
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    );
  }
} 