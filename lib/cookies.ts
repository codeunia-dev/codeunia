// Comprehensive cookie management system
export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number; // seconds
}

// Default cookie options
const defaultOptions: CookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// Client-side cookie utilities
export const clientCookies = {
  // Set a cookie
  set: (name: string, value: any, options: CookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultOptions, ...options };
    let cookieString = `${name}=${encodeURIComponent(JSON.stringify(value))}`;

    if (opts.expires) {
      const expires = opts.expires instanceof Date ? opts.expires : new Date(Date.now() + opts.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (opts.maxAge) {
      cookieString += `; max-age=${opts.maxAge}`;
    }

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.secure) cookieString += '; secure';
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;

    document.cookie = cookieString;
  },

  // Get a cookie
  get: <T = any>(name: string): T | null => {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));

    if (!cookie) return null;

    try {
      const value = decodeURIComponent(cookie.split('=')[1]);
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  // Remove a cookie
  remove: (name: string, options: CookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultOptions, ...options };
    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;

    document.cookie = cookieString;
  },

  // Check if a cookie exists
  has: (name: string): boolean => {
    if (typeof window === 'undefined') return false;
    return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`));
  },

  // Get all cookies
  getAll: (): Record<string, any> => {
    if (typeof window === 'undefined') return {};

    const cookies: Record<string, any> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        try {
          cookies[name] = JSON.parse(decodeURIComponent(value));
        } catch {
          cookies[name] = decodeURIComponent(value);
        }
      }
    });
    return cookies;
  }
};

// Server-side cookie utilities (for API routes)
export const serverCookies = {
  // Parse cookies from request headers
  parse: (cookieHeader: string): Record<string, any> => {
    const cookies: Record<string, any> = {};
    
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        try {
          cookies[name] = JSON.parse(decodeURIComponent(value));
        } catch {
          cookies[name] = decodeURIComponent(value);
        }
      }
    });

    return cookies;
  },

  // Set cookie in response headers
  set: (name: string, value: any, options: CookieOptions = {}): string => {
    const opts = { ...defaultOptions, ...options };
    let cookieString = `Set-Cookie: ${name}=${encodeURIComponent(JSON.stringify(value))}`;

    if (opts.expires) {
      const expires = opts.expires instanceof Date ? opts.expires : new Date(Date.now() + opts.expires * 24 * 60 * 60 * 1000);
      cookieString += `; Expires=${expires.toUTCString()}`;
    }

    if (opts.maxAge) {
      cookieString += `; Max-Age=${opts.maxAge}`;
    }

    if (opts.path) cookieString += `; Path=${opts.path}`;
    if (opts.domain) cookieString += `; Domain=${opts.domain}`;
    if (opts.secure) cookieString += '; Secure';
    if (opts.httpOnly) cookieString += '; HttpOnly';
    if (opts.sameSite) cookieString += `; SameSite=${opts.sameSite}`;

    return cookieString;
  }
};

// Performance-focused cookie cache
export const performanceCookies = {
  // Cache API responses in cookies
  cacheAPIResponse: (key: string, data: any, ttl: number = 300) => { // 5 minutes default
    clientCookies.set(`api_cache_${key}`, {
      data,
      timestamp: Date.now(),
      ttl
    }, { maxAge: ttl });
  },

  // Get cached API response
  getCachedAPIResponse: <T = any>(key: string): T | null => {
    const cached = clientCookies.get(`api_cache_${key}`);
    if (!cached) return null;

    const { data, timestamp, ttl } = cached;
    if (Date.now() - timestamp > ttl * 1000) {
      clientCookies.remove(`api_cache_${key}`);
      return null;
    }

    return data;
  },

  // Cache user preferences
  setUserPreference: (key: string, value: any) => {
    clientCookies.set(`pref_${key}`, value, { maxAge: 365 * 24 * 60 * 60 }); // 1 year
  },

  // Get user preference
  getUserPreference: <T = any>(key: string, defaultValue: T): T => {
    const value = clientCookies.get(`pref_${key}`);
    return value !== null ? value : defaultValue;
  },

  // Cache session data
  setSessionData: (key: string, value: any) => {
    clientCookies.set(`session_${key}`, value, { maxAge: 24 * 60 * 60 }); // 1 day
  },

  // Get session data
  getSessionData: <T = any>(key: string): T | null => {
    return clientCookies.get(`session_${key}`);
  },

  // Track user behavior for performance optimization
  trackPageView: (page: string) => {
    const views = clientCookies.get('page_views') || {};
    views[page] = (views[page] || 0) + 1;
    clientCookies.set('page_views', views, { maxAge: 30 * 24 * 60 * 60 }); // 30 days
  },

  // Get page view count
  getPageViews: (page?: string) => {
    const views = clientCookies.get('page_views') || {};
    return page ? views[page] || 0 : views;
  },

  // Cache search queries for faster autocomplete
  cacheSearchQuery: (query: string) => {
    const queries = clientCookies.get('search_history') || [];
    if (!queries.includes(query)) {
      queries.unshift(query);
      queries.splice(10); // Keep only last 10 queries
      clientCookies.set('search_history', queries, { maxAge: 7 * 24 * 60 * 60 }); // 1 week
    }
  },

  // Get search history
  getSearchHistory: (): string[] => {
    return clientCookies.get('search_history') || [];
  },

  // Clear search history
  clearSearchHistory: () => {
    clientCookies.remove('search_history');
  }
};

// Analytics and tracking cookies
export const analyticsCookies = {
  // Set user ID for tracking
  setUserId: (userId: string) => {
    clientCookies.set('user_id', userId, { maxAge: 365 * 24 * 60 * 60 }); // 1 year
  },

  // Get user ID
  getUserId: (): string | null => {
    return clientCookies.get('user_id');
  },

  // Track user session
  startSession: () => {
    const sessionId = Math.random().toString(36).substring(2);
    clientCookies.set('session_id', sessionId, { maxAge: 24 * 60 * 60 }); // 1 day
    return sessionId;
  },

  // Get current session ID
  getSessionId: (): string | null => {
    return clientCookies.get('session_id');
  },

  // Track user engagement
  trackEngagement: (action: string, data?: any) => {
    const engagement = clientCookies.get('user_engagement') || {};
    if (!engagement[action]) {
      engagement[action] = [];
    }
    engagement[action].push({
      timestamp: Date.now(),
      data
    });
    
    // Keep only last 50 actions per type
    engagement[action] = engagement[action].slice(-50);
    
    clientCookies.set('user_engagement', engagement, { maxAge: 30 * 24 * 60 * 60 }); // 30 days
  }
};

// Theme and UI preference cookies
export const themeCookies = {
  // Set theme preference
  setTheme: (theme: 'light' | 'dark' | 'auto') => {
    clientCookies.set('theme', theme, { maxAge: 365 * 24 * 60 * 60 }); // 1 year
  },

  // Get theme preference
  getTheme: (): 'light' | 'dark' | 'auto' => {
    return clientCookies.get('theme') || 'auto';
  },

  // Set language preference
  setLanguage: (language: string) => {
    clientCookies.set('language', language, { maxAge: 365 * 24 * 60 * 60 }); // 1 year
  },

  // Get language preference
  getLanguage: (): string => {
    return clientCookies.get('language') || 'en';
  },

  // Set font size preference
  setFontSize: (size: 'small' | 'medium' | 'large') => {
    clientCookies.set('font_size', size, { maxAge: 365 * 24 * 60 * 60 }); // 1 year
  },

  // Get font size preference
  getFontSize: (): 'small' | 'medium' | 'large' => {
    return clientCookies.get('font_size') || 'medium';
  }
}; 