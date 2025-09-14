/**
 * Lazy-loaded Performance Monitoring System
 * Only loads monitoring code when needed to avoid impacting initial page load
 */

import { logger } from '@/lib/logging';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'web-vital' | 'custom' | 'api' | 'database';
  metadata?: Record<string, unknown>;
}

export interface MonitoringConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint?: string;
  sampleRate: number;
}

class LazyPerformanceMonitor {
  private static instance: LazyPerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private config: MonitoringConfig;
  private flushTimer?: NodeJS.Timeout;
  private isInitialized = false;

  private constructor() {
    this.config = {
      enabled: process.env.MONITORING_ENABLED === 'true',
      batchSize: parseInt(process.env.MONITORING_BATCH_SIZE || '50'),
      flushInterval: parseInt(process.env.MONITORING_FLUSH_INTERVAL || '30000'),
      endpoint: process.env.MONITORING_ENDPOINT,
      sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '1.0')
    };
  }

  static getInstance(): LazyPerformanceMonitor {
    if (!LazyPerformanceMonitor.instance) {
      LazyPerformanceMonitor.instance = new LazyPerformanceMonitor();
    }
    return LazyPerformanceMonitor.instance;
  }

  /**
   * Initialize monitoring (lazy-loaded)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      // Dynamically import heavy monitoring dependencies
      const { PerformanceObserver } = await import('perf_hooks');
      
      // Set up performance observers
      this.setupPerformanceObservers(PerformanceObserver);
      
      // Start flush timer
      this.startFlushTimer();
      
      this.isInitialized = true;
      logger.monitoring.info('monitoring_initialized', 'Performance monitoring initialized');
    } catch (error) {
      logger.monitoring.error('monitoring_init_failed', 'Failed to initialize monitoring', {}, error as Error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Auto-flush if batch size reached
    if (this.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    type: PerformanceMetric['type'] = 'custom'
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        name,
        value: duration,
        type,
        metadata: { success: true }
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordMetric({
        name,
        value: duration,
        type,
        metadata: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    type: PerformanceMetric['type'] = 'custom'
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      
      this.recordMetric({
        name,
        value: duration,
        type,
        metadata: { success: true }
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordMetric({
        name,
        value: duration,
        type,
        metadata: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      });
      
      throw error;
    }
  }

  /**
   * Set up performance observers for Web Vitals
   */
  private setupPerformanceObservers(PerformanceObserver: any): void {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          type: 'web-vital',
          metadata: { element: lastEntry.element?.tagName }
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      logger.monitoring.warn('lcp_observer_failed', 'Failed to set up LCP observer', { error: (error as Error).message });
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            type: 'web-vital',
            metadata: { eventType: entry.name }
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      logger.monitoring.warn('fid_observer_failed', 'Failed to set up FID observer', { error: (error as Error).message });
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list: any) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0) {
          this.recordMetric({
            name: 'CLS',
            value: clsValue,
            type: 'web-vital',
            metadata: { entries: entries.length }
          });
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      logger.monitoring.warn('cls_observer_failed', 'Failed to set up CLS observer', { error: (error as Error).message });
    }
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush metrics to external service
   */
  private async flush(): Promise<void> {
    if (this.metrics.length === 0 || !this.config.endpoint) {
      return;
    }

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodeUnia-Monitor/1.0'
        },
        body: JSON.stringify({
          metrics: metricsToFlush,
          timestamp: Date.now(),
          environment: process.env.NODE_ENV
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.monitoring.info('metrics_flushed', `Flushed ${metricsToFlush.length} metrics`);
    } catch (error) {
      // Re-add metrics to queue for retry
      this.metrics.unshift(...metricsToFlush);
      logger.monitoring.error('metrics_flush_failed', 'Failed to flush metrics', {}, error as Error);
    }
  }

  /**
   * Get current metrics (for debugging)
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    
    // Flush remaining metrics
    this.flush();
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const lazyMonitor = LazyPerformanceMonitor.getInstance();

// Convenience functions for lazy initialization
export const initializeMonitoring = () => lazyMonitor.initialize();

export const recordMetric = (metric: Omit<PerformanceMetric, 'timestamp'>) => 
  lazyMonitor.recordMetric(metric);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  type: PerformanceMetric['type'] = 'custom'
) => lazyMonitor.measureAsync(name, fn, type);

export const measureSync = <T>(
  name: string,
  fn: () => T,
  type: PerformanceMetric['type'] = 'custom'
) => lazyMonitor.measureSync(name, fn, type);

// Auto-initialize in browser environment
if (typeof window !== 'undefined' && process.env.MONITORING_ENABLED === 'true') {
  // Initialize after a short delay to not block initial page load
  setTimeout(() => {
    initializeMonitoring();
  }, 1000);
}
