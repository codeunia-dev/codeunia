import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Create Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
}

/**
 * Authenticate user and verify admin access
 * @param request - Next.js request object
 * @returns Promise<AuthenticatedUser | null> - Authenticated user or null if not authenticated
 */
export async function authenticateAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get session from cookies as fallback
      await cookies();
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No valid session found');
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, is_admin')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.log('Profile not found for user:', session.user.id);
        return null;
      }

      // Check if user is admin
      if (!profile.is_admin) {
        console.log('User is not admin:', session.user.id);
        return null;
      }

      return {
        id: profile.id,
        email: session.user.email || '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        is_admin: profile.is_admin
      };
    }

    // Handle Bearer token authentication
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    const { data: { user }, error: tokenError } = await supabase.auth.getUser(token);
    
    if (tokenError || !user) {
      console.log('Invalid token:', tokenError?.message);
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('Profile not found for user:', user.id);
      return null;
    }

    // Check if user is admin
    if (!profile.is_admin) {
      console.log('User is not admin:', user.id);
      return null;
    }

    return {
      id: profile.id,
      email: user.email || '',
      first_name: profile.first_name,
      last_name: profile.last_name,
      is_admin: profile.is_admin
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Create a middleware function to protect admin routes
 * @param handler - The API route handler
 * @returns Protected API route handler
 */
export function withAdminAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Authenticate user
      const user = await authenticateAdmin(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 401 }
        );
      }

      // Call the original handler with authenticated user
      return await handler(request, user);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Create a response for unauthorized access
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized. Admin access required.' },
    { status: 401 }
  );
}

/**
 * Create a response for forbidden access
 */
export function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden. Insufficient permissions.' },
    { status: 403 }
  );
} 