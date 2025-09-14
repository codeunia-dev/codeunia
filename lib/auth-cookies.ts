// Secure authentication cookie management for Codeunia
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export interface AuthCookieOptions {
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  domain?: string;
  path?: string;
}

// Default secure options for production
const defaultAuthOptions: AuthCookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true, // Prevents XSS attacks
  sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax', // More secure in production
  domain: process.env.NODE_ENV === 'production' ? '.codeunia.com' : undefined,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

// Client-side auth cookie utilities (for non-sensitive data)
export const authCookies = {
  // Set authentication token (client-side, for non-sensitive tokens)
  setAuthToken: (token: string, options: AuthCookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultAuthOptions, ...options };
    let cookieString = `codeunia_auth_token=${encodeURIComponent(token)}`;

    if (opts.maxAge) {
      cookieString += `; max-age=${opts.maxAge}`;
    }

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.secure) cookieString += '; secure';
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;

    document.cookie = cookieString;
  },

  // Get authentication token
  getAuthToken: (): string | null => {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith('codeunia_auth_token='));

    if (!cookie) return null;

    try {
      return decodeURIComponent(cookie.split('=')[1]);
    } catch {
      return null;
    }
  },

  // Remove authentication token
  removeAuthToken: (options: AuthCookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultAuthOptions, ...options };
    let cookieString = 'codeunia_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC';

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;

    document.cookie = cookieString;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authCookies.getAuthToken() !== null;
  }
};

// CSRF token management
export const csrfCookies = {
  // Generate CSRF token
  generateCSRFToken: (): string => {
    // Use crypto.getRandomValues for secure random generation
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for server-side or environments without crypto.getRandomValues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.randomBytes(16).toString('hex');
    }
    // Ultimate fallback
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },

  // Set CSRF token
  setCSRFToken: (token: string, options: AuthCookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultAuthOptions, ...options };
    let cookieString = `codeunia_csrf_token=${encodeURIComponent(token)}`;

    if (opts.maxAge) {
      cookieString += `; max-age=${opts.maxAge}`;
    }

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;
    if (opts.secure) cookieString += '; secure';
    if (opts.sameSite) cookieString += `; samesite=${opts.sameSite}`;

    document.cookie = cookieString;
  },

  // Get CSRF token
  getCSRFToken: (): string | null => {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith('codeunia_csrf_token='));

    if (!cookie) return null;

    try {
      return decodeURIComponent(cookie.split('=')[1]);
    } catch {
      return null;
    }
  },

  // Validate CSRF token
  validateCSRFToken: (token: string): boolean => {
    const storedToken = csrfCookies.getCSRFToken();
    return storedToken === token;
  },

  // Remove CSRF token
  removeCSRFToken: (options: AuthCookieOptions = {}) => {
    if (typeof window === 'undefined') return;

    const opts = { ...defaultAuthOptions, ...options };
    let cookieString = 'codeunia_csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC';

    if (opts.path) cookieString += `; path=${opts.path}`;
    if (opts.domain) cookieString += `; domain=${opts.domain}`;

    document.cookie = cookieString;
  }
};

// Session management with Supabase
export const sessionCookies = {
  // Initialize session with CSRF protection
  initializeSession: async () => {
    const supabase = createClient();
    
    // Generate CSRF token
    const csrfToken = csrfCookies.generateCSRFToken();
    csrfCookies.setCSRFToken(csrfToken);

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      // Store session info (non-sensitive)
      authCookies.setAuthToken(session.access_token);
      
      return {
        session,
        csrfToken,
        isAuthenticated: true
      };
    }

    return {
      session: null,
      csrfToken,
      isAuthenticated: false
    };
  },

  // Refresh session
  refreshSession: async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (session?.access_token && !error) {
      authCookies.setAuthToken(session.access_token);
      return { session, isAuthenticated: true };
    }

    return { session: null, isAuthenticated: false };
  },

  // Clear session
  clearSession: () => {
    authCookies.removeAuthToken();
    csrfCookies.removeCSRFToken();
  }
};

// Server-side auth cookie utilities (for API routes)
export const serverAuthCookies = {
  // Set secure HTTP-only cookie
  setSecureCookie: (name: string, value: string, options: AuthCookieOptions = {}): string => {
    const opts = { ...defaultAuthOptions, ...options };
    let cookieString = `Set-Cookie: ${name}=${encodeURIComponent(value)}`;

    if (opts.maxAge) {
      cookieString += `; Max-Age=${opts.maxAge}`;
    }

    if (opts.path) cookieString += `; Path=${opts.path}`;
    if (opts.domain) cookieString += `; Domain=${opts.domain}`;
    if (opts.secure) cookieString += '; Secure';
    if (opts.httpOnly) cookieString += '; HttpOnly';
    if (opts.sameSite) cookieString += `; SameSite=${opts.sameSite}`;

    return cookieString;
  },

  // Parse cookies from request headers
  parseCookies: (cookieHeader: string): Record<string, string> => {
    const cookies: Record<string, string> = {};
    
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        try {
          cookies[name] = decodeURIComponent(value);
        } catch {
          cookies[name] = value;
        }
      }
    });

    return cookies;
  },

  // Validate session from cookies
  validateSession: (cookieHeader: string): { isValid: boolean; userId?: string } => {
    const cookies = serverAuthCookies.parseCookies(cookieHeader);
    const authToken = cookies['codeunia_auth_token'];
    const csrfToken = cookies['codeunia_csrf_token'];

    if (!authToken || !csrfToken) {
      return { isValid: false };
    }

    // Here you would validate the token with your auth service
    // For now, we'll just check if they exist
    return { isValid: true, userId: 'user_id_from_token' };
  }
};

// Hook for authentication state management
export const useAuthCookies = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated } = await sessionCookies.initializeSession();
        setIsAuthenticated(isAuthenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (data.session && !error) {
      await sessionCookies.initializeSession();
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, error };
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionCookies.clearSession();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}; 