import { NextRequest } from 'next/server';
import { eventsService } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { ApiSuccess, ApiErrors } from '@/lib/api/error';
import { withValidation, createValidationSchemas } from '@/lib/validators/middleware';
import { eventSchemas } from '@/lib/validators/schemas';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';



// GET: Fetch events with optional filters
export const GET = withValidation({
  query: eventSchemas.filters
})(async (request, { query }) => {
  try {
    // Try to get from cache first
    const cacheKey = `events:${JSON.stringify(query)}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return ApiSuccess.OK(cached);
    }

    // Fetch from database
    const result = await eventsService.getEvents(query);
    
    // Cache the result
    await UnifiedCache.set(cacheKey, result, 'API_STANDARD');

    return ApiSuccess.OK(result);

  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch events');
  }
});

// POST: Create a new event
export const POST = withValidation({
  body: eventSchemas.create
})(async (request, { body }) => {
  try {
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
      return ApiErrors.UNAUTHORIZED('Admin access required');
    }

    // Use service client for admin operations
    const supabaseService = createServiceClient();

    // Insert the new event
    const { data, error } = await supabaseService
      .from('events')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return ApiErrors.INTERNAL_ERROR('Failed to create event');
    }

    // Invalidate event caches after successful creation
    await UnifiedCache.purgeByTags(['content', 'api']);

    return ApiSuccess.CREATED(data, 'Event created successfully');

  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create event');
  }
});
