import { useState, useEffect, useCallback } from 'react'
import { Company } from '@/types/company'

export interface UseCompanyOptions {
  autoFetch?: boolean
}

/**
 * Hook for fetching and managing a single company by slug
 */
export function useCompany(slug: string | null, options: UseCompanyOptions = { autoFetch: true }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async () => {
    if (!slug) {
      setCompany(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Company not found')
        }
        throw new Error('Failed to fetch company')
      }

      const result = await response.json()
      setCompany(result.company)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company')
      console.error('Error fetching company:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  const updateCompany = async (updates: Partial<Company>): Promise<boolean> => {
    if (!slug) return false

    try {
      setError(null)

      const response = await fetch(`/api/companies/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update company')
      }

      const result = await response.json()
      setCompany(result.company)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company')
      console.error('Error updating company:', err)
      return false
    }
  }

  const refresh = useCallback(() => {
    fetchCompany()
  }, [fetchCompany])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    if (options.autoFetch) {
      fetchCompany()
    }
  }, [fetchCompany, options.autoFetch])

  return {
    company,
    loading,
    error,
    updateCompany,
    refresh,
    clearError,
  }
}

export interface CompaniesParams {
  search?: string
  industry?: string
  company_size?: string
  verification_status?: string
  limit?: number
  offset?: number
}

export interface CompaniesResponse {
  companies: Company[]
  total: number
  hasMore: boolean
}

/**
 * Hook for fetching a list of companies with filters
 */
export function useCompanies(params: CompaniesParams = {}) {
  const [data, setData] = useState<CompaniesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (params.search) queryParams.append('search', params.search)
      if (params.industry) queryParams.append('industry', params.industry)
      if (params.company_size) queryParams.append('company_size', params.company_size)
      if (params.verification_status) queryParams.append('verification_status', params.verification_status)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const response = await fetch(`/api/companies?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
      console.error('Error fetching companies:', err)
    } finally {
      setLoading(false)
    }
  }, [params.search, params.industry, params.company_size, params.verification_status, params.limit, params.offset])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return { 
    data, 
    loading, 
    error,
    refresh: fetchCompanies,
  }
}

/**
 * Hook for fetching the current user's company
 */
export function useMyCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyCompany = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/companies/me')
      
      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't have a company yet
          setCompany(null)
          return
        }
        throw new Error('Failed to fetch company')
      }

      const result = await response.json()
      setCompany(result.company)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company')
      console.error('Error fetching my company:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyCompany()
  }, [fetchMyCompany])

  return {
    company,
    loading,
    error,
    refresh: fetchMyCompany,
    hasCompany: company !== null,
  }
}
