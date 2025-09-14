import { NextRequest, NextResponse } from 'next/server';
import { eventsService, EventsFilters } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Define the type for event data in POST request
interface EventData {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  organizer: string;
  organizer_contact?: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  image?: string;
  location: string;
  locations?: string[];
  capacity: number;
  registered?: number;
  price: number;
  payment: string;
  status?: string;
  eventType?: string[];
  teamSize?: number;
  userTypes?: string[];
  registration_required?: boolean;
  registration_deadline?: string;
  rules?: string[];
  schedule?: unknown[];
  prize?: string;
  prize_details?: string;
  faq?: unknown[];
  socials?: Record<string, string>;
  sponsors?: unknown[];
  marking_scheme?: unknown;
}

// GET: Fetch events with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: EventsFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      dateFilter: (searchParams.get('dateFilter') as 'upcoming' | 'past' | 'all') || 'all',
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Try to get from cache first
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD');
    }

    // Fetch from database
    const result = await eventsService.getEvents(filters);
    
    // Cache the result
    await UnifiedCache.set(cacheKey, result, 'API_STANDARD');

    return UnifiedCache.createResponse(result, 'API_STANDARD');

  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return UnifiedCache.createResponse({
      events: [],
      total: 0,
      hasMore: false
    }, 'USER_PRIVATE');
  }
}

// POST: Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData: EventData = await request.json();

    // Check for admin authentication header or session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isAuthorized = false;

    // Check if user is authenticated and is admin
    if (user) {
      // Check admin status from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (profile?.is_admin) {
        isAuthorized = true;
      }
    }

    // If not authorized through session, check if it's a direct admin request
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Use service client for admin operations
    const supabaseService = createServiceClient();

    // Insert the new event
    const { data, error } = await supabaseService
      .from('events')
      .insert([{
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return UnifiedCache.createResponse(
        { error: 'Failed to create event', details: error.message },
        'USER_PRIVATE'
      );
    }

    // Invalidate event caches after successful creation
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { message: 'Event created successfully', event: data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
