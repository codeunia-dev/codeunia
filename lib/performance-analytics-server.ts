/**
 * Performance Analytics Service - Server Side
 * 
 * Tracks application performance metrics including response times, 
 * memory usage, database performance, and system health
 */

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

interface DetailedPerformanceAnalytics {
  stats: PerformanceStats
  routes: RoutePerformance[]
  systemHealth: SystemHealth
  recentMetrics: PerformanceMetric[]
}

class PerformanceAnalytics {
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 10000 // Keep last 10k metrics in memory

  /**
   * Record a performance metric
   */
  recordEvent(metric: Omit<PerformanceMetric, 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    }
    
    this.metrics.push(fullMetric)
    
    // Keep memory usage in check
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    // Send to monitoring services
    this.sendToMonitoringServices(fullMetric)
  }

  /**
   * Get performance statistics for a time period
   */
  getStats(periodMs: number = 24 * 60 * 60 * 1000): PerformanceStats {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    const totalRequests = recentMetrics.length
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length
    const errorRate = totalRequests > 0 ? errors / totalRequests : 0
    
    const responseTimes = recentMetrics.map(m => m.responseTime)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    const dbQueryTimes = recentMetrics
      .filter(m => m.dbQueryTime !== undefined)
      .map(m => m.dbQueryTime!)
    
    const averageDbQueryTime = dbQueryTimes.length > 0
      ? dbQueryTimes.reduce((a, b) => a + b, 0) / dbQueryTimes.length
      : 0

    const slowQueries = dbQueryTimes.filter(time => time > 1000).length

    // Get current system metrics
    const currentMemory = process.memoryUsage().heapUsed
    const currentCpuUsage = process.cpuUsage()
    const cpuPercent = (currentCpuUsage.user + currentCpuUsage.system) / 1000000 // Convert to percentage

    // Calculate cache performance
    const cacheMetrics = recentMetrics.filter(m => m.cacheHitRate !== undefined)
    const averageCacheHitRate = cacheMetrics.length > 0
      ? cacheMetrics.reduce((sum, m) => sum + (m.cacheHitRate || 0), 0) / cacheMetrics.length
      : 0

    return {
      averageResponseTime,
      totalRequests,
      errorRate,
      uptime: process.uptime() * 1000, // Convert to ms
      memoryUsage: currentMemory,
      cpuUsage: Math.min(cpuPercent, 100),
      dbPerformance: {
        averageQueryTime: averageDbQueryTime,
        slowQueries,
        connectionPoolSize: 10 // This would come from your DB pool
      },
      cachePerformance: {
        hitRate: averageCacheHitRate,
        missRate: 1 - averageCacheHitRate,
        averageRetrievalTime: 25 // This would be calculated from cache metrics
      },
      lastUpdated: new Date()
    }
  }

  /**
   * Get detailed performance analytics for admin dashboard
   */
  getDetailedAnalytics(periodMs: number = 24 * 60 * 60 * 1000): DetailedPerformanceAnalytics {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    // Group by route for route performance analysis
    const routeStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.route]) {
        acc[metric.route] = {
          responseTimes: [],
          errorCount: 0,
          requestCount: 0
        }
      }
      
      acc[metric.route].responseTimes.push(metric.responseTime)
      acc[metric.route].requestCount++
      if (metric.statusCode >= 400) {
        acc[metric.route].errorCount++
      }
      
      return acc
    }, {} as Record<string, { responseTimes: number[], errorCount: number, requestCount: number }>)

    const routes: RoutePerformance[] = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        averageResponseTime: stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length,
        requestCount: stats.requestCount,
        errorCount: stats.errorCount,
        slowestRequest: Math.max(...stats.responseTimes),
        fastestRequest: Math.min(...stats.responseTimes)
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 20)

    // Generate system health assessment
    const systemHealth = this.assessSystemHealth(recentMetrics)

    return {
      stats: this.getStats(periodMs),
      routes,
      systemHealth,
      recentMetrics: recentMetrics.slice(-50).reverse() // Latest 50 events
    }
  }

  /**
   * Assess system health based on metrics
   */
  private assessSystemHealth(metrics: PerformanceMetric[]): SystemHealth {
    const issues: SystemHealth['issues'] = []
    let score = 100

    // Check average response time
    const responseTimes = metrics.map(m => m.responseTime)
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    if (avgResponseTime > 2000) {
      issues.push({
        type: 'performance',
        severity: 'high',
        message: `High average response time: ${avgResponseTime.toFixed(0)}ms`,
        timestamp: Date.now()
      })
      score -= 20
    } else if (avgResponseTime > 1000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Elevated response time: ${avgResponseTime.toFixed(0)}ms`,
        timestamp: Date.now()
      })
      score -= 10
    }

    // Check error rate
    const errorCount = metrics.filter(m => m.statusCode >= 400).length
    const errorRate = metrics.length > 0 ? errorCount / metrics.length : 0

    if (errorRate > 0.05) { // 5%
      issues.push({
        type: 'performance',
        severity: 'high',
        message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: Date.now()
      })
      score -= 25
    } else if (errorRate > 0.01) { // 1%
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Elevated error rate: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: Date.now()
      })
      score -= 10
    }

    // Check memory usage
    const currentMemory = process.memoryUsage().heapUsed
    const memoryMB = currentMemory / 1024 / 1024

    if (memoryMB > 500) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: `High memory usage: ${memoryMB.toFixed(1)}MB`,
        timestamp: Date.now()
      })
      score -= 15
    } else if (memoryMB > 300) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        message: `Elevated memory usage: ${memoryMB.toFixed(1)}MB`,
        timestamp: Date.now()
      })
      score -= 8
    }

    // Check database performance
    const dbMetrics = metrics.filter(m => m.dbQueryTime !== undefined)
    if (dbMetrics.length > 0) {
      const avgDbTime = dbMetrics.reduce((sum, m) => sum + (m.dbQueryTime || 0), 0) / dbMetrics.length
      if (avgDbTime > 1000) {
        issues.push({
          type: 'database',
          severity: 'high',
          message: `Slow database queries: ${avgDbTime.toFixed(0)}ms average`,
          timestamp: Date.now()
        })
        score -= 20
      }
    }

    const status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical'

    return {
      status,
      score: Math.max(0, score),
      issues
    }
  }

  /**
   * Send metrics to external monitoring services
   */
  private async sendToMonitoringServices(metric: PerformanceMetric) {
    try {
      // In production, send to services like Datadog, New Relic, etc.
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Performance metric: ${metric.route} - ${metric.responseTime}ms`)
      }
    } catch (error) {
      console.error('Error sending performance metric to monitoring services:', error)
    }
  }

  /**
   * Generate test performance data
   */
  generateTestData(count: number = 100) {
    const routes = [
      '/api/users',
      '/api/auth/signin',
      '/api/auth/signup',
      '/api/admin/dashboard',
      '/api/posts',
      '/api/events',
      '/api/ai',
      '/protected/dashboard',
      '/admin/users',
      '/admin/events'
    ]

    const methods = ['GET', 'POST', 'PUT', 'DELETE']
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ]

    for (let i = 0; i < count; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)]
      const method = methods[Math.floor(Math.random() * methods.length)]
      
      // Generate realistic response times based on route type
      let responseTime
      if (route.includes('/api/ai')) {
        responseTime = 1000 + Math.random() * 3000 // AI endpoints are slower
      } else if (route.includes('/admin')) {
        responseTime = 200 + Math.random() * 800 // Admin pages
      } else {
        responseTime = 50 + Math.random() * 500 // Regular APIs
      }

      // Generate realistic status codes (mostly success)
      let statusCode = 200
      if (Math.random() < 0.05) { // 5% errors
        statusCode = Math.random() < 0.7 ? 404 : 500
      }

      this.recordEvent({
        route,
        method,
        responseTime,
        statusCode,
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        userId: Math.random() < 0.8 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        memoryUsage: 100 + Math.random() * 400, // MB
        cpuUsage: Math.random() * 80, // Percentage
        dbQueryTime: Math.random() < 0.7 ? 10 + Math.random() * 200 : undefined, // Some requests don't hit DB
        cacheHitRate: Math.random() < 0.6 ? 0.7 + Math.random() * 0.3 : undefined // Some requests use cache
      })
    }

    console.log(`Generated ${count} performance metrics`)
  }

  /**
   * Export metrics in different formats
   */
  exportMetrics(format: 'json' | 'csv', periodMs: number = 24 * 60 * 60 * 1000): string {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    if (format === 'csv') {
      const headers = [
        'timestamp', 'route', 'method', 'responseTime', 'statusCode', 
        'userId', 'memoryUsage', 'cpuUsage', 'dbQueryTime', 'cacheHitRate'
      ]
      const rows = recentMetrics.map(m => [
        new Date(m.timestamp).toISOString(),
        m.route,
        m.method,
        m.responseTime,
        m.statusCode,
        m.userId || '',
        m.memoryUsage || '',
        m.cpuUsage || '',
        m.dbQueryTime || '',
        m.cacheHitRate || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(recentMetrics, null, 2)
  }
}

// Global instance
const analytics = new PerformanceAnalytics()

export { analytics as performanceAnalytics }
export type { PerformanceMetric, PerformanceStats, DetailedPerformanceAnalytics }
