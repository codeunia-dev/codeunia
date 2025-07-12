import { NextRequest, NextResponse } from 'next/server'
import { eventsService, EventsFilters } from '@/lib/services/events'

// GET: Fetch events with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: EventsFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : 
                searchParams.get('featured') === 'false' ? false : undefined,
      dateFilter: searchParams.get('dateFilter') as EventsFilters['dateFilter'] || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    }

    const result = await eventsService.getEvents(filters)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST: Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Validate required fields
    const requiredFields = ['slug', 'title', 'excerpt', 'description', 'organizer', 'date', 'time', 'duration', 'category', 'location', 'capacity', 'price', 'payment']
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const event = await eventsService.createEvent(eventData)
    
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 