import { NextRequest } from 'next/server';
import { eventsService } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';

// GET: Fetch featured events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Try to get from cache first
    const cacheKey = `featured_events:${limit}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return UnifiedCache.createResponse({ events: cached }, 'API_STANDARD');
    }

    // Fetch from database
    const events = await eventsService.getFeaturedEvents(limit);
    
    // Cache the result
    await UnifiedCache.set(cacheKey, events, 'API_STANDARD');

    return UnifiedCache.createResponse({ events }, 'API_STANDARD');

  } catch (error) {
    console.error('Error in GET /api/events/featured:', error);
    return UnifiedCache.createResponse({ events: [] }, 'API_STANDARD');
  }
}
