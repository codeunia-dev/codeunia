// Server-side service for events
import { createClient } from '@/lib/supabase/server'
import { Event, EventsFilters, EventsResponse } from '@/types/events'
import { companyService } from './company-service'
import { AnalyticsService } from './analytics-service'

// Re-export types for convenience
export type { Event, EventsFilters, EventsResponse }

// Simple in-memory cache for development
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

function clearCache() {
  cache.clear()
}

// Error classes for event operations
export class EventError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'EventError'
  }
}

export const EventErrorCodes = {
  NOT_FOUND: 'EVENT_NOT_FOUND',
  UNAUTHORIZED: 'EVENT_UNAUTHORIZED',
  VALIDATION_FAILED: 'EVENT_VALIDATION_FAILED',
  DUPLICATE_DETECTED: 'DUPLICATE_EVENT_DETECTED',
  SUBSCRIPTION_LIMIT_REACHED: 'SUBSCRIPTION_LIMIT_REACHED',
  ALREADY_SUBMITTED: 'EVENT_ALREADY_SUBMITTED',
  NOT_PENDING: 'EVENT_NOT_PENDING',
}

class EventsService {
  async getEvents(filters: EventsFilters = {}): Promise<EventsResponse> {
    const cacheKey = `events:${JSON.stringify(filters)}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as EventsResponse
    }

    const supabase = await createClient()

    let query = supabase
      .from('events')
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status,
          industry,
          company_size
        )
      `, { count: 'exact' })

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

    // Filter by company
    if (filters.company_id) {
      query = query.eq('company_id', filters.company_id)
    }

    // Filter by company industry
    if (filters.company_industry) {
      query = query.eq('company.industry', filters.company_industry)
    }

    // Filter by company size
    if (filters.company_size) {
      query = query.eq('company.company_size', filters.company_size)
    }

    // Filter by approval status (default to approved for public)
    if (filters.approval_status) {
      query = query.eq('approval_status', filters.approval_status)
    } else {
      query = query.eq('approval_status', 'approved')
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
      throw new EventError('Failed to fetch events', EventErrorCodes.NOT_FOUND, 500)
    }

    const total = count || 0
    const hasMore = offset + limit < total

    const result = {
      events: events || [],
      total,
      hasMore
    }

