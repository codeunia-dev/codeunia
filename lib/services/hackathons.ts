// Server-side service for hackathons
import { createClient } from '@/lib/supabase/server'
import { Hackathon, HackathonsFilters, HackathonsResponse } from '@/types/hackathons'

// Re-export types for convenience
export type { Hackathon, HackathonsFilters, HackathonsResponse }

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

class HackathonsService {
  async getHackathons(filters: HackathonsFilters = {}): Promise<HackathonsResponse> {
    const cacheKey = `hackathons:${JSON.stringify(filters)}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as HackathonsResponse
    }

    const supabase = await createClient()
    
    let query = supabase
      .from('hackathons')
      .select(`
        *,
        company:companies(*)
      `, { count: 'exact' })

    // Only show approved hackathons by default (unless approval_status filter is explicitly provided)
    if (filters.approval_status) {
      query = query.eq('approval_status', filters.approval_status)
    } else {
      query = query.eq('approval_status', 'approved')
    }

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

    if (filters.dateFilter === 'upcoming') {
      query = query.gte('date', new Date().toISOString().split('T')[0])
    } else if (filters.dateFilter === 'past') {
      query = query.lt('date', new Date().toISOString().split('T')[0])
    }

    // Apply pagination
    const limit = filters.limit || 10
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    // Order by date
    query = query.order('date', { ascending: true })

    const { data: hackathons, error, count } = await query

    if (error) {
      console.error('Error fetching hackathons:', error)
      throw new Error('Failed to fetch hackathons')
    }

    const total = count || 0
    const hasMore = offset + limit < total

    const result = {
      hackathons: hackathons || [],
      total,
      hasMore
    }

    setCachedData(cacheKey, result)
    return result
  }

  async getHackathonBySlug(slug: string): Promise<Hackathon | null> {
    const cacheKey = `hackathon:${slug}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Hackathon
    }

    const supabase = await createClient()
    
    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Hackathon not found
      }
      console.error('Error fetching hackathon:', error)
      throw new Error('Failed to fetch hackathon')
    }

    setCachedData(cacheKey, hackathon)
    return hackathon
  }

  async getFeaturedHackathons(limit: number = 5) {
    const cacheKey = `featured_hackathons:${limit}`
    const cached = getCachedData(cacheKey)
    if (cached) {
      return cached as Hackathon[]
    }

    try {
      const supabase = await createClient()
      
      const { data: hackathons, error } = await supabase
        .from('hackathons')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('featured', true)
        .eq('approval_status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching featured hackathons:', error)
        // Return empty array instead of throwing to prevent 500 errors
        return []
      }

      const result = hackathons || []
      setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error in getFeaturedHackathons:', error)
      // Return empty array as fallback
      return []
    }
  }

  async createHackathon(hackathonData: Omit<Hackathon, 'id' | 'created_at' | 'updated_at'>): Promise<Hackathon> {
    const supabase = await createClient()
    
    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .insert([hackathonData])
      .select()
      .single()

    if (error) {
      console.error('Error creating hackathon:', error)
      throw new Error('Failed to create hackathon')
    }

    // Clear cache after creating new hackathon
    cache.clear()
    return hackathon
  }

  async updateHackathon(
    slug: string, 
    hackathonData: Partial<Omit<Hackathon, 'id' | 'created_at' | 'updated_at'>>,
    userId?: string
  ): Promise<Hackathon> {
    const supabase = await createClient()
    
    // Get existing hackathon first
    const existingHackathon = await this.getHackathonBySlug(slug)
    if (!existingHackathon) {
      throw new Error('Hackathon not found')
    }

    // Check if this is an approved hackathon being edited
    const needsReapproval = existingHackathon.approval_status === 'approved'
    
    // Prepare update payload
    const updatePayload: Record<string, unknown> = {
      ...hackathonData,
      updated_at: new Date().toISOString(),
    }

    // If hackathon was approved, reset to pending for re-approval
    if (needsReapproval) {
      updatePayload.approval_status = 'pending'
      updatePayload.approved_by = null
      updatePayload.approved_at = null
      console.log(`🔄 Hackathon ${existingHackathon.id} was approved, resetting to pending for re-approval`)
    }

    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .update(updatePayload)
      .eq('slug', slug)
      .select(`
        *,
        company:companies(*)
      `)
      .single()

    if (error) {
      console.error('Error updating hackathon:', error)
      throw new Error('Failed to update hackathon')
    }

    // If hackathon needed re-approval, create notifications and log
    if (needsReapproval && userId) {
      const hackathonId = existingHackathon.id
      if (!hackathonId) {
        console.error('Hackathon ID is missing, cannot create notifications')
        cache.clear()
        return hackathon
      }
      // Import services dynamically to avoid circular dependencies
      const { NotificationService } = await import('./notification-service')
      const { moderationService } = await import('./moderation-service')
      
      // Log the edit action
      await moderationService.logModerationAction('edited', undefined, hackathonId, userId, 'Hackathon edited after approval - requires re-approval')
      
      // Notify admins about the updated hackathon
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
      
      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map(admin => ({
          user_id: admin.id,
          company_id: existingHackathon.company_id,
          type: 'hackathon_updated' as const,
          title: 'Hackathon Updated - Requires Re-approval',
          message: `"${existingHackathon.title}" has been edited and requires re-approval`,
          action_url: `/admin/moderation/hackathons/${hackathonId}`,
          action_label: 'Review Hackathon',
          hackathon_id: hackathonId.toString(),
          metadata: {
            hackathon_title: existingHackathon.title,
            hackathon_slug: existingHackathon.slug
          }
        }))
        
        await supabase.from('notifications').insert(notifications)
        console.log(`📧 Notified ${adminUsers.length} admin(s) about updated hackathon`)
      }
      
      // Notify company members about the status change
      if (existingHackathon.company_id) {
        await NotificationService.notifyCompanyMembers(existingHackathon.company_id, {
          type: 'hackathon_status_changed',
          title: 'Hackathon Requires Re-approval',
          message: `Your hackathon "${existingHackathon.title}" has been edited and requires re-approval`,
          company_id: existingHackathon.company_id,
          action_url: `/dashboard/company/hackathons/${existingHackathon.slug}`,
          action_label: 'View Hackathon',
          hackathon_id: hackathonId.toString(),
          metadata: {
            hackathon_title: existingHackathon.title,
            old_status: 'approved',
            new_status: 'pending'
          }
        })
      }
    }

    // Clear cache after updating hackathon
    cache.clear()
    return hackathon
  }

  async deleteHackathon(slug: string) {
    const supabase = await createClient()
    
    console.log('🗑️ Deleting hackathon with slug:', slug)
    
    const { data, error } = await supabase
      .from('hackathons')
      .delete()
      .eq('slug', slug)
      .select()

    if (error) {
      console.error('❌ Error deleting hackathon from database:', error)
      throw new Error(`Failed to delete hackathon: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No hackathon was deleted. Slug might not exist or RLS policy blocked deletion.')
      throw new Error('Hackathon not found or you do not have permission to delete it')
    }

    console.log('✅ Hackathon deleted from database:', data)

    // Clear cache after deleting hackathon
    cache.clear()
    return true
  }
}

export const hackathonsService = new HackathonsService()
