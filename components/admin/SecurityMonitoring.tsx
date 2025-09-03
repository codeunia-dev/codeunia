'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Users, 
  Activity,
  RefreshCw,
  Download,
  UserX,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SecurityEvent {
  id: string
  timestamp: number
  type: 'auth_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'csrf_attack' | 'sql_injection_attempt' | 'xss_attempt' | 'admin_access' | 'password_change' | 'account_lockout'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ip: string
  userAgent?: string
  route?: string
  description: string
  details?: Record<string, unknown>
  resolved: boolean
}

interface SecurityStats {
  totalEvents: number
  criticalEvents: number
  failedLogins: number
  blockedIPs: number
  suspiciousActivities: number
  rateLimitViolations: number
  csrfAttempts: number
  sqlInjectionAttempts: number
  xssAttempts: number
  lastUpdated: Date
}

interface ThreatAnalysis {
  topThreats: Array<{
    type: string
    count: number
    severity: string
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  geographicDistribution: Array<{
    country: string
    region: string
    threatCount: number
    suspiciousIPs: number
  }>
  timePatterns: Array<{
    hour: number
    eventCount: number
    threatLevel: 'low' | 'medium' | 'high'
  }>
}

interface SecurityHealth {
  score: number
  status: 'secure' | 'warning' | 'critical'
  vulnerabilities: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
    discovered: number
  }>
  compliance: {
    gdpr: boolean
    ccpa: boolean
    sox: boolean
    pci: boolean
  }
}

export default function SecurityMonitoring() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysis | null>(null)
  const [securityHealth, setSecurityHealth] = useState<SecurityHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const periodMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[period]

      const response = await fetch(`/api/admin/security?period=${periodMs}&severity=${filterSeverity}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch security data')
      }

      const data = await response.json()
      setStats(data.stats)
      setEvents(data.events)
      setThreatAnalysis(data.threatAnalysis)
      setSecurityHealth(data.securityHealth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security data')
    } finally {
      setLoading(false)
    }
  }, [period, filterSeverity])

  const generateTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/security-test-data', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate test data')
      }

      // Refresh data after generating test data
      await fetchSecurityData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test data')
      setLoading(false)
    }
  }

  const resolveEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/security/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to resolve event')
      }

      // Update local state
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve event')
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

      const response = await fetch(`/api/admin/security/export?format=${format}&period=${periodMs}&severity=${filterSeverity}`)
      
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
      a.download = `security-events-${period}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    }
  }

  useEffect(() => {
    fetchSecurityData()
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000)
    return () => clearInterval(interval)
  }, [fetchSecurityData])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low': return 'default'
      case 'medium': return 'secondary'
      case 'high': return 'destructive'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'auth_attempt': return <Lock className="w-4 h-4" />
      case 'failed_login': return <UserX className="w-4 h-4" />
      case 'suspicious_activity': return <Eye className="w-4 h-4" />
      case 'rate_limit_exceeded': return <Zap className="w-4 h-4" />
      case 'csrf_attack': return <Shield className="w-4 h-4" />
      case 'sql_injection_attempt': return <AlertTriangle className="w-4 h-4" />
      case 'xss_attempt': return <AlertTriangle className="w-4 h-4" />
      case 'admin_access': return <Users className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading security data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
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
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Security Monitoring</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Security events, threat analysis, and system protection status</p>
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
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value as string)}
            className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateTestData} variant="outline" size="sm">
            <Shield className="w-4 h-4 mr-2" />
            Generate Test Data
          </Button>
        </div>
      </div>

      {/* Security Health Overview */}
      {securityHealth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className={getHealthStatusColor(securityHealth.status)} />
                Security Health
              </CardTitle>
              <Badge variant={securityHealth.status === 'secure' ? 'default' : 'destructive'}>
                {securityHealth.status.toUpperCase()} - {securityHealth.score}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Compliance Status */}
              <div>
                <h4 className="font-medium text-sm mb-2">Compliance Status</h4>
                <div className="flex gap-2">
                  {Object.entries(securityHealth.compliance).map(([standard, compliant]) => (
                    <Badge key={standard} variant={compliant ? 'default' : 'destructive'}>
                      {standard.toUpperCase()}: {compliant ? '✓' : '✗'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Active Vulnerabilities */}
              {securityHealth.vulnerabilities.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Active Vulnerabilities</h4>
                  <div className="space-y-2">
                    {securityHealth.vulnerabilities.slice(0, 3).map((vuln, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant={getSeverityBadge(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                        <span className="text-zinc-600 dark:text-zinc-400">{vuln.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Metrics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Critical: {stats.criticalEvents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedLogins.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Blocked IPs: {stats.blockedIPs}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attack Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.sqlInjectionAttempts + stats.xssAttempts + stats.csrfAttempts).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                SQL: {stats.sqlInjectionAttempts}, XSS: {stats.xssAttempts}, CSRF: {stats.csrfAttempts}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rateLimitViolations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Suspicious: {stats.suspiciousActivities}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Details Tabs */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geographic</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Security Events</h3>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {events.slice(0, 20).map((event) => (
                      <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-4 py-3 text-sm">{new Date(event.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <span className="capitalize">{event.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getSeverityBadge(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{event.ip}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{event.description}</td>
                        <td className="px-4 py-3 text-sm">
                          {event.resolved ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Resolved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="w-4 h-4" />
                              Open
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {!event.resolved && (
                            <Button 
                              onClick={() => resolveEvent(event.id)} 
                              variant="outline" 
                              size="sm"
                            >
                              Resolve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <h3 className="text-lg font-semibold">Threat Analysis</h3>
          {threatAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Threats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {threatAnalysis.topThreats.map((threat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(threat.severity)}>
                            {threat.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm">{threat.count} events</span>
                        </div>
                        <Badge variant="outline">
                          {threat.trend === 'increasing' ? '↗' : threat.trend === 'decreasing' ? '↘' : '→'}
                          {threat.trend}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Time Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {threatAnalysis.timePatterns.slice(0, 12).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{pattern.hour}:00</span>
                        <div className="flex items-center gap-2">
                          <span>{pattern.eventCount} events</span>
                          <Badge variant={getSeverityBadge(pattern.threatLevel)}>
                            {pattern.threatLevel}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <h3 className="text-lg font-semibold">Geographic Distribution</h3>
          {threatAnalysis && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Country</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Region</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Threat Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Suspicious IPs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {threatAnalysis.geographicDistribution.map((geo, index) => (
                        <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm font-medium">{geo.country}</td>
                          <td className="px-4 py-3 text-sm">{geo.region}</td>
                          <td className="px-4 py-3 text-sm">{geo.threatCount}</td>
                          <td className="px-4 py-3 text-sm">{geo.suspiciousIPs}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={geo.threatCount > 50 ? 'destructive' : geo.threatCount > 10 ? 'secondary' : 'default'}>
                              {geo.threatCount > 50 ? 'High' : geo.threatCount > 10 ? 'Medium' : 'Low'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <h3 className="text-lg font-semibold">Vulnerability Assessment</h3>
          {securityHealth && (
            <div className="space-y-4">
              {securityHealth.vulnerabilities.map((vuln, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{vuln.type}</CardTitle>
                      <Badge variant={getSeverityBadge(vuln.severity)}>
                        {vuln.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{vuln.description}</p>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-sm font-medium">Recommendation:</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{vuln.recommendation}</p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Discovered: {new Date(vuln.discovered).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {securityHealth.vulnerabilities.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">No active vulnerabilities detected</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
