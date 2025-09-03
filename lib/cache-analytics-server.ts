/**
 * Cache Analytics Service - Server Side
 * 
 * Tracks cache performance metrics and integrates with monitoring services
 * like Datadog, Prometheus, and Vercel Analytics
 */

interface CacheMetric {
  timestamp: number
  type: 'hit' | 'miss' | 'invalidation' | 'error'
  strategy: string
  route: string
  responseTime?: number
  buildId?: string
  userAgent?: string
  region?: string
}

interface CacheStats {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  averageResponseTime: number
  invalidations: number
  errors: number
  lastUpdated: Date
}

interface RouteStats {
  hits: number
  misses: number
  total: number
}

interface HourlyStats {
  hits: number
  misses: number
  total: number
}

interface DetailedAnalytics {
  overview: CacheStats
  byStrategy: Record<string, RouteStats>
  hourlyTrend: Record<number, HourlyStats>
  topRoutes: Array<{ route: string } & RouteStats>
  recentEvents: CacheMetric[]
}

class CacheAnalytics {
  private metrics: CacheMetric[] = []
  private readonly MAX_METRICS = 10000 // Keep last 10k metrics in memory
  
  /**
   * Record a cache event
   */
  recordEvent(metric: Omit<CacheMetric, 'timestamp'>) {
    const fullMetric: CacheMetric = {
      ...metric,
      timestamp: Date.now()
    }
    
    this.metrics.push(fullMetric)
    
    // Keep memory usage in check
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }
    
