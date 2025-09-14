// Server-side service for events
import { createClient } from '@/lib/supabase/server'
import { UnifiedCache } from '@/lib/unified-cache-system'
import { Event, EventsFilters, EventsResponse } from '@/types/events'

// Re-export types for convenience
export type { Event, EventsFilters, EventsResponse }

class EventsService {
  async getEvents(filters: EventsFilters = {}): Promise<EventsResponse> {
    const cacheKey = `events:${JSON.stringify(filters)}`
    const cached = await UnifiedCache.get(cacheKey)
    if (cached) {
      return cached as EventsResponse
    }

    const supabase = await createClient()
    
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.dateFilter === 'upcoming') {
      // Get today's date in YYYY-MM-DD format for comparison
      const today = new Date().toISOString().split('T')[0]
      console.log('Upcoming filter - Today:', today)
      query = query.gte('date', today)
    } else if (filters.dateFilter === 'past') {
      // Get today's date in YYYY-MM-DD format for comparison
      const today = new Date().toISOString().split('T')[0]
      console.log('Past filter - Today:', today)
      query = query.lt('date', today)
    }

    // Apply pagination
    const limit = filters.limit || 10
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Order by date
    query = query.order('date', { ascending: true })

    const { data: events, error, count } = await query

    if (error) {
      console.error('Error fetching events:', error)
      throw new Error('Failed to fetch events')
    }

    const total = count || 0
    const hasMore = offset + limit < total

    const result = {
      events: events || [],
      total,
      hasMore
    }

    await UnifiedCache.set(cacheKey, result, 'DATABASE_QUERIES')
    return result
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const cacheKey = `event:${slug}`
    const cached = await UnifiedCache.get(cacheKey)
    if (cached) {
      return cached as Event
    }

    const supabase = await createClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Event not found
      }
      console.error('Error fetching event:', error)
      throw new Error('Failed to fetch event')
    }

    await UnifiedCache.set(cacheKey, event, 'DATABASE_QUERIES')
    return event
  }

  async getFeaturedEvents(limit: number = 5) {
    const cacheKey = `featured_events:${limit}`
    const cached = await UnifiedCache.get(cacheKey)
    if (cached) {
      return cached as Event[]
    }

    try {
      const supabase = await createClient()
      
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('featured', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching featured events:', error)
        // Return empty array instead of throwing to prevent 500 errors
        return []
      }

      const result = events || []
      await UnifiedCache.set(cacheKey, result, 'DATABASE_QUERIES')
      return result
    } catch (error) {
      console.error('Error in getFeaturedEvents:', error)
      // Return empty array as fallback
      return []
    }
  }

  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const supabase = await createClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      throw new Error('Failed to create event')
    }

    // Clear cache after creating new event
    await UnifiedCache.purgeByTags(['events', 'content'])
    return event
  }

  async updateEvent(slug: string, eventData: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>): Promise<Event> {
    const supabase = await createClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }

    // Clear cache after updating event
    await UnifiedCache.purgeByTags(['events', 'content'])
    return event
  }

  async deleteEvent(slug: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Error deleting event:', error)
      throw new Error('Failed to delete event')
    }

    // Clear cache after deleting event
    await UnifiedCache.purgeByTags(['events', 'content'])
    return true
  }
}

export const eventsService = new EventsService()
