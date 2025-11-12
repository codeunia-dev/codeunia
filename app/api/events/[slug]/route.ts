import { NextRequest, NextResponse } from 'next/server';
import { eventsService, EventError } from '@/lib/services/events';
import { authorizationService } from '@/lib/services/authorization-service';
import { createClient } from '@/lib/supabase/server';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';

// GET: Fetch a single event by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try to get from cache first
    const cacheKey = `event:${slug}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD');
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

    return UnifiedCache.createResponse(event, 'API_STANDARD');

  } catch (error) {
    console.error('Error in GET /api/events/[slug]:', error);
    
    if (error instanceof EventError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const updateData = await request.json();

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Get existing event
    const existingEvent = await eventsService.getEventBySlug(slug);

    if (!existingEvent || !existingEvent.id) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const canEdit = await authorizationService.canEditEvent(user.id, existingEvent.id.toString());

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this event' },
        { status: 403 }
      );
    }

    // Update event using service
    const updatedEvent = await eventsService.updateEvent(
      existingEvent.id,
      updateData,
      user.id
    );

    // Invalidate caches
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { message: 'Event updated successfully', event: updatedEvent },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in PUT /api/events/[slug]:', error);
    
    if (error instanceof EventError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Get existing event
    const existingEvent = await eventsService.getEventBySlug(slug);

    if (!existingEvent || !existingEvent.id) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const canDelete = await authorizationService.canDeleteEvent(user.id, existingEvent.id.toString());

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this event' },
        { status: 403 }
      );
    }

    // Delete event using service
    await eventsService.deleteEvent(existingEvent.id, user.id);

    // Invalidate caches
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in DELETE /api/events/[slug]:', error);
    
    if (error instanceof EventError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
