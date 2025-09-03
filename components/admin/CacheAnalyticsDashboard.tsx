"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Download, RefreshCw, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'
import { useCacheAnalytics } from '@/lib/cache-analytics-client'

export function CacheAnalyticsDashboard() {
  const [timePeriod, setTimePeriod] = React.useState('24')
  const { data: analytics, loading, refresh } = useCacheAnalytics(30000) // Refresh every 30 seconds
  
  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/cache-analytics?period=${timePeriod}&format=csv`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cache-analytics-${timePeriod}h.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export CSV:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading cache analytics...</span>
      </div>
    )
  }
  
  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No cache analytics data available</p>
        <Button onClick={refresh} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }
  
  const { overview, byStrategy, hourlyTrend, topRoutes, recentEvents } = analytics
  
  // Prepare chart data
  const hourlyChartData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    hits: hourlyTrend[hour]?.hits || 0,
    misses: hourlyTrend[hour]?.misses || 0,
    hitRate: hourlyTrend[hour]?.total > 0 
      ? ((hourlyTrend[hour]?.hits || 0) / hourlyTrend[hour]?.total * 100).toFixed(1)
      : 0
  }))
  
  const strategyChartData = Object.entries(byStrategy).map(([strategy, stats]) => ({
    name: strategy,
    hitRate: stats.total > 0 ? (stats.hits / stats.total * 100).toFixed(1) : 0,
    hits: stats.hits,
    misses: stats.misses,
    total: stats.total
  }))
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cache Analytics</h2>
          <p className="text-muted-foreground">
            Real-time cache performance monitoring and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 hour</SelectItem>
              <SelectItem value="6">Last 6 hours</SelectItem>
              <SelectItem value="24">Last 24 hours</SelectItem>
              <SelectItem value="168">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.cacheHits.toLocaleString()} hits of {overview.totalRequests.toLocaleString()} requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.averageResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all cache strategies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Misses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.cacheMisses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((overview.cacheMisses / overview.totalRequests) * 100).toFixed(1)}% miss rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Invalidations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.invalidations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatic cache clears
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Hourly Cache Performance</CardTitle>
            <CardDescription>
              Cache hits vs misses over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hits" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Cache Hits"
                />
                <Line 
                  type="monotone" 
                  dataKey="misses" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Cache Misses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Strategy Performance */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance by Strategy</CardTitle>
            <CardDescription>
              Cache hit rates for different caching strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strategyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hitRate" fill="#0088FE" name="Hit Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Routes by Traffic</CardTitle>
          <CardDescription>
            Most accessed routes and their cache performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRoutes.slice(0, 10).map((route, index) => {
              const hitRate = route.total > 0 ? (route.hits / route.total * 100) : 0
              return (
                <div key={route.route} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {route.route}
                    </code>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {route.total.toLocaleString()} requests
                    </span>
                    <Badge 
                      variant={hitRate > 80 ? 'default' : hitRate > 50 ? 'secondary' : 'destructive'}
                    >
                      {hitRate.toFixed(1)}% hit rate
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cache Events</CardTitle>
          <CardDescription>
            Live stream of cache hits, misses, and invalidations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentEvents.slice(-20).reverse().map((event, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      event.type === 'hit' ? 'default' : 
                      event.type === 'miss' ? 'secondary' : 
                      event.type === 'invalidation' ? 'outline' : 'destructive'
                    }
                  >
                    {event.type}
                  </Badge>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {event.route}
                  </code>
                  <span className="text-muted-foreground">
                    {event.strategy}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {event.responseTime && (
                    <span>{event.responseTime}ms</span>
                  )}
                  <span>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Integrations</CardTitle>
          <CardDescription>
            Status of external monitoring service integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <span>Datadog</span>
              <Badge variant={process.env.DATADOG_API_KEY ? 'default' : 'secondary'}>
                {process.env.DATADOG_API_KEY ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Prometheus</span>
              <Badge variant={process.env.PROMETHEUS_PUSHGATEWAY_URL ? 'default' : 'secondary'}>
                {process.env.PROMETHEUS_PUSHGATEWAY_URL ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Vercel Analytics</span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
