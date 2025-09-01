import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authRateLimiter } from '@/lib/security/input-validation';
import { handleAuthError, handleAuthzError, handleRateLimitError } from '@/lib/security/error-handler';

export interface AuthenticatedUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  username?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>;
}

// Enhanced authentication middleware
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (!authRateLimiter.isAllowed(clientIp)) {
      return null;
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get user profile with additional security checks
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, is_admin, username, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email || user.email || '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      is_admin: profile.is_admin || false,
      username: profile.username,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Admin authentication middleware
export async function authenticateAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await authenticateUser(request);
  
  if (!user || !user.is_admin) {
    return null;
  }

  return user;
}

// Middleware wrapper for protected routes
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await authenticateUser(request);
      
      if (!user) {
        return handleAuthError();
      }

      return await handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return handleAuthError();
    }
  };
}

// Middleware wrapper for admin routes
export function withAdminAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await authenticateAdmin(request);
      
      if (!user) {
        return handleAuthzError('Admin access required');
      }

      return await handler(request, user);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return handleAuthzError('Admin access required');
    }
  };
}

// Middleware wrapper with rate limiting
export function withRateLimit(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      
      if (!authRateLimiter.isAllowed(clientIp)) {
        return handleRateLimitError();
      }

      const user = await authenticateUser(request);
      
      if (!user) {
        return handleAuthError();
      }

      return await handler(request, user);
    } catch (error) {
      console.error('Rate limited auth middleware error:', error);
      return handleAuthError();
    }
  };
}

// CSRF protection middleware
export function withCSRF(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await authenticateUser(request);
      
      if (!user) {
        return handleAuthError();
      }

      // Check CSRF token for non-GET requests
      if (request.method !== 'GET') {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionToken = request.cookies.get('csrf-token')?.value;
        
        if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
          return handleAuthError('Invalid CSRF token');
        }
      }

      return await handler(request, user);
    } catch (error) {
      console.error('CSRF middleware error:', error);
      return handleAuthError();
    }
  };
}

// Utility function to get user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  return authenticateUser(request);
}

// Utility function to check if user is admin
export async function isUserAdmin(request: NextRequest): Promise<boolean> {
  const user = await authenticateUser(request);
  return user?.is_admin || false;
}

// Session validation
export async function validateSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// Permission checking utility
export async function hasPermission(
  request: NextRequest, 
  _permission: string
): Promise<boolean> {
  const user = await authenticateUser(request);
  
  if (!user) {
    return false;
  }

  // Admin users have all permissions
  if (user.is_admin) {
    return true;
  }

  // Add specific permission checks here based on your permission system
  // For now, return false for non-admin users with specific permissions
  return false;
}
