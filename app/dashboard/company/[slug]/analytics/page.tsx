'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { CompanyAnalytics } from '@/types/company'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { CalendarIcon, Download, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type DateRange = {
  from: Date
  to: Date
}

type PresetRange = 'last7days' | 'last30days' | 'last90days' | 'thisMonth' | 'lastMonth' | 'custom'

export default function AnalyticsPage() {
  const params = useParams()
  const companySlug = params?.slug as string
  const { currentCompany, loading: companyLoading } = useCompanyContext()

  const [analytics, setAnalytics] = useState<CompanyAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedPreset, setSelectedPreset] = useState<PresetRange>('last30days')
  const [isExporting, setIsExporting] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const startDate = format(dateRange.from, 'yyyy-MM-dd')
      const endDate = format(dateRange.to, 'yyyy-MM-dd')

      const response = await fetch(
        `/api/companies/${companySlug}/analytics?start_date=${startDate}&end_date=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data.analytics || [])
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [companySlug, dateRange])

  useEffect(() => {
    if (currentCompany) {
      fetchAnalytics()
    }
  }, [currentCompany, fetchAnalytics])

  const handlePresetChange = (preset: PresetRange) => {
    setSelectedPreset(preset)
    const today = new Date()

    switch (preset) {
      case 'last7days':
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case 'last30days':
        setDateRange({ from: subDays(today, 30), to: today })
        break
      case 'last90days':
        setDateRange({ from: subDays(today, 90), to: today })
        break
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
        break
      case 'custom':
        // Keep current date range
        break
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const startDate = format(dateRange.from, 'yyyy-MM-dd')
      const endDate = format(dateRange.to, 'yyyy-MM-dd')

      // Use server-side export API for better performance
      const response = await fetch(
        `/api/companies/${companySlug}/analytics/export?start_date=${startDate}&end_date=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Failed to export analytics')
      }

      // Get the CSV content from the response
      const csvContent = await response.text()

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `${companySlug}-analytics-${startDate}-to-${endDate}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting analytics:', err)
    } finally {
      setIsExporting(false)
    }
  }

  if (companyLoading || !currentCompany) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your event performance and engagement metrics
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Date Range</CardTitle>
          <CardDescription>Select a time period to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPreset === 'last7days' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange('last7days')}
              >
                Last 7 Days
              </Button>
              <Button
                variant={selectedPreset === 'last30days' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange('last30days')}
              >
                Last 30 Days
              </Button>
              <Button
                variant={selectedPreset === 'last90days' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange('last90days')}
              >
                Last 90 Days
              </Button>
              <Button
                variant={selectedPreset === 'thisMonth' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange('thisMonth')}
              >
                This Month
              </Button>
              <Button
                variant={selectedPreset === 'lastMonth' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange('lastMonth')}
              >
                Last Month
              </Button>
            </div>

            {/* Custom Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedPreset === 'custom' ? 'secondary' : 'outline'}
                  size="sm"
                  className={cn('justify-start text-left font-normal')}
                  onClick={() => setSelectedPreset('custom')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM dd, yyyy')} -{' '}
                      {format(dateRange.to, 'MMM dd, yyyy')}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white mb-2">From</p>
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, from: date }))
                          setSelectedPreset('custom')
                        }
                      }}
                      disabled={(date) => date > new Date() || date > dateRange.to}
                      className="rounded-md border border-zinc-700"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-2">To</p>
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange((prev) => ({ ...prev, to: date }))
                          setSelectedPreset('custom')
                        }
                      }}
                      disabled={(date) => date > new Date() || date < dateRange.from}
                      className="rounded-md border border-zinc-700"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-red-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchAnalytics} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && <AnalyticsSkeleton />}

      {/* Analytics Charts */}
      {!loading && !error && (
        <AnalyticsCharts
          analytics={analytics}
          dateRange={{ start: dateRange.from, end: dateRange.to }}
          onExport={handleExport}
        />
      )}

      {/* Export Button (Alternative placement) */}
      {!loading && !error && analytics.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && analytics.length === 0 && (
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground mb-4">
                No analytics data available for the selected date range.
              </p>
              <p className="text-sm text-zinc-500">
                Analytics data is collected when your events receive views, clicks, and
                registrations.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Analytics Skeleton Loader
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-10 w-64 bg-zinc-700" />
        <Skeleton className="h-4 w-96 mt-2 bg-zinc-700" />
      </div>

      {/* Date Range Skeleton */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-zinc-700" />
          <Skeleton className="h-4 w-64 mt-2 bg-zinc-700" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-32 bg-zinc-700" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-zinc-700" />
              <Skeleton className="h-4 w-4 rounded bg-zinc-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-zinc-700" />
              <Skeleton className="h-3 w-32 mt-2 bg-zinc-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
            <CardHeader>
              <Skeleton className="h-5 w-40 bg-zinc-700" />
              <Skeleton className="h-4 w-32 mt-2 bg-zinc-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24 bg-zinc-700" />
              <Skeleton className="h-3 w-48 mt-2 bg-zinc-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-zinc-700" />
          <Skeleton className="h-4 w-64 mt-2 bg-zinc-700" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-zinc-700" />
        </CardContent>
      </Card>
    </div>
  )
}
