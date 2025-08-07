import { useState, useEffect } from 'react';
import { universalCache, apiCache, performanceCache } from '@/lib/cache';

interface UseCachedDataOptions<T> {
  ttl?: number; // Time to live in milliseconds
  key: string;
  fetchFn: () => Promise<T>;
  dependencies?: unknown[];
  enabled?: boolean;
}

export function useCachedData<T = unknown>({
  ttl = 300000, // 5 minutes default
  key,
  fetchFn,
  dependencies = [],
  enabled = true
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = universalCache.get<T>(key);
        if (cached) {
          performanceCache.recordHit();
          setData(cached);
          setLoading(false);
          return;
        }

        performanceCache.recordMiss();

        // Fetch fresh data
        const freshData = await fetchFn();
        
        // Cache the result
        universalCache.set(key, freshData, ttl);
        
        setData(freshData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttl, enabled, ...dependencies]);

  const refetch = async () => {
    // Clear cache and fetch fresh data
    universalCache.remove(key);
    setLoading(true);
    setError(null);

    try {
      const freshData = await fetchFn();
      universalCache.set(key, freshData, ttl);
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    universalCache.remove(key);
  };

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    hitRate: performanceCache.getHitRate()
  };
}

// Specialized hook for API calls
export function useCachedAPI<T = unknown>(
  url: string,
  params?: Record<string, string>,
  ttl: number = 300000
) {
  const cacheKey = apiCache.generateKey(url, params);
  
  const fetchFn = async () => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${url}${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
  };

  return useCachedData<T>({
    key: cacheKey,
    fetchFn,
    ttl,
    dependencies: [url, JSON.stringify(params)]
  });
}

// Hook for localStorage-based caching
export function useLocalStorageCache<T = unknown>(
  key: string,
  defaultValue: T,
  ttl: number = 3600000 // 1 hour default
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return defaultValue;
      
      const { data, expires } = JSON.parse(cached);
      
      if (Date.now() > expires) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return data;
    } catch {
      return defaultValue;
    }
  });

  const setCachedValue = (newValue: T) => {
    setValue(newValue);
    
    if (typeof window !== 'undefined') {
      try {
        const expires = Date.now() + ttl;
        const cacheData = { data: newValue, expires };
        localStorage.setItem(key, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  };

  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    setValue(defaultValue);
  };

  return [value, setCachedValue, clearCache] as const;
} 