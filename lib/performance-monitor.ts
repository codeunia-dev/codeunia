/**
 * Performance Monitoring Utilities
 * Tracks Web Vitals and custom performance metrics
 * Updated to use centralized logging system
 */

import { logger } from '@/lib/logging';

// Type definitions for performance entries
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
  processingEnd: number
  cancelable: boolean
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  lastInputTime: number
  sources: LayoutShiftAttribution[]
}

interface LayoutShiftAttribution {
  node?: Node
  previousRect: DOMRectReadOnly
  currentRect: DOMRectReadOnly
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'web-vital' | 'custom'
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
      this.initializeCustomMetrics()
    }
  }

  private initializeWebVitals() {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.recordMetric('LCP', lastEntry.startTime, 'web-vital')
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch {
        console.warn('LCP observer not supported')
      }

      // Track First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming
            this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime, 'web-vital')
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch {
        console.warn('FID observer not supported')
      }

      // Track Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const clsEntry = entry as LayoutShift
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value
            }
          })
          this.recordMetric('CLS', clsValue, 'web-vital')
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch {
        console.warn('CLS observer not supported')
      }
    }
  }

  private initializeCustomMetrics() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.recordMetric('PageLoad', loadTime, 'custom')
    })

    // Track bundle size (approximate)
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource')
      const jsSize = resources
        .filter((resource) => resource.name.includes('.js'))
        .reduce((total, resource) => {
          const resourceEntry = resource as PerformanceResourceTiming
          return total + (resourceEntry.transferSize || 0)
        }, 0)
      
      if (jsSize > 0) {
        this.recordMetric('BundleSize', jsSize, 'custom')
      }
    }
  }

  recordMetric(name: string, value: number, type: 'web-vital' | 'custom' = 'custom') {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    }
    
    this.metrics.push(metric)
    
    // Add to batch for external monitoring
    this.addToBatch(metric)
    
    // Log performance issues with structured logging
    if (this.isPerformanceIssue(name, value)) {
      this.logPerformanceIssue(metric)
    }
  }

  private logPerformanceIssue(metric: PerformanceMetric) {
    logger.performance.warn('performance_issue', `Performance threshold exceeded: ${metric.name} = ${metric.value}`, {
      metric: {
        name: metric.name,
        value: metric.value,
        type: metric.type,
        threshold: this.getThreshold(metric.name)
      }
    });
  }

  private getThreshold(metricName: string): number {
    const thresholds = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      PageLoad: 3000,
      BundleSize: 500000,
      '3D_FPS': 30
    }
    return thresholds[metricName as keyof typeof thresholds] || Infinity
  }

  private isPerformanceIssue(name: string, value: number): boolean {
    const thresholds = {
      LCP: 2500, // 2.5 seconds
      FID: 100,  // 100ms
      CLS: 0.1,  // 0.1
      PageLoad: 3000, // 3 seconds
      BundleSize: 500000 // 500KB
    }
    
    return value > (thresholds[name as keyof typeof thresholds] || Infinity)
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find(metric => metric.name === name)
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(metric => metric.name === name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((total, metric) => total + metric.value, 0)
    return sum / metrics.length
  }

  // Track 3D rendering performance
  track3DPerformance(fps: number, quality: string) {
    this.recordMetric('3D_FPS', fps, 'custom')
    this.recordMetric('3D_Quality', quality === 'high' ? 3 : quality === 'medium' ? 2 : 1, 'custom')
  }

  // Track API response times
  trackAPICall(endpoint: string, duration: number) {
    this.recordMetric(`API_${endpoint}`, duration, 'custom')
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      webVitals: {
        lcp: this.getAverageMetric('LCP'),
        fid: this.getAverageMetric('FID'),
        cls: this.getAverageMetric('CLS')
      },
      custom: {
        pageLoad: this.getAverageMetric('PageLoad'),
        bundleSize: this.getAverageMetric('BundleSize'),
        fps3D: this.getAverageMetric('3D_FPS'),
        quality3D: this.getAverageMetric('3D_Quality')
      },
      timestamp: Date.now()
    }
    
    return report
  }

  // Send metrics to external monitoring services
  private async sendToMonitoringServices(metric: PerformanceMetric) {
    try {
      // Send to external monitoring (Sentry, Grafana, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).gtag) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_type: metric.type
        })
      }

      // Send to custom analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric)
        }).catch(error => {
          console.warn('Failed to send performance metric:', error)
        })
      }
    } catch (error) {
      console.warn('Failed to send metrics to monitoring services:', error)
    }
  }

  // Batch send metrics for better performance
  private batchMetrics: PerformanceMetric[] = []
  private batchTimeout: NodeJS.Timeout | null = null

  private addToBatch(metric: PerformanceMetric) {
    this.batchMetrics.push(metric)
    
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch()
      }, 5000) // Flush every 5 seconds
    }
  }

  private async flushBatch() {
    if (this.batchMetrics.length === 0) return

    try {
      const metrics = [...this.batchMetrics]
      this.batchMetrics = []
      this.batchTimeout = null

      // Send batch to monitoring services
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/performance/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics })
        }).catch(error => {
          console.warn('Failed to send performance metrics batch:', error)
        })
      }
    } catch (error) {
      console.warn('Failed to flush performance metrics batch:', error)
    }
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    track3DPerformance: performanceMonitor.track3DPerformance.bind(performanceMonitor),
    trackAPICall: performanceMonitor.trackAPICall.bind(performanceMonitor),
    getPerformanceReport: performanceMonitor.getPerformanceReport.bind(performanceMonitor)
  }
}

export default performanceMonitor
