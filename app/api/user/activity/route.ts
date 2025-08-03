import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { activityService } from '@/lib/services/activity'
import { ActivityType } from '@/types/profile'

// GET: Fetch user activity data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activityType = searchParams.get('type') as ActivityType | 'all' | null

    let activityData

    if (activityType && activityType !== 'all') {
      activityData = await activityService.getUserActivityByType(user.id, activityType)
    } else {
      activityData = await activityService.getUserActivity(user.id)
    }

    return NextResponse.json(activityData)
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Log a new activity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activityType, activityData } = await request.json()

    if (!activityType) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 })
    }

    const result = await activityService.logActivity(user.id, activityType, activityData)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to log activity' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 