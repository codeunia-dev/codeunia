import { NextRequest, NextResponse } from 'next/server'
import { eventsService, EventsFilters } from '@/lib/services/events'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js';

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
    
    // Check for admin authentication header or session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let isAuthorized = false
    
    // Check if user is authenticated and is admin
    if (user && user.user_metadata?.role === 'admin') {
      isAuthorized = true
    }
    
    // If not authorized through session, check if it's a direct admin request
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      )
    }
    
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

    // Use service role client for admin operations to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Create event using service role client
    const { data, error } = await serviceSupabase
      .from('events')
      .insert([{
        slug: eventData.slug,
        title: eventData.title,
        excerpt: eventData.excerpt,
        description: eventData.description,
        organizer: eventData.organizer,
        organizer_contact: eventData.organizer_contact,
        date: eventData.date,
        time: eventData.time,
        duration: eventData.duration,
        category: eventData.category,
        categories: eventData.categories || [],
        tags: eventData.tags || [],
        featured: eventData.featured || false,
        image: eventData.image || '',
        location: eventData.location,
        locations: eventData.locations || [],
        capacity: eventData.capacity,
        registered: eventData.registered || 0,
        price: eventData.price,
        payment: eventData.payment,
        status: eventData.status || 'live',
        event_type: eventData.eventType || ['Online'],
        team_size: eventData.teamSize || 1,
        user_types: eventData.userTypes || [],
        registration_required: eventData.registration_required || false,
        registration_deadline: eventData.registration_deadline || '',
        rules: eventData.rules || [],
        schedule: eventData.schedule || [],
        prize: eventData.prize || '',
        prize_details: eventData.prize_details || '',
        faq: eventData.faq || [],
        socials: eventData.socials || {},
        sponsors: eventData.sponsors || [],
        marking_scheme: eventData.marking_scheme
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'Failed to create event: ' + error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/events:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
