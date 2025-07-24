import { NextRequest, NextResponse } from 'next/server'
import { hackathonsService, HackathonsFilters } from '@/lib/services/hackathons'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js';

// GET: Fetch hackathons with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: HackathonsFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : 
                searchParams.get('featured') === 'false' ? false : undefined,
      dateFilter: searchParams.get('dateFilter') as HackathonsFilters['dateFilter'] || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    }

    const result = await hackathonsService.getHackathons(filters)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/hackathons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    )
  }
}

// POST: Create a new hackathon
export async function POST(request: NextRequest) {
  try {
    const hackathonData = await request.json()
    
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
      if (!hackathonData[field]) {
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
    
    // Create hackathon using service role client
    const { data, error } = await serviceSupabase
      .from('hackathons')
      .insert([{
        slug: hackathonData.slug,
        title: hackathonData.title,
        excerpt: hackathonData.excerpt,
        description: hackathonData.description,
        organizer: hackathonData.organizer,
        organizer_contact: hackathonData.organizer_contact,
        date: hackathonData.date,
        time: hackathonData.time,
        duration: hackathonData.duration,
        category: hackathonData.category,
        categories: hackathonData.categories || [],
        tags: hackathonData.tags || [],
        featured: hackathonData.featured || false,
        image: hackathonData.image || '',
        location: hackathonData.location,
        locations: hackathonData.locations || [],
        capacity: hackathonData.capacity,
        registered: hackathonData.registered || 0,
        price: hackathonData.price,
        payment: hackathonData.payment,
        status: hackathonData.status || 'live',
        event_type: hackathonData.eventType || ['Online'],
        team_size: hackathonData.teamSize || 1,
        user_types: hackathonData.userTypes || [],
        registration_required: hackathonData.registration_required || false,
        registration_deadline: hackathonData.registration_deadline || '',
        rules: hackathonData.rules || [],
        schedule: hackathonData.schedule || [],
        prize: hackathonData.prize || '',
        prize_details: hackathonData.prize_details || '',
        faq: hackathonData.faq || [],
        socials: hackathonData.socials || {},
        sponsors: hackathonData.sponsors || [],
        marking_scheme: hackathonData.marking_scheme
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating hackathon:', error)
      return NextResponse.json(
        { error: 'Failed to create hackathon: ' + error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/hackathons:', error)
    return NextResponse.json(
      { error: 'Failed to create hackathon' },
      { status: 500 }
    )
  }
}
