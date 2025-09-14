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

// Lazy loading options
export interface LazyLoadOptions {
  loading?: ComponentType;
  ssr?: boolean;
  suspense?: boolean;
}

/**
 * Create a lazy-loaded component with optimized loading
 */
export function createLazyComponent<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
) {
  const {
    loading: LoadingComponent = DefaultLoading,
    ssr = false,
    suspense = false
  } = options;

  const LazyComponent = dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr
  });

  if (suspense) {
    const SuspenseWrapper = (props: T) => (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
    SuspenseWrapper.displayName = 'SuspenseWrapper';
    return SuspenseWrapper;
  }

  return LazyComponent;
}

/**
 * Lazy load heavy libraries
 */
export function lazyLoadLibrary<T>(
  importFunc: () => Promise<T>,
  fallback?: T
): Promise<T> {
  return importFunc().catch(() => {
    if (fallback) {
      return fallback;
    }
    throw new Error('Failed to load library');
  });
}

/**
 * Intersection Observer hook for lazy loading
 */
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
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

/**
 * Preload component for better performance
 */
export function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType }>
) {
  return importFunc();
}

/**
 * Lazy load with retry mechanism
 */
export function createLazyComponentWithRetry<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  maxRetries = 3,
  options: LazyLoadOptions = {}
) {
  let retryCount = 0;

  const retryImport = async () => {
    try {
      return await importFunc();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return retryImport();
      }
      throw error;
    }
  };

  return createLazyComponent(retryImport, options);
}

/**
 * Conditional lazy loading based on feature flags
 */
export function createConditionalLazyComponent<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  condition: () => boolean,
  fallbackComponent?: ComponentType<T>,
  options: LazyLoadOptions = {}
) {
  if (!condition()) {
    return fallbackComponent || (() => null);
  }

  return createLazyComponent(importFunc, options);
}

/**
 * Lazy load with error boundary
 */
export function createLazyComponentWithErrorBoundary<T = Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  ErrorComponent: ComponentType<{ error: Error; retry: () => void }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = createLazyComponent(importFunc, options);

  const ErrorBoundaryWrapper = (props: T) => {
    const [error, setError] = useState<Error | null>(null);

    if (error) {
      return <ErrorComponent error={error} retry={() => setError(null)} />;
    }

    return <LazyComponent {...(props as any)} />;
  };
  ErrorBoundaryWrapper.displayName = 'ErrorBoundaryWrapper';
  return ErrorBoundaryWrapper;
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  importFuncs: Array<() => Promise<{ default: ComponentType }>>
) {
  return Promise.all(importFuncs.map(func => func()));
}

/**
 * Lazy load with loading state management
 */
export function useLazyLoad<T>(
  importFunc: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = async () => {
    if (loading || data) return;

    setLoading(true);
    setError(null);

    try {
      const result = await importFunc();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load, ...dependencies]);

  return { data, loading, error, retry: load };
}

// Common lazy-loaded components (examples - uncomment and modify as needed)
// export const LazyAdminPanel = createLazyComponent(
//   () => import('@/components/admin/AdminPanel'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyPDFGenerator = createLazyComponent(
//   () => import('@/components/PDFGenerator'),
//   { loading: DefaultLoading, ssr: false }
// );

// export const LazyChart = createLazyComponent(
//   () => import('@/components/Chart'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyDataTable = createLazyComponent(
//   () => import('@/components/DataTable'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyRichTextEditor = createLazyComponent(
//   () => import('@/components/RichTextEditor'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyFileUpload = createLazyComponent(
//   () => import('@/components/FileUpload'),
//   { loading: DefaultLoading, ssr: false }
// );

// export const LazyVideoPlayer = createLazyComponent(
//   () => import('@/components/VideoPlayer'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyMap = createLazyComponent(
//   () => import('@/components/Map'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyCalendar = createLazyComponent(
//   () => import('@/components/Calendar'),
//   { loading: SkeletonLoading, ssr: false }
// );

// export const LazyNotificationCenter = createLazyComponent(
//   () => import('@/components/NotificationCenter'),
//   { loading: DefaultLoading, ssr: false }
// );

// Export all utilities
export {
  DefaultLoading,
  SkeletonLoading
};