    // Send to external monitoring services
    this.sendToMonitoringServices(fullMetric)
  }
  
  /**
   * Get cache statistics for a time period
   */
  getStats(periodMs: number = 24 * 60 * 60 * 1000): CacheStats {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    const totalRequests = recentMetrics.length
    const cacheHits = recentMetrics.filter(m => m.type === 'hit').length
    const cacheMisses = recentMetrics.filter(m => m.type === 'miss').length
    const invalidations = recentMetrics.filter(m => m.type === 'invalidation').length
    const errors = recentMetrics.filter(m => m.type === 'error').length
    
    const responseTimes = recentMetrics
      .filter(m => m.responseTime !== undefined)
      .map(m => m.responseTime!)
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0
    
    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      averageResponseTime,
      invalidations,
      errors,
      lastUpdated: new Date()
    }
  }
  
  /**
   * Get detailed analytics data for admin dashboard
   */
  getDetailedAnalytics(periodMs: number = 24 * 60 * 60 * 1000): DetailedAnalytics {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    // Group by strategy
    const byStrategy = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.strategy]) {
        acc[metric.strategy] = { hits: 0, misses: 0, total: 0 }
      }
      acc[metric.strategy].total++
      if (metric.type === 'hit') acc[metric.strategy].hits++
      if (metric.type === 'miss') acc[metric.strategy].misses++
      return acc
    }, {} as Record<string, { hits: number, misses: number, total: number }>)
    
    // Group by hour for trending
    const hourlyData = recentMetrics.reduce((acc, metric) => {
      const hour = new Date(metric.timestamp).getHours()
      if (!acc[hour]) {
        acc[hour] = { hits: 0, misses: 0, total: 0 }
      }
      acc[hour].total++
      if (metric.type === 'hit') acc[hour].hits++
      if (metric.type === 'miss') acc[hour].misses++
      return acc
    }, {} as Record<number, { hits: number, misses: number, total: number }>)
    
    // Top routes by traffic
    const routeStats = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.route]) {
        acc[metric.route] = { hits: 0, misses: 0, total: 0 }
      }
      acc[metric.route].total++
      if (metric.type === 'hit') acc[metric.route].hits++
      if (metric.type === 'miss') acc[metric.route].misses++
      return acc
    }, {} as Record<string, { hits: number, misses: number, total: number }>)
    
    const topRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({ route, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
    
    return {
      overview: this.getStats(periodMs),
      byStrategy,
      hourlyTrend: hourlyData,
      topRoutes,
      recentEvents: recentMetrics.slice(-20).reverse() // Latest 20 events
    }
  }
  
  /**
   * Send metrics to external monitoring services
   */
  private async sendToMonitoringServices(metric: CacheMetric) {
    try {
      // Send to multiple services in parallel
      await Promise.allSettled([
        this.sendToDatadog(metric),
        this.sendToPrometheus(metric),
        this.sendToVercelAnalytics(metric),
        this.sendToWebhook(metric)
      ])
    } catch (error) {
      console.error('Error sending to monitoring services:', error)
    }
  }
  
  /**
   * Send metric to Datadog
   */
  private async sendToDatadog(metric: CacheMetric) {
    const apiKey = process.env.DATADOG_API_KEY
    if (!apiKey) return
    
    try {
      const response = await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
        },
        body: JSON.stringify({
          series: [{
            metric: 'cache.event',
            points: [[Math.floor(metric.timestamp / 1000), 1]],
            type: 'count',
            tags: [
              `type:${metric.type}`,
              `strategy:${metric.strategy}`,
              `route:${metric.route}`,
              ...(metric.buildId ? [`build_id:${metric.buildId}`] : []),
              ...(metric.region ? [`region:${metric.region}`] : [])
            ]
          }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`Datadog API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send metric to Datadog:', error)
    }
  }
  
  /**
   * Send metric to Prometheus Pushgateway
   */
  private async sendToPrometheus(metric: CacheMetric) {
    const pushgatewayUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL
    if (!pushgatewayUrl) return
    
    try {
      const metricLine = `cache_events_total{type="${metric.type}",strategy="${metric.strategy}",route="${metric.route}"} 1 ${metric.timestamp}`
      
      await fetch(`${pushgatewayUrl}/metrics/job/cache_analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: metricLine
      })
    } catch (error) {
      console.error('Failed to send metric to Prometheus:', error)
    }
  }
  
  /**
   * Send metric to Vercel Analytics
   */
  private async sendToVercelAnalytics(metric: CacheMetric) {
    try {
      // Vercel Analytics is automatically integrated in production
      // We can use their Analytics API if needed
      if (typeof window !== 'undefined' && (window as unknown as { va?: { track: (event: string, data: Record<string, unknown>) => void } }).va) {
        (window as unknown as { va: { track: (event: string, data: Record<string, unknown>) => void } }).va.track('cache_event', {
          type: metric.type,
          strategy: metric.strategy,
          route: metric.route,
          response_time: metric.responseTime
        })
      }
    } catch (error) {
      console.error('Failed to send metric to Vercel Analytics:', error)
    }
  }
  
  /**
   * Send metric to custom webhook
   */
  private async sendToWebhook(metric: CacheMetric) {
    const webhookUrl = process.env.CACHE_ANALYTICS_WEBHOOK
    if (!webhookUrl) return
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🔄 Cache ${metric.type}: ${metric.route} (${metric.strategy})`,
          metric
        })
      })
    } catch (error) {
      console.error('Failed to send metric to webhook:', error)
    }
  }

  /**
   * Export metrics in different formats
   */
  exportMetrics(format: 'json' | 'csv', periodMs: number = 24 * 60 * 60 * 1000): string {
    const cutoff = Date.now() - periodMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'strategy', 'route', 'responseTime', 'buildId', 'userAgent', 'region']
      const rows = recentMetrics.map(m => [
        new Date(m.timestamp).toISOString(),
        m.type,
        m.strategy,
        m.route,
        m.responseTime || '',
        m.buildId || '',
        m.userAgent || '',
        m.region || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(recentMetrics, null, 2)
  }
}

// Global instance
const analytics = new CacheAnalytics()

export { analytics as cacheAnalytics }
export type { CacheMetric, CacheStats, DetailedAnalytics }
