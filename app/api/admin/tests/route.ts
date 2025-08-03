import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select(`
        *,
        test_registrations(count),
        test_attempts(count),
        test_rounds(
          id,
          round_number,
          name,
          description,
          start_date,
          end_date,
          round_type,
          is_elimination_round,
          weightage
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tests: tests || [] });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      duration_minutes,
      event_start,
      event_end,
      registration_start,
      registration_end,
      certificate_start,
      certificate_end,
      rounds,
      is_paid,
      price,
      currency,
      is_public,
      enable_leaderboard,
      certificate_template_id,
      passing_score,
      max_attempts,
      questions
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Get user from request (temporary solution)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    if (usersError || !users) {
      return NextResponse.json(
        { error: 'No users found in system' },
        { status: 400 }
      );
    }

    const user = { id: users.id };

    // Insert test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        name,
        description,
        duration_minutes: duration_minutes || 60,
        event_start: event_start || null,
        event_end: event_end || null,
        registration_start: registration_start || null,
        registration_end: registration_end || null,
        certificate_start: certificate_start || null,
        certificate_end: certificate_end || null,
        is_paid: is_paid || false,
        price: price || 0,
        currency: currency || 'INR',
        is_public: is_public !== undefined ? is_public : true,
        enable_leaderboard: enable_leaderboard || false,
        certificate_template_id: certificate_template_id || null,
        passing_score: passing_score || 70,
        max_attempts: max_attempts || 1,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (testError) throw testError;

    // Insert rounds if provided
    if (rounds && rounds.length > 0) {
      const roundsData = rounds.map((round: any, index: number) => ({
        test_id: test.id,
        round_number: index + 1,
        name: round.name,
        description: round.description,
        start_date: round.start_date,
        end_date: round.end_date,
        duration_minutes: round.duration_minutes,
        max_attempts: round.max_attempts,
        passing_score: round.passing_score,
        requirements: round.requirements || [],
        assessment_criteria: round.assessment_criteria || [],
        round_type: round.round_type || 'submission',
        is_elimination_round: round.is_elimination_round || false,
        weightage: round.weightage || 100
      }));

      const { error: roundsError } = await supabase
        .from('test_rounds')
        .insert(roundsData);

      if (roundsError) throw roundsError;
    }

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const questionsData = questions.map((question: any, index: number) => ({
        test_id: test.id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_options: question.correct_options || [],
        explanation: question.explanation || '',
        points: question.points || 1,
        order_index: index + 1
      }));

      const { error: questionsError } = await supabase
        .from('test_questions')
        .insert(questionsData);

      if (questionsError) throw questionsError;
    }

    return NextResponse.json({ 
      message: 'Test created successfully',
      test 
    });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}