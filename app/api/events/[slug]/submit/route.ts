import { NextRequest, NextResponse } from 'next/server';
import { eventsService, EventError } from '@/lib/services/events';
import { authorizationService } from '@/lib/services/authorization-service';
import { createClient } from '@/lib/supabase/server';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';

// POST: Submit event for approval
export async function POST(
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
    const canEdit = await authorizationService.canEditEvent(user.id, existingEvent.id.toString());

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to submit this event' },
        { status: 403 }
      );
    }

    // Check if event is already submitted or approved
    if (existingEvent.approval_status === 'pending') {
      return NextResponse.json(
        { error: 'Event is already pending approval' },
        { status: 400 }
      );
    }

    if (existingEvent.approval_status === 'approved') {
      return NextResponse.json(
        { error: 'Event is already approved' },
        { status: 400 }
      );
    }

    // Submit event for approval
    const submittedEvent = await eventsService.submitForApproval(
      existingEvent.id,
      user.id
    );

    // Invalidate caches
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { 
        message: 'Event submitted for approval successfully', 
        event: submittedEvent 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in POST /api/events/[slug]/submit:', error);
    
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
