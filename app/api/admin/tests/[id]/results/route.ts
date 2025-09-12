import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET: Get test results and analytics (admin only)
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
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Check if user is admin (using profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // passed, failed, all
    const offset = (page - 1) * limit;

    // Get attempts with user details
    let query = supabase
      .from('test_attempts')
      .select('*', { count: 'exact' })
      .eq('test_id', id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('passed', status === 'passed');
    }

    const { data: attempts, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get leaderboard
    const { data: leaderboard } = await supabase
      .from('test_leaderboard')
      .select('*')
      .eq('test_id', id)
      .order('rank', { ascending: true })
      .limit(10);

    // Calculate statistics
    const { data: allAttempts } = await supabase
      .from('test_attempts')
      .select('score, passed, time_taken_minutes')
      .eq('test_id', id)
      .eq('status', 'submitted');

    const { data: registrations } = await supabase
      .from('test_registrations')
      .select('*')
      .eq('test_id', id);

    const stats = {
      totalRegistrations: registrations?.length || 0,
      totalAttempts: allAttempts?.length || 0,
      passedAttempts: allAttempts?.filter((a: Record<string, unknown>) => a.passed).length || 0,
      averageScore: allAttempts ? allAttempts.reduce((sum: number, a: Record<string, unknown>) => sum + (a.score as number || 0), 0) / allAttempts.length : 0,
      averageTime: allAttempts ? allAttempts.reduce((sum: number, a: Record<string, unknown>) => sum + (a.time_taken_minutes as number || 0), 0) / allAttempts.length : 0
    };

    return NextResponse.json({
      attempts: attempts || [],
      leaderboard: leaderboard || [],
      total: count || 0,
      page,
      limit,
      statistics: stats
    });
  } catch (error) {
    console.error('Error in test results route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Override score or enable review mode (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Check if user is admin (using profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const { attemptId, action, data } = await request.json();

    if (action === 'override_score') {
      const { score, reason } = data;
      
      const { error } = await supabase
        .from('test_attempts')
        .update({
          admin_override_score: score,
          admin_override_reason: reason
        })
        .eq('id', attemptId)
        .eq('test_id', id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to override score' },
          { status: 500 }
        );
      }
    } else if (action === 'enable_review') {
      const { enabled } = data;
      
      const { error } = await supabase
        .from('test_attempts')
        .update({
          review_mode_enabled: enabled
        })
        .eq('id', attemptId)
        .eq('test_id', id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update review mode' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Action completed successfully'
    });
  } catch (error) {
    console.error('Error in test results POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}