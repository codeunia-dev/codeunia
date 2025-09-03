'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Server, 
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download
} from 'lucide-react'

interface PerformanceMetric {
  timestamp: number
  route: string
  method: string
  responseTime: number
  statusCode: number
  userAgent?: string
  userId?: string
  memoryUsage?: number
  cpuUsage?: number
  dbQueryTime?: number
  cacheHitRate?: number
}

interface PerformanceStats {
  averageResponseTime: number
  totalRequests: number
  errorRate: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
  dbPerformance: {
    averageQueryTime: number
    slowQueries: number
    connectionPoolSize: number
  }
  cachePerformance: {
    hitRate: number
    missRate: number
    averageRetrievalTime: number
  }
  lastUpdated: Date
}

interface RoutePerformance {
  route: string
  averageResponseTime: number
  requestCount: number
  errorCount: number
  slowestRequest: number
  fastestRequest: number
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  score: number
  issues: Array<{
    type: 'performance' | 'memory' | 'database' | 'cache'
    severity: 'low' | 'medium' | 'high'
    message: string
    timestamp: number
  }>
}

export default function PerformanceMonitoring() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [routes, setRoutes] = useState<RoutePerformance[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [recentMetrics, setRecentMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const periodMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[period]

      const response = await fetch(`/api/admin/performance?period=${periodMs}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }

      const data = await response.json()
      setStats(data.stats)
      setRoutes(data.routes)
      setSystemHealth(data.systemHealth)
      setRecentMetrics(data.recentMetrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }, [period])

  const generateTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/performance-test-data', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate test data')
      }

      // Refresh data after generating test data
      await fetchPerformanceData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test data')
      setLoading(false)
    }
  }

  const exportData = async (format: 'json' | 'csv') => {
    try {
      const periodMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[period]

      const response = await fetch(`/api/admin/performance/export?format=${format}&period=${periodMs}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const data = await response.text()
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-metrics-${period}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }

  useEffect(() => {
    fetchPerformanceData()
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000)
    return () => clearInterval(interval)
  }, [fetchPerformanceData])

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'critical': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading performance data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
        <Button onClick={fetchPerformanceData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Performance Monitoring</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Application performance metrics and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as '1h' | '24h' | '7d' | '30d')}
            className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateTestData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Generate Test Data
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className={getHealthStatusColor(systemHealth.status)}>
                  {getHealthStatusIcon(systemHealth.status)}
                </div>
                System Health
              </CardTitle>
              <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.status.toUpperCase()} - {systemHealth.score}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {systemHealth.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Current Issues:</h4>
                {systemHealth.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                      {issue.severity}
                    </Badge>
                    <span className="text-zinc-600 dark:text-zinc-400">{issue.message}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(issue.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatResponseTime(stats.averageResponseTime)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.averageResponseTime < 200 ? (
                  <span className="text-green-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Excellent
                  </span>
                ) : stats.averageResponseTime < 500 ? (
                  <span className="text-yellow-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Good
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Needs attention
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Error Rate: {(stats.errorRate * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
              <p className="text-xs text-muted-foreground">
                CPU: {stats.cpuUsage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.cachePerformance.hitRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Miss Rate: {(stats.cachePerformance.missRate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Performance Tabs */}
      <Tabs defaultValue="routes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes">Route Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Route Performance Analysis</h3>
            <div className="flex gap-2">
              <Button onClick={() => exportData('csv')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportData('json')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Requests</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Response</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Errors</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Slowest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Fastest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {routes.map((route, index) => (
                      <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-4 py-3 text-sm font-mono">{route.route}</td>
                        <td className="px-4 py-3 text-sm">{route.requestCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{formatResponseTime(route.averageResponseTime)}</td>
                        <td className="px-4 py-3 text-sm">
                          {route.errorCount > 0 ? (
                            <Badge variant="destructive">{route.errorCount}</Badge>
                          ) : (
                            <Badge variant="default">0</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600">{formatResponseTime(route.slowestRequest)}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{formatResponseTime(route.fastestRequest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <h3 className="text-lg font-semibold">Database Performance</h3>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Query Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatResponseTime(stats.dbPerformance.averageQueryTime)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Slow Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.dbPerformance.slowQueries}</div>
                  <p className="text-xs text-muted-foreground">Queries &gt; 1s</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Connection Pool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.dbPerformance.connectionPoolSize}</div>
                  <p className="text-xs text-muted-foreground">Active connections</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <h3 className="text-lg font-semibold">System Resources</h3>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(stats.memoryUsage / (512 * 1024 * 1024) * 100, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cpuUsage.toFixed(1)}%</div>
                  <div className="w-full bg-zinc-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(stats.cpuUsage, 100)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Performance Events</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Response Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {recentMetrics.slice(0, 20).map((metric, index) => (
                      <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-4 py-3 text-sm">{new Date(metric.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-3 text-sm font-mono">{metric.route}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{metric.method}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatResponseTime(metric.responseTime)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={metric.statusCode >= 400 ? 'destructive' : 'default'}>
                            {metric.statusCode}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
