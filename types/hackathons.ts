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
  schedule?: Record<string, unknown> | { date: string; label: string }[]
  prize?: string
  prize_details?: string
  faq?: Record<string, unknown> | { question: string; answer: string }[]
  socials?: {
    linkedin?: string
    whatsapp?: string
    instagram?: string
    [key: string]: string | undefined
  }
  sponsors?: { logo: string; name: string; type: string }[]
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