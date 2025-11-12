'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Company, CompanyMember } from '@/types/company'

interface CompanyContextType {
  currentCompany: Company | null
  userCompanies: Array<{
    company: {
      id: string
      slug: string
      name: string
      logo_url?: string
      verification_status: string
    }
    role: string
    status: string
  }>
  userRole: string | null
  loading: boolean
  error: string | null
  switchCompany: (companySlug: string) => void
  refreshCompany: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

interface CompanyProviderProps {
  children: ReactNode
  initialCompanySlug?: string
}

export function CompanyProvider({ children, initialCompanySlug }: CompanyProviderProps) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [userCompanies, setUserCompanies] = useState<Array<{
    company: {
      id: string
      slug: string
      name: string
      logo_url?: string
      verification_status: string
    }
    role: string
    status: string
  }>>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's companies
  const fetchUserCompanies = async () => {
    try {
      const response = await fetch('/api/companies/me')
      if (!response.ok) {
        throw new Error('Failed to fetch user companies')
      }
      const data = await response.json()
      setUserCompanies(data.companies || [])
      return data.companies || []
    } catch (err) {
      console.error('Error fetching user companies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch companies')
      return []
    }
  }

  // Fetch company details
  const fetchCompany = async (slug: string, companiesList?: typeof userCompanies) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/companies/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch company')
      }
      const data = await response.json()
      setCurrentCompany(data.company)

      // Find user's role in this company
      // Use provided companiesList or fall back to state
      const companies = companiesList || userCompanies
      const membership = companies.find(
        (uc) => uc.company.slug === slug
      )
      console.log('CompanyContext - Finding role for slug:', slug)
      console.log('CompanyContext - Companies list:', companies)
      console.log('CompanyContext - Found membership:', membership)
      setUserRole(membership?.role || null)
    } catch (err) {
      console.error('Error fetching company:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch company')
      setCurrentCompany(null)
    } finally {
      setLoading(false)
    }
  }

  // Initialize: fetch user companies and set current company
  useEffect(() => {
    const initialize = async () => {
      const companies = await fetchUserCompanies()
      
      if (companies.length > 0) {
        // Use initialCompanySlug if provided, otherwise use first company
        const targetSlug = initialCompanySlug || companies[0].company.slug
        // Pass the companies list to fetchCompany so it can find the role
        await fetchCompany(targetSlug, companies)
      } else {
        setLoading(false)
      }
    }

    initialize()
  }, [initialCompanySlug])

  const switchCompany = (companySlug: string) => {
    fetchCompany(companySlug)
  }

  const refreshCompany = async () => {
    if (currentCompany) {
      await fetchCompany(currentCompany.slug)
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        userCompanies,
        userRole,
        loading,
        error,
        switchCompany,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompanyContext() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider')
  }
  return context
}
