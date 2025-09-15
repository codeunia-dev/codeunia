import { NextResponse } from 'next/server';

export interface PerformanceConfig {
  enableCompression: boolean;
  enableCaching: boolean;
  enablePrefetching: boolean;
  enableImageOptimization: boolean;
  enableCodeSplitting: boolean;
  enableServiceWorker: boolean;
}

/**
 * Performance Optimization Utilities
 */
export class PerformanceOptimizer {
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  /**
   * Add performance headers to response
   */
  addPerformanceHeaders(response: NextResponse): NextResponse {
    if (this.config.enableCompression) {
      response.headers.set('Content-Encoding', 'gzip');
    }

    if (this.config.enableCaching) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Add performance hints
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');

    return response;
  }

  /**
   * Optimize images
   */
  optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): string {
    if (!this.config.enableImageOptimization) {
      return src;
    }

    const { width, height, quality = 75, format = 'webp' } = options;
    
    // If using Next.js Image component, it handles optimization automatically
    // This is for custom image optimization
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (format) params.set('f', format);

    return `${src}?${params.toString()}`;
  }

  /**
   * Preload critical resources
   */
  generatePreloadLinks(resources: Array<{
    href: string;
    as: 'script' | 'style' | 'image' | 'font' | 'fetch';
    type?: string;
    crossorigin?: boolean;
  }>): string {
    return resources
      .map(resource => {
        const { href, as, type, crossorigin } = resource;
        let link = `<link rel="preload" href="${href}" as="${as}"`;
        
        if (type) link += ` type="${type}"`;
        if (crossorigin) link += ' crossorigin';
        
        link += '>';
        return link;
      })
      .join('\n');
  }

  /**
   * Generate critical CSS
   */
  generateCriticalCSS(): string {
    return `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
      .header { background: #fff; border-bottom: 1px solid #e5e7eb; }
      .hero { padding: 4rem 0; text-align: center; }
      .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.375rem; }
    `;
  }

  /**
   * Optimize bundle size
   */
  getBundleOptimizationConfig() {
    return {
      // Tree shaking
      sideEffects: false,
      
      // Code splitting
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      
      // Compression
      optimization: {
        minimize: true,
        usedExports: true,
        sideEffects: false,
      },
    };
  }
}

/**
 * Service Worker for caching and offline support
 */
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private isRegistered = false;

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Register service worker
   */
  async register(): Promise<void> {
    if (typeof window === 'undefined' || this.isRegistered) {
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        this.isRegistered = true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<void> {
    if (typeof window === 'undefined' || !this.isRegistered) {
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
        this.isRegistered = false;
        console.log('Service Worker unregistered');
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
      }
    }
  }
}

/**
 * Resource hints for performance
 */
export function generateResourceHints(): string {
  return `
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="dns-prefetch" href="//ocnorlktyfswjqgvzrve.supabase.co">
    
    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://ocnorlktyfswjqgvzrve.supabase.co">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/images/hero-bg.webp" as="image">
  `;
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure performance metric
   */
  measure(name: string, fn: () => void | Promise<void>): void {
    const start = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      result.then(() => {
        const end = performance.now();
        this.metrics.set(name, end - start);
        console.log(`Performance: ${name} took ${end - start}ms`);
      });
    } else {
      const end = performance.now();
      this.metrics.set(name, end - start);
      console.log(`Performance: ${name} took ${end - start}ms`);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Report Core Web Vitals
   */
  reportWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & { processingStart: number };
        console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Global instances
export const performanceOptimizer = new PerformanceOptimizer({
  enableCompression: true,
  enableCaching: true,
  enablePrefetching: true,
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enableServiceWorker: true,
});

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
