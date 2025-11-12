import { useState, useEffect, useCallback } from 'react'
import { CompanyAnalytics } from '@/types/company'

export interface AnalyticsDateRange {
  start_date: string // ISO date string
  end_date: string   // ISO date string
}

export interface AnalyticsSummary {
  total_events: number
  total_hackathons: number
  total_views: number
  total_clicks: number
  total_registrations: number
  total_participants: number
  revenue_generated: number
}

/**
 * Hook for fetching company analytics data
 */
export function useCompanyAnalytics(companySlug: string | null, dateRange?: AnalyticsDateRange) {
  const [analytics, setAnalytics] = useState<CompanyAnalytics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!companySlug) {
      setAnalytics([])
      setSummary(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      if (dateRange?.start_date) {
        queryParams.append('start_date', dateRange.start_date)
      }
      if (dateRange?.end_date) {
        queryParams.append('end_date', dateRange.end_date)
      }

      const response = await fetch(`/api/companies/${companySlug}/analytics?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setAnalytics(result.analytics || [])
      
      // Calculate summary from analytics data
      if (result.analytics && result.analytics.length > 0) {
        const totals = result.analytics.reduce((acc: AnalyticsSummary, item: CompanyAnalytics) => ({
          total_events: acc.total_events + item.events_created,
          total_hackathons: acc.total_hackathons + item.hackathons_created,
          total_views: acc.total_views + item.total_views,
          total_clicks: acc.total_clicks + item.total_clicks,
          total_registrations: acc.total_registrations + item.total_registrations,
          total_participants: acc.total_participants + item.total_participants,
          revenue_generated: acc.revenue_generated + item.revenue_generated,
        }), {
          total_events: 0,
          total_hackathons: 0,
          total_views: 0,
          total_clicks: 0,
          total_registrations: 0,
          total_participants: 0,
          revenue_generated: 0,
        })
        
        setSummary(totals)
      } else {
        setSummary(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [companySlug, dateRange?.start_date, dateRange?.end_date])

  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    summary,
    loading,
    error,
    refresh,
    clearError,
  }
}

/**
 * Hook for exporting analytics data
 */
export function useAnalyticsExport(companySlug: string | null) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportAnalytics = async (dateRange?: AnalyticsDateRange, format: 'csv' | 'json' = 'csv'): Promise<boolean> => {
    if (!companySlug) return false

    try {
      setExporting(true)
      setError(null)

      const queryParams = new URLSearchParams()
      queryParams.append('format', format)
      
      if (dateRange?.start_date) {
        queryParams.append('start_date', dateRange.start_date)
      }
      if (dateRange?.end_date) {
        queryParams.append('end_date', dateRange.end_date)
      }

      const response = await fetch(`/api/companies/${companySlug}/analytics/export?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to export analytics')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${companySlug}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export analytics')
      console.error('Error exporting analytics:', err)
      return false
    } finally {
      setExporting(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    exporting,
    error,
    exportAnalytics,
    clearError,
  }
}

/**
 * Hook for real-time analytics updates
 */
export function useRealtimeAnalytics(companySlug: string | null) {
  const [realtimeStats, setRealtimeStats] = useState({
    views_today: 0,
    clicks_today: 0,
    registrations_today: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companySlug) {
      setLoading(false)
      return
    }

    const fetchRealtimeStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`/api/companies/${companySlug}/analytics?start_date=${today}&end_date=${today}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch realtime stats')
        }

        const result = await response.json()
        
        if (result.analytics && result.analytics.length > 0) {
          const todayStats = result.analytics[0]
          setRealtimeStats({
            views_today: todayStats.total_views,
            clicks_today: todayStats.total_clicks,
            registrations_today: todayStats.total_registrations,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch realtime stats')
        console.error('Error fetching realtime stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRealtimeStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealtimeStats, 30000)

    return () => clearInterval(interval)
  }, [companySlug])

  return {
    realtimeStats,
    loading,
    error,
  }
}
