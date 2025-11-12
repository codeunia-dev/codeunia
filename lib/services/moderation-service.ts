// Server-side service for event and hackathon moderation
import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types/events'
import { Hackathon } from '@/types/hackathons'
import { companyService } from './company-service'
import { SUBSCRIPTION_LIMITS } from '@/types/company'

// Moderation log entry interface
export interface ModerationLog {
  id: string
  event_id?: number
  hackathon_id?: number
  action: 'submitted' | 'approved' | 'rejected' | 'edited' | 'deleted'
  performed_by: string
  reason?: string
  notes?: string
  created_at: string
}

// Automated check results interface
export interface AutomatedCheckResult {
  passed: boolean
  issues: string[]
}

// Error classes for moderation operations
export class ModerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ModerationError'
  }
}

export const ModerationErrorCodes = {
  NOT_FOUND: 'MODERATION_NOT_FOUND',
  ALREADY_APPROVED: 'ALREADY_APPROVED',
  ALREADY_REJECTED: 'ALREADY_REJECTED',
  NOT_PENDING: 'NOT_PENDING',
  FAILED_VALIDATION: 'FAILED_VALIDATION',
  DUPLICATE_DETECTED: 'DUPLICATE_DETECTED',
  UNAUTHORIZED: 'MODERATION_UNAUTHORIZED',
}

/**
 * Service class for managing event and hackathon moderation
 * Handles approval workflows, automated checks, and moderation logging
 */
