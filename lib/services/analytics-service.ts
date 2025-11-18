import { createClient } from '@/lib/supabase/server'
import type { CompanyAnalytics } from '@/types/company'

export class AnalyticsService {
  /**
   * Track a view for an event
   */
  static async trackEventView(eventSlug: string): Promise<void> {
    const supabase = await createClient()

    // First, try to get the event (only approved events should be viewable publicly)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, company_id, views, approval_status')
      .eq('slug', eventSlug)
      .eq('approval_status', 'approved') // Only track views for approved events
      .single()

    if (eventError) {
      console.error('Error fetching event for view tracking:', eventError)
      throw new Error('Event not found')
    }

    if (!event) {
      throw new Error('Event not found')
    }

    // Increment view count using RPC function if available, otherwise direct update
    const { error: rpcError } = await supabase.rpc('increment_event_views', {
      event_id: event.id,
    })

    if (rpcError) {
      // Fallback to direct update if RPC doesn't exist
      const { error: updateError } = await supabase
        .from('events')
        .update({ views: (event.views || 0) + 1 })
        .eq('id', event.id)

      if (updateError) {
        console.error('Error updating event views:', updateError)
        // Don't throw - we don't want to fail the request if view tracking fails
      }
    }

    // Update company analytics if event has a company
    if (event.company_id) {
      try {
        await this.incrementCompanyAnalytics(
          event.company_id,
          'total_views',
          1
        )
      } catch (error) {
        console.error('Error updating company analytics:', error)
        // Don't throw - we don't want to fail the request
      }
    }
  }



  /**
   * Track a registration for an event
   */
  static async trackEventRegistration(eventId: number): Promise<void> {
    const supabase = await createClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, company_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found')
    }

    // Update company analytics if event has a company
    if (event.company_id) {
      await this.incrementCompanyAnalytics(
        event.company_id,
        'total_registrations',
        1
      )
    }
  }

  /**
   * Track a registration for a hackathon
   */
  static async trackHackathonRegistration(hackathonId: string): Promise<void> {
    const supabase = await createClient()

    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, company_id')
      .eq('id', hackathonId)
      .single()

    if (hackathonError || !hackathon) {
      throw new Error('Hackathon not found')
    }

    // Update company analytics if hackathon has a company
    if (hackathon.company_id) {
      await this.incrementCompanyAnalytics(
        hackathon.company_id,
        'total_registrations',
        1
      )
    }
  }

  /**
   * Track a view for a hackathon
   */
  static async trackHackathonView(hackathonId: string): Promise<void> {
    const supabase = await createClient()

    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('id, company_id, views')
      .eq('id', hackathonId)
      .single()

    if (hackathonError || !hackathon) {
      throw new Error('Hackathon not found')
    }

    // Increment view count
    await supabase
      .from('hackathons')
      .update({ views: (hackathon.views || 0) + 1 })
      .eq('id', hackathon.id)

    // Update company analytics if hackathon has a company
    if (hackathon.company_id) {
      await this.incrementCompanyAnalytics(
        hackathon.company_id,
        'total_views',
        1
      )
    }
  }



  /**
   * Increment a specific field in company analytics
   */
  private static async incrementCompanyAnalytics(
    companyId: string,
    field: string,
    increment: number
  ): Promise<void> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Try RPC first, fallback to manual upsert if it fails
    const { error: rpcError } = await supabase.rpc('increment_company_analytics', {
      p_company_id: companyId,
      p_date: today,
      p_field: field,
      p_increment: increment,
    })

    if (rpcError) {
      // Fallback: Get existing record or create new one
      const { data: existing, error: fetchError } = await supabase
        .from('company_analytics')
        .select('*')
        .eq('company_id', companyId)
        .eq('date', today)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching company analytics:', fetchError)
        return
      }

      if (existing) {
        // Update existing record
        const currentValue = (existing[field] as number) || 0
        const { error: updateError } = await supabase
          .from('company_analytics')
          .update({ [field]: currentValue + increment })
          .eq('company_id', companyId)
          .eq('date', today)

        if (updateError) {
          console.error('Error updating company analytics:', updateError)
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('company_analytics')
          .insert({
            company_id: companyId,
            date: today,
            events_created: 0,
            events_published: 0,
            hackathons_created: 0,
            hackathons_published: 0,
            total_views: 0,
            total_clicks: 0,
            total_registrations: 0,
            total_participants: 0,
            revenue_generated: 0,
            [field]: increment,
          })

        if (insertError) {
          console.error('Error inserting company analytics:', insertError)
        }
      }
    }
  }

  /**
   * Get analytics for a company within a date range
   */
  static async getCompanyAnalytics(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<CompanyAnalytics[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('company_analytics')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get aggregated analytics for a company
   */
  static async getAggregatedAnalytics(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total_views: number
    total_clicks: number
    total_registrations: number
    total_participants: number
    total_events_created: number
    total_events_published: number
    total_hackathons_created: number
    total_hackathons_published: number
    total_revenue: number
  }> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc(
      'aggregate_company_analytics',
      {
        p_company_id: companyId,
        p_start_date: startDate,
        p_end_date: endDate,
      }
    )

    if (error) {
      throw new Error(`Failed to aggregate analytics: ${error.message}`)
    }

    return data[0] || {
      total_views: 0,
      total_clicks: 0,
      total_registrations: 0,
      total_participants: 0,
      total_events_created: 0,
      total_events_published: 0,
      total_hackathons_created: 0,
      total_hackathons_published: 0,
      total_revenue: 0,
    }
  }

  /**
   * Export analytics data as CSV
   */
  static async exportAnalyticsCSV(
    companyId: string,
    companyName: string,
    startDate: string,
    endDate: string
  ): Promise<string> {
    const analytics = await this.getCompanyAnalytics(
      companyId,
      startDate,
      endDate
    )

    const headers = [
      'Date',
      'Events Created',
      'Events Published',
      'Hackathons Created',
      'Hackathons Published',
      'Total Views',
      'Total Clicks',
      'Total Registrations',
      'Total Participants',
      'Revenue Generated',
    ]

    const rows = analytics.map((row) => [
      row.date,
      row.events_created,
      row.events_published,
      row.hackathons_created,
      row.hackathons_published,
      row.total_views,
      row.total_clicks,
      row.total_registrations,
      row.total_participants,
      row.revenue_generated,
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  /**
   * Update company statistics (total events, hackathons, participants)
   */
  static async updateCompanyStatistics(companyId: string): Promise<void> {
    const supabase = await createClient()

    // Count total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Count total hackathons
    const { count: totalHackathons } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Update company record
    await supabase
      .from('companies')
      .update({
        total_events: totalEvents || 0,
        total_hackathons: totalHackathons || 0,
      })
      .eq('id', companyId)
  }
}
