import { NextRequest, NextResponse } from 'next/server';
import { eventsService } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';

// GET: Fetch a specific event by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Event slug is required' },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = `event:${slug}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch from database
    const event = await eventsService.getEventBySlug(slug);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Cache the result
    await UnifiedCache.set(cacheKey, event, 'API_STANDARD');

    return NextResponse.json(event);

  } catch (error) {
    console.error('Error in GET /api/events/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
