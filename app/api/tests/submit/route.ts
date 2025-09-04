import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { attemptId, score, maxScore, passed, timeTakenMinutes, answers } = await request.json()

    if (!attemptId || score === undefined || maxScore === undefined || passed === undefined || timeTakenMinutes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the test attempt
    const { data, error } = await serviceSupabase
      .from('test_attempts')
      .update({
        submitted_at: new Date().toISOString(),
        score,
        max_score: maxScore,
        passed,
        time_taken_minutes: timeTakenMinutes,
        status: 'submitted'
      })
      .eq('id', attemptId)
      .select()

    if (error) {
      console.error('Error updating test attempt:', error)
      return NextResponse.json(
        { error: 'Failed to update test attempt' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No rows were updated' },
        { status: 404 }
      )
    }

    // Save answers if provided
    if (answers && Object.keys(answers).length > 0) {
      const answerRecords = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        attempt_id: attemptId,
        question_id: questionId,
        selected_options: selectedOptions,
        answered_at: new Date().toISOString()
      }))

      const { error: answersError } = await serviceSupabase
        .from('test_answers')
        .insert(answerRecords)

      if (answersError) {
        console.error('Error saving answers:', answersError)
        return NextResponse.json(
          { error: 'Failed to save answers' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error in test submit API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
