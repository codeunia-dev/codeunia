// Server-side service for hackathons
import { createClient } from '@/lib/supabase/server'

export interface Hackathon {
  id?: number
  slug: string
  title: string
  excerpt: string
  description: string
  organizer: string
  organizer_contact?: {
    email?: string
    phone?: string
    [key: string]: string | undefined
  }
  date: string
  time: string
  duration: string
  registration_deadline?: string
  category: string
  categories: string[]
  tags: string[]
  featured: boolean
  image?: string
  location: string
  locations: string[]
  capacity: number
  registered: number
  team_size?: {
    min?: number
    max?: number
    [key: string]: number | undefined
  }
  user_types: string[]
  price: string
  payment: string
  status: 'live' | 'draft' | 'published' | 'cancelled' | 'completed'
  event_type: string[]
  registration_required: boolean
  rules?: string[]
  schedule?: Record<string, unknown>
  prize?: string
  prize_details?: string
  faq?: Record<string, unknown>
  socials?: {
    email?: string
    website?: string
    twitter?: string
    discord?: string
    linkedin?: string
    whatsapp?: string
    instagram?: string
    [key: string]: string | undefined
  }
  sponsors?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface HackathonsFilters {
  search?: string
  category?: string
  status?: string
  featured?: boolean
  dateFilter?: 'upcoming' | 'all' | 'past'
  limit?: number
  offset?: number
}

export interface HackathonsResponse {
  hackathons: Hackathon[]
  total: number
  hasMore: boolean
}

class HackathonsService {
  async getHackathons(filters: HackathonsFilters = {}): Promise<HackathonsResponse> {
    const supabase = await createClient()
    
    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,tags.cs.{${filters.search}}`)
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

    // Date filtering
    if (filters.dateFilter === 'upcoming') {
      query = query.gte('date', new Date().toISOString().split('T')[0])
    } else if (filters.dateFilter === 'past') {
      query = query.lt('date', new Date().toISOString().split('T')[0])
    }

    // Order by date (upcoming first, then by date)
    query = query.order('date', { ascending: true })

    // Apply pagination
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    
    query = query.range(offset, offset + limit - 1)

    const { data: hackathons, error, count } = await query

    if (error) {
      console.error('Error fetching hackathons:', error)
      throw new Error('Failed to fetch hackathons')
    }

    const total = count || 0
    const hasMore = offset + limit < total

    return {
      hackathons: hackathons || [],
      total,
      hasMore
    }
  }

  async getHackathonBySlug(slug: string): Promise<Hackathon | null> {
    const supabase = await createClient()
    
    const { data: hackathon, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Hackathon not found
      }
      console.error('Error fetching hackathon:', error)
      throw new Error('Failed to fetch hackathon')
    }

    return hackathon
  }

  async getFeaturedHackathons(limit: number = 5) {
    const supabase = await createClient()
    
    const { data: hackathons, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('featured', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured hackathons:', error)
      throw new Error('Failed to fetch featured hackathons')
    }

    return hackathons || []
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

    return true
  }
}

export const hackathonsService = new HackathonsService()
