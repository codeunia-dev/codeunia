import { useState, useEffect, useCallback } from 'react';
import { performanceCookies, clientCookies } from '@/lib/cookies';

interface UseCookieCacheOptions {
  key: string;
  ttl?: number; // Time to live in seconds
  fallbackToLocalStorage?: boolean;
  fallbackToMemory?: boolean;
}

export function useCookieCache<T = any>(
  options: UseCookieCacheOptions
) {
  const { key, ttl = 300, fallbackToLocalStorage = true, fallbackToMemory = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get data from cache (cookies first, then fallbacks)
  const getCachedData = useCallback((): T | null => {
    // Try cookies first
    const cookieData = performanceCookies.getCachedAPIResponse(key);
    if (cookieData) return cookieData;

    // Fallback to localStorage
    if (fallbackToLocalStorage && typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem(`cookie_cache_${key}`);
        if (localData) {
          const { data, timestamp, ttl: localTtl } = JSON.parse(localData);
          if (Date.now() - timestamp < localTtl * 1000) {
            return data;
          }
        }
      } catch (error) {
        console.warn('localStorage fallback failed:', error);
      }
    }

    return null;
  }, [key, fallbackToLocalStorage]);

  // Set data in cache (cookies + fallbacks)
  const setCachedData = useCallback((newData: T, customTtl?: number) => {
    const cacheTtl = customTtl || ttl;
    
    // Cache in cookies
    performanceCookies.cacheAPIResponse(key, newData, cacheTtl);
    
    // Fallback to localStorage
    if (fallbackToLocalStorage && typeof window !== 'undefined') {
      try {
        const cacheData = {
          data: newData,
          timestamp: Date.now(),
          ttl: cacheTtl
        };
        localStorage.setItem(`cookie_cache_${key}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('localStorage fallback failed:', error);
      }
    }
  }, [key, ttl, fallbackToLocalStorage]);

  // Fetch data with caching
  const fetchData = useCallback(async (fetchFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        setLoading(false);
        return cached;
      }

      // Fetch fresh data
      const freshData = await fetchFn();
      
      // Cache the result
      setCachedData(freshData);
      setData(freshData);
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  // Clear cache
  const clearCache = useCallback(() => {
    // Clear from cookies
    clientCookies.remove(`api_cache_${key}`);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cookie_cache_${key}`);
    }
    
    setData(null);
  }, [key]);

  // Check if data is cached
  const isCached = useCallback(() => {
    return getCachedData() !== null;
  }, [getCachedData]);

  // Get cache info
  const getCacheInfo = useCallback(() => {
    const cookieData = performanceCookies.getCachedAPIResponse(key);
    if (cookieData) {
      return { type: 'cookie', data: cookieData };
    }

    if (fallbackToLocalStorage && typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem(`cookie_cache_${key}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Date.now() - parsed.timestamp < parsed.ttl * 1000) {
            return { type: 'localStorage', data: parsed.data };
          }
        }
      } catch (error) {
        console.warn('localStorage check failed:', error);
      }
    }

    return { type: 'none', data: null };
  }, [key, fallbackToLocalStorage]);

  return {
    data,
    loading,
    error,
    fetchData,
    clearCache,
    isCached,
    getCacheInfo,
    setCachedData
  };
}

// Specialized hook for API calls with cookie caching
export function useCookieAPI<T = any>(
  url: string,
  params?: Record<string, any>,
  ttl: number = 300
) {
  const cacheKey = `api:${url}${params ? `:${JSON.stringify(params)}` : ''}`;
  
  const { data, loading, error, fetchData, clearCache, isCached, getCacheInfo } = useCookieCache<T>({
    key: cacheKey,
    ttl,
    fallbackToLocalStorage: true
  });

  const callAPI = useCallback(async () => {
    const fetchFn = async () => {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await fetch(`${url}${queryString}`);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      return response.json();
    };

    return fetchData(fetchFn);
  }, [url, params, fetchData]);

  return {
    data,
    loading,
    error,
    callAPI,
    clearCache,
    isCached,
    getCacheInfo
  };
}

// Hook for user preferences with cookie persistence
export function useCookiePreference<T = any>(
  key: string,
  defaultValue: T,
  ttl: number = 365 * 24 * 60 * 60 // 1 year
) {
  const [value, setValue] = useState<T>(() => {
    // Try to get from cookies first
    const cookieValue = performanceCookies.getUserPreference(key, null);
    if (cookieValue !== null) return cookieValue;
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const localValue = localStorage.getItem(`pref_${key}`);
        if (localValue) {
          const { data, timestamp, ttl: localTtl } = JSON.parse(localValue);
          if (Date.now() - timestamp < localTtl * 1000) {
            return data;
          }
        }
      } catch (error) {
        console.warn('localStorage preference check failed:', error);
      }
    }
    
    return defaultValue;
  });

  const setPreference = useCallback((newValue: T) => {
    setValue(newValue);
    
    // Save to cookies
    performanceCookies.setUserPreference(key, newValue);
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const cacheData = {
          data: newValue,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(`pref_${key}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('localStorage preference save failed:', error);
      }
    }
  }, [key, ttl]);

  const clearPreference = useCallback(() => {
    setValue(defaultValue);
    
    // Clear from cookies
    clientCookies.remove(`pref_${key}`);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`pref_${key}`);
    }
  }, [key, defaultValue]);

  return [value, setPreference, clearPreference] as const;
} 