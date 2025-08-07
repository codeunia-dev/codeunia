import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Define the type for question data
interface QuestionData {
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_options?: string[];
  explanation?: string | null;
  points?: number;
}

// Define the type for test data (request body for PUT)
interface TestData {
  name?: string;
  description?: string;
  duration_minutes?: number;
  registration_start?: string | null;
  registration_end?: string | null;
  test_start?: string | null;
  test_end?: string | null;
  is_public?: boolean;
  enable_leaderboard?: boolean;
  certificate_template_id?: string | null;
  passing_score?: number;
  max_attempts?: number;
  questions?: QuestionData[];
}

// GET: Get test details with questions and registrations (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not authenticated' },
        { status: 401 }
      );
    }

    // Check admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // Get registrations
    const { data: registrations, error: registrationsError } = await supabase
      .from('test_registrations')
      .select('*')
      .eq('test_id', id)
      .order('registration_date', { ascending: false });

    if (registrationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      );
    }

    // Get attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', id)
      .order('created_at', { ascending: false });

    if (attemptsError) {
      return NextResponse.json(
        { error: 'Failed to fetch attempts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      test,
      questions: questions || [],
      registrations: registrations || [],
      attempts: attempts || []
    });
  } catch (error) {
    console.error('Error in test GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update test (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not authenticated' },
        { status: 401 }
      );
    }

    // Check admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const testData: TestData = await request.json();

    // Use service role client for admin operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Start a transaction
    const testInsertData: TestData = {
      name: testData.name,
      description: testData.description,
      duration_minutes: testData.duration_minutes,
      registration_start: testData.registration_start || null,
      registration_end: testData.registration_end || null,
      test_start: testData.test_start || null,
      test_end: testData.test_end || null,
      is_public: testData.is_public ?? true,
      enable_leaderboard: testData.enable_leaderboard ?? false,
      certificate_template_id: testData.certificate_template_id || null,
      passing_score: testData.passing_score,
      max_attempts: testData.max_attempts ?? 1,
    };

    // Update test
    const { data: test, error: testError } = await serviceSupabase
      .from('tests')
      .update(testInsertData)
      .eq('id', id)
      .select()
      .single();

    if (testError) {
      console.error('Test update error:', testError);
      return NextResponse.json(
        { error: 'Failed to update test: ' + testError.message },
        { status: 500 }
      );
    }

    // Delete existing questions
    const { error: deleteError } = await serviceSupabase
      .from('test_questions')
      .delete()
      .eq('test_id', id);

    if (deleteError) {
      console.error('Delete questions error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete existing questions: ' + deleteError.message },
        { status: 500 }
      );
    }

    // Insert new questions
    const questions = testData.questions?.map((q: QuestionData, index: number) => ({
      test_id: id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_options: q.correct_options || [],
      explanation: q.explanation || null,
      points: q.points ?? 1,
      order_index: index
    })) || [];

    console.log('Updating questions:', questions);
    
    if (questions.length > 0) {
      const { error: questionsError } = await serviceSupabase
        .from('test_questions')
        .insert(questions);

      if (questionsError) {
        console.error('Questions update error:', questionsError);
        return NextResponse.json(
          { error: 'Failed to update questions: ' + questionsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      test,
      message: 'Test updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete test (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: User not authenticated' },
        { status: 401 }
      );
    }

    // Check admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Use service role client for admin operations to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete related data first (cascading delete)
    console.log(`Deleting test ${id} and all related data...`);

    // Delete test attempts
    const { error: attemptsError } = await serviceSupabase
      .from('test_attempts')
      .delete()
      .eq('test_id', id);

    if (attemptsError) {
      console.error('Error deleting test attempts:', attemptsError);
      return NextResponse.json(
        { error: 'Failed to delete test attempts: ' + attemptsError.message },
        { status: 500 }
      );
    }

    // Delete test registrations
    const { error: registrationsError } = await serviceSupabase
      .from('test_registrations')
      .delete()
      .eq('test_id', id);

    if (registrationsError) {
      console.error('Error deleting test registrations:', registrationsError);
      return NextResponse.json(
        { error: 'Failed to delete test registrations: ' + registrationsError.message },
        { status: 500 }
      );
    }

    // Delete test questions
    const { error: questionsError } = await serviceSupabase
      .from('test_questions')
      .delete()
      .eq('test_id', id);

    if (questionsError) {
      console.error('Error deleting test questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to delete test questions: ' + questionsError.message },
        { status: 500 }
      );
    }

    // Delete test rounds
    const { error: roundsError } = await serviceSupabase
      .from('test_rounds')
      .delete()
      .eq('test_id', id);

    if (roundsError) {
      console.error('Error deleting test rounds:', roundsError);
      return NextResponse.json(
        { error: 'Failed to delete test rounds: ' + roundsError.message },
        { status: 500 }
      );
    }

    // Delete round registrations
    const { error: roundRegistrationsError } = await serviceSupabase
      .from('round_registrations')
      .delete()
      .eq('test_id', id);

    if (roundRegistrationsError) {
      console.error('Error deleting round registrations:', roundRegistrationsError);
      return NextResponse.json(
        { error: 'Failed to delete round registrations: ' + roundRegistrationsError.message },
        { status: 500 }
      );
    }

    // Delete test leaderboard entries
    const { error: leaderboardError } = await serviceSupabase
      .from('test_leaderboard')
      .delete()
      .eq('test_id', id);

    if (leaderboardError) {
      console.error('Error deleting test leaderboard:', leaderboardError);
      return NextResponse.json(
        { error: 'Failed to delete test leaderboard: ' + leaderboardError.message },
        { status: 500 }
      );
    }

    // Delete certificates related to this test
    const { error: certificatesError } = await serviceSupabase
      .from('certificates')
      .delete()
      .eq('test_id', id);

    if (certificatesError) {
      console.error('Error deleting certificates:', certificatesError);
      return NextResponse.json(
        { error: 'Failed to delete certificates: ' + certificatesError.message },
        { status: 500 }
      );
    }

    // Finally delete the test itself
    const { error: testError } = await serviceSupabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (testError) {
      console.error('Error deleting test:', testError);
      return NextResponse.json(
        { error: 'Failed to delete test: ' + testError.message },
        { status: 500 }
      );
    }

    console.log(`Test ${id} deleted successfully`);
    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Error in test DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}