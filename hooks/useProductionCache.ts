import { useState, useEffect, useCallback } from 'react';
import { 
  ProductionCache, 
  LeaderboardCache, 
  TestDataCache, 
  CertificateCache, 
  BlogCache, 
  HackathonCache,
  CacheMetrics 
} from '@/lib/production-cache';
import { performanceCookies, themeCookies } from '@/lib/cookies';

// Hook for leaderboard data (high-priority cache)
export function useLeaderboard(type: 'global' | 'test' | 'hackathon', testId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await LeaderboardCache.getLeaderboard(type, testId);
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const response = await fetch(`/api/leaderboard/${type}${testId ? `?testId=${testId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const freshData = await response.json();
      
      // Cache the result
      await LeaderboardCache.setLeaderboard(type, freshData, testId);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [type, testId]);

  const refresh = useCallback(async () => {
    await LeaderboardCache.invalidateLeaderboard(type, testId);
    return fetchLeaderboard();
  }, [type, testId, fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { data, loading, error, refresh };
}

// Hook for test data (medium-priority cache)
export function useTestData(testId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTestData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await TestDataCache.getTest(id);
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const response = await fetch(`/api/tests/${id}`);
      if (!response.ok) throw new Error('Failed to fetch test data');
      
      const freshData = await response.json();
      
      // Cache the result
      await TestDataCache.setTest(id, freshData);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTestList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await TestDataCache.getTestList();
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const response = await fetch('/api/tests');
      if (!response.ok) throw new Error('Failed to fetch test list');
      
      const freshData = await response.json();
      
      // Cache the result
      await TestDataCache.setTestList(freshData);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (testId) {
      fetchTestData(testId);
    } else {
      fetchTestList();
    }
  }, [testId, fetchTestData, fetchTestList]);

  return { data, loading, error };
}

// Hook for certificate data (medium-priority cache)
export function useCertificate(certId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCertificate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await CertificateCache.getCertificate(certId);
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const response = await fetch(`/api/certificates/${certId}`);
      if (!response.ok) throw new Error('Failed to fetch certificate');
      
      const freshData = await response.json();
      
      // Cache the result
      await CertificateCache.setCertificate(certId, freshData);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [certId]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { data, loading, error };
}

// Hook for blog posts (low-priority cache)
export function useBlogPost(slug: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlogPost = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await BlogCache.getBlogPost(slug);
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch blog post');
      
      const freshData = await response.json();
      
      // Cache the result
      await BlogCache.setBlogPost(slug, freshData);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlogPost();
  }, [fetchBlogPost]);

  return { data, loading, error };
}

// Hook for user preferences (cookies - user-specific, small, secure)
export function useUserPreferences() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => themeCookies.getTheme());
  const [language, setLanguage] = useState(() => themeCookies.getLanguage());
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => themeCookies.getFontSize());

  const updateTheme = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    themeCookies.setTheme(newTheme);
  }, []);

  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    themeCookies.setLanguage(newLanguage);
  }, []);

  const updateFontSize = useCallback((newFontSize: 'small' | 'medium' | 'large') => {
    setFontSize(newFontSize);
    themeCookies.setFontSize(newFontSize);
  }, []);

  return {
    theme,
    language,
    fontSize,
    updateTheme,
    updateLanguage,
    updateFontSize
  };
}

// Hook for search history (cookies - lightweight tracking)
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    return performanceCookies.getSearchHistory();
  });

  const addSearchQuery = useCallback((query: string) => {
    if (query.trim()) {
      performanceCookies.cacheSearchQuery(query.trim());
      setSearchHistory(performanceCookies.getSearchHistory());
    }
  }, []);

  const clearSearchHistory = useCallback(() => {
    performanceCookies.clearSearchHistory();
    setSearchHistory([]);
  }, []);

  return {
    searchHistory,
    addSearchQuery,
    clearSearchHistory
  };
}

// Hook for page views (cookies - lightweight tracking)
export function usePageViews() {
  const [pageViews, setPageViews] = useState<Record<string, number>>(() => {
    const views = performanceCookies.getPageViews();
    return typeof views === 'object' ? views : {};
  });

  const trackPageView = useCallback((page: string) => {
    performanceCookies.trackPageView(page);
    const views = performanceCookies.getPageViews();
    setPageViews(typeof views === 'object' ? views : {});
  }, []);

  const getPageViewCount = useCallback((page?: string) => {
    const views = performanceCookies.getPageViews();
    if (typeof views === 'object' && page) {
      return views[page] || 0;
    }
    return typeof views === 'object' ? views : {};
  }, []);

  return {
    pageViews,
    trackPageView,
    getPageViewCount
  };
}

// Hook for cache performance monitoring
export function useCacheMetrics() {
  const [stats, setStats] = useState(() => CacheMetrics.getStats());

  const refreshStats = useCallback(() => {
    setStats(CacheMetrics.getStats());
  }, []);

  const resetStats = useCallback(() => {
    CacheMetrics.reset();
    setStats(CacheMetrics.getStats());
  }, []);

  return {
    stats,
    refreshStats,
    resetStats
  };
}

// Hook for API response caching (performance optimization)
export function useCachedAPI<T = any>(
  url: string,
  params?: Record<string, any>,
  cacheKey?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const key = cacheKey || `api:${url}${params ? `:${JSON.stringify(params)}` : ''}`;

    try {
      // Check cache first
      const cached = await ProductionCache.get<T>(key);
      if (cached) {
        CacheMetrics.recordHit();
        setData(cached);
        setLoading(false);
        return cached;
      }

      CacheMetrics.recordMiss();

      // Fetch from API
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await fetch(`${url}${queryString}`);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const freshData = await response.json();
      
      // Cache the result
      await ProductionCache.set(key, freshData);
      CacheMetrics.recordSet();
      
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [url, params, cacheKey]);

  const refresh = useCallback(async () => {
    if (cacheKey) {
      await ProductionCache.invalidate(cacheKey);
    }
    return fetchData();
  }, [cacheKey, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
} 