class ModerationService {
  /**
   * Get pending events for moderation
   * @param filters Filters for pagination
   * @returns Pending events and total count
   */
  async getPendingEvents(filters: {
    limit?: number
    offset?: number
  } = {}): Promise<{ events: Event[]; total: number }> {
    const supabase = await createClient()

    const limit = filters.limit || 20
    const offset = filters.offset || 0

    const { data: events, error, count } = await supabase
      .from('events')
      .select(
        `
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status,
          subscription_tier
        )
      `,
        { count: 'exact' }
      )
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching pending events:', error)
      throw new ModerationError(
        'Failed to fetch pending events',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    return {
      events: (events || []) as Event[],
      total: count || 0,
    }
  }

  /**
   * Get pending hackathons for moderation
   * @param filters Filters for pagination
   * @returns Pending hackathons and total count
   */
  async getPendingHackathons(filters: {
    limit?: number
    offset?: number
  } = {}): Promise<{ hackathons: Hackathon[]; total: number }> {
    const supabase = await createClient()

    const limit = filters.limit || 20
    const offset = filters.offset || 0

    const { data: hackathons, error, count } = await supabase
      .from('hackathons')
      .select(
        `
        *,
        company:companies(
          id,
          slug,
          name,
          logo_url,
          verification_status,
          subscription_tier
        )
      `,
        { count: 'exact' }
      )
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching pending hackathons:', error)
      throw new ModerationError(
        'Failed to fetch pending hackathons',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    return {
      hackathons: (hackathons || []) as Hackathon[],
      total: count || 0,
    }
  }

  /**
   * Run automated checks on an event
   * @param event Event to check
   * @returns Check results with issues
   */
  async runAutomatedChecks(
    event: Event | Hackathon
  ): Promise<AutomatedCheckResult> {
    const issues: string[] = []

    // Check for profanity in title and description
    const hasProfanity = await this.checkProfanity(
      `${event.title} ${event.description}`
    )
    if (hasProfanity) {
      issues.push('Content contains inappropriate language')
    }

    // Check for duplicate events
    const isDuplicate = await this.checkDuplicates(event)
    if (isDuplicate) {
      issues.push('Similar event already exists for this date and company')
    }

    // Validate images if present
    if (event.image) {
      const imageValid = await this.validateImages(event.image)
      if (!imageValid) {
        issues.push('Event image does not meet quality requirements')
      }
    }

    // Check required fields
    if (!event.title || event.title.trim().length < 5) {
      issues.push('Title is too short (minimum 5 characters)')
    }

    if (!event.description || event.description.trim().length < 100) {
      issues.push('Description is too short (minimum 100 characters)')
    }

    if (!event.date) {
      issues.push('Event date is required')
    } else {
      // Check if date is in the future
      const eventDate = new Date(event.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        issues.push('Event date must be in the future')
      }
    }

    if (!event.location || event.location.trim().length < 2) {
      issues.push('Location is required')
    }

    if (!event.category) {
      issues.push('Category is required')
    }

    // Check company verification
    if (event.company_id) {
      const company = await companyService.getCompanyById(event.company_id)
      if (!company) {
        issues.push('Associated company not found')
      } else if (company.verification_status !== 'verified') {
        issues.push('Company must be verified to host events')
      }
    }

    return {
      passed: issues.length === 0,
      issues,
    }
  }

  /**
   * Check text for profanity
   * @param text Text to check
   * @returns True if profanity detected, false otherwise
   */
  async checkProfanity(text: string): Promise<boolean> {
    // Basic profanity filter - in production, use a proper profanity detection service
    const profanityList = [
      'badword1',
      'badword2',
      'spam',
      'scam',
      'fraud',
      // Add more as needed
    ]

    const lowerText = text.toLowerCase()
    return profanityList.some((word) => lowerText.includes(word))
  }

  /**
   * Check for duplicate events
   * @param event Event to check
   * @returns True if duplicate found, false otherwise
   */
  async checkDuplicates(event: Event | Hackathon): Promise<boolean> {
    const supabase = await createClient()

    if (!event.company_id || !event.date || !event.title) {
      return false // Can't check without required fields
    }

    // Determine table name based on event type
    const tableName = 'id' in event && typeof event.id === 'number' ? 'events' : 'hackathons'

    // Check for events with same title, date, and company
    let query = supabase
      .from(tableName)
      .select('id')
      .eq('company_id', event.company_id)
      .eq('date', event.date)
      .ilike('title', event.title)

    // Exclude current event if it has an ID (for updates)
    if (event.id) {
      query = query.neq('id', event.id)
    }

    const { data: duplicates, error } = await query.limit(1)

    if (error) {
      console.error('Error checking duplicates:', error)
      return false // Don't block on error
    }

    return (duplicates?.length || 0) > 0
  }

  /**
   * Validate image quality
   * @param imageUrl Image URL to validate
   * @returns True if valid, false otherwise
   */
  async validateImages(imageUrl: string): Promise<boolean> {
    try {
      // Basic URL validation
      if (!imageUrl || !imageUrl.startsWith('http')) {
        return false
      }

      // In production, you would:
      // 1. Fetch the image
      // 2. Check dimensions (minimum resolution)
      // 3. Check file size
      // 4. Verify it's actually an image
      // For now, just validate URL format
      const url = new URL(imageUrl)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (error) {
      console.error('Error validating image:', error)
      return false
    }
  }

  /**
   * Approve an event
   * @param eventId Event ID
   * @param adminId ID of the admin approving the event
   * @param notes Optional notes about the approval
   * @returns Updated event
   */
  async approveEvent(
    eventId: number,
    adminId: string,
    notes?: string
  ): Promise<Event> {
    const supabase = await createClient()

    // Get the event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      throw new ModerationError(
        'Event not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if already approved
    if (event.approval_status === 'approved') {
      throw new ModerationError(
        'Event is already approved',
        ModerationErrorCodes.ALREADY_APPROVED,
        400
      )
    }

    // Check if event is pending
    if (event.approval_status !== 'pending' && event.approval_status !== 'changes_requested') {
      throw new ModerationError(
        'Event is not pending approval',
        ModerationErrorCodes.NOT_PENDING,
        400
      )
    }

    // Update event approval status
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error approving event:', updateError)
      throw new ModerationError(
        'Failed to approve event',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('approved', eventId, undefined, adminId, notes)

    return updatedEvent as Event
  }

  /**
   * Reject an event
   * @param eventId Event ID
   * @param adminId ID of the admin rejecting the event
   * @param reason Reason for rejection
   * @returns Updated event
   */
  async rejectEvent(
    eventId: number,
    adminId: string,
    reason: string
  ): Promise<Event> {
    const supabase = await createClient()

    // Get the event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      throw new ModerationError(
        'Event not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if already rejected
    if (event.approval_status === 'rejected') {
      throw new ModerationError(
        'Event is already rejected',
        ModerationErrorCodes.ALREADY_REJECTED,
        400
      )
    }

    // Update event approval status
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error rejecting event:', updateError)
      throw new ModerationError(
        'Failed to reject event',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('rejected', eventId, undefined, adminId, reason)

    return updatedEvent as Event
  }

  /**
   * Request changes to an event
   * @param eventId Event ID
   * @param adminId ID of the admin requesting changes
   * @param feedback Feedback for the changes
   * @returns Updated event
   */
  async requestChanges(
    eventId: number,
    adminId: string,
    feedback: string
  ): Promise<Event> {
    const supabase = await createClient()

    // Get the event
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      throw new ModerationError(
        'Event not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Update event approval status
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({
        approval_status: 'changes_requested',
        rejection_reason: feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error requesting changes:', updateError)
      throw new ModerationError(
        'Failed to request changes',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('edited', eventId, undefined, adminId, feedback)

    return updatedEvent as Event
  }

  /**
   * Approve a hackathon
   * @param hackathonId Hackathon ID
   * @param adminId ID of the admin approving the hackathon
   * @param notes Optional notes about the approval
   * @returns Updated hackathon
   */
  async approveHackathon(
    hackathonId: number,
    adminId: string,
    notes?: string
  ): Promise<Hackathon> {
    const supabase = await createClient()

    // Get the hackathon
    const { data: hackathon, error: fetchError } = await supabase
      .from('hackathons')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', hackathonId)
      .single()

    if (fetchError || !hackathon) {
      throw new ModerationError(
        'Hackathon not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if already approved
    if (hackathon.approval_status === 'approved') {
      throw new ModerationError(
        'Hackathon is already approved',
        ModerationErrorCodes.ALREADY_APPROVED,
        400
      )
    }

    // Check if hackathon is pending
    if (hackathon.approval_status !== 'pending' && hackathon.approval_status !== 'changes_requested') {
      throw new ModerationError(
        'Hackathon is not pending approval',
        ModerationErrorCodes.NOT_PENDING,
        400
      )
    }

    // Update hackathon approval status
    const { data: updatedHackathon, error: updateError } = await supabase
      .from('hackathons')
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', hackathonId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error approving hackathon:', updateError)
      throw new ModerationError(
        'Failed to approve hackathon',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('approved', undefined, hackathonId, adminId, notes)

    return updatedHackathon as Hackathon
  }

  /**
   * Reject a hackathon
   * @param hackathonId Hackathon ID
   * @param adminId ID of the admin rejecting the hackathon
   * @param reason Reason for rejection
   * @returns Updated hackathon
   */
  async rejectHackathon(
    hackathonId: number,
    adminId: string,
    reason: string
  ): Promise<Hackathon> {
    const supabase = await createClient()

    // Get the hackathon
    const { data: hackathon, error: fetchError } = await supabase
      .from('hackathons')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', hackathonId)
      .single()

    if (fetchError || !hackathon) {
      throw new ModerationError(
        'Hackathon not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Check if already rejected
    if (hackathon.approval_status === 'rejected') {
      throw new ModerationError(
        'Hackathon is already rejected',
        ModerationErrorCodes.ALREADY_REJECTED,
        400
      )
    }

    // Update hackathon approval status
    const { data: updatedHackathon, error: updateError } = await supabase
      .from('hackathons')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', hackathonId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error rejecting hackathon:', updateError)
      throw new ModerationError(
        'Failed to reject hackathon',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('rejected', undefined, hackathonId, adminId, reason)

    return updatedHackathon as Hackathon
  }

  /**
   * Request changes to a hackathon
   * @param hackathonId Hackathon ID
   * @param adminId ID of the admin requesting changes
   * @param feedback Feedback for the changes
   * @returns Updated hackathon
   */
  async requestHackathonChanges(
    hackathonId: number,
    adminId: string,
    feedback: string
  ): Promise<Hackathon> {
    const supabase = await createClient()

    // Get the hackathon
    const { data: hackathon, error: fetchError } = await supabase
      .from('hackathons')
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .eq('id', hackathonId)
      .single()

    if (fetchError || !hackathon) {
      throw new ModerationError(
        'Hackathon not found',
        ModerationErrorCodes.NOT_FOUND,
        404
      )
    }

    // Update hackathon approval status
    const { data: updatedHackathon, error: updateError } = await supabase
      .from('hackathons')
      .update({
        approval_status: 'changes_requested',
        rejection_reason: feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hackathonId)
      .select(
        `
        *,
        company:companies(*)
      `
      )
      .single()

    if (updateError) {
      console.error('Error requesting changes:', updateError)
      throw new ModerationError(
        'Failed to request changes',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    // Log the moderation action
    await this.logModerationAction('edited', undefined, hackathonId, adminId, feedback)

    return updatedHackathon as Hackathon
  }

  /**
   * Log a moderation action
   * @param action Action performed
   * @param eventId Event ID (if applicable)
   * @param hackathonId Hackathon ID (if applicable)
   * @param adminId ID of the admin performing the action
   * @param reason Optional reason or notes
   */
  async logModerationAction(
    action: 'submitted' | 'approved' | 'rejected' | 'edited' | 'deleted',
    eventId?: number,
    hackathonId?: number,
    adminId?: string,
    reason?: string
  ): Promise<void> {
    const supabase = await createClient()

    const logEntry = {
      event_id: eventId,
      hackathon_id: hackathonId,
      action,
      performed_by: adminId,
      reason,
      notes: reason,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('event_moderation_log')
      .insert([logEntry])

    if (error) {
      console.error('Error logging moderation action:', error)
      // Don't throw error - logging failure shouldn't block the operation
    }
  }

  /**
   * Get moderation history for an event
   * @param eventId Event ID
   * @returns Array of moderation log entries
   */
  async getModerationHistory(eventId: number): Promise<ModerationLog[]> {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('event_moderation_log')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching moderation history:', error)
      throw new ModerationError(
        'Failed to fetch moderation history',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    return (logs || []) as ModerationLog[]
  }

  /**
   * Get moderation history for a hackathon
   * @param hackathonId Hackathon ID
   * @returns Array of moderation log entries
   */
  async getHackathonModerationHistory(
    hackathonId: number
  ): Promise<ModerationLog[]> {
    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('event_moderation_log')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching moderation history:', error)
      throw new ModerationError(
        'Failed to fetch moderation history',
        ModerationErrorCodes.NOT_FOUND,
        500
      )
    }

    return (logs || []) as ModerationLog[]
  }

  /**
   * Check if a company should have auto-approval
   * @param companyId Company ID
   * @returns True if company should have auto-approval, false otherwise
   */
  async shouldAutoApprove(companyId: string): Promise<boolean> {
    const company = await companyService.getCompanyById(companyId)

    if (!company) {
      return false
    }

    // Check if company is verified
    if (company.verification_status !== 'verified') {
      return false
    }

    // Check subscription tier for auto-approval
    const limits = SUBSCRIPTION_LIMITS[company.subscription_tier]
    return limits.auto_approval === true
  }
}

export const moderationService = new ModerationService()
