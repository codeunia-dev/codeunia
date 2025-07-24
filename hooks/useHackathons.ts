import { useState, useEffect } from 'react'

export interface HackathonsParams {
  search?: string
  category?: string
  dateFilter?: string
  limit?: number
  offset?: number
}

export interface HackathonsResponse {
  hackathons: any[]
  total: number
  hasMore: boolean
}

export function useHackathons(params: HackathonsParams = {}) {
  const [data, setData] = useState<HackathonsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        
        if (params.search) queryParams.append('search', params.search)
        if (params.category && params.category !== 'All') queryParams.append('category', params.category)
        if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter)
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.offset) queryParams.append('offset', params.offset.toString())

        const response = await fetch(`/api/hackathons?${queryParams.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch hackathons')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathons()
  }, [params.search, params.category, params.dateFilter, params.limit, params.offset])

  return { data, loading, error }
}

export function useFeaturedHackathons(limit: number = 5) {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedHackathons = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/hackathons/featured?limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured hackathons')
        }

        const result = await response.json()
        setHackathons(result.hackathons || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedHackathons()
  }, [limit])

  return { hackathons, loading, error }
}

export function useHackathon(slug: string) {
  const [hackathon, setHackathon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHackathon = async () => {
      if (!slug) {
        setError('No hackathon slug provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/hackathons/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Hackathon not found')
          }
          throw new Error('Failed to fetch hackathon')
        }

        const result = await response.json()
        setHackathon(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathon()
  }, [slug])

  return { hackathon, loading, error }
}
