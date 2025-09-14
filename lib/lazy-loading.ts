/**
 * Lazy Loading Utilities
 * Provides optimized lazy loading for heavy components and libraries
 */

import dynamic from 'next/dynamic';
import { ComponentType, Suspense, useState, useEffect, useRef } from 'react';

// Loading components
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const SkeletonLoading = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const GlobeLoading = () => (
  <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-primary font-medium">Loading 3D Globe...</p>
    </div>
  </div>
);

const ChartLoading = () => (
  <div className="h-[300px] w-full flex items-center justify-center border rounded-lg">
    <div className="text-center">
      <div className="animate-pulse h-8 w-8 bg-primary/20 rounded mx-auto mb-2"></div>
      <p className="text-muted-foreground text-sm">Loading chart...</p>
    </div>
  </div>
);

// Lazy loading configurations
export const lazyComponents = {
  // 3D Components
  Globe: dynamic(() => import('@/components/ui/globe').then(mod => ({ default: mod.World })), {
    ssr: false,
    loading: GlobeLoading
  }),
  
  Particles: dynamic(() => import('@/components/ui/particles').then(mod => ({ default: mod.Particles })), {
    ssr: false,
    loading: () => null // Particles don't need loading state
  }),

  // Charts and Analytics
  PerformanceChart: dynamic(() => import('@/components/admin/PerformanceMonitoring').then(mod => ({ default: mod.PerformanceChart })), {
    ssr: false,
    loading: ChartLoading
  }),

  CacheAnalytics: dynamic(() => import('@/components/admin/CacheAnalyticsDashboard').then(mod => ({ default: mod.CacheAnalyticsDashboard })), {
    ssr: false,
    loading: ChartLoading
  }),

  // Admin Components
  AdminDashboard: dynamic(() => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })), {
    ssr: false,
    loading: DefaultLoading
  }),

  AuditLogs: dynamic(() => import('@/components/admin/AuditLogsDashboard').then(mod => ({ default: mod.AuditLogsDashboard })), {
    ssr: false,
    loading: DefaultLoading
  }),

  // Heavy UI Components
  ContributionGraph: dynamic(() => import('@/components/ui/contribution-graph').then(mod => ({ default: mod.ContributionGraph })), {
    ssr: false,
    loading: ChartLoading
  }),

  // PDF Generation (only load when needed)
  PDFGenerator: dynamic(() => import('@/components/certificates/PDFGenerator').then(mod => ({ default: mod.PDFGenerator })), {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF generator...</p>
        </div>
      </div>
    )
  })
};

// Utility function to create lazy components with custom loading
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent?: ComponentType,
  options: {
    ssr?: boolean;
    loading?: ComponentType;
  } = {}
) {
  return dynamic(importFn, {
    ssr: false,
    loading: loadingComponent || DefaultLoading,
    ...options
  });
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  threshold = 0.1,
  rootMargin = '50px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsIntersecting(true);
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

// Performance-based lazy loading
export function usePerformanceBasedLazyLoading() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    // Check device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isMobile = window.innerWidth < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      setShouldLoad(false);
      return;
    }

    if (isLowEndDevice) {
      setQuality('low');
    } else if (isMobile) {
      setQuality('medium');
    }

    // Load after a delay to not block initial render
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { shouldLoad, quality };
}

// Conditional lazy loading based on user interaction
export function useInteractionBasedLazyLoading() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        setShouldLoad(true);
      }
    };

    // Listen for user interactions
    const events = ['click', 'scroll', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [hasInteracted]);

  return { shouldLoad, hasInteracted };
}

// Lazy loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  trigger?: 'intersection' | 'interaction' | 'performance' | 'immediate';
}

export function LazyWrapper({ 
  children, 
  fallback = <DefaultLoading />, 
  threshold = 0.1,
  rootMargin = '50px',
  trigger = 'intersection'
}: LazyWrapperProps) {
  const { ref, isIntersecting } = useIntersectionObserver(threshold, rootMargin);
  const { shouldLoad: shouldLoadByInteraction } = useInteractionBasedLazyLoading();
  const { shouldLoad: shouldLoadByPerformance, quality } = usePerformanceBasedLazyLoading();

  const shouldRender = (() => {
    switch (trigger) {
      case 'immediate':
        return true;
      case 'interaction':
        return shouldLoadByInteraction;
      case 'performance':
        return shouldLoadByPerformance;
      case 'intersection':
      default:
        return isIntersecting;
    }
  })();

  return (
    <div ref={ref}>
      {shouldRender ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

