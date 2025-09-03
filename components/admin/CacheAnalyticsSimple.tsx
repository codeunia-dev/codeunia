"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, RefreshCw, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface CacheAnalytics {
  overview: {
    totalRequests: number
    cacheHits: number
    cacheMisses: number
    hitRate: number
    averageResponseTime: number
    invalidations: number
    errors: number
    lastUpdated: string
  }
  byStrategy: Record<string, { hits: number; misses: number; total: number }>
  topRoutes: Array<{ route: string; hits: number; misses: number; total: number }>
  recentEvents: Array<{ type: string; strategy: string; route: string; timestamp: number }>
}

export function CacheAnalyticsDashboard() {
  const [timePeriod, setTimePeriod] = useState('24')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<CacheAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const periodHours = parseInt(timePeriod)
      const periodMs = periodHours * 60 * 60 * 1000
      
      const response = await fetch(`/api/admin/cache-analytics?period=${periodMs}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching cache analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const handleRefresh = () => {
    fetchAnalytics()
  }

  const handleGenerateTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/cache-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: 50 })
      })
      
      if (response.ok) {
        // Refresh analytics after generating test data
        await fetchAnalytics()
      } else {
        console.error('Failed to generate test data')
      }
    } catch (error) {
      console.error('Error generating test data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const periodHours = parseInt(timePeriod)
      const periodMs = periodHours * 60 * 60 * 1000
      
      const response = await fetch(`/api/admin/cache-analytics?period=${periodMs}&format=csv`)
      
      if (!response.ok) {
        throw new Error('Failed to export CSV')
      }
      
      const csvContent = await response.text()
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `cache-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    }
  }

  if (loading && !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading Cache Analytics...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Cache Analytics
          </CardTitle>
          <CardDescription>
            {error ? `Error: ${error}` : 'No cache data available yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {error 
                ? 'Failed to load cache analytics. Please try refreshing.' 
                : 'No cache events have been recorded yet. Generate some test data or wait for real usage to populate analytics.'
              }
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button onClick={handleGenerateTestData} variant="outline" size="sm" disabled={loading}>
                  <Activity className="w-4 h-4 mr-2" />
                  Generate Test Data
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-white">Cache Performance</h3>
          <p className="text-zinc-400">
            Real-time cache analytics and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 hour</SelectItem>
              <SelectItem value="6">Last 6 hours</SelectItem>
              <SelectItem value="24">Last 24 hours</SelectItem>
              <SelectItem value="168">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button onClick={handleGenerateTestData} variant="outline" size="sm" disabled={loading}>
                <Activity className="w-4 h-4 mr-2" />
                Generate Test Data
              </Button>
            )}          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={handleGenerateTestData} 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="bg-blue-50 hover:bg-blue-100"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Test Data
            </Button>
          )}
          {process.env.NODE_ENV === 'development' && (
            <Button onClick={handleGenerateTestData} variant="outline" size="sm" disabled={loading}>
              <Zap className="w-4 h-4 mr-2" />
              Generate Test Data
            </Button>
          )}
          <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.overview.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-zinc-400">
              {analytics.overview.cacheHits.toLocaleString()} hits of {analytics.overview.totalRequests.toLocaleString()} requests
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.overview.averageResponseTime}ms
            </div>
            <p className="text-xs text-zinc-400">
              Across all cache strategies
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Cache Misses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.overview.cacheMisses.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400">
              {((analytics.overview.cacheMisses / analytics.overview.totalRequests) * 100).toFixed(1)}% miss rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Invalidations</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics.overview.invalidations}
            </div>
            <p className="text-xs text-zinc-400">
              Automatic cache clears
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Strategy Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Performance by Strategy</CardTitle>
            <CardDescription className="text-zinc-400">
              Cache hit rates for different caching strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.byStrategy).map(([strategy, stats]) => {
                const hitRate = stats.total > 0 ? (stats.hits / stats.total * 100) : 0
                return (
                  <div key={strategy} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                        {strategy}
                      </Badge>
                      <span className="text-sm text-zinc-400">
                        {stats.total.toLocaleString()} requests
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-zinc-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${hitRate > 80 ? 'bg-green-500' : hitRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${hitRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-white font-medium w-12 text-right">
                        {hitRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Routes */}
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top Routes by Traffic</CardTitle>
            <CardDescription className="text-zinc-400">
              Most accessed routes and their cache performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topRoutes.map((route, index) => {
                const hitRate = route.total > 0 ? (route.hits / route.total * 100) : 0
                return (
                  <div key={route.route} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300 shrink-0">
                        {index + 1}
                      </Badge>
                      <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300 truncate">
                        {route.route}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs text-zinc-400">
                        {route.total.toLocaleString()}
                      </span>
                      <Badge 
                        className={
                          hitRate > 80 ? 'bg-green-600' : 
                          hitRate > 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }
                      >
                        {hitRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Events */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Cache Events</CardTitle>
          <CardDescription className="text-zinc-400">
            Live stream of cache hits, misses, and invalidations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analytics.recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800 last:border-0">
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={
                      event.type === 'hit' ? 'bg-green-600' : 
                      event.type === 'miss' ? 'bg-yellow-600' : 
                      event.type === 'invalidation' ? 'bg-blue-600' : 'bg-red-600'
                    }
                  >
                    {event.type}
                  </Badge>
                  <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs text-zinc-300">
                    {event.route}
                  </code>
                  <span className="text-zinc-400 text-xs">
                    {event.strategy}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Integration Status */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Monitoring Integrations</CardTitle>
          <CardDescription className="text-zinc-400">
            Status of external monitoring service integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Datadog</span>
              <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                Not Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Prometheus</span>
              <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                Not Configured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">Vercel Analytics</span>
              <Badge className="bg-green-600">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
