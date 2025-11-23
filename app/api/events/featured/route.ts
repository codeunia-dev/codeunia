import { NextRequest } from 'next/server';
import { eventsService } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET: Fetch featured events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Fetch from database - no caching to prevent stale data
    const events = await eventsService.getFeaturedEvents(limit);

    // Return with no-cache headers to prevent stale data
    return UnifiedCache.createResponse({ events }, 'USER_PRIVATE');

  } catch (error) {
    console.error('Error in GET /api/events/featured:', error);
    return UnifiedCache.createResponse({ events: [] }, 'API_STANDARD');
  }
}
