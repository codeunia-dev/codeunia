export interface Event {
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
  marking_scheme?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface EventsFilters {
  search?: string
  category?: string
  status?: string
  featured?: boolean
  dateFilter?: 'upcoming' | 'past' | 'all'
  limit?: number
  offset?: number
}

export interface EventsResponse {
  events: Event[]
  total: number
  hasMore: boolean
}
