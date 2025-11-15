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

  async updateHackathon(slug: string, hackathonData: Partial<Omit<Hackathon, 'id' | 'created_at' | 'updated_at'>>): Promise<Hackathon> {
    const supabase = await createClient()
    
    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .update(hackathonData)
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Error updating hackathon:', error)
      throw new Error('Failed to update hackathon')
    }

    // Clear cache after updating hackathon
    cache.clear()
    return hackathon
  }

  async deleteHackathon(slug: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('hackathons')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Error deleting hackathon:', error)
      throw new Error('Failed to delete hackathon')
    }

    // Clear cache after deleting hackathon
    cache.clear()
    return true
  }
}

export const hackathonsService = new HackathonsService()
