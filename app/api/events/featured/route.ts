import { NextRequest, NextResponse } from 'next/server'
import { eventsService } from '@/lib/services/events'

// GET: Fetch featured events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5
    
    const events = await eventsService.getFeaturedEvents(limit)
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error in GET /api/events/featured:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured events' },
      { status: 500 }
    )
  }
} 