    setCachedData(cacheKey, result)
    return result
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    const cacheKey = `event:${slug}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Event
    }

    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          banner_url,
          description,
          website,
          verification_status
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Event not found
      }
      console.error('Error fetching event:', error)
      throw new EventError('Failed to fetch event', EventErrorCodes.NOT_FOUND, 500)
    }

    setCachedData(cacheKey, event)
    return event
  }

  /**
   * Get event by ID
   * @param id Event ID
   * @returns Event or null if not found
   */
  async getEventById(id: number): Promise<Event | null> {
    const cacheKey = `event:id:${id}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Event
    }

    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          banner_url,
          description,
          website,
          verification_status
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Event not found
      }
      console.error('Error fetching event by ID:', error)
      throw new EventError('Failed to fetch event', EventErrorCodes.NOT_FOUND, 500)
    }

    setCachedData(cacheKey, event)
    return event
  }

  async getFeaturedEvents(limit: number = 5) {
    const cacheKey = `featured_events:${limit}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Event[]
    }

    try {
      const supabase = await createClient()

      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          company:companies(
            id,
            slug,
            name,
            logo_url,
            verification_status
          )
        `)
        .eq('featured', true)
        .eq('approval_status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching featured events:', error)
        // Return empty array instead of throwing to prevent 500 errors
        return []
      }

      const result = events || []
      setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getFeaturedEvents:', error)
      // Return empty array as fallback
      return []
    }
  }

  /**
   * Get events for a specific company
   * @param companyId Company ID
   * @param filters Event filters
   * @returns Events response
   */
  async getCompanyEvents(
    companyId: string,
    filters: EventsFilters = {}
  ): Promise<EventsResponse> {
    return this.getEvents({
      ...filters,
      company_id: companyId,
    })
  }

  /**
   * Create a new event with company context
   * @param eventData Event data
   * @param userId ID of the user creating the event
   * @param companyId ID of the company hosting the event
   * @returns Created event
   */
  async createEvent(
    eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>,
    userId: string,
    companyId: string
  ): Promise<Event> {
    const supabase = await createClient()

    // Check subscription limits
    const canCreate = await companyService.checkSubscriptionLimits(
      companyId,
      'create_event'
    )
    if (!canCreate) {
      throw new EventError(
        'Subscription limit reached. Please upgrade your plan to create more events.',
        EventErrorCodes.SUBSCRIPTION_LIMIT_REACHED,
        403
      )
    }

    // Validate event data
    const validation = await this.validateEvent(eventData, companyId)
    if (!validation.valid) {
      throw new EventError(
        `Event validation failed: ${validation.errors.join(', ')}`,
        EventErrorCodes.VALIDATION_FAILED,
        400
      )
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicates(eventData, companyId)
    if (isDuplicate) {
      throw new EventError(
        'A similar event already exists for this company and date',
        EventErrorCodes.DUPLICATE_DETECTED,
        409
      )
    }

    // Get company to check auto-approval
    const company = await companyService.getCompanyById(companyId)
    if (!company) {
      throw new EventError(
        'Company not found',
        EventErrorCodes.NOT_FOUND,
        404
      )
    }

    // Prepare event data with company context
    // Payment constraint: if price is "Free", payment must be "Not Required"
    // if price is not "Free", payment must be "Required"
    const paymentValue = eventData.price === 'Free' ? 'Not Required' : (eventData.payment || 'Required')

    // Remove status field - events start as draft by default
    // They can be submitted for approval later via submitForApproval
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...eventDataWithoutStatus } = eventData

    const eventPayload = {
      ...eventDataWithoutStatus,
      company_id: companyId,
      created_by: userId,
      approval_status: 'draft' as const,
      is_codeunia_event: false,
      payment: paymentValue,
    }

    console.log('Event payload:', JSON.stringify(eventPayload, null, 2))

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventPayload])
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status
        )
      `)
      .single()

    if (error) {
      console.error('Error creating event:', error)
      throw new EventError('Failed to create event', EventErrorCodes.NOT_FOUND, 500)
    }

    // Track analytics for event creation
    try {
      await AnalyticsService.incrementCompanyAnalytics(
        companyId,
        'events_created',
        1
      )
    } catch (analyticsError) {
      console.error('Error tracking event creation analytics:', analyticsError)
      // Don't fail the event creation if analytics tracking fails
    }

    clearCache()
    return event
  }

  /**
   * Update an event
   * @param id Event ID
   * @param eventData Partial event data to update
   * @param userId ID of the user updating the event
   * @returns Updated event
   */
  async updateEvent(
    id: number,
    eventData: Partial<Event>,
    userId: string
  ): Promise<Event> {
    const supabase = await createClient()

    // Get existing event
    const existingEvent = await this.getEventById(id)
    if (!existingEvent) {
      throw new EventError('Event not found', EventErrorCodes.NOT_FOUND, 404)
    }

    // Remove fields that shouldn't be updated directly
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      id: _id,
      created_at,
      created_by,
      company_id,
      approval_status,
      approved_by,
      approved_at,
      views,
      clicks,
      company,
      status: _status,
      ...updateData
    } = eventData
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Check if this is an approved event being edited
    // If so, reset to pending status for re-approval
    const needsReapproval = existingEvent.approval_status === 'approved'

    // Update the updated_at timestamp
    const updatePayload: Record<string, unknown> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    // If event was approved, reset to pending for re-approval
    if (needsReapproval) {
      updatePayload.approval_status = 'pending'
      updatePayload.approved_by = null
      updatePayload.approved_at = null
      console.log(`🔄 Event ${id} was approved, resetting to pending for re-approval`)
    }

    const { data: event, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status
        )
      `)
      .single()

    if (error) {
      console.error('Error updating event:', error)
      throw new EventError('Failed to update event', EventErrorCodes.NOT_FOUND, 500)
    }

    // If event needed re-approval, create notifications and log
    if (needsReapproval) {
      // Import notification service dynamically to avoid circular dependencies
      const { NotificationService } = await import('./notification-service')
      const { moderationService } = await import('./moderation-service')

      // Log the edit action
      await moderationService.logModerationAction('edited', id, undefined, userId, 'Event edited after approval - requires re-approval')

      // Notify admins about the updated event
      // Get all admin users
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (adminUsers && adminUsers.length > 0) {
        // Create notifications for all admins
        const notifications = adminUsers.map(admin => ({
          user_id: admin.id,
          company_id: existingEvent.company_id,
          type: 'event_updated' as const,
          title: 'Event Updated - Requires Re-approval',
          message: `"${existingEvent.title}" has been edited and requires re-approval`,
          action_url: `/admin/moderation/events/${id}`,
          action_label: 'Review Event',
          event_id: id.toString(),
          metadata: {
            event_title: existingEvent.title,
            event_slug: existingEvent.slug
          }
        }))

        await supabase.from('notifications').insert(notifications)
        console.log(`📧 Notified ${adminUsers.length} admin(s) about updated event`)
      }

      // Notify company members about the status change
      if (existingEvent.company_id) {
        await NotificationService.notifyCompanyMembers(existingEvent.company_id, {
          type: 'event_status_changed',
          title: 'Event Requires Re-approval',
          message: `Your event "${existingEvent.title}" has been edited and requires re-approval`,
          company_id: existingEvent.company_id,
          action_url: `/dashboard/company/events/${existingEvent.slug}`,
          action_label: 'View Event',
          event_id: id.toString(),
          metadata: {
            event_title: existingEvent.title,
            old_status: 'approved',
            new_status: 'pending'
          }
        })
      }
    }

    clearCache()
    return event
  }

  /**
   * Delete an event
   * @param id Event ID
   * @param _userId ID of the user deleting the event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteEvent(id: number, _userId: string): Promise<void> {
    const supabase = await createClient()

    // Get existing event to verify ownership
    const existingEvent = await this.getEventById(id)
    if (!existingEvent) {
      throw new EventError('Event not found', EventErrorCodes.NOT_FOUND, 404)
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      throw new EventError('Failed to delete event', EventErrorCodes.NOT_FOUND, 500)
    }

    clearCache()
  }

  /**
   * Submit an event for approval
   * @param eventId Event ID
   * @param _userId ID of the user submitting the event
   * @returns Updated event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submitForApproval(eventId: number, _userId: string): Promise<Event> {
    const supabase = await createClient()

    // Get existing event
    const existingEvent = await this.getEventById(eventId)
    if (!existingEvent) {
      throw new EventError('Event not found', EventErrorCodes.NOT_FOUND, 404)
    }

    // Check if already submitted or approved
    if (existingEvent.approval_status === 'pending' || existingEvent.approval_status === 'approved') {
      throw new EventError(
        'Event has already been submitted or approved',
        EventErrorCodes.ALREADY_SUBMITTED,
        400
      )
    }

    // Validate event before submission
    const validation = await this.validateEvent(existingEvent, existingEvent.company_id!)
    if (!validation.valid) {
      throw new EventError(
        `Event validation failed: ${validation.errors.join(', ')}`,
        EventErrorCodes.VALIDATION_FAILED,
        400
      )
    }

    // Update approval status to pending
    const { data: event, error } = await supabase
      .from('events')
      .update({
        approval_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select(`
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status
        )
      `)
      .single()

    if (error) {
      console.error('Error submitting event for approval:', error)
      throw new EventError('Failed to submit event', EventErrorCodes.NOT_FOUND, 500)
    }

    clearCache()
    return event
  }

  /**
   * Validate event data
   * @param eventData Event data to validate
   * @param companyId Company ID
   * @returns Validation result
   */
  async validateEvent(
    eventData: Partial<Event>,
    companyId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Required fields validation
    if (!eventData.title || eventData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long')
    }

    if (!eventData.description || eventData.description.trim().length < 100) {
      errors.push('Description must be at least 100 characters long')
    }

    if (!eventData.date) {
      errors.push('Event date is required')
    } else {
      // Validate date is in the future
      const eventDate = new Date(eventData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        errors.push('Event date must be in the future')
      }
    }

    if (!eventData.time) {
      errors.push('Event time is required')
    }

    if (!eventData.location || eventData.location.trim().length < 2) {
      errors.push('Location is required')
    }

    if (!eventData.category) {
      errors.push('Category is required')
    }

    if (eventData.capacity && eventData.capacity < 1) {
      errors.push('Capacity must be at least 1')
    }

    // Validate company exists and is verified
    const company = await companyService.getCompanyById(companyId)
    if (!company) {
      errors.push('Company not found')
    } else if (company.verification_status !== 'verified') {
      errors.push('Company must be verified to create events')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check for duplicate events
   * @param eventData Event data to check
   * @param companyId Company ID
   * @returns True if duplicate found, false otherwise
   */
  async checkDuplicates(
    eventData: Partial<Event>,
    companyId: string
  ): Promise<boolean> {
    const supabase = await createClient()

    // Check for events with same title, date, and company
    const { data: duplicates, error } = await supabase
      .from('events')
      .select('id')
      .eq('company_id', companyId)
      .eq('date', eventData.date!)
      .ilike('title', eventData.title!)
      .limit(1)

    if (error) {
      console.error('Error checking duplicates:', error)
      return false // Don't block on error
    }

    return (duplicates?.length || 0) > 0
  }

  /**
   * Increment view count for an event
   * @param eventId Event ID
   */
  async incrementViews(eventId: number): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_event_views', {
      event_id: eventId,
    })

    if (error) {
      // Try fallback method if RPC doesn't exist
      const event = await this.getEventById(eventId)
      if (event) {
        await supabase
          .from('events')
          .update({ views: (event.views || 0) + 1 })
          .eq('id', eventId)
      }
    }

    // Clear cache for this event
    clearCache()
  }

  /**
   * Increment click count for an event
   * @param eventId Event ID
   */
  async incrementClicks(eventId: number): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_event_clicks', {
      event_id: eventId,
    })

    if (error) {
      // Try fallback method if RPC doesn't exist
      const event = await this.getEventById(eventId)
      if (event) {
        await supabase
          .from('events')
          .update({ clicks: (event.clicks || 0) + 1 })
          .eq('id', eventId)
      }
    }

    // Clear cache for this event
    clearCache()
  }
}

export const eventsService = new EventsService()
